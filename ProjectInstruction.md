# ProfitLens — Complete Project Context Document
> AI-Powered Commerce Intelligence Dashboard for Bangladeshi SMEs
> The Infinity AI BuildFest 2026 — Track 4: Online Commerce (E-Commerce)
> Team Lead: Md. Amir Hamza | Event: June 12, 2026 | BRAC University, Dhaka

---

## Quick Reference

| Field | Detail |
|---|---|
| Project name | ProfitLens |
| Full title | ProfitLens — AI-Powered Commerce Intelligence Dashboard for Bangladeshi SMEs |
| Hackathon | The Infinity AI BuildFest 2026 |
| Organizer | CloudCamp Bangladesh |
| Track | Track 4 — Online Commerce (E-Commerce) |
| Challenge | AI-Driven Marketplace Optimization → SME Dashboard |
| Team size | 4 members |
| Team lead | Md. Amir Hamza |
| Submission deadline | May 30, 2026, 5:59 PM UTC |
| Final event | June 12, 2026, BRAC University, Dhaka |
| Primary language | Java (Spring Boot) + Python (AI/ML scripts) |
| Frontend | React.js |
| Database | PostgreSQL + pgvector (Supabase free tier) |
| Deployment | Vercel (frontend) + Railway (backend) |
| LLM | Google Gemini 1.5 Flash (free tier) |
| Cost | $0 — all free tiers |

---

## 1. Elevator Pitch

> An AI-native dashboard that helps Bangladeshi small businesses forecast demand, optimize pricing, and grow sales — no data science degree required.

---

## 2. Problem Statement

Bangladeshi SMEs — over 7.8 million of them — operate with almost zero data intelligence. Owners manually track inventory in notebooks, price products based on competitor guessing, and have no visibility into which products will sell next week or next month.

**Three chronic problems:**
1. **Stockouts during peak demand** — lost sales
2. **Overstocking of slow items** — wasted capital
3. **No ability to react to market trends** — reactive, not proactive

Existing analytics tools (Google Analytics, Shopify) are:
- English-only
- Technically complex
- Built for Western markets
- Not affordable for small Bangladeshi merchants

There is no affordable, Bangla-first, AI-native business intelligence tool designed for the Bangladeshi SME context.

---

## 3. Solution — What ProfitLens Does

ProfitLens is a full-stack AI-native dashboard that gives SME owners the intelligence of a data science team at near-zero cost.

### What it is NOT
- Not an e-commerce platform
- Not a shopping cart or order management system
- Not a payment gateway

### What it IS
A **read + analyze tool** — like Google Analytics for websites, but for a shop owner's sales data. The owner brings their data; ProfitLens provides the intelligence.

### Core User Flow
```
Shop owner opens ProfitLens dashboard
  → sees their products and recent sales data
  → clicks the "Analyze" button
  → system runs all 4 AI engines in sequence
  → dashboard populates with:
      • 4-week demand forecast charts
      • pricing recommendation per product
      • anomaly alert cards (if any)
      • Bangla AI advisory summary at the top
  → owner reads Bangla summary and takes action
```

---

## 4. Data Sources

| Source | Type | Purpose | How |
|---|---|---|---|
| UCI Online Retail Dataset (Kaggle) | Open dataset (CC BY 4.0) | Pre-populate dashboard for demo | Download CSV → clean with Pandas → insert to PostgreSQL |
| Daraz Bangladesh public listings | Web scraping | Competitor price data | Scrapy + BeautifulSoup → price_snapshots table |
| Bangladesh BBS Consumer Price Index | Public PDF | Market trend context for RAG | PyPDF → pgvector embeddings |
| Merchant CSV/XLSX upload | User upload | Real merchant sales data | Apache POI + OpenCSV → Spring Boot → PostgreSQL |
| Synthetic data (Python script) | Generated | Testing and fallback demo | Realistic Bangladeshi retail products (rice, oil, soap) |

### Data Sources Checkboxes for Submission Form
- ✅ Internal (own DB / app data)
- ✅ External APIs (paid/free)
- ✅ Public Web (scraping)
- ✅ User Uploads / Bulk Import
- ✅ Open Datasets (Kaggle, HF, gov)
- ✅ Synthetic / AI-generated Data

---

## 5. The 4 AI Roles

### AI Role 1 — Demand Forecasting (Facebook Prophet)

| Field | Detail |
|---|---|
| Model | Facebook Prophet (Python, MIT license) |
| Input | Per-product daily sales history (product_id, date, quantity) |
| Output | Weekly demand predictions with upper/lower confidence bounds for next 4 weeks |
| Trigger | Called by Spring Boot via ProcessBuilder when Analyze is clicked |
| Storage | Results written to `forecasts` table in PostgreSQL |
| Example | "Next week: ~120 units of rice, ~40 units of cooking oil" |
| Evaluation | MAE and MAPE on held-out 2-week test window. MAPE > 30% = warning |

**Why Prophet:**
- Handles seasonality, trends, and irregular patterns automatically
- Works well on short sales histories (3–6 months)
- Completely free and open source
- Runs locally — no external API, no data leaves the server

---

### AI Role 2 — Dynamic Pricing Engine (Rule-Based)

| Field | Detail |
|---|---|
| Type | Deterministic rule engine (Java, Spring Boot) |
| Input | Merchant's current price + scraped competitor median price from price_snapshots |
| Logic | Compare merchant price vs competitor median → apply 15% margin floor |
| Output | REDUCE / HOLD / RAISE signal per product with explanation |
| Storage | Results written to `pricing_signals` column in products table |
| Example | "Cooking oil priced 12% above competitors — reduce to ৳95" |
| Bias guard | Hard floor prevents recommendations below minimum margin for essential goods |

