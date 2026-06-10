package com.brainfreezed.profitlense.controller;

import com.brainfreezed.profitlense.dto.ProductDTO;
import com.brainfreezed.profitlense.model.Product;
import com.brainfreezed.profitlense.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final ProductRepository productRepository;
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<ProductDTO> products = productRepository.findAll().stream()
            .map(p -> ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .currentPrice(p.getCurrentPrice())
                .unit(p.getUnit())
                .stockCode(p.getStockCode())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/products/{merchantId}")
    public ResponseEntity<List<ProductDTO>> getProductsByMerchant(@PathVariable UUID merchantId) {
        List<ProductDTO> products = productRepository.findByMerchantId(merchantId).stream()
            .map(p -> ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .currentPrice(p.getCurrentPrice())
                .unit(p.getUnit())
                .stockCode(p.getStockCode())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }
}
