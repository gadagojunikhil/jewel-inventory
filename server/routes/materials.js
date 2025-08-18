const express = require('express');
const router = express.Router();
const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialsByCategory
} = require('../controllers/materialController');

// GET /api/materials - Get all materials
router.get('/', getAllMaterials);

// GET /api/materials/category/:category - Get materials by category
router.get('/category/:category', getMaterialsByCategory);

// GET /api/materials/:id - Get material by ID
router.get('/:id', getMaterialById);

// POST /api/materials - Create new material
router.post('/', createMaterial);

// PUT /api/materials/:id - Update material
router.put('/:id', updateMaterial);

// DELETE /api/materials/:id - Delete material (soft delete)
router.delete('/:id', deleteMaterial);

module.exports = router;