**Signal logic:**
```
IF merchant_price > competitor_median * 1.10  → REDUCE
IF merchant_price < cost_floor (margin < 15%)  → RAISE
ELSE                                            → HOLD
```

---

### AI Role 3 — Bangla Advisory Summary (Gemini LLM + RAG)

| Field | Detail |
|---|---|
| Model | Google Gemini 1.5 Flash (free tier) |
| Embedding model | Gemini text-embedding-004 (2048 dimensions, free tier) |
| Vector store | pgvector on Supabase |
| RAG type | Contextual RAG (Anthropic-style) + Semantic chunking + Hybrid search |
| Context sources | Daraz category trends + BBS CPI reports embedded in pgvector |
| Retrieval | Top-3 chunks via cosine similarity + product knowledge graph traversal |
| Output | JSON: `{ "summary_bangla": "...", "action_items": ["✓ ...", "✓ ...", "✓ ..."] }` |
| Storage | Written to `ai_summaries` table |
| Token optimization | Gemini Context Caching + JSON mode + batch processing |

**Example output:**
```json
{
  "summary_bangla": "আপনার চাল স্টক ৩ সপ্তাহে শেষ হবে — এখনই অর্ডার দিন। সরিষার তেলের দাম বাজারের তুলনায় ১২% বেশি।",
  "action_items": [
    "✓ চাল পুনরায় অর্ডার করুন — আনুমানিক ৩ সপ্তাহের মজুদ বাকি",
    "✓ সরিষার তেলের দাম ৳৯৫ এ কমানোর কথা বিবেচনা করুন",
    "✓ সাবানের বিক্রয় স্বাভাবিকের চেয়ে বেশি — স্টক চেক করুন"
  ]
}
```

---

### AI Role 4 — Anomaly Detection (Statistical Z-Score)

| Field | Detail |
|---|---|
| Method | Z-score on 14-day rolling window per product |
| Input | Daily sales history per product from sales_records table |
| Threshold | Z-score > 2.0 standard deviations = anomaly |
| Output | Alert record with severity (MILD / CRITICAL) + product + direction (SPIKE / DROP) |
| Storage | Written to `anomaly_alerts` table |
| UI | Color-coded alert card on dashboard (amber = MILD, deep amber = CRITICAL) |
| Implementation | Java in Spring Boot using descriptive statistics — no external ML library needed |

**Formula:**
```
rolling_mean = AVG(daily_sales) over last 14 days
rolling_std  = STDDEV(daily_sales) over last 14 days
z_score      = (today_sales - rolling_mean) / rolling_std
IF ABS(z_score) > 2.0 → create alert
```

---

## 6. System Architecture

### 8-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: User Interface                                        │
│  React 18 + Recharts + Bangla UI + Vercel                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Application Logic                                     │
│  Spring Boot 3.2 REST API + Spring Scheduler + CORS config      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: AI Intelligence                                       │
│  Gemini 1.5 Flash + Facebook Prophet + Z-score + Rule Engine    │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Knowledge Retrieval (RAG)                             │
│  pgvector + Contextual RAG + Semantic chunking + Hybrid search  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5: Agent Pipeline                                        │
│  Scraper Agent + Forecaster Agent + Summarizer Agent + Alert    │
├─────────────────────────────────────────────────────────────────┤
│  Layer 6: Data Storage                                          │
│  PostgreSQL + pgvector (Supabase) + Redis cache                 │
├─────────────────────────────────────────────────────────────────┤
│  Layer 7: Data Acquisition                                      │
│  Scrapy + BeautifulSoup + Apache POI + OpenCSV + PyPDF          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 8: Automation & Ops                                      │
│  n8n + Supabase Realtime + GitHub Actions + Spring Actuator     │
└─────────────────────────────────────────────────────────────────┘
```

### Core User-Triggered Flow (Analyze Button)

```
React: POST /api/analyze
  │
  ├─► Spring Boot AnalyzeService.java
  │     │
  │     ├─► ProcessBuilder → forecast.py (Python)
  │     │     └─► Prophet trains on sales_records
  │     │     └─► Writes predictions to forecasts table
  │     │
  │     ├─► PricingService.java
  │     │     └─► Reads price_snapshots (competitor prices)
  │     │     └─► Applies margin floor rule
  │     │     └─► Returns REDUCE/HOLD/RAISE per product
  │     │
  │     ├─► AnomalyService.java
  │     │     └─► Calculates Z-score per product (14-day window)
  │     │     └─► Writes alerts to anomaly_alerts table
  │     │
  │     └─► GeminiService.java
  │           └─► Retrieves top-3 pgvector chunks (RAG)
  │           └─► Builds structured prompt with all AI outputs
  │           └─► Calls Gemini 1.5 Flash API
  │           └─► Parses JSON response
  │           └─► Writes Bangla summary to ai_summaries table
  │
  └─► Returns AnalysisResult JSON to React
        └─► Recharts charts update (forecast line chart, inventory bar chart)
        └─► Pricing pills render (green/amber/gray per product)
        └─► Anomaly cards appear (if alerts exist)
        └─► Bangla summary card shows at top of dashboard
