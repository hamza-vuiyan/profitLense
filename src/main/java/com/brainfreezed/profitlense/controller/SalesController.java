package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.dto.SalesSummaryDTO;
import com.brainfreezed.profitlense.model.SalesRecord;
import com.brainfreezed.profitlense.repository.SalesRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesController {
    
    private final SalesRecordRepository salesRecordRepository;
    
    @GetMapping("/sales-summary")
    public ResponseEntity<List<SalesSummaryDTO>> getSalesSummary(
            @RequestParam(required = false) UUID merchantId,
            @RequestParam(defaultValue = "30") int days) {
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        List<SalesRecord> records;
        if (merchantId != null) {
            records = salesRecordRepository.findByMerchantIdAndSaleDateBetween(
                merchantId, startDate, endDate
            );
        } else {
            records = salesRecordRepository.findAll().stream()
                .filter(r -> !r.getSaleDate().isBefore(startDate) && !r.getSaleDate().isAfter(endDate))
                .collect(Collectors.toList());
        }
        
        // Group by product and calculate totals
        Map<UUID, SalesSummaryDTO> summaryMap = new HashMap<>();
        for (SalesRecord record : records) {
            UUID productId = record.getProduct().getId();
            summaryMap.computeIfAbsent(productId, k -> SalesSummaryDTO.builder()
                .productId(productId)
                .productName(record.getProduct().getName())
                .category(record.getProduct().getCategory())
                .totalRevenue(BigDecimal.ZERO)
                .totalQuantity(0)
                .build());
            
            SalesSummaryDTO summary = summaryMap.get(productId);
            summary.setTotalRevenue(summary.getTotalRevenue().add(record.getRevenue() != null ? record.getRevenue() : BigDecimal.ZERO));
            summary.setTotalQuantity(summary.getTotalQuantity() + record.getQuantitySold());
        }
        
        List<SalesSummaryDTO> result = summaryMap.values().stream()
            .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
}
