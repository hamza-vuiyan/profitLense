import { useState, useEffect } from 'react'
import { getDocsConfig, getDocsTeam, getDocsMetrics } from '../api'
import Sidebar from '../components/Sidebar'

const STACK = [
  { icon: '☕', name: 'Spring Boot 4', desc: 'REST API, JPA, data loader' },
  { icon: '⚛️', name: 'React 18 + Vite', desc: 'SPA frontend with Recharts' },
  { icon: '🐍', name: 'Python + Prophet', desc: 'Time-series AI forecasting' },
  { icon: '🐘', name: 'PostgreSQL', desc: 'Hosted on Supabase free tier' },
  { icon: '🐳', name: 'Docker', desc: 'Multi-stage production build' },
  { icon: '☁️', name: 'Render + Vercel', desc: 'Free cloud deployment' },
]

const FLOW = [
  { step: '1', title: 'Data Ingestion', desc: 'CSV (500K+ rows) is parsed on startup and loaded into Supabase across Merchant, Product, and SalesRecord tables.' },
  { step: '2', title: 'Pricing Rules Engine', desc: 'Java service compares current vs competitor prices and emits HOLD or REDUCE signals in milliseconds.' },
  { step: '3', title: 'Prophet AI Forecast', desc: 'Python script trains a Facebook Prophet model per product and predicts weekly demand for 4 weeks ahead.' },
  { step: '4', title: 'Live Dashboard', desc: 'React frontend polls for results, renders KPIs, interactive charts, and plain-English advisories.' },
]

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="kpi-card" style={{ flex: 1 }}>
      <div className="kpi-left">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ fontSize: '1.6rem' }}>
          {value?.toLocaleString() ?? '—'}
        </div>
        <div className="kpi-sub">live from database</div>
      </div>
      <div className={`kpi-icon ${color}`}>{icon}</div>
    </div>
  )
}

