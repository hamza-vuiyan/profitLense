# EXECUTION LOG - Phase 1 Complete ✅

## What We Just Built (Day 1, 9 AM - 1.5 hours)

### JPA Entities (5 models)
- ✅ Merchant.java
- ✅ Product.java 
- ✅ SalesRecord.java
- ✅ Forecast.java
- ✅ PricingSignal.java

### Repositories & Services
- ✅ 5 Spring Data JPA repositories
- ✅ DataLoaderService (CSV parser)
- ✅ 2 REST Controllers (Products, Sales)
- ✅ 4 DTOs for responses

### Configuration
- ✅ pom.xml: Added OpenCSV dependency
- ✅ application.properties: Database template
- ✅ schema.sql: Supabase schema
- ✅ DataLoaderRunner: Auto-load CSV on startup
- ✅ PHASE_1_SETUP.md: Complete setup instructions

## Your Next Steps (Right Now)

1. **Create Supabase project** (5 min)
   - Go to supabase.com
   - Create project, save password
   - Copy connection string

2. **Run schema.sql in Supabase** (2 min)
   - Open SQL Editor in Supabase
   - Copy schema.sql contents
   - Run it

3. **Update application.properties** (2 min)
   - Update DB URL and password
   - Save file

4. **Build and run** (5 min + 2-3 min data load)
   - `mvn clean install -DskipTests`
   - `mvn spring-boot:run`
   - Watch logs for data loading

5. **Test endpoints** (5 min)
   - `GET /api/products` → should return 1000+ products
   - `GET /api/sales-summary` → should return revenue data
   - `GET /actuator/health` → should return UP

---


# ProfitLens MVP Execution Plan

## Project Decisions (Locked in for MVP)
- **Merchant scope**: Single demo merchant (hard-coded)
- **AI engines**: 2 core (Forecast + Pricing) — skip anomaly detection
- **Forecasting**: Facebook Prophet (Python via ProcessBuilder)
- **Advisory summary**: English (rules-based) — skip Bangla/Gemini for MVP
- **Authentication**: None (demo-only, no login)
- **Data input**: CSV upload (no external scraping)

## Project Phases (Execution Order)

### Phase 1: Foundation & Database (Day 1, 9 AM – 2 PM)
**Goal**: Working backend with data loaded, able to query sales data

**Database:**
- merchants table (hard-code 1 demo merchant)
- products table (categories + current_price)
- sales_records table (transaction history from data.csv)
- forecasts table (Prophet outputs)
- pricing_signals table (rule engine outputs)

**Backend tasks:**
- Add PostgreSQL + JPA dependencies to pom.xml
- Create all 5 JPA entities with annotations
- Create all 5 repository interfaces
- Set up application.properties with Supabase credentials
- Build ProductController → GET /api/products (returns all products)
- Build SalesController → GET /api/sales-summary (revenue by product, last 30 days)
- Write data loader to parse data.csv and insert into sales_records

**Testing:** Postman test all endpoints. Data visible in Supabase.

---

### Phase 2: AI Engine — Forecasting (Day 1, 2 PM – 5 PM) ✅ Complete
**Goal**: Prophet forecasting script working end-to-end, ready for hybrid deployment.

**Backend tasks:**
- ✅ Add Python script: `forecast.py` (reads sales_records → Prophet → writes forecasts table)
- ✅ Build `ForecastService.java` → `runProphet(merchantId)` → calls `forecast.py` via `ProcessBuilder`
- ✅ Build `/api/forecast` GET endpoint → returns latest forecasts for a merchant
- ✅ Added `Dockerfile` & `scripts/requirements.txt` to support seamless deployment of Java + Python

**Python/ML tasks:**
- ✅ `forecast.py`: loads sales history per product, trains Prophet, outputs 4-week forecast
- ✅ Handle edge cases: products with <10 sales records

**Testing:** ✅ Postman POST to trigger forecast. Verify predictions in forecasts table.

---

### Phase 3: AI Engine — Pricing (Day 2, 9 AM – 12 PM) ✅ Complete
**Goal**: Pricing rule engine working

