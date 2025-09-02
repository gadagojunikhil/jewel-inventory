const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

// Get jewelry piece by code and include sale_price for stones/materials
// Add logging to debug the route
router.get('/details/:code', async (req, res) => {
  console.log('Request received for /details/:code');
  try {
    const { code } = req.params;
    console.log(`Fetching jewelry details for code: ${code}`);

    // Fetch jewelry piece by code
    const jewelryQuery = `SELECT * FROM jewelry_pieces WHERE code = $1`;
    const jewelryResult = await pool.query(jewelryQuery, [code]);
    console.log('Jewelry query result:', jewelryResult.rows);

    if (jewelryResult.rows.length === 0) {
      console.log('Jewelry not found');
      return res.status(404).json({ error: 'Jewelry not found' });
    }

    const jewelry = jewelryResult.rows[0];

    // Fetch stones from jewelry_stones table
    let stones = [];
    try {
      const stonesQuery = `SELECT stone_code, stone_name, weight, cost_price, sale_price FROM jewelry_stones WHERE jewelry_id = $1`;
      const stonesResult = await pool.query(stonesQuery, [jewelry.id]);
      stones = stonesResult.rows;
      console.log('Stones query result:', stones);
    } catch (e) {
      console.error('Error fetching stones:', e);
      stones = [];
    }
    jewelry.stones = stones;

    res.json(jewelry);
  } catch (error) {
    console.error('Error in /details/:code route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all jewelry pieces with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status, 
      minPrice, 
      maxPrice, 
      search, 
      sortBy = 'created_at', 
      order = 'DESC',
      page = 1,
      limit = 10
    } = req.query;
    
    let query = `
      SELECT 
        j.*,
        c.name as category_name
      FROM jewelry_pieces j
      LEFT JOIN categories c ON j.category_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    if (category) {
      paramCount++;
      query += ` AND j.category_id = $${paramCount}`;
      queryParams.push(category);
    }
    
    if (status) {
      paramCount++;
      query += ` AND j.status = $${paramCount}`;
      queryParams.push(status);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (j.name ILIKE $${paramCount} OR j.code ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }
    
    query += ` ORDER BY j.${sortBy} ${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    
    const result = await pool.query(query, queryParams);
    // Enrich stones with sale_price for each jewelry piece
    const jewelryRows = result.rows;
    for (const jewelry of jewelryRows) {
      let stones = [];
      if (jewelry.stones) {
        try {
          stones = typeof jewelry.stones === 'string' ? JSON.parse(jewelry.stones) : jewelry.stones;
        } catch (e) {
          stones = [];
        }
        for (let stone of stones) {
          let stoneCode = stone.stoneCode || stone.code;
          if (stoneCode) {
            const materialResult = await pool.query('SELECT sale_price FROM materials WHERE code = $1', [stoneCode]);
            stone.sale_price = materialResult.rows[0]?.sale_price || 0;
          } else {
            stone.sale_price = 0;
          }
        }
      }
      jewelry.stones = stones;
    }
    res.json(jewelryRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete jewelry piece
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM jewelry_pieces WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jewelry piece not found' });
    }
    
    res.json({ message: 'Jewelry piece deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload jewelry pieces
router.post('/bulk-upload', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }
    
    await client.query('BEGIN');
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        // Calculate total cost
        const materialsCost = (item.materials || []).reduce((sum, m) => sum + (m.total_cost || 0), 0);
        const total_cost = materialsCost + (item.labor_cost || 0) + (item.other_costs || 0);
        
        // Insert jewelry piece
        const jewelryQuery = `
          INSERT INTO jewelry_pieces (
            code, name, category_id, labor_cost, other_costs,
            total_cost, sale_price, status, vendor, notes,
            gold_weight, gold_purity, diamond_weight, stone_weight,
            created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, code, name
        `;
        
        const jewelryResult = await client.query(jewelryQuery, [
          item.code,
          item.name,
          item.category_id,
          item.labor_cost || 0,
          item.other_costs || 0,
          total_cost,
          item.sale_price,
          item.status || 'In Stock',
          item.vendor,
          item.notes,
          item.gold_weight || 0,
          item.gold_purity || 18,
          item.diamond_weight || 0,
          item.stone_weight || 0,
          req.userId
        ]);
        
        const jewelryId = jewelryResult.rows[0].id;
        
        // Insert materials if provided
        if (item.materials && item.materials.length > 0) {
          for (const material of item.materials) {
            await client.query(
              `INSERT INTO jewelry_materials (
                jewelry_id, material_id, quantity, cost_per_unit, total_cost
              ) VALUES ($1, $2, $3, $4, $5)`,
              [
                jewelryId,
                material.material_id,
                material.quantity,
                material.cost_per_unit,
                material.total_cost
              ]
            );
          }
        }
        
        results.push({
          index: i,
          success: true,
          data: jewelryResult.rows[0]
        });
      } catch (error) {
        errors.push({
          index: i,
          code: item.code,
          error: error.message
        });
      }
    }
    
    if (errors.length === items.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'All items failed to upload',
        details: errors 
      });
    }
    
    await client.query('COMMIT');
    
    res.json({
      message: `Successfully uploaded ${results.length} out of ${items.length} items`,
      successful: results,
      failed: errors
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;