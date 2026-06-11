import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { getDocsConfig, getDocsMetrics } from '../api'

const NAV_ITEMS = [
  { id: 'pitch', label: 'Pitch Deck', icon: '🚀', subs: [
    { id: 'problem', label: 'Problem' },
    { id: 'solution', label: 'Solution' },
    { id: 'whyno', label: 'Why Now' },
    { id: 'demo', label: 'Product Demo' },
    { id: 'market', label: 'Market Opportunity' },
    { id: 'bmodel', label: 'Business Model' },
    { id: 'traction', label: 'Traction' },
    { id: 'competition', label: 'Competition' },
    { id: 'advantage', label: 'Unique Advantage' },
    { id: 'gtm', label: 'Go-To-Market' },
    { id: 'team', label: 'Team' },
    { id: 'vision', label: 'Vision' },
  ]},
  { id: 'tech', label: 'Technical', icon: '⚙️', subs: [
    { id: 'overview', label: 'Product Overview' },
    { id: 'features', label: 'Feature Matrix' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'dataflow', label: 'Data Flow' },
    { id: 'stack', label: 'Tech Stack' },
    { id: 'api', label: 'API Reference' },
    { id: 'datalayer', label: 'Data Layer' },
    { id: 'ailayer', label: 'AI Layer' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'perf', label: 'Performance' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'changelog', label: 'Changelog' },
  ]},
]

