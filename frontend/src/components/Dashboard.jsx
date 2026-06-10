import ProductAnalysisCard from './ProductAnalysisCard'

/**
 * Dashboard: renders the grid of product analysis cards.
 * Shows skeleton loaders while analyzing.
 * Shows an empty state before the first analysis.
 */
export default function Dashboard({ result, analyzing }) {
  // Skeleton placeholders while loading
  if (analyzing) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-card" aria-hidden="true" />
        ))}
      </div>
    )
  }

  // Pre-analysis empty state
  if (!result) {
    return (
      <div className="empty-state">
        <div className="icon">🔍</div>
        <p>
          Hit <strong style={{ color: 'var(--accent-blue-light)' }}>Run Analysis</strong> to trigger
          the AI engines and see pricing signals &amp; demand forecasts for every product.
        </p>
      </div>
    )
  }

  const products = result.products ?? []

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📭</div>
        <p>Analysis completed but returned no products. Make sure data is loaded in the database.</p>
      </div>
    )
  }

  return (
    <>
      <div className="section-title">
        Product Results
        <span className="pill">{products.length} products</span>
      </div>
      <div className="product-grid">
        {products.map((product, idx) => (
          <ProductAnalysisCard
            key={product.productId ?? idx}
            product={product}
            animationDelay={idx * 40}
          />
        ))}
      </div>
    </>
  )
}
