const { EstimateService } = require('../services');

class EstimateController {
  constructor() {
    this.estimateService = new EstimateService();
  }

  // Get all estimates with optional filters
  async getAllEstimates(req, res) {
    try {
      const result = await this.estimateService.findAll(req.query);
      
      res.status(200).json({
        success: true,
        estimates: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('EstimateController.getAllEstimates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch estimates',
        error: error.message
      });
    }
  }

  // Get single estimate by ID
  async getEstimateById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.estimateService.findById(id);
      
      res.status(200).json({
        success: true,
        estimate: result.data
      });
    } catch (error) {
      console.error('EstimateController.getEstimateById error:', error);
      
      if (error.message === 'Estimate not found') {
        return res.status(404).json({
          success: false,
          message: 'Estimate not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch estimate',
        error: error.message
      });
    }
  }

  // Create new estimate
  async createEstimate(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const result = await this.estimateService.create(req.body, userId);
      
      res.status(201).json({
        success: true,
        message: result.message,
        estimate: result.data
      });
    } catch (error) {
      console.error('EstimateController.createEstimate error:', error);
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create estimate',
        error: error.message
      });
    }
  }

  // Update estimate
  async updateEstimate(req, res) {
    try {
      const { id } = req.params;
      const result = await this.estimateService.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: result.message,
        estimate: result.data
      });
    } catch (error) {
      console.error('EstimateController.updateEstimate error:', error);
      
      if (error.message === 'Estimate not found') {
        return res.status(404).json({
          success: false,
          message: 'Estimate not found'
        });
      }
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update estimate',
        error: error.message
      });
    }
  }

  // Delete estimate
  async deleteEstimate(req, res) {
    try {
      const { id } = req.params;
      const result = await this.estimateService.delete(id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('EstimateController.deleteEstimate error:', error);
      
      if (error.message === 'Estimate not found') {
        return res.status(404).json({
          success: false,
          message: 'Estimate not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete estimate',
        error: error.message
      });
    }
  }

  // Convert estimate to sale
  async convertEstimate(req, res) {
    try {
      const { id } = req.params;
      const result = await this.estimateService.convertToSale(id);
      
      res.status(200).json({
        success: true,
        message: result.message,
        estimate: result.data
      });
    } catch (error) {
      console.error('EstimateController.convertEstimate error:', error);
      
      if (error.message === 'Estimate not found') {
        return res.status(404).json({
          success: false,
          message: 'Estimate not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to convert estimate',
        error: error.message
      });
    }
  }

  // Search estimates by customer
  async searchByCustomer(req, res) {
    try {
      const { q } = req.query;
      const result = await this.estimateService.searchByCustomer(q);
      
      res.status(200).json({
        success: true,
        estimates: result.data
      });
    } catch (error) {
      console.error('EstimateController.searchByCustomer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search estimates',
        error: error.message
      });
    }
  }

  // Get estimate statistics
  async getStatistics(req, res) {
    try {
      const result = await this.estimateService.getStatistics(req.query);
      
      res.status(200).json({
        success: true,
        statistics: result.data
      });
    } catch (error) {
      console.error('EstimateController.getStatistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get estimate statistics',
        error: error.message
      });
    }
  }
}

module.exports = EstimateController;
