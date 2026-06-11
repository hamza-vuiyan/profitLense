import Sidebar from '../components/Sidebar'

// ─── Static data ─────────────────────────────────────────────────────────────
const TECH_STACK = [
  { icon: '☕', name: 'Spring Boot 4', color: '#6db33f', desc: 'REST API layer, JPA data access, auto CSV loader on startup, background process executor for Python.' },
  { icon: '⚛️', name: 'React 18 + Vite', color: '#61dafb', desc: 'Single-page application with Recharts visualisations, real-time polling, tab navigation, and skeleton loading states.' },
  { icon: '🐍', name: 'Python + Prophet', color: '#3776ab', desc: 'Facebook Prophet time-series ML model. Trains one model per product, predicts weekly demand 4 weeks ahead.' },
  { icon: '🐘', name: 'PostgreSQL (Supabase)', color: '#336791', desc: 'Managed cloud Postgres. Stores all merchants, products, sales records, forecasts, and pricing signals.' },
  { icon: '🐳', name: 'Docker (Multi-stage)', color: '#2496ed', desc: 'Builder stage compiles the JAR; runtime stage installs Java + Python + Prophet into a single container.' },
  { icon: '☁️', name: 'Render + Vercel', color: '#7c3aed', desc: 'Backend deployed as Docker container on Render (free tier). Frontend SPA deployed on Vercel (free tier).' },
]

const PROJECT_STRUCTURE = [
  { path: 'profitlense/', label: 'Root', desc: 'Project root' },
  { path: '├── data.csv', label: 'Data', desc: '500K+ rows of UCI Online Retail transactions' },
  { path: '├── schema.sql', label: 'DB Schema', desc: 'All 7 PostgreSQL table definitions (run in Supabase)' },
  { path: '├── Dockerfile', label: 'Container', desc: 'Multi-stage build: Maven + Python Prophet in one image' },
  { path: '├── render.yaml', label: 'Infra', desc: 'Render.com infrastructure-as-code config' },
  { path: '├── scripts/', label: 'AI Engine', desc: 'Python forecasting module' },
  { path: '│   ├── forecast.py', label: '', desc: 'Main Prophet script — reads DB, trains models, writes forecasts' },
  { path: '│   └── requirements.txt', label: '', desc: 'prophet, pandas, sqlalchemy, psycopg2-binary' },
  { path: '├── src/main/java/…/', label: 'Backend', desc: 'Spring Boot source' },
  { path: '│   ├── model/', label: '', desc: 'JPA entities: Merchant, Product, SalesRecord, Forecast, PricingSignal, DocsConfig, TeamMember' },
  { path: '│   ├── repository/', label: '', desc: 'Spring Data JPA repositories (7 total)' },
  { path: '│   ├── service/', label: '', desc: 'AnalyzeService, PricingService, ForecastService, DataLoaderService' },
  { path: '│   ├── controller/', label: '', desc: 'AnalyzeController, PricingController, ForecastController, DocsController' },
  { path: '│   └── dto/', label: '', desc: 'Response DTOs: ProductAnalysisDTO, ForecastDTO, etc.' },
  { path: '└── frontend/', label: 'Frontend', desc: 'React + Vite SPA' },
  { path: '    ├── src/pages/', label: '', desc: 'Dashboard.jsx, DocsPage.jsx, AdminPage.jsx' },
  { path: '    ├── src/components/', label: '', desc: 'Sidebar, Topbar, KpiRow, PricingTable, ForecastPanel, AdvisoryGrid' },
  { path: '    └── src/api.js', label: '', desc: 'Axios API client with 5-min timeout for Prophet calls' },
]

