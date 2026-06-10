function fmt(v) {
  if (v == null) return '—'
  return `৳${Number(v).toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function AdvisoryGrid({ products, title }) {
  if (products.length === 0) return (
    <div className="empty">
      <div className="em-icon">💡</div>
      <p>No advisory items. All prices are competitive — great work!</p>
    </div>
  )

  return (
    <>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
        <h2 style={{fontSize:'.95rem', fontWeight:700, color:'var(--text-1)'}}>{title}</h2>
        <span style={{fontSize:'.75rem', color:'var(--text-3)'}}>{products.length} items</span>
      </div>
      <div className="advisory-grid">
        {products.map((p, i) => {
          const isReduce = p.pricingSignal === 'REDUCE'
          return (
            <div key={p.productId??i} className="advisory-card" style={{animationDelay:`${i*25}ms`}}>
              <div className={`advisory-signal-bar ${isReduce ? 'reduce' : 'hold'}`} />
              <div className="advisory-body">
                <div className="advisory-name">{p.productName ?? '—'}</div>
                <div className="advisory-cat">{p.category ?? 'Uncategorized'}</div>
                {p.advisoryText && <div className="advisory-text">{p.advisoryText}</div>}
                <div className="advisory-meta">
                  <span className={`badge ${isReduce ? 'reduce' : 'hold'}`}>
                    {isReduce ? '↘ Reduce' : '✓ Hold'}
                  </span>
                  <span className="advisory-price">
                    Now: <strong>{fmt(p.currentPrice)}</strong>
                  </span>
                  {isReduce && (
                    <span className="advisory-price">
                      → <strong style={{color:'var(--emerald)'}}>{fmt(p.suggestedPrice)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
