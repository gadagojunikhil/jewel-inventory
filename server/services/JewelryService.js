const BaseService = require('./BaseService');
const { jewelryModel } = require('../models');

/**
 * Jewelry Service - Handles jewelry-related business logic
 */
class JewelryService extends BaseService {
  constructor() {
    super(jewelryModel);
  }

  /**
   * Create jewelry with stones and validation
   * @param {Object} jewelryData - Jewelry data
   * @param {Array} stones - Stone data array
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Created jewelry with stones
   */
  async createWithStones(jewelryData, stones = [], context = {}) {
    return this.executeOperation('create_jewelry_with_stones', async () => {
      // Validate jewelry data
      const validatedData = this.validateJewelryData(jewelryData, 'create');

      // Validate stones data
      const validatedStones = this.validateStonesData(stones);

      // Check if code is available
      if (validatedData.code) {
        const isCodeAvailable = await this.model.isCodeAvailable(validatedData.code);
        if (!isCodeAvailable) {
          throw new Error('Jewelry code is already taken');
        }
      } else {
        // Generate code if not provided
        validatedData.code = await this.generateJewelryCode(validatedData);
      }

      // Add audit fields
      if (context.userId) {
        validatedData.created_by = context.userId;
      }

      return await this.model.createWithStones(validatedData, validatedStones);
    }, context);
  }

  /**
   * Update jewelry with stones
   * @param {Number} id - Jewelry ID
   * @param {Object} jewelryData - Updated jewelry data
   * @param {Array} stones - Updated stones data (null to keep existing)
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Updated jewelry with stones
   */
  async updateWithStones(id, jewelryData, stones = null, context = {}) {
    return this.executeOperation('update_jewelry_with_stones', async () => {
      // Validate jewelry data
      const validatedData = this.validateJewelryData(jewelryData, 'update');

      // Validate stones data if provided
      let validatedStones = null;
      if (stones !== null) {
        validatedStones = this.validateStonesData(stones);
      }

      // Check if code is available (excluding current jewelry)
      if (validatedData.code) {
        const isCodeAvailable = await this.model.isCodeAvailable(validatedData.code, id);
        if (!isCodeAvailable) {
          throw new Error('Jewelry code is already taken');
        }
      }

      return await this.model.updateWithStones(id, validatedData, validatedStones);
    }, context);
  }

  /**
   * Get all jewelry with detailed information
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry with details
   */
  async getAllWithDetails(options = {}) {
    return this.executeOperation('get_all_jewelry_with_details', async () => {
      return await this.model.findAllWithDetails(options);
    });
  }

  /**
   * Search jewelry with multiple criteria
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching jewelry
   */
  async search(searchCriteria = {}, options = {}) {
    return this.executeOperation('search_jewelry', async () => {
      return await this.model.search(searchCriteria, options);
    });
  }

