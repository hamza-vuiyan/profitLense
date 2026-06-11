package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.model.DocsConfig;
import com.brainfreezed.profitlense.model.TeamMember;
import com.brainfreezed.profitlense.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DocsController {

    private final DocsConfigRepository docsConfigRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProductRepository productRepository;
    private final SalesRecordRepository salesRecordRepository;
    private final PricingSignalRepository pricingSignalRepository;

    // --- PUBLIC DOCS ENDPOINTS ---

    @GetMapping("/api/docs/config")
    public ResponseEntity<Map<String, Object>> getDocsConfig() {
        DocsConfig config = docsConfigRepository.findAll().stream().findFirst().orElseGet(() -> {
            DocsConfig defaultCfg = new DocsConfig();
            defaultCfg.setPitchText("# Welcome to ProfitLens\nYour AI-powered pricing engine.");
            defaultCfg.setTechText("# Tech Stack\nSpring Boot, React, Supabase.");
            return defaultCfg;
        });

        // Check visibility
        boolean isVisible = config.getIsVisible() != null && config.getIsVisible();
        if (isVisible) {
            LocalDateTime now = LocalDateTime.now();
            if (config.getVisibleFrom() != null && now.isBefore(config.getVisibleFrom())) {
                isVisible = false;
            }
            if (config.getVisibleUntil() != null && now.isAfter(config.getVisibleUntil())) {
                isVisible = false;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("isVisible", isVisible);
        response.put("visibleFrom", config.getVisibleFrom());
        response.put("visibleUntil", config.getVisibleUntil());
        if (isVisible) {
            response.put("pitchText", config.getPitchText());
            response.put("techText", config.getTechText());
        } else {
            response.put("pitchText", "Documentation is currently locked or outside the visible window.");
            response.put("techText", "Documentation is currently locked.");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/docs/team")
    public ResponseEntity<List<TeamMember>> getTeamMembers() {
        return ResponseEntity.ok(teamMemberRepository.findAll());
    }

    @GetMapping("/api/docs/live-metrics")
    public ResponseEntity<Map<String, Long>> getLiveMetrics() {
        Map<String, Long> metrics = new HashMap<>();
        metrics.put("totalProducts", productRepository.count());
        metrics.put("totalSalesRecords", salesRecordRepository.count());
        metrics.put("totalPricingSignals", pricingSignalRepository.count());
        return ResponseEntity.ok(metrics);
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/api/admin/config")
    public ResponseEntity<DocsConfig> getAdminConfig() {
        DocsConfig config = docsConfigRepository.findAll().stream().findFirst().orElseGet(() -> {
            DocsConfig defaultCfg = new DocsConfig();
            defaultCfg.setPitchText("# Welcome to ProfitLens\nYour AI-powered pricing engine.");
            defaultCfg.setTechText("# Tech Stack\nSpring Boot, React, Supabase.");
            return defaultCfg;
        });
        return ResponseEntity.ok(config);
    }

    @PostMapping("/api/admin/config")
    public ResponseEntity<DocsConfig> updateDocsConfig(@RequestBody DocsConfig update) {
        DocsConfig config = docsConfigRepository.findAll().stream().findFirst().orElse(new DocsConfig());
        config.setIsVisible(update.getIsVisible());
        config.setVisibleFrom(update.getVisibleFrom());
        config.setVisibleUntil(update.getVisibleUntil());
        config.setPitchText(update.getPitchText());
        config.setTechText(update.getTechText());
        return ResponseEntity.ok(docsConfigRepository.save(config));
    }

    @PostMapping("/api/admin/team")
    public ResponseEntity<TeamMember> addTeamMember(@RequestBody TeamMember member) {
        return ResponseEntity.ok(teamMemberRepository.save(member));
    }
    
    @DeleteMapping("/api/admin/team/{id}")
    public ResponseEntity<Void> deleteTeamMember(@PathVariable UUID id) {
        teamMemberRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
