package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultDTO {
    private String status;
    private String message;
    private String forecastStatus; // "READY" | "RUNNING" | "ERROR"
    private List<ProductAnalysisDTO> products;
    private long totalDurationMs;
}
