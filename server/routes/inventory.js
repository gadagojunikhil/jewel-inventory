const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

// Get all inventory items (jewelry pieces)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      status, 
      vendor,
      search, 
      sortBy = 'created_at', 
      order = 'DESC',
      page = 1,
      limit = 50
    } = req.query;
    
    let baseQuery = `
      FROM jewelry_pieces j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN vendors v ON j.vendor_id = v.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      baseQuery += ` AND j.category_id = $${paramCount}`;
      queryParams.push(category);
    }

    if (status) {
      paramCount++;
      baseQuery += ` AND j.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (vendor) {
      paramCount++;
      baseQuery += ` AND j.vendor_id = $${paramCount}`;
      queryParams.push(vendor);
    }

    if (search) {
      paramCount++;
      baseQuery += ` AND (j.name ILIKE $${paramCount} OR j.code ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Get total count before applying ordering/pagination
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const totalResult = await pool.query(countQuery, queryParams);

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['created_at', 'name', 'code', 'sale_price', 'total_cost', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build final data query with ordering and pagination
    let dataQuery = `
      SELECT 
        j.*,
        c.name as category_name,
        c.code as category_code,
        v.name as vendor_name,
        v.company as vendor_company
      ${baseQuery}
      ORDER BY j.${safeSortBy} ${safeOrder}
    `;

    // Add pagination
    if (limit && limit > 0) {
      dataQuery += ` LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}`;
    }

    const result = await pool.query(dataQuery, queryParams);
    // Fetch stones for each jewelry piece from the new jewelry_stones table
    const jewelryIds = result.rows.map(item => item.id);
    let stonesMap = {};
    if (jewelryIds.length > 0) {
      const stonesResult = await pool.query(
        `SELECT jewelry_id, stone_code, stone_name, weight, cost_price, sale_price 
         FROM jewelry_stones WHERE jewelry_id = ANY($1)`,
        [jewelryIds]
      );
      stonesResult.rows.forEach(stone => {
        if (!stonesMap[stone.jewelry_id]) stonesMap[stone.jewelry_id] = [];
        stonesMap[stone.jewelry_id].push(stone);
      });
    }

    // Attach stones to each item
    const itemsWithStones = result.rows.map(item => {
      return {
        ...item,
        stones: stonesMap[item.id] || []
      };
    });

    res.json({
      items: itemsWithStones,
      total: totalResult.rows[0].total
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Server error while fetching inventory' });
  }
});

// Get single inventory item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        j.*,
        c.name as category_name,
        c.code as category_code,
        v.name as vendor_name,
        v.company as vendor_company,
        v.city as vendor_city
      FROM jewelry_pieces j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN vendors v ON j.vendor_id = v.id
      WHERE j.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    // Fetch stones for this jewelry piece from jewelry_stones table
    const item = result.rows[0];
    if (item) {
      const stonesResult = await pool.query(
        `SELECT * FROM jewelry_stones WHERE jewelry_id = $1`,
        [item.id]
      );
      item.stones = stonesResult.rows;
      res.json(item);
    } else {
      res.status(404).json({ error: 'Inventory item not found' });
    }
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Server error while fetching inventory item' });
  }
});

// Add new inventory item
router.post('/', [
  auth,
  body('code').trim().notEmpty().withMessage('Item code is required'),
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('gross_weight').optional().isFloat({ min: 0 }).withMessage('Gross weight must be a positive number'),
  body('stone_weight').optional().isFloat({ min: 0 }).withMessage('Stone weight must be a positive number'),
  body('gold_purity').optional().isInt({ min: 1, max: 24 }).withMessage('Gold purity must be between 1 and 24'),
  body('vendor_id').optional().isInt({ min: 1 }).withMessage('Valid vendor is required if specified')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      code,
      name,
      description,
      category_id,
      vendor_id,
      gross_weight = 0,
      stone_weight = 0,
      net_weight = 0,
      gold_purity = 18,
      gold_rate = 0,
      total_gold_price = 0,
      stones = [],
      total_stone_cost = 0,
      wastage_percentage = 0,
      total_wastage = 0,
      making_charges = 0,
      total_making_charges = 0,
      total_cost_value = 0,
      sale_price = 0,
      certificate = 'No',
      status = 'In Stock',
      notes
    } = req.body;

    // Check if code already exists
    const existingItem = await pool.query(
      'SELECT id FROM jewelry_pieces WHERE code = $1',
      [code]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({ error: 'Item code already exists' });
    }

    const query = `
      INSERT INTO jewelry_pieces (
        code, name, description, category_id, vendor_id, 
        gross_weight, net_weight, gold_weight, gold_purity, 
        stone_weight, gold_rate, total_gold_price,
        total_stone_cost, wastage_percentage, total_wastage,
        making_charges, total_making_charges, total_cost_value,
        sale_price, certificate, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id, code, name, created_at
    `;

    const values = [
      code,
      name,
      description,
      category_id,
      vendor_id || null,
      gross_weight,
      net_weight,
      net_weight, // Also store as gold_weight for backward compatibility
      gold_purity,
      stone_weight,
      gold_rate,
      total_gold_price,
      total_stone_cost,
      wastage_percentage,
      total_wastage,
      making_charges,
      total_making_charges,
      total_cost_value,
      sale_price,
      certificate,
      status,
      notes || '',
      req.userId
    ];

    const result = await pool.query(query, values);

    // After creating the jewelry piece, insert stones into jewelry_stones table if provided
    const createdItem = result.rows[0];

    // Normalize stones to an array for robust handling (accept arrays, JSON strings, single object)
    let stonesArrayForInsert = [];
    if (stones !== undefined) {
      if (Array.isArray(stones)) {
        stonesArrayForInsert = stones;
      } else if (typeof stones === 'string') {
        try {
          const parsed = JSON.parse(stones);
          stonesArrayForInsert = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        } catch (e) {
          stonesArrayForInsert = [];
        }
      } else if (stones && typeof stones === 'object') {
        stonesArrayForInsert = [stones];
      }
    }

    if (stonesArrayForInsert.length > 0) {
      const stoneInsertPromises = stonesArrayForInsert.map(stone => {
        const stoneCode = stone.stone_code || stone.code || null;
        const stoneName = stone.stone_name || stone.name || null;
        const weight = stone.weight || 0;
        const costPrice = stone.cost_price || stone.costPrice || 0;
        const salePrice = stone.sale_price || stone.salePrice || stone.rate || 0;

        return pool.query(
          `INSERT INTO jewelry_stones (jewelry_id, stone_code, stone_name, weight, cost_price, sale_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [createdItem.id, stoneCode, stoneName, weight, costPrice, salePrice]
        );
      });
      await Promise.all(stoneInsertPromises);
    }
    
    res.status(201).json({
      message: 'Inventory item added successfully',
      item: createdItem
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Item code already exists' });
    }
    res.status(500).json({ error: 'Server error while adding inventory item' });
  }
});

