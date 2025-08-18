const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

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
        c.name as category_name,
        json_agg(
          json_build_object(
            'material_id', jm.material_id,
            'material_name', m.name,
            'material_code', m.code,
            'quantity', jm.quantity,
            'unit', m.unit,
            'cost_per_unit', jm.cost_per_unit,
            'total_cost', jm.total_cost
          )
        ) FILTER (WHERE jm.id IS NOT NULL) as materials
      FROM jewelry_pieces j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN jewelry_materials jm ON j.id = jm.jewelry_id
      LEFT JOIN materials m ON jm.material_id = m.id
      WHERE j.id = $1
      GROUP BY j.id, c.name
    `;
    
    const completeResult = await pool.query(completeQuery, [id]);
    res.json(completeResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
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