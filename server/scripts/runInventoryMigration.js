const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running inventory table migration...');
    
    const migrationPath = path.join(__dirname, 'inventory_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Inventory migration completed successfully!');
    console.log('Added columns: gross_weight, net_weight, gold_rate, total_gold_price, stones, total_stone_cost, wastage_percentage, total_wastage, making_charges, total_making_charges, total_cost_value, certificate, description');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