```

### Nightly Automated Pipeline

```
01:00 AM → Scraper Agent    → Scrapy crawls Daraz → writes price_snapshots
02:00 AM → Forecaster Agent → Prophet reruns for all merchants → updates forecasts
03:00 AM → Summarizer Agent → Gemini generates fresh Bangla summaries
Any time → Alert Agent (n8n) → polls pipeline_runs every 15 min → fires webhook on failure
```

---

## 7. Database Schema

### Tables

```sql
-- Core merchant and product data
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_price DECIMAL(10,2),
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sales history (from Kaggle dataset or merchant CSV upload)
CREATE TABLE sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    product_id UUID REFERENCES products(id),
    sale_date DATE NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    revenue DECIMAL(10,2),
    source_file VARCHAR(255),
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
    model_version VARCHAR(50),
    pipeline_run_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Daraz scraper output
CREATE TABLE price_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_category VARCHAR(100),
    product_name VARCHAR(255),
    competitor_price DECIMAL(10,2),
    source_url VARCHAR(500),
    scraped_at TIMESTAMP DEFAULT NOW()
);

-- Z-score anomaly detection output
CREATE TABLE anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    product_id UUID REFERENCES products(id),
    alert_date DATE NOT NULL,
    z_score DECIMAL(6,3),
    direction VARCHAR(10), -- SPIKE or DROP
    severity VARCHAR(10),  -- MILD or CRITICAL
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Gemini LLM output
CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    summary_bangla TEXT NOT NULL,
    action_items JSONB,
    tokens_used INTEGER,
    pipeline_run_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pipeline observability
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL, -- scraper / forecaster / summarizer / analyzer
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    status VARCHAR(20),             -- success / failed / partial
    rows_processed INTEGER,
    rows_failed INTEGER,
    error_message TEXT,
    merchant_id UUID
);

-- pgvector table for RAG knowledge base
CREATE TABLE market_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    source VARCHAR(255),            -- daraz / bbs / synthetic
    product_category VARCHAR(100),
    scraped_at TIMESTAMP,
    embedding VECTOR(2048)          -- Gemini text-embedding-004
);
CREATE INDEX ON market_documents USING ivfflat (embedding vector_cosine_ops);
```

### Key Indexes
```sql
CREATE INDEX idx_sales_merchant_product ON sales_records(merchant_id, product_id);
CREATE INDEX idx_sales_date ON sales_records(sale_date);
CREATE INDEX idx_forecasts_merchant ON forecasts(merchant_id, forecast_date);
CREATE INDEX idx_anomalies_merchant ON anomaly_alerts(merchant_id, resolved);
CREATE INDEX idx_pipeline_status ON pipeline_runs(status, job_name);
```

---

## 8. REST API Endpoints

| Method | Endpoint | Description | Returns |
|---|---|---|---|
| GET | `/api/products/{merchantId}` | List all products with current prices | Product[] |
| GET | `/api/sales-summary/{merchantId}` | Revenue by product for last 30 days | SalesSummary |
| POST | `/api/analyze/{merchantId}` | **Main endpoint** — runs all 4 AI engines | AnalysisResult |
| GET | `/api/forecast/{merchantId}` | Get latest Prophet forecast | Forecast[] |
| GET | `/api/pricing/{merchantId}` | Get pricing signals | PricingSignal[] |
| GET | `/api/anomalies/{merchantId}` | Get active anomaly alerts | AnomalyAlert[] |
| GET | `/api/summary/{merchantId}` | Get latest Bangla AI summary | AiSummary |
| POST | `/api/upload/{merchantId}` | Upload sales CSV/XLSX | UploadResult |
| GET | `/api/export/csv/{merchantId}` | Download forecast + inventory as CSV | File |
| GET | `/actuator/health` | Health check | Status |

### AnalysisResult JSON Shape
```json
{
  "merchantId": "uuid",
  "analysisTimestamp": "2026-05-20T14:30:00Z",
  "forecasts": [
    {
      "productId": "uuid",
      "productName": "চাল",
      "weeklyForecast": [
        { "week": 1, "predicted": 120, "lower": 95, "upper": 145 },
        { "week": 2, "predicted": 115, "lower": 90, "upper": 140 },
        { "week": 3, "predicted": 108, "lower": 84, "upper": 132 },
        { "week": 4, "predicted": 122, "lower": 97, "upper": 147 }
      ]
    }
  ],
  "pricingSignals": [
    {
      "productId": "uuid",
      "productName": "সরিষার তেল",
      "currentPrice": 110.0,
      "competitorMedian": 97.5,
      "signal": "REDUCE",
      "suggestedPrice": 95.0,
      "explanation": "Priced 12% above competitor median"
    }
  ],
  "anomalyAlerts": [
    {
      "productId": "uuid",
      "productName": "সাবান",
      "zScore": 2.4,
      "direction": "SPIKE",
      "severity": "MILD",
      "alertDate": "2026-05-20"
    }
  ],
  "aiSummary": {
    "summaryBangla": "আপনার চাল স্টক ৩ সপ্তাহে শেষ হবে — এখনই অর্ডার দিন।",
    "actionItems": [
      "✓ চাল পুনরায় অর্ডার করুন",
      "✓ সরিষার তেলের দাম ৳৯৫ এ কমান",
      "✓ সাবানের বিক্রয় বৃদ্ধি পর্যবেক্ষণ করুন"
    ]
  },
  "pipelineRunId": "uuid"
}
```

---

## 9. Complete Tech Stack

### Backend (Java / Spring Boot)

| Library | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2 | REST API, scheduling, validation, dependency injection |
| Spring Data JPA + Hibernate | Latest | PostgreSQL ORM, entity mapping |
| Spring Boot Actuator | Latest | Health check at `/actuator/health`, metrics |
| Apache POI | 5.2 | XLSX file parsing for merchant uploads |
| OpenCSV | 5.8 | CSV file parsing for merchant uploads |
| Jackson | Latest | JSON serialization/deserialization |
| SLF4J + Logback | Latest | Structured JSON application logging |
| JUnit 5 + Mockito | Latest | Unit and integration testing |
| Lombok | Latest | Reduces boilerplate (@Getter, @Builder, @Slf4j) |

### Python Services

| Library | Version | Purpose |
|---|---|---|
| Facebook Prophet | 1.1 | Time-series demand forecasting |
| Pandas | 2.x | Data cleaning, CSV/XLSX manipulation, normalization |
| Scrapy | 2.11 | Automated Daraz product listing scraper |
| BeautifulSoup4 | 4.x | HTML parsing for scraped Daraz pages |
| PyPDF | 4.x | BBS Consumer Price Index PDF parsing |
| NumPy | Latest | Z-score anomaly detection calculations |
| Pydantic | 2.x | Schema validation for scraped data before DB insert |
| psycopg2 | Latest | PostgreSQL driver for Python scripts |
| FastAPI | 0.110 | Lightweight microservice for pgvector embedding generation |

### Frontend (React)

| Library | Version | Purpose |
|---|---|---|
| React | 18 | Component-based dashboard UI |
| Recharts | 2.x | Demand forecast line charts, inventory bar charts |
| Axios | Latest | Spring Boot REST API calls |
| Supabase JS | Latest | Realtime subscription for auto-refresh |

### Infrastructure

| Service | Tier | Purpose |
|---|---|---|
| Supabase | Free | PostgreSQL 15 + pgvector extension + Realtime |
| Railway | Free | Spring Boot JAR hosting |
| Vercel | Free | React frontend hosting + auto-deploy on git push |
| GitHub Actions | Free | CI/CD — run tests on push, deploy on merge to main |

### AI / ML

| Tool | Purpose | Cost |
|---|---|---|
| Google Gemini 1.5 Flash | Primary LLM for Bangla summary | Free tier |
| Gemini text-embedding-004 | Document + query embeddings for RAG | Free tier |
| Facebook Prophet | Demand forecasting ML model | Free (MIT) |
| Ollama + DeepSeek-R1-Distill-7B | Local dev/testing, Gemini fallback | Free |
| Ollama + Llama 3.2-3B | Offline fallback if Gemini API fails | Free |

### Automation

| Tool | Purpose |
|---|---|
| n8n | Pipeline failure alerting + future WhatsApp notifications |
| Supabase Realtime | Push dashboard refresh when new summary written to DB |
| Spring Boot @Scheduled | Nightly cron: scraper (1 AM) → forecast (2 AM) → summary (3 AM) |

---

## 10. Gemini Integration Details

### Production Prompt (Bangla Merchant Advisory)

```
SYSTEM:
You are a business advisor for small shop owners in Bangladesh. You speak
only in simple, practical Bangla. You summarize sales data into short,
actionable advice. Never use technical terms. Never give investment advice.
Never mention any information not present in the data provided. If you are
unsure, say "তথ্য পর্যাপ্ত নয়" (not enough information). Always qualify
predictions with "প্রায়" (approximately).

USER:
Merchant data:
- Top products: {{product_list}}
- Demand forecast next 4 weeks: {{forecast_summary}}
- Pricing signals: {{pricing_signals}}
- Active alerts: {{anomaly_alerts}}
- Relevant market context: {{rag_chunks}}

Write a summary in Bangla of 3-4 sentences. Then list exactly 3 action
items the merchant should take this week, each starting with a checkmark.
Respond ONLY in this JSON format:
{
  "summary_bangla": "...",
  "action_items": ["✓ ...", "✓ ...", "✓ ..."]
}
```

### Token Optimization Strategy

| Technique | Implementation |
|---|---|
| Gemini Context Caching | System prompt cached per session |
| JSON mode | Forced structured output — no free text |
| Cheap model routing | Gemini Flash (not Pro) for all inference |
| Request batching | All merchant summaries in one nightly batch |
| Data compression | Prophet output compressed to stats (mean, upper, lower) — raw rows never sent |
| Chunk size limit | RAG chunks capped at 200 tokens before injection |
| Rolling summary | Only latest 4-week window sent — not full history |

### Guardrails

| Guardrail | Implementation |
|---|---|
| Hallucination prevention | Any numeric value in Bangla summary cross-checked against Prophet output. Deviation > 20% triggers regeneration. |
| Scope protection | System prompt hard boundary: "Do not give investment advice or respond outside merchant sales data." |
| JSON validation | Response parsed strictly. Empty summary_bangla = retry with stricter prompt. |
| Output audit | Every Gemini call logged to pipeline_runs with tokens_used, latency, success/failure |

---

## 11. RAG Architecture

### Pipeline

```
1. INGESTION (one-time + nightly refresh):
   Daraz pages scraped → HTML parsed → text chunks extracted
   BBS PDFs downloaded → text extracted via PyPDF
   Each chunk prefixed with context header:
     "[Source: Daraz | Category: grocery | Date: 2026-05-01]"
   Chunks embedded via Gemini text-embedding-004 (2048 dims)
   Embeddings stored in pgvector market_documents table

2. RETRIEVAL (at query time, inside Analyze flow):
   Merchant's active product categories used as query input
   Query rewritten via Prompt 3 (RAG Query Rewriter)
   Rewritten query embedded → cosine similarity search in pgvector
   Top-3 chunks retrieved
   Product knowledge graph traversed:
     product → subcategory → category → market_sector
     Sibling products' prices added as extra context
   Combined context injected into Gemini prompt