**Backend tasks:**
- ✅ Hard-code competitor median prices for demo (or load from simple JSON fixture)
- ✅ Build PricingService.java → analyze(merchantId)
- ✅ Apply rule logic: IF price > median * 1.10 → REDUCE | ELSE → HOLD
- ✅ Build /api/pricing GET endpoint → returns pricing signals per product

**Testing:** ✅ Postman test. Verify REDUCE/HOLD signals match logic.

---

### Phase 4: Orchestration (Day 2, 12 PM – 3 PM) ✅ Complete
**Goal**: Single Analyze endpoint that runs both AI engines

**Backend tasks:**
- ✅ Build AnalyzeController.java → POST /api/analyze/{merchantId}
- ✅ Build AnalyzeService.java (orchestrator) → calls ForecastService + PricingService in sequence
- ✅ Return AnalysisResult JSON (forecasts + pricing signals + advisory text)
- ✅ Error handling + graceful degradation

**Testing:** Postman POST /api/analyze. Get full result JSON.

---

### Phase 5: Frontend (Day 2, 3 PM – 6 PM) ✅ Complete
**Goal**: React dashboard with working Analyze button

**Frontend tasks:**
- ✅ Create React app (CRA or Vite)
- ✅ Dashboard component → displays products, current prices
- ✅ Analyze button → POST /api/analyze → show results
- ✅ Results display:
  - Forecast chart (Recharts line chart, 4-week demand)
  - Pricing table (product, current price, signal, suggested price)
  - Advisory text (English summary from backend)

**Testing:** Run dashboard locally. Click Analyze. See results update.

---

### Phase 6: Integration & Polish (Day 3, 9 AM – 12 PM) ✅ Complete
**Goal**: Full end-to-end working demo

**Backend tasks:**
- ✅ CORS configuration (allow React frontend)
- ✅ Error handling + logging
- ✅ Fixed @Async execution timeout bug in AnalyzeService

**Frontend tasks:**
- ✅ Loading state on Analyze button
- ✅ Error handling + user messages
- ✅ Responsive layout (mobile-friendly)
- ✅ Changed theme to a clean light UI design

**Testing:** Deploy both locally. Full flow demo.

---

### Phase 7: Deployment & Demo Prep (Day 3, 12 PM – 5:30 PM)
**Goal**: Live working demo + submission ready

**Deployment:**
- Deploy Spring Boot to Railway (or local/Docker if time-constrained)
- Deploy React to Vercel or GitHub Pages
- Update environment variables (DB credentials, API URL)

**Demo prep:**
- Record 3-min demo video (problem → data upload → click Analyze → see results)
- Create /docs README with architecture diagram
- GitHub repo setup (all code + .gitignore)

---

## Minimum Features for Hackathon Demo

### Must-Have ✅
- [x] CSV upload (or pre-loaded demo data)
- [x] Analyze button that triggers both AI engines
- [x] Forecast chart (4-week demand line chart)
- [x] Pricing recommendations (REDUCE/HOLD signals)
- [x] English advisory text summarizing actions
- [x] Live working URL

### Nice-to-Have (if time permits)
- [ ] Anomaly detection (Z-score alerts)
- [ ] Bangla output (Gemini integration)
- [ ] Multiple merchants
- [ ] User authentication
- [ ] Inventory tracking
- [ ] CSV export of results

### Explicitly Deferred (Post-Hackathon)
- Daraz price scraping
- Nightly scheduled jobs
- Real-time dashboard updates
- Anomaly detection
- Bangla AI summary (Gemini)
- Mobile app
- Multi-tenant SaaS setup

---

## Database Schema (Simplified MVP)

