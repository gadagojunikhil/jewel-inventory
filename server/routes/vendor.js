const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vendors ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Add a new vendor
router.post('/', async (req, res) => {
  const { name, contact, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = await db.query(
      'INSERT INTO vendors (name, contact, email) VALUES ($1, $2, $3) RETURNING *',
      [name, contact, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding vendor:', err);
    res.status(500).json({ error: 'Failed to add vendor' });
  }
});

// Update a vendor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, contact, email } = req.body;
  try {
    const result = await db.query(
      'UPDATE vendors SET name = $1, contact = $2, email = $3 WHERE id = $4 RETURNING *',
      [name, contact, email, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Delete a vendor (optional)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM vendors WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;
