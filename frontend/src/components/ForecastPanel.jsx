import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function shortDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getMonth()+1}/${dt.getDate()}`
}

function CustomTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{
      background:'#ffffff',
      border:'1px solid #e2e8f0',
      boxShadow:'0 4px 12px rgba(0,0,0,.08)',
      borderRadius:8, padding:'8px 12px', fontSize:'.78rem', color:'#0f172a', lineHeight:1.7
    }}>
      <div style={{color:'#64748b'}}>{d?.date}</div>
      <div>Demand: <strong style={{color:'#3b82f6'}}>{Number(d?.demand??0).toFixed(1)} units</strong></div>
    </div>
  )
}

/** Full-page forecast: shows each product as a mini line chart card */
function ForecastCards({ products }) {
  if (products.length === 0) return (
    <div className="empty">
      <div className="em-icon">📈</div>
      <p>No forecast data yet. Forecasts generate in the background — check back in ~2 minutes.</p>
    </div>
  )

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16}}>
      {products.map((p, i) => {
        const data = (p.forecasts??[]).map(f => ({
          date: shortDate(f.forecastDate),
          demand: parseFloat(f.predictedDemand??0)
        }))
        return (
          <div key={p.productId??i} className="panel" style={{animationDelay:`${i*30}ms`}}>
            <div className="panel-header">
              <div className="panel-title" style={{fontSize:'.82rem'}}>
                <span style={{fontSize:'13px'}}>📈</span>
                <span style={{maxWidth:180, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  {p.productName}
                </span>
              </div>
              <span className="panel-tag blue">{p.category}</span>
            </div>
            <div style={{padding:'12px 16px 16px'}}>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={data} margin={{top:4,right:4,left:-28,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize:10, fill:'#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10, fill:'#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTip />} cursor={{stroke:'#cbd5e1'}} />
                  <Line type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2}
                    dot={{fill:'#3b82f6', r:3, strokeWidth:0}}
                    activeDot={{r:5, fill:'#60a5fa', stroke:'#3b82f6', strokeWidth:2}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Sidebar version: bar-list showing top forecasted products */
function ForecastSidebar({ products }) {
  // Flatten all forecasts and find max avg demand for bar scaling
  const items = products.map(p => {
    const fcs = p.forecasts ?? []
    const avg = fcs.length ? fcs.reduce((s, f) => s + parseFloat(f.predictedDemand??0), 0) / fcs.length : 0
    return { name: p.productName, avg, cat: p.category }
  }).sort((a,b) => b.avg - a.avg)

  const maxAvg = Math.max(...items.map(i => i.avg), 1)

  if (items.length === 0) return (
    <div className="empty" style={{padding:'30px 16px'}}>
      <div className="em-icon" style={{fontSize:'2rem'}}>📈</div>
      <p style={{fontSize:'.8rem'}}>Forecasts generate in background (~2 min)</p>
    </div>
  )

  return (
    <div className="forecast-list">
      {items.slice(0, 8).map((it, i) => (
        <div key={i} className="forecast-item">
          <div className="fi-date">{it.cat?.split(' ')[0] ?? '—'}</div>
          <div className="fi-bar-wrap">
            <div style={{fontSize:'.72rem', color:'var(--text-3)', marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
              {it.name}
            </div>
            <div className="fi-bar-bg">
              <div className="fi-bar" style={{width:`${Math.round((it.avg/maxAvg)*100)}%`}} />
            </div>
          </div>
          <div className="fi-demand">{it.avg.toFixed(1)}</div>
        </div>
      ))}
    </div>
  )
}

export default function ForecastPanel({ products, full }) {
  if (full) return <ForecastCards products={products} />

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title"><span className="icon">📈</span>Demand Forecast</div>
        <span className="panel-tag amber">avg units/wk</span>
      </div>
      <ForecastSidebar products={products} />
    </div>
  )
}
