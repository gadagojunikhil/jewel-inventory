const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function createInitialAdmin() {
  try {
    console.log('Creating initial admin user...');
    
    // Check if any admin users exist
    const adminCheck = await pool.query(
      'SELECT id FROM users WHERE role IN ($1, $2) LIMIT 1',
      ['admin', 'super_admin']
    );
    
    if (adminCheck.rows.length > 0) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }
    
    // Create initial admin user
    const adminPassword = 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    const result = await pool.query(`
      INSERT INTO users (
        first_name, last_name, username, password_hash, role, 
        is_password_reset_required, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, last_name, username, role
    `, [
      'System',
      'Administrator', 
      'admin',
      passwordHash,
      'super_admin',
      true, // Force password change on first login
      true
    ]);
    
    const user = result.rows[0];
    
    console.log('Initial admin user created successfully:');
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Username: ${user.username}`);
    console.log(`Role: ${user.role}`);
    console.log(`Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('');
    
  } catch (error) {
    console.error('Error creating initial admin user:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createInitialAdmin()
    .then(() => {
      console.log('Admin user creation completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create admin user:', error);
      process.exit(1);
    });
}

module.exports = createInitialAdmin;
