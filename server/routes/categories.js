const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // Validate token here if needed

    const result = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category
router.post('/', auth, [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, code, description } = req.body;
    
    const result = await pool.query(
      'INSERT INTO categories (name, code, description) VALUES ($1, $2, $3) RETURNING *',
      [name, code, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category code already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    const result = await pool.query(
      'UPDATE categories SET name = $1, code = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, code, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is in use
    const checkResult = await pool.query(
      'SELECT COUNT(*) FROM jewelry_pieces WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that is in use' 
      });
    }
    
    const result = await pool.query(
      'UPDATE categories SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;