package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.dto.ForecastDTO;
import com.brainfreezed.profitlense.dto.ForecastRunResultDTO;
import com.brainfreezed.profitlense.service.ForecastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ForecastController {

    private final ForecastService forecastService;

    /**
     * GET /api/forecast?merchantId={uuid}
     * Returns latest forecasts (from today forward) for the given merchant.
     */
    @GetMapping("/forecast")
    public ResponseEntity<List<ForecastDTO>> getForecasts(
            @RequestParam(defaultValue = "00000000-0000-0000-0000-000000000001") String merchantId) {
        log.info("GET /api/forecast for merchant={}", merchantId);
        try {
            UUID id = UUID.fromString(merchantId);
            List<ForecastDTO> forecasts = forecastService.getForecasts(id);
            return ResponseEntity.ok(forecasts);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/forecast/run?merchantId={uuid}
     * Triggers the Prophet Python script to generate new forecasts.
     * This may take 30–120 seconds depending on product count.
     */
    @PostMapping("/forecast/run")
    public ResponseEntity<ForecastRunResultDTO> runForecast(
            @RequestParam(defaultValue = "00000000-0000-0000-0000-000000000001") String merchantId) {
        log.info("POST /api/forecast/run for merchant={}", merchantId);
        try {
            UUID id = UUID.fromString(merchantId);
            ForecastRunResultDTO result = forecastService.runProphet(id);
            if ("ERROR".equals(result.getStatus())) {
                return ResponseEntity.internalServerError().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }
}
