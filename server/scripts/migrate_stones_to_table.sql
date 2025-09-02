-- Migrate stones from jewelry_pieces.stones JSON column to jewelry_stones table
-- This script assumes stones is a JSON array with stone_code, stone_name, weight, cost_price, sale_price

DO $$
DECLARE
  jewelry_rec RECORD;
  stone_rec JSONB;
BEGIN
  FOR jewelry_rec IN SELECT id, stones FROM jewelry_pieces WHERE stones IS NOT NULL LOOP
    FOR stone_rec IN SELECT * FROM jsonb_array_elements(jewelry_rec.stones::jsonb) LOOP
      INSERT INTO jewelry_stones (jewelry_id, stone_code, stone_name, weight, cost_price, sale_price)
      VALUES (
        jewelry_rec.id,
        COALESCE(stone_rec->>'stoneCode', stone_rec->>'code'),
        COALESCE(stone_rec->>'stoneName', stone_rec->>'name'),
        (stone_rec->>'weight')::DECIMAL,
        (stone_rec->>'cost_price')::DECIMAL,
        (stone_rec->>'sale_price')::DECIMAL
      );
    END LOOP;
  END LOOP;
END $$;

-- After migration, you can drop the stones column from jewelry_pieces if desired:
-- ALTER TABLE jewelry_pieces DROP COLUMN stones;
