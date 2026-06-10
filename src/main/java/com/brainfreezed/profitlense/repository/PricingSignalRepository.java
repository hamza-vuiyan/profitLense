package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.PricingSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PricingSignalRepository extends JpaRepository<PricingSignal, UUID> {
    
    @Query("""
        SELECT p FROM PricingSignal p
        JOIN FETCH p.product
        WHERE p.merchant.id = :merchantId
        ORDER BY p.product.name ASC
        """)
    List<PricingSignal> findByMerchantIdWithProduct(@Param("merchantId") UUID merchantId);
    
    @Modifying
    @Query("DELETE FROM PricingSignal p WHERE p.merchant.id = :merchantId")
    void deleteByMerchantId(@Param("merchantId") UUID merchantId);
}