```sql
-- Merchants (hard-code demo merchant)
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_price DECIMAL(10,2),
    unit VARCHAR(50),
    stock_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales history (from data.csv)
CREATE TABLE sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    product_id UUID REFERENCES products(id),
    sale_date DATE NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    revenue DECIMAL(10,2),
    ingested_at TIMESTAMP DEFAULT NOW()
);

-- Prophet forecast output
CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    product_id UUID REFERENCES products(id),
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2),
    lower_bound DECIMAL(10,2),
    upper_bound DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(merchant_id, product_id, forecast_date)
);

-- Pricing signals output
CREATE TABLE pricing_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    product_id UUID REFERENCES products(id),
    current_price DECIMAL(10,2),
    competitor_median DECIMAL(10,2),
    signal VARCHAR(20), -- REDUCE or HOLD
    suggested_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_merchant_product ON sales_records(merchant_id, product_id, sale_date);
CREATE INDEX idx_forecasts_merchant ON forecasts(merchant_id, forecast_date);
CREATE INDEX idx_pricing_merchant ON pricing_signals(merchant_id);
```

---

## API Roadmap (MVP)

### Phase 1: Queries
- `GET /api/products` → Product[] (all products with prices)
- `GET /api/sales-summary` → SalesSummary (revenue by product, last 30 days)

### Phase 2: Forecasting
- `GET /api/forecast` → Forecast[] (latest Prophet predictions)

### Phase 3: Pricing
- `GET /api/pricing` → PricingSignal[] (REDUCE/HOLD per product)

### Phase 4: Orchestration
- `POST /api/analyze` → AnalysisResult (forecasts + pricing + advisory text)
  - Returns JSON with forecasts, pricing_signals, advisory_summary

### Phase 5: Health
- `GET /actuator/health` → Status (for deployment verification)

---

## Development Timeline

### Day 1 (Thursday) — Foundation
| Time | Task | Duration | Owner |
|------|------|----------|-------|
| 9:00 AM | DB schema + JPA entities + repositories | 2.5 hrs | Backend |
| 11:30 AM | Supabase setup + schema creation | 1 hr | DevOps |
| 12:30 PM | Data loader: parse data.csv → insert sales_records | 1.5 hrs | Backend |
| 2:00 PM | Break + test | 30 min | — |
| 2:30 PM | Build forecast.py (Prophet script) | 2 hrs | ML/Backend |
| 4:30 PM | ForecastService + /api/forecast endpoint | 1 hr | Backend |
| 5:30 PM | Postman tests + verify data loaded | 30 min | Backend |

**Day 1 Success Criteria:**
- ✅ All DB tables created + indexed
- ✅ data.csv loaded into sales_records (100K+ rows)
- ✅ GET /api/products returns all products
- ✅ GET /api/sales-summary returns revenue data
- ✅ forecast.py runs without errors
- ✅ GET /api/forecast returns predictions

---

### Day 2 (Friday) — AI Engines & Frontend
| Time | Task | Duration | Owner |
|------|------|----------|-------|
| 9:00 AM | PricingService + /api/pricing endpoint | 1.5 hrs | Backend |
| 10:30 AM | AnalyzeService + POST /api/analyze orchestration | 1.5 hrs | Backend |
| 12:00 PM | End-to-end backend testing (Postman) | 1 hr | Backend |
| 1:00 PM | Lunch break | 1 hr | — |
| 2:00 PM | React dashboard scaffolding + Analyze button | 2 hrs | Frontend |
| 4:00 PM | Forecast chart (Recharts) + Pricing table | 1.5 hrs | Frontend |
| 5:30 PM | Integration test + bug fixes | 1 hr | Frontend+Backend |

**Day 2 Success Criteria:**
- ✅ POST /api/analyze returns full AnalysisResult JSON
- ✅ React dashboard renders forecast line chart
- ✅ Pricing table shows REDUCE/HOLD signals
- ✅ Clicking Analyze button triggers both engines
- ✅ Results display on dashboard

---

### Day 3 (Saturday) — Polish & Deployment
| Time | Task | Duration | Owner |
|------|------|----------|-------|
| 9:00 AM | CORS config + error handling | 1 hr | Backend |
| 10:00 AM | Loading states + responsive design | 1.5 hrs | Frontend |
| 11:30 AM | Deploy to Railway (backend) + Vercel (frontend) | 1.5 hrs | DevOps/Full |
| 1:00 PM | Lunch + live URL testing | 1.5 hrs | — |
| 2:30 PM | Demo video recording (3 min) | 1.5 hrs | Demo/Video |
| 4:00 PM | README + /docs + GitHub setup | 1 hr | Docs |
| 5:00 PM | Final demo rehearsal + submission | 30 min | Lead |