const WORKFLOW = [
  {
    step: '1', title: 'Startup & Data Ingestion', icon: '📥', color: 'var(--blue)',
    detail: [
      'Spring Boot connects to Supabase PostgreSQL on application start.',
      'DataLoaderRunner checks if data is already loaded to avoid re-importing.',
      'If empty: reads data.csv (500K+ rows), creates 1 demo Merchant, ~1,400 unique Products, and 500K+ SalesRecord rows.',
      'This initial load takes 2–5 minutes and runs once.',
    ]
  },
  {
    step: '2', title: 'User Triggers Analysis', icon: '🖱️', color: 'var(--purple)',
    detail: [
      'User opens the React frontend at localhost:3000 (dev) or profit-lense.vercel.app (prod).',
      'User clicks "Run Analysis" in the top navigation bar.',
      'Frontend sends POST /api/analyze to the Spring Boot backend.',
      'Backend responds immediately after the pricing engine completes (~1s), returning forecastStatus: RUNNING.',
    ]
  },
  {
    step: '3', title: 'Pricing Rules Engine (Java)', icon: '💰', color: 'var(--emerald)',
    detail: [
      'PricingService queries all products for the merchant from the database.',
      'For each product: computes the median competitor price across all similar products by category.',
      'Applies deterministic rules: if price > competitor median by a threshold → REDUCE signal; otherwise → HOLD.',
      'Calculates suggested price and percentage change, saves PricingSignal rows to the database.',
      'Returns all pricing signals to the frontend within ~1 second.',
    ]
  },
  {
    step: '4', title: 'Prophet AI Forecasting (Python, async)', icon: '🤖', color: 'var(--amber)',
    detail: [
      'ForecastService launches scripts/forecast.py as a subprocess via ProcessBuilder.',
      'Spring Boot detects the local venv at scripts/venv/bin/python3; falls back to system python3 in Docker.',
      'The Python script connects to Supabase, queries the last 365 days of sales per product.',
      'Products with fewer than 10 records are skipped to ensure model reliability.',
      'Facebook Prophet fits a model per product and predicts weekly demand for 4 weeks ahead.',
      'Predictions (with upper/lower bounds) are written back to the forecasts table.',
      'Total runtime: ~2–5 minutes depending on number of products.',
    ]
  },
  {
    step: '5', title: 'Frontend Polling & Rendering', icon: '📊', color: 'var(--sky)',
    detail: [
      'While forecastStatus is RUNNING, the frontend polls GET /api/analyze every 3 seconds.',
      'Once the Python script finishes, the API response includes fully populated forecast data.',
      'React updates all 4 dashboard tabs simultaneously: Overview, Pricing Signals, Demand Forecast, Advisory.',
      'KPI row shows aggregate stats; Pricing Table lists all products with HOLD/REDUCE badges.',
      'Demand Forecast tab renders one Recharts LineChart per product showing predicted demand.',
      'Advisory Grid translates signals into plain-English recommendations for the merchant.',
    ]
  },
]

const APIS = [
  { method: 'POST', path: '/api/analyze', desc: 'Triggers full analysis: pricing engine runs synchronously, Prophet launches async. Returns pricing signals immediately.' },
  { method: 'GET',  path: '/api/analyze', desc: 'Fetches the latest cached analysis result. Used for polling until forecastStatus changes from RUNNING to DONE.' },
  { method: 'GET',  path: '/api/products', desc: 'Returns all products for the demo merchant.' },
  { method: 'GET',  path: '/api/docs/live-metrics', desc: 'Returns live counters: totalProducts, totalSalesRecords, totalPricingSignals.' },
  { method: 'GET',  path: '/actuator/health', desc: 'Spring Boot Actuator health check endpoint.' },
]

const DB_TABLES = [
  { table: 'merchants', fields: 'id, name, created_at', note: '1 demo merchant seeded on startup' },
  { table: 'products', fields: 'id, merchant_id, name, category, current_price, stock_code', note: '~1,400 unique products from data.csv' },
  { table: 'sales_records', fields: 'id, product_id, sale_date, quantity_sold, revenue', note: '500K+ transaction rows' },
  { table: 'forecasts', fields: 'id, product_id, forecast_date, predicted_demand, lower_bound, upper_bound', note: 'Written by Prophet script' },
  { table: 'pricing_signals', fields: 'id, product_id, signal, current_price, competitor_median, suggested_price', note: 'Written by Java rules engine' },
  { table: 'docs_config', fields: 'id, is_visible, visible_from, visible_until, pitch_text, tech_text', note: 'Controls /docs page visibility' },
  { table: 'team_members', fields: 'id, name, role, email, image_url', note: 'Managed via admin API' },
]