3. GENERATION:
   Gemini receives: forecast data + pricing signals + RAG context
   Returns Bangla JSON summary
```

### RAG Techniques Used

| Technique | Implementation |
|---|---|
| Contextual RAG | Each chunk prefixed with source + category + date before embedding |
| Variable/Semantic chunking | Split at natural document boundaries (headings, tables) not fixed character count |
| Hybrid search | pgvector cosine similarity + PostgreSQL tsvector full-text search combined |
| Graph RAG | Product knowledge graph in PostgreSQL adjacency table — traversed at retrieval time |
| Query rewriting | Bangla product query rewritten to English market research query before embedding |

---

## 12. Prophet Forecasting Script

### forecast.py (complete logic)

```python
import os
import pandas as pd
from prophet import Prophet
import psycopg2
from datetime import datetime
import uuid

DB_URL = os.environ['DATABASE_URL']
MERCHANT_ID = os.environ['MERCHANT_ID']

def run_forecast():
    conn = psycopg2.connect(DB_URL)
    
    # Load sales history per product
    query = """
        SELECT product_id, sale_date AS ds, SUM(quantity_sold) AS y
        FROM sales_records
        WHERE merchant_id = %s
        GROUP BY product_id, sale_date
        ORDER BY product_id, sale_date
    """
    df = pd.read_sql(query, conn, params=[MERCHANT_ID])
    run_id = str(uuid.uuid4())
    
    for product_id in df['product_id'].unique():
        product_df = df[df['product_id'] == product_id][['ds', 'y']].copy()
        product_df['ds'] = pd.to_datetime(product_df['ds'])
        
        if len(product_df) < 10:  # skip if not enough data
            continue
        
        # Train Prophet
        m = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=0.80  # 80% confidence interval
        )
        m.fit(product_df)
        
        # Predict next 4 weeks (28 days)
        future = m.make_future_dataframe(periods=28)
        forecast = m.predict(future)
        future_only = forecast[forecast['ds'] > product_df['ds'].max()]
        
        # Write results to forecasts table
        with conn.cursor() as cur:
            for _, row in future_only.iterrows():
                cur.execute("""
                    INSERT INTO forecasts 
                    (id, merchant_id, product_id, forecast_date, predicted_demand, 
                     lower_bound, upper_bound, model_version, pipeline_run_id, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (merchant_id, product_id, forecast_date)
                    DO UPDATE SET predicted_demand = EXCLUDED.predicted_demand,
                                  lower_bound = EXCLUDED.lower_bound,
                                  upper_bound = EXCLUDED.upper_bound
                """, (
                    str(uuid.uuid4()), MERCHANT_ID, str(product_id),
                    row['ds'].date(), max(0, row['yhat']),
                    max(0, row['yhat_lower']), max(0, row['yhat_upper']),
                    'prophet-v1', run_id, datetime.now()
                ))
        conn.commit()
    
    conn.close()
    print(f"Forecast complete. run_id={run_id}")

if __name__ == '__main__':
    run_forecast()
```

---

## 13. Spring Boot Key Service Classes

### AnalyzeController.java (entry point)
```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalyzeController {

    @Autowired private AnalyzeService analyzeService;

    @PostMapping("/analyze/{merchantId}")
    public ResponseEntity<AnalysisResult> analyze(@PathVariable UUID merchantId) {
        AnalysisResult result = analyzeService.runFullAnalysis(merchantId);
        return ResponseEntity.ok(result);
    }
}
```

### AnalyzeService.java (orchestrator)
```java
@Service
@Slf4j
public class AnalyzeService {

    @Autowired private ForecastService forecastService;
    @Autowired private PricingService pricingService;
    @Autowired private AnomalyService anomalyService;
    @Autowired private GeminiService geminiService;
    @Autowired private PipelineRunRepository pipelineRunRepo;

    public AnalysisResult runFullAnalysis(UUID merchantId) {
        PipelineRun run = startRun(merchantId, "analyzer");
        try {
            // Step 1: Run Prophet forecasting (calls Python script)
            List<Forecast> forecasts = forecastService.runProphet(merchantId);
            
            // Step 2: Run pricing engine
            List<PricingSignal> pricingSignals = pricingService.analyze(merchantId);
            
            // Step 3: Detect anomalies
            List<AnomalyAlert> anomalies = anomalyService.detect(merchantId);
            
            // Step 4: Generate Gemini Bangla summary
            AiSummary summary = geminiService.generateSummary(
                merchantId, forecasts, pricingSignals, anomalies
            );
            
            finishRun(run, "success");
            return new AnalysisResult(forecasts, pricingSignals, anomalies, summary);
            
        } catch (Exception e) {
            finishRun(run, "failed", e.getMessage());
            throw new RuntimeException("Analysis failed: " + e.getMessage(), e);
        }
    }

    private PipelineRun startRun(UUID merchantId, String jobName) {
        PipelineRun run = new PipelineRun(merchantId, jobName, "running", LocalDateTime.now());
        return pipelineRunRepo.save(run);
    }

    private void finishRun(PipelineRun run, String status) {
        run.setStatus(status);
        run.setFinishedAt(LocalDateTime.now());
        pipelineRunRepo.save(run);
    }
}
```

### PricingService.java (rule engine)
```java
@Service
public class PricingService {

    @Autowired private PriceSnapshotRepository priceRepo;
    @Autowired private ProductRepository productRepo;

