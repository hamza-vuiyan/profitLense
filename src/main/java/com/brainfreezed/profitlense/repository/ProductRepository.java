package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByMerchantId(UUID merchantId);
    Optional<Product> findByStockCode(String stockCode);
}
