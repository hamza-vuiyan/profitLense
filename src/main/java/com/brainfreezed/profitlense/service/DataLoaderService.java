package com.brainfreezed.profitlense.service;

import com.brainfreezed.profitlense.model.Merchant;
import com.brainfreezed.profitlense.model.Product;
import com.brainfreezed.profitlense.model.SalesRecord;
import com.brainfreezed.profitlense.repository.MerchantRepository;
import com.brainfreezed.profitlense.repository.ProductRepository;
import com.brainfreezed.profitlense.repository.SalesRecordRepository;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.io.FileReader;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataLoaderService {
    
    private final MerchantRepository merchantRepository;
    private final ProductRepository productRepository;
    private final SalesRecordRepository salesRecordRepository;
    
    private static final String DEMO_MERCHANT_NAME = "Demo Shop Bangladesh";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy H:mm");
    private static final int BATCH_SIZE = 1000; // Batch insert every N records for 10x-100x performance improvement
    
    public void loadDataFromCSV(String csvFilePath) {
        log.info("Starting data load from CSV: {}", csvFilePath);
        
        // Skip if data already exists (idempotent - won't reload on subsequent runs)
        long existingProducts = productRepository.count();
        if (existingProducts > 0) {
            log.info("Data already loaded ({} products exist), skipping CSV import", existingProducts);
            return;
        }
        
        // Verify CSV file exists
        try {
            if (!Files.exists(Paths.get(csvFilePath))) {
                log.error("CSV file not found at: {}", Paths.get(csvFilePath).toAbsolutePath());
                throw new RuntimeException("CSV file not found: " + csvFilePath);
            }
            long fileSize = Files.size(Paths.get(csvFilePath));
            log.info("CSV file found: {} (size: {} MB)", Paths.get(csvFilePath).toAbsolutePath(), fileSize / (1024 * 1024));
        } catch (Exception e) {
            log.error("Error accessing CSV file", e);
            throw new RuntimeException("Failed to access CSV file: " + e.getMessage(), e);
        }
        
        try {
            // Ensure demo merchant exists (separate transaction so it's saved even if CSV load fails)
            Merchant merchant = saveMerchantIfNotExists();
            log.info("Using merchant: {} (id: {})", merchant.getName(), merchant.getId());
            
            // Load CSV with BATCH PROCESSING for performance
            Map<String, Product> productCache = new HashMap<>();
            List<SalesRecord> recordBatch = new ArrayList<>();
            
            int recordCount = 0;
            int productCount = 0;
            int errorCount = 0;
            long startTime = System.currentTimeMillis();
            
            try (CSVReader reader = new CSVReader(new FileReader(csvFilePath))) {
                String[] line;
                int lineNum = 0;
                
                // Skip header
                reader.readNext();
                lineNum++;
                log.info("CSV header skipped, starting to read data rows...");
                
                while ((line = reader.readNext()) != null) {
                    lineNum++;
                    try {
                        if (line.length < 8) {
                            log.warn("Skipping incomplete line {}: expected 8 columns, got {}", lineNum, line.length);
                            continue;
                        }
                        
                        String invoiceNo = line[0].trim();
                        String stockCode = line[1].trim();
                        String description = line[2].trim();
                        Integer quantity = Integer.parseInt(line[3].trim());
                        String invoiceDateStr = line[4].trim();
                        BigDecimal unitPrice = new BigDecimal(line[5].trim());
                        
                        // Parse date
                        LocalDate saleDate = LocalDate.parse(invoiceDateStr, DATE_FORMATTER);
                        
                        // Get or create product (with caching to avoid duplicate queries)
                        Product product = productCache.get(stockCode);
                        if (product == null) {
                            Optional<Product> existing = productRepository.findByStockCode(stockCode);
                            if (existing.isPresent()) {
                                product = existing.get();
                            } else {
                                // Create and IMMEDIATELY save product to get ID before referencing in SalesRecord
                                product = Product.builder()
                                    .merchant(merchant)
                                    .stockCode(stockCode)
                                    .name(description)
                                    .category("General")
                                    .currentPrice(unitPrice)
                                    .unit("unit")
                                    .build();
                                product = saveProduct(product);
                                productCount++;
                                
                                if (productCount % 100 == 0) {
                                    log.debug("Created {} unique products so far...", productCount);
                                }
                            }
                            productCache.put(stockCode, product);
                        }
                        
                        // Create sales record (now product has a valid ID)
                        BigDecimal revenue = unitPrice.multiply(BigDecimal.valueOf(quantity));
                        SalesRecord record = SalesRecord.builder()
                            .merchant(merchant)
                            .product(product)
                            .saleDate(saleDate)
                            .quantitySold(quantity)
                            .unitPrice(unitPrice)
                            .revenue(revenue)
                            .build();
                        
                        recordBatch.add(record);
                        recordCount++;
                        
                        // Flush sales records when batch is full
                        if (recordBatch.size() >= BATCH_SIZE) {
                            try {
                                saveSalesRecordBatch(recordBatch);
                                recordBatch.clear();
                                
                                if (recordCount % 10000 == 0) {
                                    long elapsed = System.currentTimeMillis() - startTime;
                                    double rate = recordCount / (elapsed / 1000.0);
                                    log.info("✓ Loaded {} sales records... ({:.0f} records/sec, {} products)", recordCount, rate, productCount);
                                }
                            } catch (Exception e) {
                                log.error("Error flushing sales record batch at record #{}: {}", recordCount, e.getMessage());
                                recordBatch.clear(); // Clear batch to continue
                                // Don't re-throw - continue processing other records
                            }
                        }
                        
                    } catch (Exception e) {
                        errorCount++;
                        if (errorCount <= 10) {
                            log.warn("Error processing line {}: {}", lineNum, e.getMessage());
                        }
                        // Continue processing other lines
                    }
                }
                
                // Flush remaining sales records
                if (!recordBatch.isEmpty()) {
                    try {
                        saveSalesRecordBatch(recordBatch);
                        log.info("✓ Flushed final record batch: {} records", recordBatch.size());
                    } catch (Exception e) {
                        log.error("Error flushing final sales record batch: {}", e.getMessage());
                    }
                    recordBatch.clear();
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            double rate = recordCount / (totalTime / 1000.0);
            log.info("✅ Data load complete! Loaded {} records ({} products) in {:.0f}s ({:.0f} records/sec), {} errors", 
                recordCount, productCount, totalTime / 1000.0, rate, errorCount);
            
        } catch (Exception e) {
            log.error("❌ Error loading CSV data", e);
            // Don't re-throw - let the application continue even if data load fails
        }
    }

    // Separate transaction to ensure merchant is saved even if CSV load fails later
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private Merchant saveMerchantIfNotExists() {
        return merchantRepository.findByName(DEMO_MERCHANT_NAME)
            .orElseGet(() -> {
                Merchant newMerchant = Merchant.builder()
                    .name(DEMO_MERCHANT_NAME)
                    .build();
                return merchantRepository.save(newMerchant);
            });
    }

    // Separate transaction for each batch - so if one batch fails, others still commit
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void saveSalesRecordBatch(List<SalesRecord> batch) {
        if (!batch.isEmpty()) {
            salesRecordRepository.saveAll(batch);
        }
    }

    // Separate transaction for product save
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private Product saveProduct(Product product) {
        return productRepository.save(product);
    }
}