  /**
   * Get jewelry by status
   * @param {String} status - Jewelry status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry with specified status
   */
  async getByStatus(status, options = {}) {
    return this.executeOperation('get_jewelry_by_status', async () => {
      const validStatuses = ['In Stock', 'Sold', 'Reserved', 'Damaged', 'Lost'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      return await this.model.findByStatus(status, options);
    });
  }

  /**
   * Get jewelry by category
   * @param {Number} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry in category
   */
  async getByCategory(categoryId, options = {}) {
    return this.executeOperation('get_jewelry_by_category', async () => {
      if (!categoryId || isNaN(categoryId)) {
        throw new Error('Invalid category ID');
      }

      return await this.model.findByCategory(categoryId, options);
    });
  }

  /**
   * Get jewelry by vendor
   * @param {Number} vendorId - Vendor ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry from vendor
   */
  async getByVendor(vendorId, options = {}) {
    return this.executeOperation('get_jewelry_by_vendor', async () => {
      if (!vendorId || isNaN(vendorId)) {
        throw new Error('Invalid vendor ID');
      }

      return await this.model.findByVendor(vendorId, options);
    });
  }

  /**
   * Update jewelry status
   * @param {Number} id - Jewelry ID
   * @param {String} status - New status
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Updated jewelry
   */
  async updateStatus(id, status, context = {}) {
    return this.executeOperation('update_jewelry_status', async () => {
      const validStatuses = ['In Stock', 'Sold', 'Reserved', 'Damaged', 'Lost'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      return await this.model.updateStatus(id, status);
    }, context);
  }

  /**
   * Get jewelry statistics
   * @returns {Promise<Object>} Jewelry statistics
   */
  async getStatistics() {
    return this.executeOperation('get_jewelry_statistics', async () => {
      const basicStats = await this.model.getStatistics();
      const categoryStats = await this.model.getCategoryStatistics();
      const vendorStats = await this.model.getVendorStatistics();

      return {
        ...basicStats,
        by_category: categoryStats,
        by_vendor: vendorStats
      };
    });
  }

  /**
   * Get inventory valuation
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Inventory valuation
   */
  async getInventoryValuation(filters = {}) {
    return this.executeOperation('get_inventory_valuation', async () => {
      const options = {
        where: { status: 'In Stock', ...filters.where },
        includeStones: true
      };

      const inventory = await this.model.findAllWithDetails(options);

      const valuation = {
        total_pieces: inventory.length,
        total_cost_value: 0,
        total_sale_value: 0,
        total_potential_profit: 0,
        by_category: {},
        by_vendor: {},
        by_gold_purity: {}
      };

      inventory.forEach(piece => {
        const costValue = parseFloat(piece.total_cost_value) || 0;
        const saleValue = parseFloat(piece.sale_price) || 0;
        const profit = saleValue - costValue;

        valuation.total_cost_value += costValue;
        valuation.total_sale_value += saleValue;
        valuation.total_potential_profit += profit;

        // Group by category
        const categoryKey = piece.category_name || 'Unknown';
        if (!valuation.by_category[categoryKey]) {
          valuation.by_category[categoryKey] = { count: 0, cost_value: 0, sale_value: 0 };
        }
        valuation.by_category[categoryKey].count++;
        valuation.by_category[categoryKey].cost_value += costValue;
        valuation.by_category[categoryKey].sale_value += saleValue;

        // Group by vendor
        const vendorKey = piece.vendor_name || 'Unknown';
        if (!valuation.by_vendor[vendorKey]) {
          valuation.by_vendor[vendorKey] = { count: 0, cost_value: 0, sale_value: 0 };
        }
        valuation.by_vendor[vendorKey].count++;
        valuation.by_vendor[vendorKey].cost_value += costValue;
        valuation.by_vendor[vendorKey].sale_value += saleValue;

        // Group by gold purity
        const purityKey = `${piece.gold_purity}K` || 'Unknown';
        if (!valuation.by_gold_purity[purityKey]) {
          valuation.by_gold_purity[purityKey] = { count: 0, cost_value: 0, sale_value: 0 };
        }
        valuation.by_gold_purity[purityKey].count++;
        valuation.by_gold_purity[purityKey].cost_value += costValue;
        valuation.by_gold_purity[purityKey].sale_value += saleValue;
      });

      return valuation;
    });
  }

  /**
   * Generate jewelry code
   * @param {Object} jewelryData - Jewelry data
   * @returns {Promise<String>} Generated code
   */
  async generateJewelryCode(jewelryData) {
    // Simple code generation logic - can be enhanced
    const prefix = jewelryData.category_code || 'JWL';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    let code = `${prefix}-${timestamp}-${random}`;
    
    // Ensure uniqueness
    let isUnique = await this.model.isCodeAvailable(code);
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      code = `${prefix}-${timestamp}-${newRandom}`;
      isUnique = await this.model.isCodeAvailable(code);
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error('Failed to generate unique jewelry code');
    }
    
    return code;
  }

  /**
   * Validate jewelry data
   * @param {Object} jewelryData - Jewelry data to validate
   * @param {String} operation - Operation type (create, update)
   * @returns {Object} Validated jewelry data
   */
  validateJewelryData(jewelryData, operation = 'create') {
    const validatedData = this.validateData(jewelryData, operation);

    // Required fields for creation
    if (operation === 'create') {
      if (!validatedData.name) {
        throw new Error('Jewelry name is required');
      }
      if (!validatedData.sale_price || validatedData.sale_price <= 0) {
        throw new Error('Sale price is required and must be greater than 0');
      }
    }

    // Validate numeric fields
    const numericFields = [
      'gross_weight', 'net_weight', 'gold_weight', 'stone_weight',
      'gold_rate', 'total_gold_price', 'total_stone_cost',
      'wastage_percentage', 'total_wastage', 'making_charges',
      'total_making_charges', 'total_cost_value', 'sale_price'
    ];

    numericFields.forEach(field => {
      if (validatedData[field] !== undefined && validatedData[field] !== null) {
        const value = parseFloat(validatedData[field]);
        if (isNaN(value) || value < 0) {
          throw new Error(`${field} must be a valid positive number`);
        }
        validatedData[field] = value;
      }
    });

    // Validate gold purity
    if (validatedData.gold_purity !== undefined) {
      const validPurities = [14, 18, 22, 24];
      if (!validPurities.includes(parseInt(validatedData.gold_purity))) {
        throw new Error(`Gold purity must be one of: ${validPurities.join(', ')}`);
      }
    }

    // Validate status
    if (validatedData.status) {
      const validStatuses = ['In Stock', 'Sold', 'Reserved', 'Damaged', 'Lost'];
      if (!validStatuses.includes(validatedData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Sanitize string fields
    ['name', 'description', 'notes'].forEach(field => {
      if (validatedData[field]) {
        validatedData[field] = validatedData[field].trim();
      }
    });

    return validatedData;
  }

  /**
   * Validate stones data
   * @param {Array} stones - Stones data array
   * @returns {Array} Validated stones data
   */
  validateStonesData(stones) {
    if (!Array.isArray(stones)) {
      throw new Error('Stones must be an array');
    }

    return stones.map((stone, index) => {
      if (!stone.stone_code) {
        throw new Error(`Stone ${index + 1}: Stone code is required`);
      }

      const validatedStone = { ...stone };

      // Validate numeric fields
      ['weight', 'cost_price', 'sale_price'].forEach(field => {
        if (validatedStone[field] !== undefined && validatedStone[field] !== null) {
          const value = parseFloat(validatedStone[field]);
          if (isNaN(value) || value < 0) {
            throw new Error(`Stone ${index + 1}: ${field} must be a valid positive number`);
          }
          validatedStone[field] = value;
        }
      });

      // Sanitize string fields
      ['stone_code', 'stone_name'].forEach(field => {
        if (validatedStone[field]) {
          validatedStone[field] = validatedStone[field].trim();
        }
      });

      return validatedStone;
    });
  }

  /**
   * Calculate jewelry pricing
   * @param {Object} pricingData - Pricing calculation data
   * @returns {Object} Calculated pricing breakdown
   */
  calculatePricing(pricingData) {
    const {
      grossWeight = 0,
      stoneWeight = 0,
      goldPurity = 18,
      goldRate = 0,
      wastagePercentage = 0,
      makingChargePerGram = 0,
      stonePrice = 0
    } = pricingData;

    const netWeight = grossWeight - stoneWeight;
    const fineWeight = (netWeight * goldPurity) / 24;
    
    const goldValue = fineWeight * goldRate;
    const wastageAmount = (netWeight * wastagePercentage / 100) * goldRate;
    const makingAmount = netWeight * makingChargePerGram;
    
    const totalGoldAmount = goldValue + wastageAmount;
    const totalMakingCharges = makingAmount;
    const totalStoneAmount = stonePrice;
    
    const subtotal = totalGoldAmount + totalMakingCharges + totalStoneAmount;

    return {
      grossWeight,
      netWeight,
      fineWeight,
      stoneWeight,
      goldValue,
      wastageAmount,
      totalGoldAmount,
      makingAmount,
      totalMakingCharges,
      totalStoneAmount,
      subtotal,
      calculations: {
        goldPurity,
        goldRate,
        wastagePercentage,
        makingChargePerGram
      }
    };
  }
}

module.exports = JewelryService;
