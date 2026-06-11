import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const navItem = (to, icon, label, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <span className="nav-icon">{icon}</span> {label}
    </NavLink>
  )

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
        {navItem('/', '🏠', 'Dashboard', true)}
        <div className="nav-section" style={{marginTop:12}}>Presentation</div>
        {navItem('/docs', '📖', 'Documentation')}
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
