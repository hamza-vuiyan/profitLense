package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingRunResultDTO {
    private int productsAnalyzed;
    private int signalsGenerated;
    private long durationMs;
    private String status;
}
