const BaseModel = require('./BaseModel');

/**
 * Material Model - Handles all material-related database operations
 */
class MaterialModel extends BaseModel {
  constructor() {
    super('materials');
  }

  /**
   * Find material by code
   * @param {String} code - Material code
   * @returns {Promise<Object|null>} Material record or null
   */
  async findByCode(code) {
    return this.findOne({ code });
  }

  /**
   * Find materials by category
   * @param {String} category - Material category
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of materials in category
   */
  async findByCategory(category, options = {}) {
    return this.findAll({
      where: { category, is_active: true, ...options.where },
      orderBy: { name: 'ASC', ...options.orderBy }
    });
  }

  /**
   * Get all unique categories
   * @returns {Promise<Array>} Array of unique category names
   */
  async getCategories() {
    const query = `
      SELECT DISTINCT category 
      FROM ${this.tableName} 
      WHERE is_active = true 
      ORDER BY category ASC
    `;
    const result = await this.query(query);
    return result.rows.map(row => row.category);
  }

  /**
   * Find materials with stock and pricing info
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of materials with enhanced info
   */
  async findAllWithDetails(options = {}) {
    const {
      where = { is_active: true },
      orderBy = { category: 'ASC', name: 'ASC' },
      limit,
      offset
    } = options;

    let query = `
      SELECT 
        m.*,
        CASE 
          WHEN m.stock_quantity <= 0 THEN 'Out of Stock'
          WHEN m.stock_quantity <= 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status,
        ROUND((m.sale_price - m.cost_price) / m.cost_price * 100, 2) as profit_margin_percent,
        (m.sale_price - m.cost_price) as profit_per_unit,
        (m.sale_price - m.cost_price) * m.stock_quantity as total_profit_potential
      FROM ${this.tableName} m
    `;

    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        if (key.includes('.')) {
          whereConditions.push(`${key} = $${paramIndex++}`);
        } else {
          whereConditions.push(`m.${key} = $${paramIndex++}`);
        }
        params.push(value);
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    if (Object.keys(orderBy).length > 0) {
      const orderClauses = Object.entries(orderBy)
        .map(([column, direction]) => {
          const col = column.includes('.') ? column : `m.${column}`;
          return `${col} ${direction.toUpperCase()}`;
        })
        .join(', ');
      query += ` ORDER BY ${orderClauses}`;
    }

    // Add LIMIT and OFFSET
    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Get materials by stock status
   * @param {String} status - Stock status ('in_stock', 'low_stock', 'out_of_stock')
   * @returns {Promise<Array>} Array of materials with specified stock status
   */
  async findByStockStatus(status) {
    let condition = '';
    switch (status) {
      case 'out_of_stock':
        condition = 'stock_quantity <= 0';
        break;
      case 'low_stock':
        condition = 'stock_quantity > 0 AND stock_quantity <= 10';
        break;
      case 'in_stock':
        condition = 'stock_quantity > 10';
        break;
      default:
        throw new Error('Invalid stock status');
    }

    const query = `
      SELECT *, 
        CASE 
          WHEN stock_quantity <= 0 THEN 'Out of Stock'
          WHEN stock_quantity <= 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM ${this.tableName} 
      WHERE is_active = true AND ${condition}
      ORDER BY category ASC, name ASC
    `;

    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Update material stock quantity
   * @param {Number} id - Material ID
   * @param {Number} quantity - New quantity
   * @param {String} operation - Operation type ('set', 'add', 'subtract')
   * @returns {Promise<Object|null>} Updated material
   */
  async updateStock(id, quantity, operation = 'set') {
    const material = await this.findById(id);
    if (!material) {
      throw new Error('Material not found');
    }

    let newQuantity;
    switch (operation) {
      case 'set':
        newQuantity = quantity;
        break;
      case 'add':
        newQuantity = material.stock_quantity + quantity;
        break;
      case 'subtract':
        newQuantity = material.stock_quantity - quantity;
        break;
      default:
        throw new Error('Invalid operation. Use "set", "add", or "subtract"');
    }

    if (newQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    return this.update(id, { stock_quantity: newQuantity });
  }

  /**
   * Get material statistics
   * @returns {Promise<Object>} Material statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_materials,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_materials,
        COUNT(DISTINCT category) as total_categories,
        COUNT(CASE WHEN stock_quantity <= 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock_quantity > 10 THEN 1 END) as in_stock,
        ROUND(AVG(cost_price), 2) as avg_cost_price,
        ROUND(AVG(sale_price), 2) as avg_sale_price,
        ROUND(AVG((sale_price - cost_price) / cost_price * 100), 2) as avg_profit_margin,
        SUM(stock_quantity * cost_price) as total_inventory_value,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days
      FROM ${this.tableName}
      WHERE is_active = true
    `;
    
    const result = await this.query(query);
    return result.rows[0];
  }

  /**
   * Get category-wise statistics
   * @returns {Promise<Array>} Array of category statistics
   */
  async getCategoryStatistics() {
    const query = `
      SELECT 
        category,
        COUNT(*) as material_count,
        COUNT(CASE WHEN stock_quantity <= 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 10 THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock_quantity > 10 THEN 1 END) as in_stock,
        ROUND(AVG(cost_price), 2) as avg_cost_price,
        ROUND(AVG(sale_price), 2) as avg_sale_price,
        SUM(stock_quantity * cost_price) as category_inventory_value
      FROM ${this.tableName}
      WHERE is_active = true
      GROUP BY category
      ORDER BY category ASC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Search materials by name, code, or category
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching materials
   */
  async search(searchTerm, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      includeInactive = false,
      category = null 
    } = options;
    
    let query = `
      SELECT 
        *,
        CASE 
          WHEN stock_quantity <= 0 THEN 'Out of Stock'
          WHEN stock_quantity <= 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM ${this.tableName}
      WHERE 
        (name ILIKE $1 OR 
         code ILIKE $1 OR 
         category ILIKE $1)
    `;

    const params = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (!includeInactive) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(true);
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    query += ` ORDER BY category ASC, name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Check if material code is available
   * @param {String} code - Material code
   * @param {Number} excludeId - Material ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isCodeAvailable(code, excludeId = null) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE code = $1`;
    const params = [code];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Get materials used in jewelry pieces
   * @param {Number} materialId - Material ID
   * @returns {Promise<Array>} Array of jewelry pieces using this material
   */
  async getJewelryUsage(materialId) {
    const query = `
      SELECT 
        j.id, j.code, j.name,
        jm.quantity, jm.cost_per_unit, jm.total_cost
      FROM jewelry_materials jm
      JOIN jewelry_pieces j ON jm.jewelry_id = j.id
      WHERE jm.material_id = $1
      ORDER BY j.name ASC
    `;
    
    const result = await this.query(query, [materialId]);
    return result.rows;
  }

  /**
   * Update material pricing in bulk
   * @param {Array} updates - Array of {id, cost_price, sale_price} objects
   * @returns {Promise<Array>} Array of updated materials
   */
  async bulkUpdatePricing(updates) {
    const client = await this.beginTransaction();
    
    try {
      const results = [];
      
      for (const update of updates) {
        const { id, cost_price, sale_price } = update;
        
        const query = `
          UPDATE ${this.tableName}
          SET 
            cost_price = $2,
            sale_price = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await client.query(query, [id, cost_price, sale_price]);
        if (result.rows[0]) {
          results.push(result.rows[0]);
        }
      }
      
      await this.commitTransaction(client);
      return results;
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   * @param {Number} threshold - Stock threshold (default: 10)
   * @returns {Promise<Array>} Array of materials with low stock
   */
  async getLowStockAlerts(threshold = 10) {
    const query = `
      SELECT 
        *,
        'Low Stock' as alert_type,
        CASE 
          WHEN stock_quantity <= 0 THEN 'Critical'
          WHEN stock_quantity <= ${threshold / 2} THEN 'High'
          ELSE 'Medium'
        END as alert_priority
      FROM ${this.tableName}
      WHERE is_active = true AND stock_quantity <= $1
      ORDER BY stock_quantity ASC, name ASC
    `;
    
    const result = await this.query(query, [threshold]);
    return result.rows;
  }
}

module.exports = MaterialModel;
