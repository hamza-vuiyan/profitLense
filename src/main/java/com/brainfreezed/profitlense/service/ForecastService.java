package com.brainfreezed.profitlense.service;

import com.brainfreezed.profitlense.dto.ForecastDTO;
import com.brainfreezed.profitlense.dto.ForecastRunResultDTO;
import com.brainfreezed.profitlense.model.Forecast;
import com.brainfreezed.profitlense.repository.ForecastRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {

    private final ForecastRepository forecastRepository;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    /**
     * Triggers the Python Prophet script to generate forecasts for the given merchant.
     * The script reads from the DB, trains Prophet models, and writes predictions back.
     */
    public ForecastRunResultDTO runProphet(UUID merchantId) {
        long startMs = System.currentTimeMillis();

        // Resolve the path to forecast.py relative to the working directory
        Path scriptPath = Paths.get("scripts", "forecast.py").toAbsolutePath();
        
        // Detect Python path: use local venv if available, else fallback to global (e.g. for Docker)
        Path localVenvPython = Paths.get("scripts", "venv", "bin", "python3").toAbsolutePath();
        String pythonCommand = localVenvPython.toFile().exists() ? localVenvPython.toString() : "python3";

        // Build the DB URL for psycopg2 with embedded credentials
        String dbUrl = buildPsycopg2Url(datasourceUrl, datasourceUsername, datasourcePassword);

        log.info("Running Prophet forecast for merchant={}", merchantId);
        log.debug("Script path: {}, Python: {}", scriptPath, pythonCommand);

        ProcessBuilder pb = new ProcessBuilder(
                pythonCommand,
                scriptPath.toString(),
                "--db-url", dbUrl,
                "--merchant-id", merchantId.toString(),
                "--min-records", "10",
                "--forecast-weeks", "4"
        );
        pb.redirectErrorStream(false);

        try {
            Process process = pb.start();

            // Capture stdout (JSON result)
            String stdout;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                stdout = reader.lines().collect(Collectors.joining("\n"));
            }

            // Capture stderr (warnings/errors)
            String stderr;
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream()))) {
                stderr = reader.lines().collect(Collectors.joining("\n"));
            }

            int exitCode = process.waitFor();

            if (!stderr.isBlank()) {
                log.warn("Prophet stderr:\n{}", stderr);
            }

            long durationMs = System.currentTimeMillis() - startMs;

            if (exitCode != 0) {
                log.error("Prophet script exited with code {}: {}", exitCode, stderr);
                return ForecastRunResultDTO.builder()
                        .productsForecasted(0)
                        .productsSkipped(0)
                        .durationMs(durationMs)
                        .status("ERROR")
                        .message("Script failed (exit " + exitCode + "): " + stderr)
                        .build();
            }

            // Parse simple JSON: {"forecasted": N, "skipped": M, "message": "..."}
            int forecasted = extractIntField(stdout, "forecasted");
            int skipped = extractIntField(stdout, "skipped");
            String message = extractStringField(stdout, "message");
            if (message == null) message = "Done";

            log.info("Prophet complete: forecasted={}, skipped={}, duration={}ms",
                    forecasted, skipped, durationMs);

            return ForecastRunResultDTO.builder()
                    .productsForecasted(forecasted)
                    .productsSkipped(skipped)
                    .durationMs(durationMs)
                    .status("SUCCESS")
                    .message(message)
                    .build();

        } catch (Exception e) {
            long durationMs = System.currentTimeMillis() - startMs;
            log.error("Failed to run Prophet script", e);
            return ForecastRunResultDTO.builder()
                    .productsForecasted(0)
                    .productsSkipped(0)
                    .durationMs(durationMs)
                    .status("ERROR")
                    .message("Exception running script: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Returns the latest forecast records for a merchant, from today onwards.
     */
    public List<ForecastDTO> getForecasts(UUID merchantId) {
        // Use createdAt-ordered query — forecast dates may be historical (demo dataset from 2011)
        // so filtering by "today" would always return empty results
        List<Forecast> forecasts = forecastRepository
                .findByMerchantIdOrderByCreatedAtDesc(merchantId);

        return forecasts.stream()
                .map(f -> ForecastDTO.builder()
                        .id(f.getId())
                        .productId(f.getProduct().getId())
                        .productName(f.getProduct().getName())
                        .category(f.getProduct().getCategory())
                        .forecastDate(f.getForecastDate())
                        .predictedDemand(f.getPredictedDemand())
                        .lowerBound(f.getLowerBound())
                        .upperBound(f.getUpperBound())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Convert Spring JDBC URL to psycopg2-compatible DSN with embedded credentials.
     * jdbc:postgresql://host:port/db?sslmode=require
     *   →  postgresql://user:pass@host:port/db?sslmode=require
     */
    private String buildPsycopg2Url(String jdbcUrl, String username, String password) {
        // Strip "jdbc:" prefix if present
        String url = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring(5) : jdbcUrl;
        // url is now: postgresql://host:port/db?params
        // Insert credentials after the scheme
        String scheme = "postgresql://";
        if (url.startsWith(scheme)) {
            String rest = url.substring(scheme.length());
            // Encode password to handle special characters
            String encodedPassword = java.net.URLEncoder.encode(password, java.nio.charset.StandardCharsets.UTF_8);
            String encodedUsername = java.net.URLEncoder.encode(username, java.nio.charset.StandardCharsets.UTF_8);
            return scheme + encodedUsername + ":" + encodedPassword + "@" + rest;
        }
        return url;
    }

    /** Extracts an integer field from a simple flat JSON string, e.g. {"forecasted": 5, ...} */
    private int extractIntField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*(\\d+)";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }

    /** Extracts a string field from a simple flat JSON string. Returns null if not found. */
    private String extractStringField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }
}
