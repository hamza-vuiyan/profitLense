export default function KpiRow({ products, reduceList, withForecast }) {
  const total    = products.length
  const reduce   = reduceList.length
  const hold     = total - reduce
  const pctReduce = total > 0 ? Math.round((reduce / total) * 100) : 0
  const hasForecast = withForecast.length

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-left">
          <div className="kpi-label">Products Analyzed</div>
          <div className="kpi-value">{total.toLocaleString()}</div>
          <div className="kpi-sub">across all categories</div>
        </div>
        <div className="kpi-icon blue">📦</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-left">
          <div className="kpi-label">Price Alerts</div>
          <div className="kpi-value" style={{color:'var(--rose)'}}>{reduce.toLocaleString()}</div>
          <div className="kpi-delta down">↓ {pctReduce}% above competitor median</div>
        </div>
        <div className="kpi-icon rose">⚠️</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-left">
          <div className="kpi-label">Competitive Price</div>
          <div className="kpi-value" style={{color:'var(--emerald)'}}>{hold.toLocaleString()}</div>
          <div className="kpi-delta up">✓ {total > 0 ? 100 - pctReduce : 0}% well-positioned</div>
        </div>
        <div className="kpi-icon emerald">✅</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-left">
          <div className="kpi-label">Forecasts Available</div>
          <div className="kpi-value" style={{color:'var(--amber)'}}>{hasForecast.toLocaleString()}</div>
          <div className="kpi-sub">4-week demand predictions</div>
        </div>
        <div className="kpi-icon amber">📈</div>
      </div>
    </div>
  )
}
