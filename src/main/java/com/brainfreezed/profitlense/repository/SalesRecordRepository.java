package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, UUID> {
    List<SalesRecord> findByMerchantIdAndProductIdAndSaleDateBetween(
        UUID merchantId, UUID productId, LocalDate startDate, LocalDate endDate
    );
    
    List<SalesRecord> findByMerchantIdAndSaleDateBetween(
        UUID merchantId, LocalDate startDate, LocalDate endDate
    );
    
    @Query("SELECT DISTINCT sr.product.id FROM SalesRecord sr WHERE sr.merchant.id = :merchantId")
    List<UUID> findDistinctProductIds(@Param("merchantId") UUID merchantId);
}
