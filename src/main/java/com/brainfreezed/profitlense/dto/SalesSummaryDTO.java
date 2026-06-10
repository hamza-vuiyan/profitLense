package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesSummaryDTO {
    private UUID productId;
    private String productName;
    private BigDecimal totalRevenue;
    private Integer totalQuantity;
    private String category;
}
