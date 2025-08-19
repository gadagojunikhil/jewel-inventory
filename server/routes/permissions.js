const express = require('express');
const { Pool } = require('pg');
const { auth, superAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'jewelry_inventory',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Get all custom permissions
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM custom_permissions ORDER BY page_id, role');
    
    // Transform the flat result into a nested object structure
    const permissions = {};
    result.rows.forEach(row => {
      if (!permissions[row.page_id]) {
        permissions[row.page_id] = {};
      }
      permissions[row.page_id][row.role] = {
        access: row.has_access,
        level: row.access_level
      };
    });

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
});

// Save custom permissions (Super Admin only)
router.post('/', auth, superAdminAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { permissions } = req.body;
    
    // Clear existing custom permissions
    await client.query('DELETE FROM custom_permissions');
    
    // Insert new permissions
    for (const pageId in permissions) {
      for (const role in permissions[pageId]) {
        const { access, level } = permissions[pageId][role];
        
        await client.query(
          'INSERT INTO custom_permissions (page_id, role, has_access, access_level, updated_at) VALUES ($1, $2, $3, $4, NOW())',
          [pageId, role, access, level]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Permissions saved successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving permissions',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Reset permissions to default (Super Admin only)
router.delete('/', auth, superAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM custom_permissions');
    
    res.json({
      success: true,
      message: 'Permissions reset to default successfully'
    });
  } catch (error) {
    console.error('Error resetting permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting permissions',
      error: error.message
    });
  }
});

module.exports = router;
