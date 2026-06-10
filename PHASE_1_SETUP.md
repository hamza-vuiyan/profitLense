# ProfitLens Phase 1 — Foundation Setup Guide

## What We Just Built

✅ **JPA Entities** (5 models):
- `Merchant.java` — Hard-coded demo merchant
- `Product.java` — Products with stock codes and prices
- `SalesRecord.java` — Transaction history from data.csv
- `Forecast.java` — Prophet output (created in Phase 2)
- `PricingSignal.java` — Rule engine output (created in Phase 3)

✅ **Repositories** (5 Spring Data JPA):
- `MerchantRepository`
- `ProductRepository`
- `SalesRecordRepository`
- `ForecastRepository`
- `PricingSignalRepository`

✅ **Services**:
- `DataLoaderService` — Parses CSV, creates products, loads sales records

✅ **Controllers** (REST APIs):
- `ProductController` — `GET /api/products` (all products)
- `SalesController` — `GET /api/sales-summary` (last 30 days revenue)

✅ **Configuration**:
- `application.properties` — Database connection template
- `schema.sql` — Database initialization script
- `DataLoaderRunner` — Auto-loads CSV on startup

---

## Step-by-Step Setup (Day 1)

### Step 1: Create Supabase Project & Database
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project:
   - Project name: `profitlense`
   - Database password: **SAVE THIS** (you'll need it)
   - Region: Choose closest to Bangladesh (use `ap-southeast-1` or `ap-south-1`)
4. Wait for project to initialize (~2 min)
5. Copy your **Connection String** from Settings → Database → Connection Pooling

### Step 2: Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy-paste all SQL from `schema.sql` file
4. Click "Run"
5. Verify tables were created:
   - Go to **Table Editor** → you should see all 5 tables

### Step 3: Configure Application Properties
1. Open `src/main/resources/application.properties`
2. Update these fields:
   ```properties
   spring.datasource.url=jdbc:postgresql://[YOUR_PROJECT_ID].supabase.co:5432/postgres
   spring.datasource.password=[YOUR_SUPABASE_PASSWORD]
   ```

   Get these from Supabase:
   - **Project ID**: Settings → General → Project ID (looks like `abcdefgh`)
   - **Password**: The one you set during project creation

3. Save the file

### Step 4: Verify data.csv is in Project Root
1. Check that `data.csv` is at `/home/amir/GitRepos/profitlense/data.csv`
2. It should have 500K+ rows of sales data from UCI Online Retail dataset

### Step 5: Build and Run the Application
```bash
cd /home/amir/GitRepos/profitlense

# Build
mvn clean install -DskipTests

# Run (data will auto-load on startup)
mvn spring-boot:run
```

The app will:
1. Start Spring Boot server on `http://localhost:8080`
2. Auto-load `data.csv` into the database
3. Create demo merchant "Demo Shop Bangladesh"
4. Create products from data.csv
5. Insert ~500K sales records

**This takes 2-3 minutes depending on your machine.**

### Step 6: Test the APIs (Use Postman or curl)

**Test 1: Get all products**
```bash
curl http://localhost:8080/api/products
```
Expected: JSON array of products (should show 1000+ products)

**Test 2: Get sales summary (last 30 days)**
```bash
curl http://localhost:8080/api/sales-summary
```
Expected: JSON array of sales data grouped by product, sorted by revenue

**Test 3: Health check**
```bash
curl http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

---

## Expected Outputs

### In Supabase Dashboard
- `merchants` table: 1 row ("Demo Shop Bangladesh")
- `products` table: 1000+ rows (from data.csv unique products)
- `sales_records` table: 500K+ rows (all transactions)
- `forecasts` table: empty (will fill in Phase 2)
- `pricing_signals` table: empty (will fill in Phase 3)

### In Postman/Browser
- `GET /api/products` → Returns ~1000 products
- `GET /api/sales-summary` → Returns 50-100 top-selling products + revenue

---

## Troubleshooting

### Error: "Connection refused" (port 5432)
- Check Supabase project is running (check dashboard)
- Verify URL in `application.properties` is correct
- Try port `6543` instead of `5432` (Supabase sometimes requires this)

### Error: "FATAL: Ident authentication failed"
- Password is wrong or missing
- Re-copy from Supabase Settings → Database

### Error: "Tables don't exist"
- Schema SQL wasn't executed
- Run the SQL again in Supabase SQL Editor
- Verify Hibernate DDL mode is `validate` (not `create`)

### CSV Not Loading
- Check `data.csv` is in project root
- Check file size > 10MB (should be ~100MB)
- Check data.csv is readable: `head data.csv` should show headers

### Slow Load
- Normal! 500K rows takes 2-5 minutes
- Check logs: should see "Loaded 10000 records...", "Loaded 20000 records...", etc.
- Use `top` or Task Manager to see CPU/memory usage

---

## Next: Phase 2 — Forecasting AI Engine

Once this is working:
1. Build `forecast.py` (Prophet script)
2. Create `ForecastService.java` to call it
3. Build `GET /api/forecast` endpoint
4. By end of Phase 2, you'll have working time-series predictions

---

## File Summary

| File | Purpose |
|------|---------|
| `src/main/java/com/brainfreezed/profitlense/model/*.java` | 5 JPA entities |
| `src/main/java/com/brainfreezed/profitlense/repository/*.java` | 5 Spring Data repos |
| `src/main/java/com/brainfreezed/profitlense/service/DataLoaderService.java` | CSV parser + data loader |
| `src/main/java/com/brainfreezed/profitlense/controller/*.java` | 2 REST controllers |
| `src/main/java/com/brainfreezed/profitlense/dto/*.java` | Response DTOs |
| `src/main/java/com/brainfreezed/profitlense/DataLoaderRunner.java` | Auto-load on startup |
| `src/main/resources/application.properties` | DB config template |
| `schema.sql` | Database schema (run in Supabase) |

---

## Phase 1 Complete When

- ✅ Supabase project created and connected
- ✅ Schema tables created
- ✅ Application builds with `mvn clean install`
- ✅ `mvn spring-boot:run` starts without errors
- ✅ Data loads to Supabase (check table row counts)
- ✅ `GET /api/products` returns 1000+ products
- ✅ `GET /api/sales-summary` returns revenue data

**Estimated Time: 1.5 hours**

---

**Ready for Phase 2?** Start building `forecast.py` and `ForecastService.java`
