package com.brainfreezed.profitlense.service;

import com.brainfreezed.profitlense.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyzeService {

    private final ForecastService forecastService;
    private final PricingService pricingService;
    private final AtomicBoolean isForecastRunning = new AtomicBoolean(false);

    /**
     * Orchestrates the execution of both AI engines.
     * Strategy: Run Pricing Engine synchronously (fast, ~3s).
     * Run Prophet asynchronously in the background.
     * Immediately return pricing results with any previously cached forecasts from DB.
     * The frontend can poll /api/forecast later for updated forecast results.
     */
    public AnalysisResultDTO runFullAnalysis(UUID merchantId) {
        long startMs = System.currentTimeMillis();
        log.info("Starting full analysis orchestration for merchant={}", merchantId);

        try {
            // 1. Run Pricing Engine synchronously (fast: ~1-3 seconds)
            log.info("Triggering Pricing Engine...");
            PricingRunResultDTO pricingResult = pricingService.runPricingEngine(merchantId);

            // 2. Kick off Prophet in the background if not already running
            if (isForecastRunning.compareAndSet(false, true)) {
                log.info("Triggering Forecast Engine asynchronously...");
                CompletableFuture.runAsync(() -> {
                    log.info("Background: Starting Prophet forecast for merchant={}", merchantId);
                    try {
                        ForecastRunResultDTO result = forecastService.runProphet(merchantId);
                        log.info("Background: Prophet complete — forecasted={}, skipped={}, status={}",
                                result.getProductsForecasted(), result.getProductsSkipped(), result.getStatus());
                    } catch (Exception e) {
                        log.error("Background: Prophet forecast failed", e);
                    } finally {
                        isForecastRunning.set(false);
                    }
                });
            } else {
                log.info("Forecast Engine is already running in the background. Skipping trigger.");
            }

            return getLatestAnalysis(merchantId);



        } catch (Exception e) {
            log.error("Failed to run full analysis orchestration", e);
            return AnalysisResultDTO.builder()
                    .status("ERROR")
                    .message("Analysis failed: " + e.getMessage())
                    .forecastStatus("ERROR")
                    .products(Collections.emptyList())
                    .totalDurationMs(System.currentTimeMillis() - startMs)
                    .build();
        }
    }

    /**
     * Returns the latest analysis results from the database without triggering the engines.
     */
    public AnalysisResultDTO getLatestAnalysis(UUID merchantId) {
        long startMs = System.currentTimeMillis();
        try {
            List<PricingSignalDTO> pricingSignals = pricingService.getPricingSignals(merchantId);
            List<ForecastDTO> forecasts = forecastService.getForecasts(merchantId);

            Map<UUID, List<ForecastDTO>> forecastsByProduct = forecasts.stream()
                    .collect(Collectors.groupingBy(ForecastDTO::getProductId));

            List<ProductAnalysisDTO> productAnalyses = new ArrayList<>();

            for (PricingSignalDTO signal : pricingSignals) {
                UUID productId = signal.getProductId();
                List<ForecastDTO> productForecasts = forecastsByProduct.getOrDefault(productId, new ArrayList<>());

                String advisoryText = generateAdvisory(signal, productForecasts);

                productAnalyses.add(ProductAnalysisDTO.builder()
                        .productId(productId)
                        .productName(signal.getProductName())
                        .category(signal.getCategory())
                        .currentPrice(signal.getCurrentPrice())
                        .competitorMedian(signal.getCompetitorMedian())
                        .pricingSignal(signal.getSignal())
                        .suggestedPrice(signal.getSuggestedPrice())
                        .forecasts(productForecasts)
                        .advisoryText(advisoryText)
                        .build());
            }

            boolean isRunning = isForecastRunning.get();
            boolean hasCachedForecasts = !forecasts.isEmpty();

            String message;
            if (isRunning) {
                message = "Forecast generation running in background. Pricing signals are ready.";
            } else if (hasCachedForecasts) {
                message = "Analyzed " + pricingSignals.size() + " products. Forecasts and pricing signals are ready.";
            } else {
                message = "Analyzed " + pricingSignals.size() + " products. No forecasts available.";
            }

            String forecastStatus = isRunning ? "RUNNING" : (hasCachedForecasts ? "READY" : "EMPTY");

            long durationMs = System.currentTimeMillis() - startMs;
            return AnalysisResultDTO.builder()
                    .status("SUCCESS")
                    .message(message)
                    .forecastStatus(forecastStatus)
                    .products(productAnalyses)
                    .totalDurationMs(durationMs)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get latest analysis", e);
            return AnalysisResultDTO.builder()
                    .status("ERROR")
                    .message("Failed to retrieve data: " + e.getMessage())
                    .forecastStatus("ERROR")
                    .products(Collections.emptyList())
                    .totalDurationMs(System.currentTimeMillis() - startMs)
                    .build();
        }
    }


    /**
     * Generates a human-readable advisory based on pricing signals and forecast trends.
     */
    private String generateAdvisory(PricingSignalDTO signal, List<ForecastDTO> forecasts) {
        if (forecasts.isEmpty()) {
            if ("REDUCE".equals(signal.getSignal())) {
                return "Your price is significantly above competitors. Recommend lowering price to increase sales volume.";
            } else {
                return "Price is competitive. Hold current pricing.";
            }
        }

        BigDecimal firstDemand = forecasts.get(0).getPredictedDemand();
        BigDecimal lastDemand = forecasts.get(forecasts.size() - 1).getPredictedDemand();

        boolean demandIncreasing = lastDemand.compareTo(firstDemand) > 0;
        boolean demandFlat = lastDemand.compareTo(firstDemand) == 0;

        if ("REDUCE".equals(signal.getSignal())) {
            if (demandIncreasing) {
                return "Demand is rising, but your price is too high. A slight price drop could capture massive market share.";
            } else {
                return "Demand is dropping AND price is too high. Critical: reduce price immediately to clear inventory.";
            }
        } else {
            if (demandIncreasing) {
                return "Strong outlook! Demand is growing and price is perfectly competitive. Maintain strategy.";
            } else if (demandFlat) {
                return "Stable product. Price is competitive and demand is steady.";
            } else {
                return "Demand is slowing down, but price remains competitive. Consider marketing promotions rather than price cuts.";
            }
        }
    }
}
