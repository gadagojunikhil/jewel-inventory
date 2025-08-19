-- Drop existing tables if they exist
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS jewelry_materials CASCADE;
DROP TABLE IF EXISTS jewelry_pieces CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'super_admin', 'manager', 'user')),
  is_password_reset_required BOOLEAN DEFAULT true,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  postal_code VARCHAR(20),
  contact_person VARCHAR(255),
  website VARCHAR(255),
  gst_number VARCHAR(50),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE materials (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  cost_price DECIMAL(10, 2),
  sale_price DECIMAL(10, 2),
  unit VARCHAR(20),
  stock_quantity DECIMAL(10, 3) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jewelry pieces table
CREATE TABLE jewelry_pieces (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  labor_cost DECIMAL(10, 2) DEFAULT 0,
  other_costs DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  sale_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'In Stock',
  vendor_id INTEGER REFERENCES vendors(id),
  notes TEXT,
  image_url VARCHAR(500),
  gold_weight DECIMAL(10, 3) DEFAULT 0,
  gold_purity INTEGER DEFAULT 18,
  diamond_weight DECIMAL(10, 3) DEFAULT 0,
  stone_weight DECIMAL(10, 3) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jewelry materials junction table
CREATE TABLE jewelry_materials (
  id SERIAL PRIMARY KEY,
  jewelry_id INTEGER REFERENCES jewelry_pieces(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id),
  quantity DECIMAL(10, 3) NOT NULL,
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  jewelry_id INTEGER REFERENCES jewelry_pieces(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  sale_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_jewelry_status ON jewelry_pieces(status);
CREATE INDEX idx_jewelry_category ON jewelry_pieces(category_id);
CREATE INDEX idx_jewelry_code ON jewelry_pieces(code);
CREATE INDEX idx_jewelry_vendor ON jewelry_pieces(vendor_id);
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_email ON vendors(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jewelry_pieces_updated_at BEFORE UPDATE ON jewelry_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();