**Day 3 Success Criteria:**
- ✅ Live URL working (both backend + frontend)
- ✅ Full demo flow: upload CSV → click Analyze → see results
- ✅ Demo video uploaded
- ✅ GitHub repo public with all code
- ✅ Submission form filled + submitted

---

## Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Prophet installation issues | Blocks forecasting | Medium | Test Prophet locally on Day 1 morning. Have fallback: simple moving average in Java |
| Supabase free tier limits | DB goes down | Low | Use generous indexes. Monitor row count. Keep data < 1GB |
| API quota limits (if using external LLM) | Demo fails | Low | Skip Gemini for MVP (using English rules-based instead) |
| CSV parsing bugs | Bad data load | Medium | Validate CSV format early. Use strict error messages |
| React-Backend CORS issues | Frontend can't call API | Medium | Add @CrossOrigin(origins = "*") on all controllers |
| Deployment fails Day 3 | Can't demo live | Medium | Have local Docker setup as backup. Practice deployment on Day 2 evening |
| Forecast prediction errors | Unrealistic numbers | Low | Validate Prophet output bounds. Add sanity checks (e.g., predictions > 0) |
| Time pressure | Incomplete features | High | **Prioritize ruthlessly.** Day 1 = data only. Day 2 = AI. Day 3 = polish+deploy |

**Mitigation strategy for time pressure:**
1. Use hardcoded/fixture data instead of scraping
2. Skip authentication (demo-only)
3. Defer anomaly detection to post-hackathon
4. Deploy locally or to free tier only (no fancy infra)
5. Focus on ONE merchant demo (not multi-tenant)

---

## MVP Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                    React Frontend (Vercel)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Dashboard                                               │ │
│  │  ├─ Products List                                       │ │
│  │  ├─ [Analyze] Button ────────────┐                      │ │
│  │  ├─ Forecast Chart (Recharts)    │                      │ │
│  │  ├─ Pricing Table                │                      │ │
│  │  └─ Advisory Summary             │                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/analyze
                           ▼
┌───────────────────────────────────────────────────────────────┐
│           Spring Boot Backend (Railway)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ AnalyzeController                                       │ │
│  │  └─ POST /api/analyze/{merchantId}                      │ │
│  └────────┬──────────────────────────────────────────────┬─┘ │
│           │                                              │   │
│      Step 1: Forecast                              Step 2: Pricing
│           │                                              │   │
│  ┌────────▼──────────────┐                ┌──────────────▼──────┐
│  │ ForecastService       │                │ PricingService      │
│  │ ├─ queryHistoryDB     │                │ ├─ loadCompetitors  │
│  │ ├─ callProphet.py     │                │ ├─ applyRules       │
│  │ └─ savePredictions    │                │ └─ returnSignals    │
│  └────────┬──────────────┘                └──────────────┬──────┘
│           │                                              │   │
│           └──────────────────┬───────────────────────────┘   │
│                              │                               │
│                    ┌─────────▼──────────┐                    │
│                    │ AnalysisResult JSON│                    │
│                    │ ├─ forecasts[]     │                    │
│                    │ ├─ pricing_signals │                    │
│                    │ └─ advisory_text   │                    │
│                    └─────────┬──────────┘                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL (Supabase)                                   │ │
│  │  ├─ merchants (demo merchant: hard-coded)               │ │
│  │  ├─ products (1000+ from data.csv)                      │ │
│  │  ├─ sales_records (100K+ transactions)                  │ │
│  │  ├─ forecasts (Prophet output)                          │ │
│  │  └─ pricing_signals (rule engine output)                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Python Scripts (executed from Spring Boot)              │ │
│  │  └─ forecast.py (Prophet time-series forecasting)       │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## Key Implementation Decisions

