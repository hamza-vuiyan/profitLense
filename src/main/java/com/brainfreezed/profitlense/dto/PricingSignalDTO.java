package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingSignalDTO {
    private UUID id;
    private UUID productId;
    private String productName;
    private String category;
    private BigDecimal currentPrice;
    private BigDecimal competitorMedian;
    private String signal;
    private BigDecimal suggestedPrice;
}
