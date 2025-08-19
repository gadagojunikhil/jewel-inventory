const express = require('express');
const router = express.Router();
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorStats
} = require('../controllers/vendorController');
const { auth, adminAuth, managerAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Get all vendors
router.get('/', getAllVendors);

// Get vendor by ID
router.get('/:id', getVendorById);

// Get vendor statistics
router.get('/:id/stats', getVendorStats);

// Create new vendor
router.post('/', createVendor);

// Update vendor
router.put('/:id', updateVendor);

// Delete vendor (soft delete)
router.delete('/:id', deleteVendor);

module.exports = router;
