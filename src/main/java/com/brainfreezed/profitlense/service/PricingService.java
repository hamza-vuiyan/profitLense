package com.brainfreezed.profitlense.service;

import com.brainfreezed.profitlense.dto.PricingRunResultDTO;
import com.brainfreezed.profitlense.dto.PricingSignalDTO;
import com.brainfreezed.profitlense.model.Merchant;
import com.brainfreezed.profitlense.model.PricingSignal;
import com.brainfreezed.profitlense.model.Product;
import com.brainfreezed.profitlense.repository.MerchantRepository;
import com.brainfreezed.profitlense.repository.PricingSignalRepository;
import com.brainfreezed.profitlense.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final ProductRepository productRepository;
    private final PricingSignalRepository pricingSignalRepository;
    private final MerchantRepository merchantRepository;

    /**
     * Runs the pricing rule engine for all products of a given merchant.
     */
    @Transactional
    public PricingRunResultDTO runPricingEngine(UUID merchantId) {
        long startMs = System.currentTimeMillis();
        log.info("Running Pricing Engine for merchant={}", merchantId);

        Merchant merchant = merchantRepository.findById(merchantId).orElseThrow(() -> 
            new IllegalArgumentException("Merchant not found: " + merchantId));

        List<Product> products = productRepository.findByMerchantId(merchantId);
        
        // Delete previous signals for this merchant so we only keep the latest
        pricingSignalRepository.deleteByMerchantId(merchantId);

        int signalsGenerated = 0;

        for (Product product : products) {
            if (product.getCurrentPrice() == null || product.getCurrentPrice().compareTo(BigDecimal.ZERO) == 0) {
                continue; // Skip products without a valid price
            }

            // Mocking competitor median price for demo purposes.
            // In a real scenario, this would be fetched from a scraping service/DB.
            // Here we randomly generate a competitor median between 80% and 120% of our current price.
            BigDecimal currentPrice = product.getCurrentPrice();
            double randomFactor = 0.8 + (Math.random() * 0.4); 
            BigDecimal competitorMedian = currentPrice.multiply(BigDecimal.valueOf(randomFactor))
                                                      .setScale(2, RoundingMode.HALF_UP);

            String signal;
            BigDecimal suggestedPrice;

            // RULE: If our price > competitor median * 1.10 -> REDUCE
            BigDecimal upperThreshold = competitorMedian.multiply(BigDecimal.valueOf(1.10));
            
            if (currentPrice.compareTo(upperThreshold) > 0) {
                signal = "REDUCE";
                // Suggest a price that is 5% above the competitor median
                suggestedPrice = competitorMedian.multiply(BigDecimal.valueOf(1.05))
                                                 .setScale(2, RoundingMode.HALF_UP);
            } else {
                signal = "HOLD";
                suggestedPrice = currentPrice;
            }

            PricingSignal pricingSignal = PricingSignal.builder()
                    .merchant(merchant)
                    .product(product)
                    .currentPrice(currentPrice)
                    .competitorMedian(competitorMedian)
                    .signal(signal)
                    .suggestedPrice(suggestedPrice)
                    .build();

            pricingSignalRepository.save(pricingSignal);
            signalsGenerated++;
        }

        long durationMs = System.currentTimeMillis() - startMs;
        log.info("Pricing Engine complete: analyzed={}, signals={}, duration={}ms", 
                 products.size(), signalsGenerated, durationMs);

        return PricingRunResultDTO.builder()
                .productsAnalyzed(products.size())
                .signalsGenerated(signalsGenerated)
                .durationMs(durationMs)
                .status("SUCCESS")
                .build();
    }

    /**
     * Returns the latest pricing signals for a merchant.
     */
    public List<PricingSignalDTO> getPricingSignals(UUID merchantId) {
        List<PricingSignal> signals = pricingSignalRepository.findByMerchantIdWithProduct(merchantId);

        return signals.stream()
                .map(s -> PricingSignalDTO.builder()
                        .id(s.getId())
                        .productId(s.getProduct().getId())
                        .productName(s.getProduct().getName())
                        .category(s.getProduct().getCategory())
                        .currentPrice(s.getCurrentPrice())
                        .competitorMedian(s.getCompetitorMedian())
                        .signal(s.getSignal())
                        .suggestedPrice(s.getSuggestedPrice())
                        .build())
                .collect(Collectors.toList());
    }
}