### Why this order?
1. **Foundation first** (DB + data) → unblocks all AI work
2. **Forecasting second** → most complex AI, needs testing
3. **Pricing third** → simpler rule engine, faster to deliver
4. **Orchestration** → glues everything together
5. **Frontend last** → can work in parallel, but needs backend ready

### Why skip these for MVP?
- **Gemini Bangla integration** → Requires API key, adds latency, not critical for demo
- **Anomaly detection** → Nice-to-have, takes 1 hr, can be Day 3 if time permits
- **Multi-merchant support** → Adds complexity, demo works with single merchant
- **Authentication** → Not needed for internal demo
- **Daraz scraping** → Too unreliable for hackathon, use hard-coded competitor prices

### Recommended fallback plans
- **Prophet fails to install?** → Use simple 7-day moving average (Java)
- **Supabase unavailable?** → Use local PostgreSQL in Docker
- **No time for React?** → Use Postman + API calls + Excel charts
- **Deployment fails?** → Demo locally on laptop with live Postman tests

---

## Success Metrics for MVP Demo

| Metric | Target | How to verify |
|--------|--------|---------------|
| **Data loaded** | 100K+ sales records in DB | SELECT COUNT(*) FROM sales_records |
| **Forecast accuracy** | Prophet runs, predictions > 0 | SELECT * FROM forecasts LIMIT 5 |
| **Pricing signals** | REDUCE/HOLD logic working | GET /api/pricing returns valid signals |
| **E2E flow** | POST /api/analyze returns full JSON | Postman test |
| **Frontend demo** | Click Analyze → see results in 3 sec | Live demo on screen |
| **Live URL** | Both backend + frontend accessible | Share URL with judges |
| **Video quality** | 3 min, clear demo flow | YouTube link in submission |

---

## Files to Create (In Order)

### Day 1
1. src/main/java/com/brainfreezed/profitlense/model/*.java (5 entities)
2. src/main/java/com/brainfreezed/profitlense/repository/*.java (5 repos)
3. src/main/java/com/brainfreezed/profitlense/service/DataLoaderService.java
4. src/main/java/com/brainfreezed/profitlense/controller/ProductController.java
5. src/main/java/com/brainfreezed/profitlense/controller/SalesController.java
6. src/main/resources/application.properties
7. scripts/forecast.py

### Day 2
8. src/main/java/com/brainfreezed/profitlense/service/ForecastService.java
9. src/main/java/com/brainfreezed/profitlense/service/PricingService.java
10. src/main/java/com/brainfreezed/profitlense/service/AnalyzeService.java
11. src/main/java/com/brainfreezed/profitlense/controller/AnalyzeController.java
12. src/main/java/com/brainfreezed/profitlense/dto/AnalysisResult.java
13. React dashboard + components

### Day 3
14. Docker compose (optional)
15. README.md + /docs
16. GitHub Actions workflow (optional)

---

## Final Recommendation

**MVP sweet spot for hackathon:**
- ✅ Single demo merchant (simpler logic)
- ✅ Forecast + Pricing only (2 AI engines, not 4)
- ✅ Prophet forecasting (impressive, real ML)
- ✅ English advisory (no Gemini complexity)
- ✅ React dashboard with charts (visual impact)
- ✅ Live demo URL (works, auditable)

**Time estimate:** 2.5 days (Day 1 afternoon starts, full Day 2+3)
**Team: 1-2 people can pull this off**
**Risk: Low (simple architecture, clear phases)**
**Demo impact: HIGH (working AI + charts + live data)**

---

## Next Steps

1. ✅ Confirm database credentials for Supabase
2. ✅ Install Python + Prophet locally
3. ✅ Create Spring Boot data loader (Day 1, morning)
4. ✅ Set local dev environment (Java 17, Maven, Python 3.9+)
5. ✅ Commit plan to GitHub (this document)
6. ✅ Begin Day 1 execution (Foundation phase)

**Ready to start?** → Begin with pom.xml dependency setup + database schema creation.
