-- Estimates table for storing customer estimates (INR and USD)
CREATE TABLE estimates (
  id SERIAL PRIMARY KEY,
  estimate_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Jewelry details
  item_code VARCHAR(50),
  jewelry_name VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  
  -- Gold calculations
  gold_purity INTEGER,
  gross_weight DECIMAL(10, 3),
  net_weight DECIMAL(10, 3),
  fine_weight DECIMAL(10, 3),
  gold_rate DECIMAL(10, 2),
  gold_price DECIMAL(10, 2),
  gold_value DECIMAL(10, 2),
  
  -- Making and wastage
  wastage_percent DECIMAL(5, 2),
  wastage_amount DECIMAL(10, 2),
  making_charge_per_gram DECIMAL(10, 2),
  making_amount DECIMAL(10, 2),
  total_gold_amount DECIMAL(10, 2),
  
  -- Stones
  stone_total DECIMAL(10, 2),
  stone_details JSONB, -- Store stone breakdown as JSON
  
  -- Certification
  diamond_carats DECIMAL(10, 3),
  certification_required BOOLEAN DEFAULT false,
  certification_charges DECIMAL(10, 2),
  
  -- Currency and rates
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('INR', 'USD')),
  usd_to_inr_rate DECIMAL(10, 4),
  
  -- Taxes and totals
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  grand_total DECIMAL(10, 2),
  grand_total_inr DECIMAL(10, 2),
  grand_total_usd DECIMAL(10, 4),
  
  -- Metadata
  estimate_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired', 'cancelled')),
  notes TEXT,
  
  -- Foreign keys
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for estimates
CREATE INDEX idx_estimates_number ON estimates(estimate_number);
CREATE INDEX idx_estimates_customer ON estimates(customer_name);
CREATE INDEX idx_estimates_phone ON estimates(customer_phone);
CREATE INDEX idx_estimates_date ON estimates(estimate_date);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_currency ON estimates(currency);
CREATE INDEX idx_estimates_item_code ON estimates(item_code);

-- Create trigger for updated_at
CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate estimate number
CREATE OR REPLACE FUNCTION generate_estimate_number(currency_type VARCHAR(3))
RETURNS VARCHAR(50) AS $$
DECLARE
  prefix VARCHAR(10);
  counter INTEGER;
  estimate_num VARCHAR(50);
BEGIN
  -- Set prefix based on currency
  IF currency_type = 'USD' THEN
    prefix := 'EST-USD-';
  ELSE
    prefix := 'EST-INR-';
  END IF;
  
  -- Get next counter for this currency type
  SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
  INTO counter
  FROM estimates 
  WHERE estimate_number LIKE prefix || '%';
  
  -- Generate estimate number
  estimate_num := prefix || LPAD(counter::TEXT, 4, '0');
  
  RETURN estimate_num;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data (optional)
-- INSERT INTO estimates (estimate_number, customer_name, customer_phone, currency, grand_total, created_by)
-- VALUES 
-- ('EST-INR-0001', 'John Doe', '+91-9876543210', 'INR', 45000.00, 1),
-- ('EST-USD-0001', 'Jane Smith', '+1-555-123-4567', 'USD', 580.50, 1);
