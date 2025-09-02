-- Migration script to update categories table for hierarchical structure
-- Run this script to add the missing columns for parent/child categories

-- Add new columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'parent' CHECK (type IN ('parent', 'child')),
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS wastage_charges DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS making_charges DECIMAL(12,2) DEFAULT 0.00;

-- Make code column optional (not required for parent categories)
ALTER TABLE categories ALTER COLUMN code DROP NOT NULL;

-- Update existing data to have proper type
UPDATE categories SET type = 'parent' WHERE type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Sample parent categories (Material Types)
INSERT INTO categories (name, type, description) VALUES 
('Gold', 'parent', 'Gold jewelry and items'),
('Diamond', 'parent', 'Diamond jewelry and items'),
('Silver', 'parent', 'Silver jewelry and items'),
('Platinum', 'parent', 'Platinum jewelry and items')
ON CONFLICT (name) DO NOTHING;

COMMIT;
