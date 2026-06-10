package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.dto.AnalysisResultDTO;
import com.brainfreezed.profitlense.model.Merchant;
import com.brainfreezed.profitlense.repository.MerchantRepository;
import com.brainfreezed.profitlense.service.AnalyzeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AnalyzeController {

    private final AnalyzeService analyzeService;
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
     * POST /api/analyze?merchantId={uuid}
     * Triggers the full orchestration flow: runs both Prophet forecast and Pricing Rules,
     * then combines the results.
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResultDTO> runFullAnalysis(
            @RequestParam(required = false) String merchantId) {
        log.info("POST /api/analyze for merchant={}", merchantId);
        try {
            UUID id = resolveMerchantId(merchantId);
            AnalysisResultDTO result = analyzeService.runFullAnalysis(id);
            if ("ERROR".equals(result.getStatus())) {
                return ResponseEntity.internalServerError().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/analyze?merchantId={uuid}
     * Retrieves the latest analysis results without triggering a new run.
     */
    @GetMapping("/analyze")
    public ResponseEntity<AnalysisResultDTO> getAnalysisResults(
            @RequestParam(required = false) String merchantId) {
        log.info("GET /api/analyze for merchant={}", merchantId);
        try {
            UUID id = resolveMerchantId(merchantId);
            AnalysisResultDTO result = analyzeService.getLatestAnalysis(id);
            if ("ERROR".equals(result.getStatus())) {
                return ResponseEntity.internalServerError().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid merchantId: {}", merchantId);
            return ResponseEntity.badRequest().build();
        }
    }
}
