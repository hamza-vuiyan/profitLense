package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, UUID> {

    /**
     * Fetches forecasts for a merchant from the given date forward,
     * eagerly joining product to avoid N+1 lazy-load issues.
     */
    @Query("""
        SELECT f FROM Forecast f
        JOIN FETCH f.product
        WHERE f.merchant.id = :merchantId
          AND f.forecastDate >= :fromDate
        ORDER BY f.product.id, f.forecastDate ASC
        """)
    List<Forecast> findByMerchantIdAndForecastDateGreaterThanEqualOrderByForecastDateAsc(
        @Param("merchantId") UUID merchantId,
        @Param("fromDate") LocalDate fromDate
    );

    /**
     * Returns all forecasts for a merchant, newest first (by creation time).
     * Eagerly joins product to avoid N+1.
     */
    @Query("""
        SELECT f FROM Forecast f
        JOIN FETCH f.product
        WHERE f.merchant.id = :merchantId
        ORDER BY f.createdAt DESC
        """)
    List<Forecast> findByMerchantIdOrderByCreatedAtDesc(@Param("merchantId") UUID merchantId);
}