    private static final double MARGIN_FLOOR = 0.15;
    private static final double REDUCE_THRESHOLD = 1.10;

    public List<PricingSignal> analyze(UUID merchantId) {
        List<Product> products = productRepo.findByMerchantId(merchantId);
        List<PricingSignal> signals = new ArrayList<>();

        for (Product product : products) {
            Double competitorMedian = priceRepo
                .findMedianPriceByCategory(product.getCategory());

            if (competitorMedian == null) continue;

            double currentPrice = product.getCurrentPrice();
            double costFloor = currentPrice * (1 - MARGIN_FLOOR);
            String signal;
            double suggestedPrice = currentPrice;
            String explanation;

            if (currentPrice > competitorMedian * REDUCE_THRESHOLD) {
                signal = "REDUCE";
                suggestedPrice = competitorMedian * 0.98; // just below median
                explanation = String.format(
                    "Priced %.0f%% above competitor median (৳%.2f)",
                    ((currentPrice / competitorMedian) - 1) * 100, competitorMedian
                );
            } else if (currentPrice < costFloor) {
                signal = "RAISE";
                suggestedPrice = costFloor * 1.05;
                explanation = "Price below minimum margin floor of 15%";
            } else {
                signal = "HOLD";
                explanation = "Price competitive and above margin floor";
            }

            signals.add(new PricingSignal(
                product.getId(), product.getName(),
                currentPrice, competitorMedian,
                signal, suggestedPrice, explanation
            ));
        }
        return signals;
    }
}
```

### AnomalyService.java (Z-score detection)
```java
@Service
public class AnomalyService {

    @Autowired private SalesRecordRepository salesRepo;
    @Autowired private AnomalyAlertRepository alertRepo;

    private static final double Z_THRESHOLD = 2.0;
    private static final int WINDOW_DAYS = 14;

    public List<AnomalyAlert> detect(UUID merchantId) {
        List<UUID> productIds = salesRepo.findDistinctProductIds(merchantId);
        List<AnomalyAlert> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate windowStart = today.minusDays(WINDOW_DAYS);

        for (UUID productId : productIds) {
            List<Double> windowSales = salesRepo
                .findDailySalesInWindow(merchantId, productId, windowStart, today);

            if (windowSales.size() < 7) continue;

            double mean = windowSales.stream()
                .mapToDouble(Double::doubleValue).average().orElse(0);
            double variance = windowSales.stream()
                .mapToDouble(s -> Math.pow(s - mean, 2)).average().orElse(0);
            double std = Math.sqrt(variance);

            if (std == 0) continue;

            double todaySales = salesRepo
                .findTodaySales(merchantId, productId, today);
            double zScore = (todaySales - mean) / std;

            if (Math.abs(zScore) > Z_THRESHOLD) {
                String direction = zScore > 0 ? "SPIKE" : "DROP";
                String severity = Math.abs(zScore) > 3.0 ? "CRITICAL" : "MILD";

                AnomalyAlert alert = new AnomalyAlert(
                    merchantId, productId, today, zScore, direction, severity
                );
                alerts.add(alertRepo.save(alert));
            }
        }
        return alerts;
    }
}
```

### GeminiService.java (LLM integration)
```java
@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    @Autowired private AiSummaryRepository summaryRepo;
    @Autowired private MarketDocumentRepository marketDocRepo;

    public AiSummary generateSummary(
            UUID merchantId,
            List<Forecast> forecasts,
            List<PricingSignal> signals,
            List<AnomalyAlert> anomalies) {

        // Build RAG context — retrieve top-3 chunks from pgvector
        String ragContext = marketDocRepo
            .findTopChunksByCategory(extractCategories(forecasts), 3)
            .stream()
            .map(MarketDocument::getContent)
            .collect(Collectors.joining("\n---\n"));

        // Build structured prompt
        String prompt = buildPrompt(forecasts, signals, anomalies, ragContext);

        // Call Gemini API
        String rawResponse = callGeminiApi(prompt);

        // Parse JSON response
        AiSummaryDto dto = parseGeminiResponse(rawResponse);

        // Validate — check no hallucinated numbers
        validateNumerics(dto, forecasts);

        // Save to DB
        AiSummary summary = new AiSummary(merchantId, dto.summaryBangla(), dto.actionItems());
        return summaryRepo.save(summary);
    }

    private String buildPrompt(List<Forecast> forecasts,
                                List<PricingSignal> signals,
                                List<AnomalyAlert> anomalies,
                                String ragContext) {
        return """
            Merchant data:
            - Demand forecast: %s
            - Pricing signals: %s
            - Active alerts: %s
            - Market context: %s
            
            Write a summary in Bangla of 3-4 sentences and exactly 3 action items.
            Respond ONLY in JSON: {"summary_bangla":"...","action_items":["✓ ...","✓ ...","✓ ..."]}
            """.formatted(
                summarizeForecasts(forecasts),
                summarizeSignals(signals),
                summarizeAnomalies(anomalies),
                ragContext
            );
    }

    private String callGeminiApi(String userPrompt) {
        RestTemplate restTemplate = new RestTemplate();
        String url = GEMINI_URL + "?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT + "\n\n" + userPrompt))
            )),
            "generationConfig", Map.of("responseMimeType", "application/json")
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(
            url, requestBody, Map.class
        );
        // Extract text from response
        return extractTextFromGeminiResponse(response.getBody());
    }

    private static final String SYSTEM_PROMPT = """
        You are a business advisor for small shop owners in Bangladesh.
        Speak only in simple, practical Bangla. Never use technical terms.
        Never give investment advice. Never mention information not in the data.
        Qualify predictions with "প্রায়" (approximately).
        """;
}
```

---

## 14. Frontend Key Components

### Dashboard.jsx structure
```jsx
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, 
         CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
