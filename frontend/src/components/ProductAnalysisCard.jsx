import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

// Format currency (BDT-friendly)
function fmt(val) {
  if (val == null) return '—'
  return `৳${Number(val).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format short date for chart axis
function shortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Custom chart tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{
      background: 'rgba(8,12,20,0.95)',
      border: '1px solid rgba(99,157,255,0.2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.8rem',
      color: '#e8f0fe',
      lineHeight: 1.7,
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>📅 {label}</div>
      <div>Forecast: <strong style={{ color: '#4f8ef7' }}>{Number(d?.predictedDemand ?? 0).toFixed(1)} units</strong></div>
      {d?.lowerBound != null && (
        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
          Range: {Number(d.lowerBound).toFixed(1)} – {Number(d.upperBound).toFixed(1)}
        </div>
      )}
    </div>
  )
}

/**
 * Single product analysis card:
 * - Signal badge (REDUCE / HOLD)
 * - Pricing table (current / competitor median / suggested)
 * - Advisory text
 * - Recharts 4-week forecast line chart
 */
export default function ProductAnalysisCard({ product, animationDelay = 0 }) {
  const {
    productName,
    category,
    currentPrice,
    competitorMedian,
    suggestedPrice,
    pricingSignal,
    advisoryText,
    forecasts = [],
  } = product

  const isReduce = pricingSignal === 'REDUCE'
  const signalClass = isReduce ? 'reduce' : 'hold'

  // Prepare chart data
  const chartData = forecasts.map(f => ({
    date: shortDate(f.forecastDate),
    predictedDemand: parseFloat(f.predictedDemand ?? 0),
    lowerBound: parseFloat(f.lowerBound ?? 0),
    upperBound: parseFloat(f.upperBound ?? 0),
  }))

  const avgDemand = chartData.length
    ? (chartData.reduce((s, d) => s + d.predictedDemand, 0) / chartData.length)
    : null

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-block">
          <div className="card-product-name">{productName ?? 'Unknown Product'}</div>
          <div className="card-category">{category ?? 'Uncategorized'}</div>
        </div>
        <span className={`signal-badge ${signalClass}`}>
          {isReduce ? '↘ REDUCE' : '✓ HOLD'}
        </span>
      </div>

      {/* Pricing Row */}
      <div className="pricing-row">
        <div className="price-cell">
          <div className="price-cell-label">Current Price</div>
          <div className="price-cell-value">{fmt(currentPrice)}</div>
        </div>
        <div className="price-cell">
          <div className="price-cell-label">Competitor Median</div>
          <div className="price-cell-value">{fmt(competitorMedian)}</div>
        </div>
        <div className="price-cell">
          <div className="price-cell-label">Suggested Price</div>
          <div className={`price-cell-value ${isReduce ? 'highlight' : ''}`}>
            {fmt(suggestedPrice)}
          </div>
        </div>
      </div>

      {/* Advisory Text */}
      {advisoryText && (
        <div className={`advisory-box ${signalClass}`}>
          💡 {advisoryText}
        </div>
      )}

      {/* Forecast Chart */}
      {chartData.length > 0 ? (
        <div className="chart-wrapper">
          <div className="chart-title">
            📈 4-Week Demand Forecast
            {avgDemand != null && (
              <span style={{ color: 'var(--accent-blue-light)', marginLeft: 8 }}>
                avg {avgDemand.toFixed(1)} units/wk
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,157,255,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,157,255,0.2)', strokeWidth: 1 }} />
              {avgDemand != null && (
                <ReferenceLine
                  y={avgDemand}
                  stroke="rgba(79,142,247,0.3)"
                  strokeDasharray="4 4"
                />
              )}
              <Line
                type="monotone"
                dataKey="predictedDemand"
                stroke="#4f8ef7"
                strokeWidth={2}
                dot={{ fill: '#4f8ef7', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#7ab3ff', stroke: '#4f8ef7', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          ℹ No forecast data available (insufficient historical sales).
        </div>
      )}
    </article>
  )
}
