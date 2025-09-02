-- Migration script to remove redundant cost columns from jewelry_pieces table
-- Since we're calculating and storing total_cost_value, these individual cost columns are redundant

-- IMPORTANT: Backup your database before running this script!

-- Remove redundant cost columns that are calculated and included in total_cost_value
ALTER TABLE jewelry_pieces 
DROP COLUMN IF EXISTS total_gold_price,
DROP COLUMN IF EXISTS total_stone_cost,
DROP COLUMN IF EXISTS total_wastage,
DROP COLUMN IF EXISTS total_making_charges;

-- Keep these columns as they are input parameters for calculation:
-- - gross_weight (input)
-- - net_weight (calculated but needed for reference)
-- - gold_rate (input)
-- - stones (input data)
-- - wastage_percentage (input)
-- - making_charges (input per gram rate)
-- - total_cost_value (final calculated total)

-- Also consider removing these old columns from the original schema if not used:
-- ALTER TABLE jewelry_pieces 
-- DROP COLUMN IF EXISTS labor_cost,
-- DROP COLUMN IF EXISTS other_costs,
-- DROP COLUMN IF EXISTS total_cost;

COMMIT;
