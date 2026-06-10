package com.brainfreezed.profitlense.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastDTO {
    private UUID id;
    private UUID productId;
    private String productName;
    private String category;
    private LocalDate forecastDate;
    private BigDecimal predictedDemand;
    private BigDecimal lowerBound;
    private BigDecimal upperBound;
}
