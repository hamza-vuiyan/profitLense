package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.PricingSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PricingSignalRepository extends JpaRepository<PricingSignal, UUID> {
    List<PricingSignal> findByMerchantIdOrderByCreatedAtDesc(UUID merchantId);
}