const MERCHANT_ID = "demo-merchant-uuid";

export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/analyze/${MERCHANT_ID}`
      );
      setAnalysisData(data);
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1>ProfitLens 📊</h1>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            background: "#00b37a", color: "#fff",
            border: "none", padding: "0.8rem 2rem",
            borderRadius: "8px", fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "⏳ Analyzing..." : "🔍 Analyze"}
        </button>
      </div>

      {/* Bangla AI Summary Card */}
      {analysisData?.aiSummary && (
        <BanglaSummaryCard summary={analysisData.aiSummary} />
      )}

      {/* Forecast Chart */}
      {analysisData?.forecasts && (
        <ForecastChart forecasts={analysisData.forecasts} />
      )}

      {/* Pricing Table */}
      {analysisData?.pricingSignals && (
        <PricingTable signals={analysisData.pricingSignals} />
      )}

      {/* Anomaly Alerts */}
      {analysisData?.anomalyAlerts?.length > 0 && (
        <AnomalyCards alerts={analysisData.anomalyAlerts} />
      )}
    </div>
  );
}

function BanglaSummaryCard({ summary }) {
  return (
    <div style={{
      background: "#f0fdf8", border: "1px solid #00b37a",
      borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem"
    }}>
      <div style={{ fontSize: "0.75rem", color: "#00b37a", 
                    fontWeight: 600, marginBottom: "0.5rem" }}>
        AI পরামর্শ (AI Advisory)
      </div>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "1rem" }}>
        {summary.summaryBangla}
      </p>
      <ul style={{ paddingLeft: "1rem" }}>
        {summary.actionItems.map((item, i) => (
          <li key={i} style={{ marginBottom: "0.4rem", color: "#1a6b4a" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingTable({ signals }) {
  const pillStyle = (signal) => ({
    padding: "3px 10px", borderRadius: "100px",
    fontSize: "0.72rem", fontWeight: 700,
    background: signal === "HOLD" ? "#dcfce7" :
                signal === "RAISE" ? "#fef9c3" : "#fee2e2",
    color: signal === "HOLD" ? "#166534" :
           signal === "RAISE" ? "#854d0e" : "#991b1b"
  });

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
      <thead>
        <tr style={{ background: "#f8fafc" }}>
          <th style={thStyle}>Product</th>
          <th style={thStyle}>Current Price</th>
          <th style={thStyle}>Competitor Median</th>
          <th style={thStyle}>Signal</th>
          <th style={thStyle}>Suggested Price</th>
        </tr>
      </thead>
      <tbody>
        {signals.map(s => (
          <tr key={s.productId} style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={tdStyle}>{s.productName}</td>
            <td style={tdStyle}>৳{s.currentPrice}</td>
            <td style={tdStyle}>৳{s.competitorMedian}</td>
            <td style={tdStyle}>
              <span style={pillStyle(s.signal)}>{s.signal}</span>
            </td>
            <td style={tdStyle}>৳{s.suggestedPrice.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 15. Environment Variables

### Spring Boot (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://db.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=${SUPABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

gemini.api.key=${GEMINI_API_KEY}
python.script.path=/app/scripts/forecast.py

logging.level.root=INFO
logging.pattern.console={"time":"%d","level":"%level","class":"%logger{36}","msg":"%msg"}%n
```

### Railway Environment Variables (set in Railway dashboard)
```
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_PASSWORD=your_supabase_password_here
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

### React (.env)
```
REACT_APP_API_URL=https://your-app.railway.app
```

---

## 16. Spring Boot Project Structure

```
profitlens/
├── src/main/java/com/profitlens/
│   ├── ProfitLensApplication.java
│   ├── controller/
│   │   ├── AnalyzeController.java
│   │   ├── ProductController.java
│   │   └── UploadController.java
│   ├── service/
│   │   ├── AnalyzeService.java        ← orchestrator
│   │   ├── ForecastService.java       ← calls forecast.py
│   │   ├── PricingService.java        ← rule engine
│   │   ├── AnomalyService.java        ← Z-score
│   │   └── GeminiService.java         ← LLM + RAG
│   ├── model/
│   │   ├── Product.java
│   │   ├── SalesRecord.java
│   │   ├── Forecast.java
│   │   ├── PricingSignal.java
│   │   ├── AnomalyAlert.java
│   │   ├── AiSummary.java
│   │   └── PipelineRun.java
│   ├── repository/
│   │   ├── ProductRepository.java
│   │   ├── SalesRecordRepository.java
│   │   ├── ForecastRepository.java
│   │   ├── PriceSnapshotRepository.java
│   │   ├── AnomalyAlertRepository.java
│   │   ├── AiSummaryRepository.java
│   │   ├── MarketDocumentRepository.java
│   │   └── PipelineRunRepository.java
│   └── dto/
│       ├── AnalysisResult.java
│       └── AiSummaryDto.java
├── src/main/resources/
│   └── application.properties
├── scripts/
│   ├── forecast.py                    ← Prophet forecasting
│   ├── scraper.py                     ← Daraz price scraper
│   └── load_dataset.py                ← Kaggle data loader
├── pom.xml
└── README.md