export default function DocsPage() {
  const [config, setConfig] = useState(null)
  const [team, setTeam] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getDocsConfig(), getDocsTeam(), getDocsMetrics()])
      .then(([cfg, tm, mt]) => { setConfig(cfg); setTeam(tm); setMetrics(mt) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="page-title">📖 Documentation</div>
            <div className="page-sub">Hackathon pitch deck, technical overview & team</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {config && (
              <div className={`chip`}>
                <span className={`dot ${config.isVisible ? 'green' : 'amber'}`} />
                {config.isVisible ? 'Docs Public' : 'Docs Locked'}
              </div>
            )}
          </div>
        </div>

        <div className="page-body">
          {loading && <div className="empty"><div className="em-icon">⏳</div><p>Loading documentation…</p></div>}
          {error && <div className="error-banner">⚠️ <span><strong>Backend offline.</strong> Start the Spring Boot server to load live data.</span></div>}

          {!loading && config && (
            <>
              {!config.isVisible ? (
                <div className="error-banner" style={{ marginTop: 0 }}>
                  🔒 <span><strong>Documentation is currently locked.</strong> Ask an admin to enable it via <code>/admin</code>.</span>
                </div>
              ) : (
                <>
                  {/* ── PITCH DECK ─────────────────────────────────── */}
                  <section className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header">
                      <div className="panel-title"><span className="icon">🚀</span> Pitch Deck</div>
                      <span className="panel-tag blue">SME AI Platform</span>
                    </div>
                    <div style={{ padding: '24px 28px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div>
                          <h3 style={{ color: 'var(--rose)', marginBottom: 8 }}>❌ The Problem</h3>
                          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '.9rem' }}>
                            SME merchants lose up to <strong>20% of revenue</strong> through blind pricing and inventory guesswork. 
                            While Amazon uses ML to price dynamically every hour, small shops use spreadsheets. 
                            They constantly oscillate between stock-outs and dead inventory.
                          </p>
                        </div>
                        <div>
                          <h3 style={{ color: 'var(--emerald)', marginBottom: 8 }}>✅ Our Solution</h3>
                          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '.9rem' }}>
                            <strong>ProfitLens</strong> is an AI-powered pricing and demand forecasting platform that democratises 
                            enterprise-grade analytics for any SME. Plug in your sales data, get instant <em>HOLD/REDUCE</em> 
                            signals and 4-week demand forecasts — no data-science degree required.
                          </p>
                        </div>
                        <div>
                          <h3 style={{ color: 'var(--blue)', marginBottom: 8 }}>📊 Market</h3>
                          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '.9rem' }}>
                            20M+ global e-commerce stores, margins shrinking as ad costs rise. 
                            B2B SaaS subscription model — the tool pays for itself within days of use.
                          </p>
                        </div>
                        <div>
                          <h3 style={{ color: 'var(--amber)', marginBottom: 8 }}>🏆 Traction</h3>
                          <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '.9rem' }}>
                            Production-ready platform processing <strong>{metrics?.totalSalesRecords?.toLocaleString() ?? '500K+'} sales records</strong>, 
                            generating <strong>{metrics?.totalPricingSignals?.toLocaleString() ?? 'live'} pricing signals</strong> across <strong>{metrics?.totalProducts?.toLocaleString() ?? '1K+'} products</strong>. 
                            Deployed on cloud with full Docker pipeline.
                          </p>
                        </div>
                      </div>
                      {config.pitchText && (
                        <div style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 'var(--radius)', whiteSpace: 'pre-wrap', color: 'var(--text-2)', fontSize: '.88rem', lineHeight: 1.7 }}>
                          {config.pitchText}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ── LIVE METRICS ───────────────────────────────── */}
                  <section style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📡 Live Platform Metrics</h2>
                      <span className="chip"><span className="dot green" />Real data</span>
                    </div>
                    <div className="kpi-grid">
                      <MetricCard label="Products Managed" value={metrics?.totalProducts} icon="📦" color="blue" />
                      <MetricCard label="Sales Records Processed" value={metrics?.totalSalesRecords} icon="📈" color="emerald" />
                      <MetricCard label="Pricing Signals Generated" value={metrics?.totalPricingSignals} icon="💡" color="amber" />
                    </div>
                  </section>

                  {/* ── HOW IT WORKS ───────────────────────────────── */}
                  <section className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header">
                      <div className="panel-title"><span className="icon">⚙️</span> How It Works — Data Flow</div>
                    </div>
                    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                      {FLOW.map(f => (
                        <div key={f.step} style={{ display: 'flex', gap: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0, fontSize: '.9rem' }}>{f.step}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 5 }}>{f.title}</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '.8rem', lineHeight: 1.6 }}>{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* ── TECH STACK ─────────────────────────────────── */}
                  <section className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header">
                      <div className="panel-title"><span className="icon">🛠️</span> Tech Stack</div>
                      <span className="panel-tag emerald">Production Ready</span>
                    </div>
                    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                      {STACK.map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)' }}>
                          <span style={{ fontSize: 24 }}>{s.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{s.name}</div>
                            <div style={{ color: 'var(--text-3)', fontSize: '.78rem' }}>{s.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {config.techText && (
                      <div style={{ padding: '0 28px 24px', whiteSpace: 'pre-wrap', color: 'var(--text-2)', fontSize: '.85rem', lineHeight: 1.7 }}>
                        {config.techText}
                      </div>
                    )}
                  </section>

                  {/* ── TEAM ───────────────────────────────────────── */}
                  <section className="panel" style={{ marginBottom: 24 }}>
                    <div className="panel-header">
                      <div className="panel-title"><span className="icon">👥</span> Team</div>
                      <span className="panel-tag amber">BrainFreezed Org</span>
                    </div>
                    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 20 }}>
                      {team.length === 0 && (
                        <div style={{ color: 'var(--text-3)', fontSize: '.85rem', gridColumn: '1/-1' }}>
                          No team members yet — add them from the <a href="/admin" style={{ color: 'var(--blue)' }}>Admin Panel</a>.
                        </div>
                      )}
                      {team.map(m => (
                        <div key={m.id} style={{ textAlign: 'center', padding: 20, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface2)', transition: 'transform .2s, box-shadow .2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                          {m.imageUrl
                            ? <img src={m.imageUrl} alt={m.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '3px solid var(--blue-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{m.name[0]}</div>
                          }
                          <div style={{ fontWeight: 700, fontSize: '.95rem', marginBottom: 4 }}>{m.name}</div>
                          <div style={{ color: 'var(--text-3)', fontSize: '.78rem', fontWeight: 600, marginBottom: m.email ? 8 : 0 }}>{m.role}</div>
                          {m.email && <div style={{ color: 'var(--blue)', fontSize: '.75rem' }}>{m.email}</div>}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>

        <footer className="footer">
          <span className="footer-brand">ProfitLens © {new Date().getFullYear()}</span>
          <span className="footer-author">Made with <span className="footer-author-heart">❤️</span> by <strong>BrainFreezed Org</strong></span>
        </footer>
      </div>
    </div>
  )
}