const DEPLOYMENTS = [
  { platform: 'Supabase', role: 'Database', color: '#3ecf8e', detail: 'PostgreSQL managed database. Stores all 7 tables. Connection pooling via pg-bouncer. Free tier (500MB).' },
  { platform: 'Render.com', role: 'Backend', color: '#6366f1', detail: 'Docker container hosting the Spring Boot JAR + Python + Prophet. Builds from Dockerfile on git push. Free tier (512MB RAM).' },
  { platform: 'Vercel', role: 'Frontend', color: '#000', detail: 'Hosts the React SPA. Configured with root directory = frontend/, VITE_API_BASE env var pointing to Render URL. Free tier.' },
  { platform: 'GitHub', role: 'CI/CD', color: '#24292e', detail: 'Source of truth. Vercel + Render both connect to GitHub and auto-deploy on every push to master.' },
]

const TEAM = [
  { name: 'MD AMIR HAMZA', role: 'Lead', initials: 'AH' },
  { name: 'ABU UBAIDA', role: 'Member', initials: 'AU' },
  { name: 'MD MIZANUR RAHMAN', role: 'Member', initials: 'MR' },
  { name: 'MD ASHIKULLAH', role: 'Member', initials: 'MA' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Section({ title, icon, tag, tagColor = 'blue', children }) {
  return (
    <section className="panel" style={{ marginBottom: 24 }}>
      <div className="panel-header">
        <div className="panel-title"><span className="icon">{icon}</span>{title}</div>
        {tag && <span className={`panel-tag ${tagColor}`}>{tag}</span>}
      </div>
      <div style={{ padding: '24px 28px' }}>{children}</div>
    </section>
  )
}

function Badge({ method }) {
  const colors = { GET: '#059669', POST: '#2563eb', DELETE: '#e11d48' }
  return (
    <span style={{ background: colors[method] + '18', color: colors[method], border: `1px solid ${colors[method]}30`, borderRadius: 6, padding: '2px 8px', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.05em', flexShrink: 0 }}>
      {method}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DocsPage() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="page-title">📖 Documentation</div>
            <div className="page-sub">Project overview, workflow, architecture & tech stack</div>
          </div>
        </div>

        <div className="page-body">

          {/* ── PITCH / OVERVIEW ─────────────────────────────────── */}
          <Section title="What is ProfitLens?" icon="🚀" tag="Hackathon Project" tagColor="blue">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { emoji: '❌', label: 'The Problem', color: 'var(--rose)', text: 'Small and medium e-commerce merchants lose up to 20% of revenue through blind pricing and inventory guesswork. While Amazon uses ML to price products every hour, SMEs rely on spreadsheets and gut feeling — constantly bouncing between stock-outs and dead inventory.' },
                { emoji: '✅', label: 'Our Solution', color: 'var(--emerald)', text: 'ProfitLens is an AI-powered pricing and demand forecasting platform. Upload your sales history, get instant HOLD/REDUCE pricing signals from a rules engine, and see 4-week AI demand forecasts powered by Facebook Prophet — all in one clean dashboard.' },
                { emoji: '📊', label: 'Market Opportunity', color: 'var(--blue)', text: 'There are 20M+ global e-commerce stores. As ad costs rise, margins shrink. Merchants can no longer afford to guess. ProfitLens operates on a B2B SaaS model — the tool pays for itself within days of use through recovered margin.' },
                { emoji: '🏆', label: 'What We Built', color: 'var(--amber)', text: 'A production-ready, fully deployed full-stack application: Spring Boot backend with Java + Python AI, React frontend with live charts, PostgreSQL on Supabase, Docker container, deployed on Render (backend) and Vercel (frontend) — all on free tiers.' },
              ].map(c => (
                <div key={c.label} style={{ padding: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: c.color, marginBottom: 8 }}>{c.emoji} {c.label}</div>
                  <p style={{ color: 'var(--text-2)', fontSize: '.85rem', lineHeight: 1.7, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── END-TO-END WORKFLOW ──────────────────────────────── */}
          <Section title="End-to-End Workflow" icon="⚙️" tag="How it works">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {WORKFLOW.map((w, i) => (
                <div key={w.step} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: w.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1rem' }}>{w.step}</div>
                    {i < WORKFLOW.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '6px 0' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: i < WORKFLOW.length - 1 ? 16 : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{w.icon}</span>{w.title}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {w.detail.map((d, j) => (
                        <li key={j} style={{ color: 'var(--text-2)', fontSize: '.85rem', lineHeight: 1.6 }}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── PROJECT STRUCTURE ────────────────────────────────── */}
          <Section title="Project Structure" icon="📁" tag="File Tree" tagColor="emerald">
            <div style={{ background: '#0f172a', borderRadius: 10, padding: '20px 24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '.82rem' }}>
                <tbody>
                  {PROJECT_STRUCTURE.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 16px 4px 0', color: '#7dd3fc', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{row.path}</td>
                      <td style={{ padding: '4px 12px 4px 0', color: '#fbbf24', whiteSpace: 'nowrap', verticalAlign: 'top', fontSize: '.75rem', fontWeight: 700 }}>{row.label}</td>
                      <td style={{ padding: '4px 0', color: '#94a3b8', verticalAlign: 'top' }}>{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── TECH STACK ──────────────────────────────────────── */}
          <Section title="Tech Stack" icon="🛠️" tag="6 Technologies" tagColor="amber">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {TECH_STACK.map(t => (
                <div key={t.name} style={{ display: 'flex', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)', transition: 'transform .18s, box-shadow .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.07)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 4, color: t.color }}>{t.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '.78rem', lineHeight: 1.6 }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── API REFERENCE ────────────────────────────────────── */}
          <Section title="API Reference" icon="🔌" tag="REST Endpoints">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {APIS.map((api, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: i < APIS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <Badge method={api.method} />
                  <code style={{ color: 'var(--blue)', fontSize: '.85rem', fontWeight: 600, flexShrink: 0, minWidth: 220 }}>{api.path}</code>
                  <div style={{ color: 'var(--text-2)', fontSize: '.83rem', lineHeight: 1.6 }}>{api.desc}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── DATA MODEL ───────────────────────────────────────── */}
          <Section title="Database Schema" icon="🗄️" tag="7 Tables" tagColor="blue">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {DB_TABLES.map(t => (
                <div key={t.table} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                  <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--blue)', marginBottom: 6, fontFamily: 'monospace' }}>{t.table}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 6, fontFamily: 'monospace', lineHeight: 1.5 }}>{t.fields}</div>
                  <div style={{ fontSize: '.73rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{t.note}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── DEPLOYMENT ───────────────────────────────────────── */}
          <Section title="Deployment Architecture" icon="🚀" tag="Free Tier" tagColor="emerald">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {DEPLOYMENTS.map(d => (
                <div key={d.platform} style={{ padding: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{d.platform}</div>
                    <span className="panel-tag blue" style={{ marginLeft: 'auto', fontSize: '.65rem' }}>{d.role}</span>
                  </div>
                  <div style={{ color: 'var(--text-2)', fontSize: '.82rem', lineHeight: 1.7 }}>{d.detail}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── TEAM ─────────────────────────────────────────────── */}
          <Section title="Team" icon="👥" tag="BrainFreezed Org" tagColor="amber">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {TEAM.map(m => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)', minWidth: 220 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{m.initials}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '.78rem', marginTop: 2 }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>

        <footer className="footer">
          <span className="footer-brand">ProfitLens © {new Date().getFullYear()}</span>
          <span className="footer-author">Made with <span className="footer-author-heart">❤️</span> by <strong>BrainFreezed Org</strong></span>
        </footer>
      </div>
    </div>
  )
}
