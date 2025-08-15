const express = require('express');
const router = express.Router();


const db = require('../config/database');

// Add a new material
router.post('/', async (req, res) => {
	const { name, description, wastageCharges, makingCharges } = req.body;
	if (!name) return res.status(400).json({ error: 'Name is required' });
	try {
		const result = await db.query(
			'INSERT INTO materials (name, description, wastage_charges, making_charges) VALUES ($1, $2, $3, $4) RETURNING *',
			[name, description || '', wastageCharges || 0, makingCharges || 0]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error('Error adding material:', err);
		res.status(500).json({ error: 'Failed to add material' });
	}
});

module.exports = router;