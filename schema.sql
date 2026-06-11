-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_price DECIMAL(10,2),
    unit VARCHAR(50),
    stock_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Records Table
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    revenue DECIMAL(10,2),
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forecasts Table
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2),
    lower_bound DECIMAL(10,2),
    upper_bound DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(merchant_id, product_id, forecast_date)
);

-- Pricing Signals Table
CREATE TABLE IF NOT EXISTS pricing_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_price DECIMAL(10,2),
    competitor_median DECIMAL(10,2),
    signal VARCHAR(20),
    suggested_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sales_merchant_product_date ON sales_records(merchant_id, product_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(sale_date);
CREATE INDEX IF NOT EXISTS idx_forecasts_merchant ON forecasts(merchant_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_forecasts_product ON forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_merchant ON pricing_signals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pricing_product ON pricing_signals(product_id);

-- Docs Configuration Table
CREATE TABLE IF NOT EXISTS docs_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_visible BOOLEAN DEFAULT true,
    visible_from TIMESTAMP,
    visible_until TIMESTAMP,
    pitch_text TEXT,
    tech_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
