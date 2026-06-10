import { useState, useCallback, useEffect } from 'react'
import { runAnalysis, getAnalysis } from './api'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import KpiRow from './components/KpiRow'
import PricingTable from './components/PricingTable'
import ForecastPanel from './components/ForecastPanel'
import AdvisoryGrid from './components/AdvisoryGrid'

const TABS = ['Overview', 'Pricing Signals', 'Demand Forecast', 'Advisory']

export default function App() {
  const [tab, setTab]         = useState('Overview')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const data = await runAnalysis()
      if (data.status === 'ERROR') throw new Error(data.message)
      setResult(data)
      setTab('Overview')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unknown error')
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const products = result?.products ?? []
  const reduceList = products.filter(p => p.pricingSignal === 'REDUCE')
  const holdList   = products.filter(p => p.pricingSignal === 'HOLD')
  const withForecast = products.filter(p => p.forecasts?.length > 0)
  const forecastRunning = result?.forecastStatus === 'RUNNING'

  // Auto-poll if forecast is running in the background
  useEffect(() => {
    let interval;
    if (forecastRunning && !analyzing) {
      interval = setInterval(async () => {
        try {
          const data = await getAnalysis()
          if (data.status === 'ERROR') throw new Error(data.message)
          setResult(data)
        } catch (err) {
          console.error("Polling failed:", err)
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [forecastRunning, analyzing])

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <Topbar
          analyzing={analyzing}
          hasResult={!!result}
          forecastRunning={forecastRunning}
          onAnalyze={handleAnalyze}
        />

        {/* Tab bar only after results */}
        {result && (
          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'Overview'         && '📊 '}
                {t === 'Pricing Signals'  && '💰 '}
                {t === 'Demand Forecast'  && '📈 '}
                {t === 'Advisory'         && '💡 '}
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="page-body">
          {error && (
            <div className="error-banner">
              ⚠️ <span><strong>Analysis failed:</strong> {error}</span>
            </div>
          )}

          {forecastRunning && (
            <div className="forecast-banner">
              ⏳ <span>Prophet forecast is generating in the background (~2 min). Pricing signals are shown immediately below. Refresh this page after a minute to see demand charts.</span>
            </div>
          )}

          {/* Empty state */}
          {!result && !analyzing && !error && (
            <div className="empty">
              <div className="em-icon">📊</div>
              <p>Click <strong style={{color:'var(--blue-light)'}}>Run Analysis</strong> in the top bar to kick off the AI engines and populate this dashboard with pricing signals and demand forecasts.</p>
            </div>
          )}

          {/* Skeleton while loading */}
          {analyzing && <SkeletonDash />}

          {/* Results */}
          {result && !analyzing && (
            <>
              {tab === 'Overview' && (
                <>
                  <KpiRow products={products} reduceList={reduceList} withForecast={withForecast} />
                  <div className="two-col">
                    <PricingTable products={products.slice(0, 20)} caption="Top 20 Products" />
                    <ForecastPanel products={withForecast.slice(0, 8)} />
                  </div>
                  <AdvisoryGrid products={reduceList.slice(0, 6)} title="⚠️ Price Reduction Alerts" />
                </>
              )}
              {tab === 'Pricing Signals' && (
                <PricingTable products={products} caption={`All ${products.length} products`} full />
              )}
              {tab === 'Demand Forecast' && (
                <ForecastPanel products={withForecast} full />
              )}
              {tab === 'Advisory' && (
                <AdvisoryGrid products={products} title="All Advisory Insights" />
              )}
            </>
          )}
        </div>

        <footer className="footer">
          <span className="footer-brand">ProfitLens © {new Date().getFullYear()}</span>
          <span className="footer-author">
            Made with <span className="footer-author-heart">❤️</span> by <strong>BrainFreezed Org</strong>
          </span>
        </footer>
      </div>
    </div>
  )
}

function SkeletonDash() {
  return (
    <>
      <div className="kpi-grid" style={{marginBottom:24}}>
        {[1,2,3,4].map(i => (
          <div key={i} className="kpi-card">
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
              <div className="skeleton" style={{height:12, width:80}} />
              <div className="skeleton" style={{height:32, width:60}} />
              <div className="skeleton" style={{height:10, width:100}} />
            </div>
            <div className="skeleton" style={{width:42, height:42, borderRadius:10}} />
          </div>
        ))}
      </div>
      <div className="panel">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton-row">
            <div className="skeleton" style={{height:12, width:160, flex:1}} />
            <div className="skeleton" style={{height:12, width:70}} />
            <div className="skeleton" style={{height:12, width:70}} />
            <div className="skeleton" style={{height:22, width:60, borderRadius:100}} />
          </div>
        ))}
      </div>
    </>
  )
}
