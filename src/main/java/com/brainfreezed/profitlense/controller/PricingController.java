package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.dto.PricingRunResultDTO;
import com.brainfreezed.profitlense.dto.PricingSignalDTO;
import com.brainfreezed.profitlense.service.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.brainfreezed.profitlense.model.Merchant;
import com.brainfreezed.profitlense.repository.MerchantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PricingController {

    private final PricingService pricingService;
    private final MerchantRepository merchantRepository;

    private UUID resolveMerchantId(String merchantIdStr) {
        if (merchantIdStr == null || merchantIdStr.isEmpty()) {
            Optional<Merchant> first = merchantRepository.findAll().stream().findFirst();
            if (first.isPresent()) {
                return first.get().getId();
            }
            throw new IllegalArgumentException("No merchants found in database");
        }
        return UUID.fromString(merchantIdStr);
    }

    /**
     * GET /api/pricing?merchantId={uuid}
     * Returns latest pricing signals for the given merchant.
     */
    @GetMapping("/pricing")
    public ResponseEntity<List<PricingSignalDTO>> getPricingSignals(
            @RequestParam(required = false) String merchantId) {
        log.info("GET /api/pricing for merchant={}", merchantId);
        try {
            UUID id = resolveMerchantId(merchantId);
            List<PricingSignalDTO> signals = pricingService.getPricingSignals(id);
            return ResponseEntity.ok(signals);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/pricing/run?merchantId={uuid}
     * Triggers the Rule engine to generate new pricing signals.
     */
    @PostMapping("/pricing/run")
    public ResponseEntity<PricingRunResultDTO> runPricingEngine(
            @RequestParam(required = false) String merchantId) {
        log.info("POST /api/pricing/run for merchant={}", merchantId);
        try {
            UUID id = resolveMerchantId(merchantId);
            PricingRunResultDTO result = pricingService.runPricingEngine(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }
}