// Update inventory item
router.put('/:id', [
  auth,
  body('code').optional().trim().notEmpty().withMessage('Item code cannot be empty'),
  body('description').optional().trim(),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category is required'),
  body('vendor_id').optional().custom(value => {
    if (value === null || value === '' || value === undefined) return true;
    return Number.isInteger(parseInt(value)) && parseInt(value) > 0;
  }).withMessage('Valid vendor is required if specified'),
  body('gross_weight').optional().isFloat({ min: 0 }).withMessage('Gross weight must be a positive number'),
  body('stone_weight').optional().isFloat({ min: 0 }).withMessage('Stone weight must be a positive number'),
  body('net_weight').optional().isFloat({ min: 0 }).withMessage('Net weight must be a positive number'),
  body('gold_purity').optional().isInt({ min: 1, max: 24 }).withMessage('Gold purity must be between 1 and 24'),
  body('gold_rate').optional().isFloat({ min: 0 }).withMessage('Gold rate must be a positive number'),
  body('total_gold_price').optional().isFloat({ min: 0 }).withMessage('Total gold price must be a positive number'),
  body('total_stone_cost').optional().isFloat({ min: 0 }).withMessage('Total stone cost must be a positive number'),
  body('wastage_percentage').optional().isFloat({ min: 0 }).withMessage('Wastage percentage must be a positive number'),
  body('total_wastage').optional().isFloat({ min: 0 }).withMessage('Total wastage must be a positive number'),
  body('making_charges').optional().isFloat({ min: 0 }).withMessage('Making charges must be a positive number'),
  body('total_making_charges').optional().isFloat({ min: 0 }).withMessage('Total making charges must be a positive number'),
  body('total_cost_value').optional().isFloat({ min: 0 }).withMessage('Total cost value must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('certificate').optional().isIn(['Yes', 'No']).withMessage('Certificate must be Yes or No'),
  body('status').optional().isIn(['In Stock', 'Sold', 'Reserved', 'Repair', 'Archived']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors for update request:', {
        itemId: req.params.id,
        errors: errors.array(),
        requestBody: req.body
      });
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const {
      code,
      description,
      category_id,
      vendor_id,
      gross_weight,
      stone_weight,
      net_weight,
      gold_purity,
      gold_rate,
      total_gold_price,
      stones,
      total_stone_cost,
      wastage_percentage,
      total_wastage,
      making_charges,
      total_making_charges,
      total_cost_value,
      sale_price,
      certificate,
      status,
      notes
    } = req.body;

    // Check if code is being updated and if it already exists for another item
    if (code) {
      const existingItem = await pool.query(
        'SELECT id FROM jewelry_pieces WHERE code = $1 AND id != $2',
        [code, id]
      );

      if (existingItem.rows.length > 0) {
        return res.status(400).json({ error: 'Item code already exists' });
      }
    }

    // Build dynamic update query for provided fields only
    const updates = {};
    const allowedFields = [
      'code', 'description', 'category_id', 'vendor_id', 'gross_weight', 
      'stone_weight', 'net_weight', 'gold_purity', 'gold_rate', 'total_gold_price',
      'total_stone_cost', 'wastage_percentage', 'total_wastage', 'making_charges',
      'total_making_charges', 'total_cost_value', 'sale_price', 'certificate', 
      'status', 'notes'
    ];

    allowedFields.forEach(field => {
      if (req.body.hasOwnProperty(field)) {
        if (field === 'vendor_id' && (req.body[field] === '' || req.body[field] === null)) {
          updates[field] = null;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Handle stones separately in the jewelry_stones table
    if (stones !== undefined) {
      // Debug log to inspect incoming stones payload
      try {
        console.log('PUT /api/inventory/:id - incoming stones type:', typeof stones, 'value sample:', Array.isArray(stones) ? `array(len=${stones.length})` : (typeof stones === 'string' ? `string(len=${stones.length})` : JSON.stringify(stones).slice(0, 200)) );
      } catch (logErr) {
        console.log('Error logging stones payload:', logErr);
      }

      // Normalize stones to an array. Accept arrays, JSON strings, or single objects.
      let stonesArray = [];

      if (Array.isArray(stones)) {
        stonesArray = stones;
      } else if (typeof stones === 'string') {
        try {
          const parsed = JSON.parse(stones);
          stonesArray = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
        } catch (e) {
          // If parsing fails, treat as empty
          stonesArray = [];
        }
      } else if (stones && typeof stones === 'object') {
        // If it's an object with numeric keys or a single stone object, convert accordingly
        if (Array.isArray(Object.values(stones))) {
          const maybeArray = Object.values(stones);
          if (maybeArray.every(v => v && typeof v === 'object' && (v.stone_code || v.stoneCode || v.code || v.stone_name || v.name || v.weight))) {
            stonesArray = maybeArray;
          } else {
            stonesArray = [stones];
          }
        } else {
          stonesArray = [stones];
        }
      }

      // Delete existing stones for this jewelry piece
      await pool.query(
        `DELETE FROM jewelry_stones WHERE jewelry_id = $1`,
        [id]
      );

      // Insert new stones (if any)
      if (stonesArray.length > 0) {
        const stoneInsertPromises = stonesArray.map(stone => {
          // Support multiple possible field names coming from client
          const stoneCode = stone.stone_code || stone.stoneCode || stone.code || null;
          const stoneName = stone.stone_name || stone.stoneName || stone.name || null;
          const weight = stone.weight || stone.wt || 0;
          const costPrice = stone.cost_price || stone.costPrice || stone.cost || 0;
          const salePrice = stone.sale_price || stone.salePrice || stone.sale || stone.rate || 0;

          return pool.query(
            `INSERT INTO jewelry_stones (jewelry_id, stone_code, stone_name, weight, cost_price, sale_price)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, stoneCode, stoneName, weight, costPrice, salePrice]
          );
        });
        await Promise.all(stoneInsertPromises);
      }
    }

    // Remove stones from updates as it is handled separately
    delete updates.stones;

    // Also update gold_weight for backward compatibility
    if (net_weight !== undefined) {
      updates.gold_weight = net_weight;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    // Add updated_at timestamp
    updates.updated_at = new Date();

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];

    const query = `
      UPDATE jewelry_pieces 
      SET ${setClause}
      WHERE id = $1
      RETURNING id, code, description, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({
      message: 'Inventory item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Item code already exists' });
    }
    res.status(500).json({ error: 'Server error while updating inventory item' });
  }
});

// Delete inventory item
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM jewelry_pieces WHERE id = $1 RETURNING id, code, name',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ 
      message: 'Inventory item deleted successfully',
      deleted_item: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Server error while deleting inventory item' });
  }
});

// Get inventory statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN status = 'In Stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN status = 'Sold' THEN 1 END) as sold,
        COUNT(CASE WHEN status = 'Reserved' THEN 1 END) as reserved,
        COALESCE(SUM(CASE WHEN status = 'In Stock' THEN sale_price ELSE 0 END), 0) as total_value,
        COALESCE(AVG(CASE WHEN status = 'In Stock' THEN sale_price END), 0) as avg_price,
        COALESCE(SUM(gold_weight), 0) as total_gold_weight
      FROM jewelry_pieces
    `;
    
    const result = await pool.query(statsQuery);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    res.status(500).json({ error: 'Server error while fetching statistics' });
  }
});

module.exports = router;