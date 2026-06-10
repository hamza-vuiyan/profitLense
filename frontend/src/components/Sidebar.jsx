export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">📊</div>
        <div>
          <div className="logo-name">ProfitLens</div>
          <div className="logo-tagline">AI Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Main</div>
        <div className="nav-item active">
          <span className="nav-icon">🏠</span> Dashboard
        </div>
        <div className="nav-item">
          <span className="nav-icon">💰</span> Pricing
        </div>
        <div className="nav-item">
          <span className="nav-icon">📈</span> Forecasts
        </div>
        <div className="nav-item">
          <span className="nav-icon">📦</span> Products
        </div>
        <div className="nav-item">
          <span className="nav-icon">📋</span> Sales History
        </div>

        <div className="nav-section" style={{marginTop:12}}>Reports</div>
        <div className="nav-item">
          <span className="nav-icon">💡</span> Advisory
        </div>
        <div className="nav-item">
          <span className="nav-icon">⬇</span> Export
        </div>

        <div className="nav-section" style={{marginTop:12}}>Settings</div>
        <div className="nav-item">
          <span className="nav-icon">⚙</span> Configuration
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div className="merchant-card">
          <div className="merchant-avatar">🏪</div>
          <div>
            <div className="merchant-name">Demo Merchant</div>
            <div className="merchant-plan">Pro Plan · Active</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
