const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    await client.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@jewelry.com', passwordHash, 'Admin User', 'admin']
    );
    
    // Seed categories
    const categories = [
      { name: 'Necklace', code: 'N', description: 'All types of necklaces' },
      { name: 'Ring', code: 'R', description: 'All types of rings' },
      { name: 'Earrings', code: 'E', description: 'All types of earrings' },
      { name: 'Bracelet', code: 'B', description: 'All types of bracelets' },
      { name: 'Pendant', code: 'P', description: 'All types of pendants' },
      { name: 'Brooch', code: 'BR', description: 'All types of brooches' }
    ];
    
    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (name, code, description) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (code) DO NOTHING`,
        [category.name, category.code, category.description]
      );
    }
    
    // Seed materials
    const materials = [
      { category: 'Diamond', name: 'Round Diamonds', code: 'RD', cost_price: 200, sale_price: 500, unit: 'carat' },
      { category: 'Diamond', name: 'Princess Cut Diamonds', code: 'PD', cost_price: 180, sale_price: 450, unit: 'carat' },
      { category: 'Stone', name: 'Ruby', code: 'RU', cost_price: 100, sale_price: 300, unit: 'carat' },
      { category: 'Stone', name: 'Sapphire', code: 'SA', cost_price: 80, sale_price: 250, unit: 'carat' },
      { category: 'Stone', name: 'Emerald', code: 'EM', cost_price: 120, sale_price: 350, unit: 'carat' },
      { category: 'Gold', name: '14K Yellow Gold', code: 'G14-Y', cost_price: 30, sale_price: 45, unit: 'gram' },
      { category: 'Gold', name: '18K Yellow Gold', code: 'G18-Y', cost_price: 40, sale_price: 60, unit: 'gram' },
      { category: 'Gold', name: '22K Yellow Gold', code: 'G22-Y', cost_price: 50, sale_price: 75, unit: 'gram' },
      { category: 'Silver', name: 'Sterling Silver 925', code: 'SS-925', cost_price: 2, sale_price: 3, unit: 'gram' }
    ];
    
    for (const material of materials) {
      await client.query(
        `INSERT INTO materials (category, name, code, cost_price, sale_price, unit) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (code) DO NOTHING`,
        [material.category, material.name, material.code, 
         material.cost_price, material.sale_price, material.unit]
      );
    }
    
    await client.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedDatabase();