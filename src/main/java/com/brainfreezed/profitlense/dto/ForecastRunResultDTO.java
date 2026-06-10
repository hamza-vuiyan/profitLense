package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastRunResultDTO {
    private int productsForecasted;
    private int productsSkipped;
    private long durationMs;
    private String status;
    private String message;
}
