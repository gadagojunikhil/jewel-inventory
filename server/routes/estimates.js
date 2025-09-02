const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const EstimateController = require('../controllers/estimateController');

// Create controller instance
const estimateController = new EstimateController();

// Routes
router.get('/', auth, (req, res) => estimateController.getAllEstimates(req, res));
router.get('/statistics', auth, (req, res) => estimateController.getStatistics(req, res));
router.get('/search/customer', auth, (req, res) => estimateController.searchByCustomer(req, res));
router.get('/:id', auth, (req, res) => estimateController.getEstimateById(req, res));
router.post('/', auth, (req, res) => estimateController.createEstimate(req, res));
router.put('/:id', auth, (req, res) => estimateController.updateEstimate(req, res));
router.delete('/:id', auth, (req, res) => estimateController.deleteEstimate(req, res));
router.post('/:id/convert', auth, (req, res) => estimateController.convertEstimate(req, res));

module.exports = router;
