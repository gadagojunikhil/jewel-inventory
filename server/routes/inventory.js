const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inventory ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add a new inventory item
router.post('/', async (req, res) => {
  const { name, code, category, material, quantity, price, description } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
  try {
    const result = await db.query(
      'INSERT INTO inventory (name, code, category, material, quantity, price, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, code, category, material, quantity, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, code, category, material, quantity, price, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE inventory SET name = $1, code = $2, category = $3, material = $4, quantity = $5, price = $6, description = $7 WHERE id = $8 RETURNING *',
      [name, code, category, material, quantity, price, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM inventory WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

module.exports = router;
