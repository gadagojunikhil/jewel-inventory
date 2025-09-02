-- Migration script to update jewelry_pieces table for comprehensive inventory management
-- Run this script to add the missing columns for stones, wastage, making charges, etc.

-- Add new columns to jewelry_pieces table
ALTER TABLE jewelry_pieces 
ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_weight DECIMAL(10,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_gold_price DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stones JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_stone_cost DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wastage_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wastage DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS making_charges DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_making_charges DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost_value DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS certificate VARCHAR(10) DEFAULT 'No' CHECK (certificate IN ('Yes', 'No')),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Make sale_price optional (can be set later)
ALTER TABLE jewelry_pieces ALTER COLUMN sale_price DROP NOT NULL;
ALTER TABLE jewelry_pieces ALTER COLUMN sale_price SET DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jewelry_gross_weight ON jewelry_pieces(gross_weight);
CREATE INDEX IF NOT EXISTS idx_jewelry_net_weight ON jewelry_pieces(net_weight);
CREATE INDEX IF NOT EXISTS idx_jewelry_total_cost ON jewelry_pieces(total_cost_value);
CREATE INDEX IF NOT EXISTS idx_jewelry_certificate ON jewelry_pieces(certificate);

COMMIT;
