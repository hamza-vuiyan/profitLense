export default function Topbar({ analyzing, hasResult, forecastRunning, onAnalyze }) {
  return (
    <div className="topbar">
      <div>
        <div className="page-title">Business Dashboard</div>
        <div className="page-sub">
          {hasResult ? 'Last analysis complete · pricing signals and forecasts ready' : 'Run an analysis to populate your dashboard'}
        </div>
      </div>

      <div className="topbar-actions">
        {forecastRunning && (
          <div className="chip">
            <span className="dot amber" />
            Forecasting…
          </div>
        )}
        {hasResult && !forecastRunning && (
          <div className="chip">
            <span className="dot green" />
            Up to date
          </div>
        )}

        <button
          id="btn-analyze"
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={analyzing}
        >
          {analyzing
            ? <><span className="spinner" /> Analyzing…</>
            : <>⚡ Run Analysis</>
          }
        </button>
      </div>
    </div>
  )
}
