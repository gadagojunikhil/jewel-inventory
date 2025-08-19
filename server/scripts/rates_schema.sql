-- Exchange Rates tables for storing daily gold and dollar rates

-- Gold rates table - stores daily gold rates from dpgold.com
CREATE TABLE IF NOT EXISTS gold_rates (
  id SERIAL PRIMARY KEY,
  rate_date DATE NOT NULL UNIQUE,
  gold_24k_per_10g DECIMAL(10, 2) NOT NULL,  -- 24k gold rate per 10 grams
  gold_22k_per_10g DECIMAL(10, 2) NOT NULL,  -- 22k gold rate per 10 grams
  gold_18k_per_10g DECIMAL(10, 2),           -- 18k gold rate per 10 grams
  gold_14k_per_10g DECIMAL(10, 2),           -- 14k gold rate per 10 grams
  source VARCHAR(100) DEFAULT 'dpgold.com',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dollar rates table - stores daily USD to INR exchange rates
CREATE TABLE IF NOT EXISTS dollar_rates (
  id SERIAL PRIMARY KEY,
  rate_date DATE NOT NULL UNIQUE,
  usd_to_inr DECIMAL(10, 4) NOT NULL,        -- USD to INR conversion rate
  inr_to_usd DECIMAL(10, 6),                 -- INR to USD conversion rate (calculated)
  source VARCHAR(100) DEFAULT 'exchangerate-api.com',
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate fetch logs table - tracks automated rate fetching attempts
CREATE TABLE IF NOT EXISTS rate_fetch_logs (
  id SERIAL PRIMARY KEY,
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('gold', 'dollar')),
  fetch_date DATE NOT NULL,
  fetch_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  source VARCHAR(100),
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gold_rates_date ON gold_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_dollar_rates_date ON dollar_rates(rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_gold_rates_active ON gold_rates(is_active, rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_dollar_rates_active ON dollar_rates(is_active, rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_rate_fetch_logs_type_date ON rate_fetch_logs(rate_type, fetch_date DESC);
CREATE INDEX IF NOT EXISTS idx_rate_fetch_logs_status ON rate_fetch_logs(status, fetch_date DESC);

-- Create updated_at triggers
CREATE TRIGGER update_gold_rates_updated_at BEFORE UPDATE ON gold_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dollar_rates_updated_at BEFORE UPDATE ON dollar_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO gold_rates (rate_date, gold_24k_per_10g, gold_22k_per_10g, gold_18k_per_10g, gold_14k_per_10g, notes) 
VALUES 
(CURRENT_DATE, 75000.00, 68750.00, 56250.00, 43750.00, 'Sample data for testing')
ON CONFLICT (rate_date) DO NOTHING;

INSERT INTO dollar_rates (rate_date, usd_to_inr, inr_to_usd, notes) 
VALUES 
(CURRENT_DATE, 83.50, 0.011976, 'Sample data for testing')
ON CONFLICT (rate_date) DO NOTHING;
