package com.brainfreezed.profitlense;

import com.brainfreezed.profitlense.service.DataLoaderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * One-time data loader that runs on application startup.
 * After data is loaded successfully, you can disable this by commenting out @Component
 * This prevents re-loading data on every restart (data is already in database)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoaderRunner implements CommandLineRunner {
    
    private final DataLoaderService dataLoaderService;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("ProfitLense application started");
        
        // Check if data.csv exists
        String csvPath = "data.csv";
        File csvFile = new File(csvPath);
        
        if (csvFile.exists()) {
            log.info("Found data.csv, attempting data load...");
            try {
                // DataLoaderService will skip if data is already loaded (idempotent)
                dataLoaderService.loadDataFromCSV(csvPath);
                log.info("✅ Data loading process completed successfully. Data is ready to use.");
                log.info("💡 TIP: If you don't need to reload data again, comment out @Component on this class to speed up startup.");
            } catch (Exception e) {
                log.error("Failed to load data from CSV", e);
                // Don't fail startup, just log the error
            }
        } else {
            log.warn("data.csv not found at {}", csvPath);
        }
    }
}
