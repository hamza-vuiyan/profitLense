package com.brainfreezed.profitlense.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;
    
    @Column(name = "quantity_sold", nullable = false)
    private Integer quantitySold;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    @Column(name = "revenue")
    private BigDecimal revenue;
    
    @Column(name = "ingested_at", nullable = false, updatable = false)
    private LocalDateTime ingestedAt;
    
    @PrePersist
    protected void onCreate() {
        if (this.ingestedAt == null) {
            this.ingestedAt = LocalDateTime.now();
        }
    }
}