const PITCH = {
  problem: {
    title: 'The Problem',
    subtitle: 'SMEs lose millions in blind pricing',
    body: `Small and medium e-commerce merchants lose up to 20% of revenue through blind pricing and inventory guesswork. While Amazon uses machine learning to reprice products every hour, SMEs rely on spreadsheets and gut feeling — constantly bouncing between stock-outs and dead inventory. The result: lost margin, wasted inventory, and reactive decision-making.`,
  },
  solution: {
    title: 'Our Solution',
    subtitle: 'AI-powered pricing & demand intelligence',
    body: `ProfitLens is an AI-powered pricing and demand forecasting platform built for the modern e-commerce merchant. Upload your sales history, and within minutes get:

• HOLD/REDUCE pricing signals from a deterministic rules engine
• 4-week AI demand forecasts powered by Facebook Prophet
• Competitor price benchmarking across your category
• Plain-English advisory recommendations

All presented in a clean, real-time dashboard — no data science team required.`,
  },
  whyno: {
    title: 'Why Now',
    subtitle: 'The perfect storm of market need',
    body: `Three macro trends make this the right moment:

1. Rising ad costs squeeze margins — CAC is up 60% YoY. Merchants can no longer subsidize inefficiency.
2. AI commoditization — Facebook Prophet, OpenAI, and open-source ML make advanced forecasting accessible to startups.
3. SME digital acceleration — Post-COVID, 67% of SMBs have adopted new digital tools. The appetite for SaaS analytics has never been higher.

The inflection point is here. Merchants who adopt AI-driven pricing now will have a structural advantage.`,
  },
  demo: {
    title: 'Product Demo',
    subtitle: 'See it in action',
    body: `ProfitLens delivers value in three clicks:

Step 1 — Upload or connect your sales data (CSV or API).
Step 2 — Click "Run Analysis". The pricing rules engine processes all products in <1 second.
Step 3 — Prophet AI trains per-product models (~2-5 min) and generates 4-week forecasts.

The dashboard instantly shows:
• KPI summary — total revenue, at-risk products, forecast accuracy
• Pricing signals table — every product with HOLD/REDUCE badges
• Forecast charts — one interactive LineChart per product
• Advisory grid — plain-English recommendations for action`,
  },
  market: {
    title: 'Market Opportunity',
    subtitle: '20M+ potential customers globally',
    body: `The global e-commerce market is valued at $6.3T with over 20 million online stores. As competition intensifies, margin optimization becomes existential.

ProfitLens targets the SME segment (businesses with 10-500 employees and $1M-$50M revenue) — a market of ~2.5M businesses in North America alone.

Our TAM: $4.2B (pricing optimization SaaS)
Our SAM: $840M (SME-focused pricing + forecasting)
Our target: $50M ARR within 36 months`,
  },
  bmodel: {
    title: 'Business Model',
    subtitle: 'B2B SaaS with clear value-based pricing',
    body: `• Freemium tier: 1 merchant, up to 100 products, basic pricing signals
• Growth ($49/mo): Unlimited products, full forecasting, API access
• Pro ($149/mo): Priority processing, custom models, team accounts
• Enterprise ($499+/mo): White-label, dedicated infra, SLA

Value prop: A typical merchant recovers 5-15% margin in the first month — the tool pays for itself in days.

Channels: Direct outreach, e-commerce community partnerships, Shopify/ WooCommerce marketplace listing`,
  },
  traction: {
    title: 'Traction',
    subtitle: 'Built and deployed on free tiers',
    body: `• Fully deployed and operational on Render + Vercel (free tier)
• Processes 500K+ real transaction rows from UCI Online Retail dataset
• ~1,400 unique products analyzed with pricing signals
• Prophet models trained and forecasting 4 weeks ahead
• End-to-end pipeline runs in <5 minutes
• Ready for beta customer onboarding`,
  },
  competition: {
    title: 'Competition',
    subtitle: 'Unfair advantages vs incumbents',
    body: `Enterprise solutions (Prisync, Competera, IntelligenceNode):
→ $10K+/month, 6-month implementation, enterprise-only
→ ProfitLens: ready in minutes, 100x cheaper, SME-first

Spreadsheet/DIY:
→ Manual, error-prone, no ML
→ ProfitLens: automated, AI-powered, real-time

Generic BI tools (Tableau, PowerBI):
→ No pricing-specific logic, no forecasting models
→ ProfitLens: purpose-built for e-commerce pricing`,
  },
  advantage: {
    title: 'Unique Advantage',
    subtitle: 'Java + Python in one container',
    body: `1. Hybrid architecture — Java rules engine for instant pricing signals + Python Prophet for ML forecasting in a single deployment
2. No infra complexity — multi-stage Docker build packages everything (Maven + Python + Prophet) into one deployable image
3. Real-time by design — frontend polls async jobs; users see incremental progress
4. Free-tier ready — entire stack runs on Render free tier (512MB RAM) + Vercel + Supabase free tier`,
  },
  gtm: {
    title: 'Go-To-Market',
    subtitle: 'Community-first, partnerships-driven',
    body: `Phase 1 (0-3 months): Launch on Product Hunt, Hacker News. Target Shopify/WooCommerce subreddits and e-commerce communities. Price at $0 (founder beta).

Phase 2 (3-9 months): Launch paid tiers. Partner with 3-5 e-commerce agencies for distribution. Target $5K MRR.

Phase 3 (9-18 months): Shopify App Store listing. WooCommerce plugin. Target $50K MRR.

Phase 4 (18-36 months): Expand to Amazon Marketplace integration. Enterprise tier. Target $500K MRR.`,
  },
  team: {
    title: 'Team',
    subtitle: 'Built by BrainFreezed Org',
    body: `A dedicated team of developers and problem-solvers passionate about democratizing AI for e-commerce merchants.`,
  },
  vision: {
    title: 'Vision',
    subtitle: 'The intelligence layer for every online store',
    body: `Our vision is to become the operating system for e-commerce margin optimization. Not just pricing — but inventory planning, supplier negotiation, dynamic discounting, and customer lifetime value prediction.

Every online store, regardless of size, deserves the same AI-powered decision intelligence that Amazon has built over two decades. ProfitLens is how we deliver it.`,
  },
}

