const { jewelryService } = require('../services');

/**
 * Jewelry Controller - Handles HTTP requests for jewelry management
 */
class JewelryController {
  /**
   * Get all jewelry with optional filtering and pagination
   */
  async getAllJewelry(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        category_id,
        vendor_id,
        status,
        search,
        include_stones = true 
      } = req.query;

      const offset = (page - 1) * limit;
      
      if (search) {
        // Use search functionality
        const searchCriteria = {
          searchTerm: search,
          categoryId: category_id,
          vendorId: vendor_id,
          status
        };

        const jewelry = await jewelryService.search(searchCriteria, {
          limit: parseInt(limit),
          offset: parseInt(offset),
          includeStones: include_stones === 'true'
        });

        return res.json({
          success: true,
          data: jewelry,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: jewelry.length
          }
        });
      }

      // Regular filtering
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        where: {},
        includeStones: include_stones === 'true'
      };

      if (category_id) options.where.category_id = category_id;
      if (vendor_id) options.where.vendor_id = vendor_id;
      if (status) options.where.status = status;

      const jewelry = await jewelryService.getAllWithDetails(options);

      res.json({
        success: true,
        data: jewelry,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jewelry.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get jewelry by ID
   */
  async getJewelryById(req, res) {
    try {
      const { id } = req.params;
      const options = {
        where: { id: parseInt(id) },
        includeStones: true
      };

      const jewelry = await jewelryService.getAllWithDetails(options);

      if (!jewelry || jewelry.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Jewelry not found'
        });
      }

      res.json({
        success: true,
        data: jewelry[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create new jewelry piece
   */
  async createJewelry(req, res) {
    try {
      const { stones, ...jewelryData } = req.body;
      const context = {
        userId: req.user?.userId
      };

      const jewelry = await jewelryService.createWithStones(
        jewelryData, 
        stones || [], 
        context
      );

      res.status(201).json({
        success: true,
        data: jewelry,
        message: 'Jewelry created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update jewelry piece
   */
  async updateJewelry(req, res) {
    try {
      const { id } = req.params;
      const { stones, ...jewelryData } = req.body;
      const context = {
        userId: req.user?.userId
      };

      const jewelry = await jewelryService.updateWithStones(
        id, 
        jewelryData, 
        stones, 
        context
      );

      if (!jewelry) {
        return res.status(404).json({
          success: false,
          error: 'Jewelry not found'
        });
      }

      res.json({
        success: true,
        data: jewelry,
        message: 'Jewelry updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete jewelry piece
   */
  async deleteJewelry(req, res) {
    try {
      const { id } = req.params;
      const context = {
        userId: req.user?.userId
      };

      const result = await jewelryService.delete(id, context);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Jewelry not found'
        });
      }

      res.json({
        success: true,
        message: 'Jewelry deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update jewelry status
   */
  async updateJewelryStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const context = {
        userId: req.user?.userId
      };

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const jewelry = await jewelryService.updateStatus(id, status, context);

      if (!jewelry) {
        return res.status(404).json({
          success: false,
          error: 'Jewelry not found'
        });
      }

      res.json({
        success: true,
        data: jewelry,
        message: 'Jewelry status updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get jewelry by category
   */
  async getJewelryByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { 
        page = 1, 
        limit = 50,
        include_stones = true 
      } = req.query;

      const offset = (page - 1) * limit;
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeStones: include_stones === 'true'
      };

      const jewelry = await jewelryService.getByCategory(categoryId, options);

      res.json({
        success: true,
        data: jewelry,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jewelry.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get jewelry by vendor
   */
  async getJewelryByVendor(req, res) {
    try {
      const { vendorId } = req.params;
      const { 
        page = 1, 
        limit = 50,
        include_stones = true 
      } = req.query;

      const offset = (page - 1) * limit;
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeStones: include_stones === 'true'
      };

      const jewelry = await jewelryService.getByVendor(vendorId, options);

      res.json({
        success: true,
        data: jewelry,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jewelry.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get jewelry by status
   */
  async getJewelryByStatus(req, res) {
    try {
      const { status } = req.params;
      const { 
        page = 1, 
        limit = 50,
        include_stones = true 
      } = req.query;

      const offset = (page - 1) * limit;
      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        includeStones: include_stones === 'true'
      };

      const jewelry = await jewelryService.getByStatus(status, options);

      res.json({
        success: true,
        data: jewelry,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jewelry.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Search jewelry
   */
  async searchJewelry(req, res) {
    try {
      const { q: searchTerm } = req.query;
      const { 
        page = 1, 
        limit = 50,
        category_id,
        vendor_id,
        status,
        min_price,
        max_price,
        gold_purity,
        include_stones = true 
      } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: 'Search term is required'
        });
      }

      const searchCriteria = {
        searchTerm,
        categoryId: category_id,
        vendorId: vendor_id,
        status,
        minPrice: min_price,
        maxPrice: max_price,
        goldPurity: gold_purity,
        includeStones: include_stones === 'true'
      };

      const offset = (page - 1) * limit;
      const jewelry = await jewelryService.search(searchCriteria, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: jewelry,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: jewelry.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get jewelry statistics
   */
  async getJewelryStatistics(req, res) {
    try {
      const statistics = await jewelryService.getStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get inventory valuation
   */
  async getInventoryValuation(req, res) {
    try {
      const { 
        category_id,
        vendor_id,
        gold_purity 
      } = req.query;

      const filters = {
        where: {}
      };

      if (category_id) filters.where.category_id = category_id;
      if (vendor_id) filters.where.vendor_id = vendor_id;
      if (gold_purity) filters.where.gold_purity = gold_purity;

      const valuation = await jewelryService.getInventoryValuation(filters);

      res.json({
        success: true,
        data: valuation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Calculate jewelry pricing
   */
  calculatePricing(req, res) {
    try {
      const pricingData = req.body;
      const calculation = jewelryService.calculatePricing(pricingData);

      res.json({
        success: true,
        data: calculation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

const jewelryController = new JewelryController();

module.exports = {
  getAllJewelry: jewelryController.getAllJewelry.bind(jewelryController),
  getJewelryById: jewelryController.getJewelryById.bind(jewelryController),
  createJewelry: jewelryController.createJewelry.bind(jewelryController),
  updateJewelry: jewelryController.updateJewelry.bind(jewelryController),
  deleteJewelry: jewelryController.deleteJewelry.bind(jewelryController),
  updateJewelryStatus: jewelryController.updateJewelryStatus.bind(jewelryController),
  getJewelryByCategory: jewelryController.getJewelryByCategory.bind(jewelryController),
  getJewelryByVendor: jewelryController.getJewelryByVendor.bind(jewelryController),
  getJewelryByStatus: jewelryController.getJewelryByStatus.bind(jewelryController),
  searchJewelry: jewelryController.searchJewelry.bind(jewelryController),
  getJewelryStatistics: jewelryController.getJewelryStatistics.bind(jewelryController),
  getInventoryValuation: jewelryController.getInventoryValuation.bind(jewelryController),
  calculatePricing: jewelryController.calculatePricing.bind(jewelryController)
};