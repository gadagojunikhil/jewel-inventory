-- Jewelry Stones Table
CREATE TABLE jewelry_stones (
  id SERIAL PRIMARY KEY,
  jewelry_id INTEGER REFERENCES jewelry_pieces(id) ON DELETE CASCADE,
  stone_code VARCHAR(20) NOT NULL,
  stone_name VARCHAR(100),
  weight DECIMAL(10, 3) DEFAULT 0,
  cost_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup
CREATE INDEX idx_jewelry_stones_jewelry_id ON jewelry_stones(jewelry_id);
CREATE INDEX idx_jewelry_stones_stone_code ON jewelry_stones(stone_code);