const TEAM_MEMBERS = [
  { name: 'MD AMIR HAMZA', role: 'Lead', initials: 'AH' },
  { name: 'ABU UBAIDA', role: 'Member', initials: 'AU' },
  { name: 'MD MIZANUR RAHMAN', role: 'Member', initials: 'MR' },
  { name: 'MD ASHIKULLAH', role: 'Member', initials: 'MA' },
]

const TECH_SECTIONS = {
  overview: {
    title: 'Product Overview',
    subtitle: 'What ProfitLens does',
    body: `ProfitLens is a full-stack AI application that ingests e-commerce sales data, runs a deterministic pricing rules engine, and generates ML-based demand forecasts. Target users are small-to-medium e-commerce merchants who need actionable pricing intelligence without hiring data scientists.

Core use cases:
• Identify products priced above market for immediate price reduction
• Forecast weekly demand 4 weeks ahead to plan inventory
• Get plain-English advisory on which products need attention
• Monitor real-time KPIs across the entire catalog`,
  },
  features: {
    title: 'Feature Matrix',
    subtitle: 'Current, upcoming & planned',
    body: null,
    type: 'matrix',
    matrix: [
      { feature: 'Pricing Signal Engine', status: 'Live', desc: 'HOLD/REDUCE signals per product based on competitor median' },
      { feature: 'Prophet Demand Forecasting', status: 'Live', desc: '4-week weekly demand forecast with confidence intervals' },
      { feature: 'Interactive Dashboard', status: 'Live', desc: 'Recharts-based dashboard with KPIs, tables, charts' },
      { feature: 'CSV Data Import', status: 'Live', desc: 'Auto-load 500K+ rows from CSV on first startup' },
      { feature: 'Competitor Benchmarking', status: 'Upcoming', desc: 'Price distribution analytics across categories' },
      { feature: 'Multi-Merchant Support', status: 'Upcoming', desc: 'Separate merchant accounts with isolated data' },
      { feature: 'Inventory Alerts', status: 'Planned', desc: 'Low-stock + overstock notifications based on forecast' },
      { feature: 'Dynamic Pricing API', status: 'Planned', desc: 'REST API to automatically update prices on connected stores' },
      { feature: 'Supplier Intelligence', status: 'Planned', desc: 'Negotiation leverage reports based on demand trends' },
    ],
  },
  architecture: {
    title: 'Architecture',
    subtitle: 'UI → API → Services → Database',
    body: null,
    type: 'mermaid',
    diagram: `┌─────────────────────────────────────────────────────┐
│              React SPA (Vite + Vercel)               │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │
│  │Dashboard│ │ DocsPage │ │Admin   │ │ Recharts  │ │
│  │  .jsx   │ │   .jsx   │ │Page.jsx│ │  Charts   │ │
│  └────┬────┘ └────┬─────┘ └───┬────┘ └───────────┘ │
│       └───────────┼────────────┘                     │
└───────────────────┼─────────────────────────────────┘
                    │ HTTP (Axios)
┌───────────────────┼─────────────────────────────────┐
│     Spring Boot 4 (Java 17 + Render Docker)         │
│  ┌────────────────┴──────────────────────────────┐  │
│  │           REST Controllers (/api/*)           │  │
│  │  Analyze  │ Pricing  │ Forecast  │  Docs      │  │
│  └────┬───────┴────┬────┴─────┬────┴──────┬──────┘  │
│       │            │          │           │          │
│  ┌────┴────┐ ┌─────┴─────┐ ┌─┴────────┐ ┌┴────────┐ │
│  │Analyze  │ │Pricing    │ │Forecast  │ │Docs     │ │
│  │Service  │ │Service    │ │Service   │ │Config   │ │
│  └─────────┘ └───────────┘ └────┬─────┘ └─────────┘ │
│                                 │ ProcessBuilder    │
│  ┌──────────────────────────────┴──────────────┐    │
│  │     Python Subprocess (scripts/forecast.py)  │    │
│  │     Facebook Prophet Model Training          │    │
│  └──────────────────────┬───────────────────────┘    │
│                         │                            │
│  ┌──────────────────────┴───────────────────────┐    │
│  │    JPA Repositories + Spring Data            │    │
│  └──────────────────────┬───────────────────────┘    │
└─────────────────────────┼───────────────────────────┘
                          │ JDBC
              ┌───────────┴───────────┐
              │  Supabase PostgreSQL  │
              └───────────────────────┘`,
  },
  dataflow: {
    title: 'Data Flow',
    subtitle: 'Input → Processing → AI → Output → Feedback',
    body: null,
    type: 'mermaid',
    diagram: `INPUT                PROCESSING              AI                  OUTPUT
─────────          ──────────────────    ──────────────      ──────────────
data.csv             PricingService       Prophet Model       Dashboard UI
  │                        │                    │                 ▲
  │  DataLoader            │  per-product        │  forecasts      │
  │  (one-time)            │  median calc        │  written to     │  polling
  ▼                        ▼                    ▼  DB              │  every 3s
┌────────────┐    ┌──────────────────┐   ┌──────────────┐       │
│ PostgreSQL │───▶│ HOLD/REDUCE       │   │ Python +     │───────┘
│  (Supabase)│    │ signals in DB     │   │ Prophet      │
│  7 tables  │    └──────────────────┘   └──────────────┘
│            │                │                    │
└────────────┘                ▼                    ▼
                      ┌──────────────────────────────────┐
                      │       Feedback Loop              │
                      │  User adjusts prices → new data  │
                      │  → re-analyze → updated signals   │
                      └──────────────────────────────────┘`,
  },
  stack: {
    title: 'Technology Stack',
    subtitle: 'Modern, modular, production-ready',
    body: null,
    type: 'stack',
    stack: [
      { layer: 'Frontend', tech: 'React 18 + Vite 5', detail: 'Recharts, React Router 7, Axios, hosted on Vercel' },
      { layer: 'Backend', tech: 'Spring Boot 4 + Java 17', detail: 'Spring Data JPA, Validation, Actuator, deployed on Render' },
      { layer: 'Database', tech: 'PostgreSQL (Supabase)', detail: '7 tables, cloud-managed, free tier (500MB)' },
      { layer: 'AI/ML', tech: 'Facebook Prophet (Python)', detail: 'Time-series forecasting, per-product models, 4-week horizon' },
      { layer: 'Container', tech: 'Docker Multi-stage', detail: 'Single image: Maven build stage + Python runtime stage' },
      { layer: 'CI/CD', tech: 'GitHub + Render + Vercel', detail: 'Auto-deploy on push to master branch' },
    ],
  },
  api: {
    title: 'API Reference',
    subtitle: 'REST endpoints',
    body: null,
    type: 'api',
    endpoints: [
      { method: 'POST', path: '/api/analyze', desc: 'Trigger full analysis (pricing sync + forecast async)' },
      { method: 'GET', path: '/api/analyze', desc: 'Poll latest analysis result' },
      { method: 'GET', path: '/api/products', desc: 'List all products' },
      { method: 'GET', path: '/api/products/{merchantId}', desc: 'Products by merchant' },
      { method: 'GET', path: '/api/pricing', desc: 'Latest pricing signals' },
      { method: 'POST', path: '/api/pricing/run', desc: 'Run pricing rules engine' },
      { method: 'GET', path: '/api/forecast', desc: 'Latest forecasts' },
      { method: 'POST', path: '/api/forecast/run', desc: 'Run Prophet forecast' },
      { method: 'GET', path: '/api/sales-summary', desc: 'Sales summary (last N days)' },
      { method: 'GET', path: '/api/docs/config', desc: 'Docs page visibility config' },
      { method: 'GET', path: '/api/docs/team', desc: 'Team members list' },
      { method: 'GET', path: '/api/docs/live-metrics', desc: 'Live DB counters' },
      { method: 'GET', path: '/api/admin/config', desc: 'Admin: get docs config' },
      { method: 'POST', path: '/api/admin/config', desc: 'Admin: update docs config' },
      { method: 'POST', path: '/api/admin/team', desc: 'Admin: add team member' },
      { method: 'DELETE', path: '/api/admin/team/{id}', desc: 'Admin: remove team member' },
      { method: 'GET', path: '/actuator/health', desc: 'Health check endpoint' },
    ],
  },
  datalayer: {
    title: 'Data Layer',
    subtitle: 'Sources, storage & privacy',
    body: `Data Sources:
• UCI Online Retail dataset (500K+ real transactions) as demo data
• CSV import via DataLoaderRunner on application startup
• Future: Shopify/WooCommerce API connectors, manual CSV upload

Storage:
• PostgreSQL on Supabase (managed cloud)
• 7 tables: merchants, products, sales_records, forecasts, pricing_signals, docs_config, team_members
• Indexed on merchant_id, product_id, and sale_date for query performance

Privacy & Compliance:
• No PII stored — demo data uses anonymized transaction records
• Each merchant's data is isolated (future: multi-tenant via merchant_id)
• Environment variables manage all secrets (DB URL, credentials)
• Future: GDPR compliance tools, data retention policies`,
  },
  ailayer: {
    title: 'AI Layer',
    subtitle: 'Prophet forecasting engine',
    body: `Model: Facebook Prophet (Open Source)
• Designed for business time series with daily/weekly/yearly seasonality
• Robust to missing data and outliers
• Provides prediction intervals (uncertainty quantification)

Training Pipeline:
• Python subprocess launched via Java ProcessBuilder
• Queries last 365 days of sales per product from Supabase
• Minimum 10 records required per product (data quality gate)
• One model trained per product
• Forecast: 4 weeks ahead, weekly granularity
• Confidence bounds: 80% prediction interval

Why not a more complex model?
• Prophet is interpretable, lightweight, and works well with sparse SME data
• No GPU needed — trains on Render free tier (512MB RAM)
• Easy to replace with more sophisticated models later (GluonTS, DeepAR)

Future AI Roadmap:
• Product category embeddings for cold-start forecasting
• Anomaly detection on sales spikes/drops
• Price elasticity estimation per product
• Reinforcement learning for dynamic pricing`,
  },
  roadmap: {
    title: 'Product Roadmap',
    subtitle: 'Short, mid & long term',
    body: null,
    type: 'roadmap',
    phases: [
      {
        phase: 'Short-term (0-3 months)',
        items: [
          '✅ Multi-merchant authentication & data isolation',
          '✅ Shopify direct integration (API sync)',
          '✅ CSV upload UI (drag-and-drop)',
          '✅ Email alerts for pricing signals',
        ],
        color: 'var(--emerald)',
      },
      {
        phase: 'Mid-term (3-9 months)',
        items: [
          '🔲 Competitor price scraping & benchmarking',
          '🔲 Inventory optimization recommendations',
          '🔲 Automated price updates (Shopify API push)',
          '🔲 Custom forecasting horizons (12 weeks)',
          '🔲 Team accounts with RBAC',
        ],
        color: 'var(--blue)',
      },
      {
        phase: 'Long-term (9-36 months)',
        items: [
          '🔲 Amazon Marketplace integration',
          '🔲 Supplier negotiation intelligence',
          '🔲 Dynamic discounting engine',
          '🔲 CLV prediction & churn alerts',
          '🔲 White-label enterprise deployment',
        ],
        color: 'var(--purple)',
      },
    ],
  },
  perf: {
    title: 'Performance & Scalability',
    subtitle: 'Built for real-world loads',
    body: `Current Performance:
• Pricing engine: ~1 second for 1,400 products
• Prophet training: ~2-5 minutes for ~1,400 models
• Frontend load: <1 second (static assets on Vercel CDN)
• API response time: <200ms for cached data

Optimization Strategy:
• Future: async pricing engine with parallel streams
• Future: model caching (skip retraining if data unchanged)
• Future: database read replicas for heavy query loads
• Future: Redis caching for API responses

Scalability Limits:
• Current stack (Render free tier): ~50 concurrent users
• With paid Render tier (2GB RAM): ~500 concurrent users
• With horizontal scaling (multiple containers): 10K+ users`,
  },
  security: {
    title: 'Security',
    subtitle: 'Defense in depth',
    body: `Authentication & Authorization:
• No auth currently (MVP demo mode)
• Future: JWT-based authentication with Spring Security
• Future: Role-based access control (Admin, Merchant, Viewer)
• Future: OAuth2 integration (Google, GitHub)

Data Protection:
• All secrets managed via environment variables
• PostgreSQL connection encrypted (TLS)
• No PII stored in demo data
• CORS restricted to frontend origin

Infrastructure:
• Docker container isolation
• Render and Vercel auto-HTTPS
• Regular dependency updates via Dependabot`,
  },
  analytics: {
    title: 'Analytics & KPIs',
    subtitle: 'Measuring what matters',
    body: null,
    type: 'matrix',
    matrix: [
      { feature: 'Active Merchants', status: 'Planned', desc: 'Daily active users, signups, churn rate' },
      { feature: 'Analysis Runs', status: 'Planned', desc: 'Total analyses triggered, average processing time' },
      { feature: 'Pricing Signals Generated', status: 'Planned', desc: 'HOLD vs REDUCE ratio, average price change suggested' },
      { feature: 'Forecast Accuracy', status: 'Planned', desc: 'MAPE (Mean Absolute Percentage Error) per product' },
      { feature: 'Margin Impact', status: 'Planned', desc: 'Estimated margin recovered through pricing actions' },
    ],
  },
  changelog: {
    title: 'Changelog',
    subtitle: 'Version history',
    body: null,
    type: 'changelog',
    entries: [
      { version: 'v1.0.0', date: 'June 2026', changes: ['Initial MVP launch', 'Pricing rules engine', 'Prophet demand forecasting', 'Interactive dashboard with 4 tabs', 'Docs module with admin control'] },
    ],
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SectionCard({ icon, label, color, text }) {
  return (
    <div style={{ padding: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
      <div style={{ fontWeight: 700, fontSize: '.9rem', color, marginBottom: 8 }}>{icon} {label}</div>
      <p style={{ color: 'var(--text-2)', fontSize: '.85rem', lineHeight: 1.7, margin: 0 }}>{text}</p>
    </div>
  )
}

function Badge({ method }) {
  const colors = { GET: '#059669', POST: '#2563eb', DELETE: '#e11d48', PUT: '#d97706' }
  return (
    <span style={{ background: colors[method] + '18', color: colors[method], border: `1px solid ${colors[method]}30`, borderRadius: 6, padding: '2px 8px', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em', flexShrink: 0, fontFamily: 'monospace' }}>
      {method}
    </span>
  )
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div style={{ padding: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value ?? '—'}</div>
      <div style={{ color: 'var(--text-3)', fontSize: '.78rem', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function DocsPage() {
  const [config, setConfig] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('problem')

  useEffect(() => {
    Promise.all([
      getDocsConfig().catch(() => null),
      getDocsMetrics().catch(() => null),
    ]).then(([cfg, mtr]) => {
      setConfig(cfg)
      setMetrics(mtr)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = () => {
      const sections = document.querySelectorAll('[data-section]')
      let current = 'problem'
      sections.forEach(s => {
        const rect = s.getBoundingClientRect()
        if (rect.top <= 120) current = s.dataset.section
      })
      setActiveSection(current)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="content">
          <div className="empty"><div className="em-icon">⏳</div><p>Loading documentation…</p></div>
        </div>
      </div>
    )
  }

  if (config && !config.isVisible) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="content">
          <div className="empty" style={{ marginTop: 80 }}>
            <div className="em-icon" style={{ fontSize: 48 }}>🔒</div>
            <h2 style={{ color: 'var(--text-1)', margin: '12px 0 4px' }}>Documentation Not Available</h2>
            <p style={{ color: 'var(--text-3)', maxWidth: 480 }}>
              The documentation page is currently not publicly accessible.
              {config.visibleFrom && ` It will be available from ${new Date(config.visibleFrom).toLocaleString()}.`}
              {config.visibleUntil && ` It will close on ${new Date(config.visibleUntil).toLocaleString()}.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const scrollTo = (id) => {
    const el = document.querySelector(`[data-section="${id}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        {/* TOPBAR */}
        <div className="topbar" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div className="page-title">📖 Documentation</div>
            <div className="page-sub">YC pitch deck + technical deep-dive</div>
          </div>
          {metrics && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="chip"><span className="dot green" />{metrics.totalProducts} products</span>
              <span className="chip"><span className="dot blue" />{metrics.totalSalesRecords?.toLocaleString()} records</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 0 }}>
          {/* SIDE NAV */}
          <nav style={{
            width: 200, flexShrink: 0, position: 'sticky', top: 72, alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 88px)', overflowY: 'auto', padding: '12px 8px 12px 0',
          }}>
            {NAV_ITEMS.map(group => (
              <div key={group.id} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 6, paddingLeft: 8 }}>
                  {group.icon} {group.label}
                </div>
                {group.subs.map(sub => (
                  <button key={sub.id} onClick={() => scrollTo(sub.id)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 6,
                      fontSize: '.78rem', fontWeight: activeSection === sub.id ? 700 : 400,
                      color: activeSection === sub.id ? 'var(--blue)' : 'var(--text-2)',
                      background: activeSection === sub.id ? 'var(--accent-bg)' : 'transparent',
                      border: 'none', cursor: 'pointer', transition: '.15s',
                    }}>
                    {sub.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── LIVE METRICS ────────────────────────────────── */}
            {metrics && (
              <section data-section="metrics" style={{ marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <MetricCard icon="📦" label="Products" value={metrics.totalProducts?.toLocaleString()} color="var(--blue)" />
                  <MetricCard icon="🧾" label="Sales Records" value={metrics.totalSalesRecords?.toLocaleString()} color="var(--amber)" />
                  <MetricCard icon="💡" label="Pricing Signals" value={metrics.totalPricingSignals?.toLocaleString()} color="var(--purple)" />
                </div>
              </section>
            )}

            {/* ── PITCH DECK SECTIONS ────────────────────────── */}
            <section data-section="pitch-start" style={{ marginBottom: 8 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>🚀 YC-Style Pitch Deck</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '.85rem', margin: '4px 0 0' }}>Problem · Solution · Why Now · Product · Market · Business Model · Traction · Competition · Advantage · GTM · Team · Vision</p>
            </section>

            {Object.entries(PITCH).map(([id, section]) => (
              <section key={id} data-section={id} className="panel" style={{ marginBottom: 20, scrollMarginTop: 80 }}>
                <div className="panel-header">
                  <div className="panel-title">{section.title}</div>
                  <span className="panel-tag blue">{section.subtitle}</span>
                </div>
                <div style={{ padding: '24px 28px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{section.body}</p>
                </div>
              </section>
            ))}

            {/* ── TEAM ─────────────────────────────────────────── */}
            <section data-section="team" className="panel" style={{ marginBottom: 20, scrollMarginTop: 80 }}>
              <div className="panel-header">
                <div className="panel-title">👥 Team</div>
                <span className="panel-tag amber">{TEAM_MEMBERS.length} members</span>
              </div>
              <div style={{ padding: '24px 28px' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.8, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>{PITCH.team.body}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                  {TEAM_MEMBERS.map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                        {m.initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{m.name}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: '.75rem', marginTop: 2 }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TECHNICAL SECTIONS ─────────────────────────── */}
            <section data-section="tech-start" style={{ marginBottom: 8, marginTop: 32 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>⚙️ Technical Documentation</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '.85rem', margin: '4px 0 0' }}>Architecture · Stack · APIs · Data · AI · Security</p>
            </section>

            {Object.entries(TECH_SECTIONS).map(([id, section]) => (
              <section key={id} data-section={id} className="panel" style={{ marginBottom: 20, scrollMarginTop: 80 }}>
                <div className="panel-header">
                  <div className="panel-title">{section.title}</div>
                  <span className="panel-tag blue">{section.subtitle}</span>
                </div>
                <div style={{ padding: '24px 28px' }}>

                  {section.body && (
                    <p style={{ color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{section.body}</p>
                  )}

                  {section.type === 'matrix' && section.matrix && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {section.matrix.map((row, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < section.matrix.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span className={`chip ${row.status === 'Live' ? '' : ''}`} style={{
                            background: row.status === 'Live' ? 'rgba(5,150,105,.12)' : row.status === 'Upcoming' ? 'rgba(37,99,235,.12)' : 'rgba(100,116,139,.12)',
                            color: row.status === 'Live' ? 'var(--emerald)' : row.status === 'Upcoming' ? 'var(--blue)' : 'var(--text-3)',
                            padding: '3px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 700, flexShrink: 0, border: 'none',
                          }}>
                            {row.status === 'Live' ? '● LIVE' : row.status === 'Upcoming' ? '◒ UPCOMING' : '○ PLANNED'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{row.feature}</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '.78rem', marginTop: 2 }}>{row.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'mermaid' && section.diagram && (
                    <div style={{ background: '#0f172a', borderRadius: 10, padding: '20px 24px', overflowX: 'auto' }}>
                      <pre style={{ margin: 0, color: '#7dd3fc', fontSize: '.75rem', lineHeight: 1.6, fontFamily: 'monospace' }}>{section.diagram}</pre>
                    </div>
                  )}

                  {section.type === 'stack' && section.stack && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                      {section.stack.map(s => (
                        <div key={s.layer} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                          <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 4 }}>{s.layer}</div>
                          <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 4 }}>{s.tech}</div>
                          <div style={{ color: 'var(--text-3)', fontSize: '.78rem', lineHeight: 1.6 }}>{s.detail}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'api' && section.endpoints && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {section.endpoints.map((ep, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderBottom: i < section.endpoints.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <Badge method={ep.method} />
                          <code style={{ color: 'var(--blue)', fontSize: '.82rem', fontWeight: 600, flexShrink: 0, minWidth: 200, fontFamily: 'monospace' }}>{ep.path}</code>
                          <div style={{ color: 'var(--text-2)', fontSize: '.82rem', lineHeight: 1.6 }}>{ep.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'roadmap' && section.phases && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                      {section.phases.map(p => (
                        <div key={p.phase} style={{ padding: 18, border: `1px solid ${p.color}30`, borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                          <div style={{ fontWeight: 700, fontSize: '.85rem', color: p.color, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${p.color}20` }}>{p.phase}</div>
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {p.items.map((item, j) => (
                              <li key={j} style={{ color: 'var(--text-2)', fontSize: '.8rem', lineHeight: 1.5 }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'changelog' && section.entries && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {section.entries.map((entry, i) => (
                        <div key={i} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span className="chip">{entry.version}</span>
                            <span style={{ color: 'var(--text-3)', fontSize: '.78rem' }}>{entry.date}</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {entry.changes.map((c, j) => (
                              <li key={j} style={{ color: 'var(--text-2)', fontSize: '.82rem', lineHeight: 1.5 }}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </section>
            ))}

          </div>
        </div>

        <footer className="footer" style={{ marginTop: 32 }}>
          <span className="footer-brand">ProfitLens © {new Date().getFullYear()}</span>
          <span className="footer-author">Made with <span className="footer-author-heart">❤️</span> by <strong>BrainFreezed Org</strong></span>
        </footer>
      </div>
    </div>
  )
}
