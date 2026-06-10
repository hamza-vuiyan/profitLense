function fmt(v) {
  if (v == null) return '—'
  return `৳${Number(v).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function pctDiff(current, suggested) {
  if (!current || !suggested) return null
  const diff = ((Number(suggested) - Number(current)) / Number(current)) * 100
  return diff.toFixed(1)
}

export default function PricingTable({ products, caption, full }) {
  const reduceCount = products.filter(p => p.pricingSignal === 'REDUCE').length
  const holdCount   = products.length - reduceCount

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title"><span className="icon">💰</span>{caption ?? 'Pricing Signals'}</div>
        <div style={{display:'flex', gap:6}}>
          <span className="panel-tag rose" style={{background:'rgba(244,63,94,.10)', color:'var(--rose)'}}>
            {reduceCount} reduce
          </span>
          <span className="panel-tag emerald">{holdCount} hold</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current</th>
              <th>Competitor</th>
              <th>Suggested</th>
              <th>Change</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center', padding:'32px', color:'var(--text-3)'}}>No data</td></tr>
            )}
            {products.map((p, i) => {
              const diff = pctDiff(p.currentPrice, p.suggestedPrice)
              const isReduce = p.pricingSignal === 'REDUCE'
              return (
                <tr key={p.productId ?? i}>
                  <td className="name">
                    {p.productName ?? '—'}
                    <div className="cat">{p.category ?? ''}</div>
                  </td>
                  <td>{fmt(p.currentPrice)}</td>
                  <td>{fmt(p.competitorMedian)}</td>
                  <td style={{color: isReduce ? 'var(--emerald)' : 'var(--text-2)', fontWeight: isReduce ? 600 : 400}}>
                    {fmt(p.suggestedPrice)}
                  </td>
                  <td style={{color: isReduce ? 'var(--rose)' : 'var(--text-3)', fontSize:'.78rem'}}>
                    {diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${isReduce ? 'reduce' : 'hold'}`}>
                      {isReduce ? '↘ Reduce' : '✓ Hold'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!full && products.length > 0 && (
        <div style={{padding:'10px 16px', borderTop:'1px solid var(--border)', textAlign:'center'}}>
          <span style={{fontSize:'.75rem', color:'var(--text-3)'}}>
            Showing {products.length} of all products. Switch to the <strong>Pricing Signals</strong> tab to see all.
          </span>
        </div>
      )}
    </div>
  )
}