profitlens-frontend/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── BanglaSummaryCard.jsx
│   │   ├── ForecastChart.jsx
│   │   ├── PricingTable.jsx
│   │   └── AnomalyCards.jsx
│   └── index.jsx
├── .env
└── package.json
```

---

## 17. 3-Day Build Plan

### Day 1 — Foundation (9 AM – 6 PM)

| Time | Task | Duration |
|---|---|---|
| 9:00 AM | Create Spring Boot project via Spring Initializr | 30 min |
| 9:30 AM | Set up free Supabase project + enable pgvector | 30 min |
| 10:00 AM | Design and create all DB tables (SQL schema above) | 45 min |
| 10:45 AM | Download Kaggle UCI dataset + load into PostgreSQL via Python | 1.5 hrs |
| 12:30 PM | Write all JPA entities + repositories | 1.5 hrs |
| 2:00 PM | Build REST API skeleton (all controllers, empty services) | 1.5 hrs |
| 3:30 PM | Build Prophet forecasting Python script | 2 hrs |
| 5:30 PM | Test all endpoints in Postman — verify DB + data loaded | 30 min |

**Day 1 success criteria:** Postman returns 200 from all endpoints. Data visible in Supabase. forecast.py runs without errors.

---

### Day 2 — AI Engine (9 AM – 6 PM)

| Time | Task | Duration |
|---|---|---|
| 9:00 AM | Build PricingService.java (rule engine) | 1.5 hrs |
| 10:30 AM | Build AnomalyService.java (Z-score detection) | 1.5 hrs |
| 12:00 PM | Build GeminiService.java (LLM + prompt + RAG) | 2 hrs |
| 2:00 PM | Wire AnalyzeService.java (orchestrate all 4 AI steps) | 1.5 hrs |
| 3:30 PM | Build Daraz price scraper (scraper.py) | 1.5 hrs |
| 5:00 PM | End-to-end test: POST /api/analyze via Postman | 1 hr |

**Day 2 success criteria:** POST /api/analyze returns full JSON with forecasts, pricingSignals, anomalyAlerts, and aiSummary.summaryBangla all populated.

---

### Day 3 — Frontend + Deploy (9 AM – 5:30 PM)

| Time | Task | Duration |
|---|---|---|
| 9:00 AM | Build React dashboard UI (all chart components) | 3 hrs |
| 12:00 PM | Wire Analyze button → POST /api/analyze → update charts | 1.5 hrs |
| 1:30 PM | Deploy Spring Boot to Railway + React to Vercel | 1.5 hrs |
| 3:00 PM | Push /docs page to GitHub → deploy on Vercel | 30 min |
| 3:30 PM | Record 3-min demo video → upload to YouTube → submit | 2 hrs |

**Day 3 success criteria:** Live URL works. Clicking Analyze on production URL runs full AI pipeline and shows Bangla summary + charts. YouTube video uploaded. Submission form links filled.

---

## 18. Submission Form Quick Reference

### Links to fill

| Field | Points | Content |
|---|---|---|
| YouTube video | 10 pts | 3-min demo video — Problem → Demo → AI explanation |
| GitHub repo | 2 pts | Public repo with README, all code, AGENTS.md |
| Live demo | 5 pts | https://profitlens.vercel.app |
| Figma design | 1 pt | Dashboard wireframe (optional) |

### Judging criteria coverage

| Criterion | Weight | How ProfitLens covers it |
|---|---|---|
| Innovation | 20% | 4 AI techniques + Bangla-first + zero-cost for merchants |
| Technical execution | 20% | Spring Boot + Prophet + Gemini + pgvector RAG + MCP |
| Business model | 20% | 7.8M SME market + clear SaaS monetization pathway |
| Real-world impact | 20% | MAE/MAPE tracked + KPIs: revenue ↑15–30%, stockouts ↓25% |
| Scalability | 10% | Cloud-native + modular agents + free-tier infra |
| Presentation | 10% | /docs page + 3-min video + Bangla UI demo |

---

## 19. Important Notes for Other LLMs

If you are another LLM receiving this context document to help with ProfitLens, here are the critical points to keep consistent:

1. **Project name is ProfitLens** (not SMEBoost — that was the earlier working name, now changed to ProfitLens)

2. **The core user action is one button — "Analyze"** — clicking it runs Prophet → PricingService → AnomalyService → GeminiService in sequence and returns one JSON response to React

3. **No e-commerce functionality** — no cart, no orders, no payments. This is purely a read + analyze dashboard

4. **Language: Java (Spring Boot) for backend, Python only for ML scripts** — Prophet and the scraper are Python scripts called from Spring Boot via ProcessBuilder. Everything else is Java.

5. **Gemini API is free tier** — use Gemini 1.5 Flash, not Pro. API key goes in Railway environment variable GEMINI_API_KEY

6. **Database is Supabase free tier** — PostgreSQL with pgvector extension enabled. Connection string in application.properties

7. **Deployment: Railway (backend) + Vercel (frontend)** — both free tiers, connected via REACT_APP_API_URL environment variable

8. **The Bangla output is critical for judging** — Gemini must respond in Bangla. The JSON mode + Bangla system prompt is non-negotiable

9. **All 4 AI roles must be present in the final demo**: Prophet forecast, pricing rule engine, Z-score anomaly, Gemini Bangla summary

10. **Team has 4 members, team lead is Md. Amir Hamza** — backend engineer with Spring Boot and SQL experience

---

*Document generated for The Infinity AI BuildFest 2026 — ProfitLens project context for LLM handoff.*
*Last updated from conversation with Claude on June 8, 2026.*
