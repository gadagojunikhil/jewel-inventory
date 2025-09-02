const BaseModel = require('./BaseModel');

/**
 * Jewelry Model - Handles all jewelry-related database operations
 */
class JewelryModel extends BaseModel {
  constructor() {
    super('jewelry_pieces');
  }

  /**
   * Find jewelry by code
   * @param {String} code - Jewelry code
   * @returns {Promise<Object|null>} Jewelry record or null
   */
  async findByCode(code) {
    return this.findOne({ code });
  }

  /**
   * Find all jewelry with related data (category, vendor, stones)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry with related data
   */
  async findAllWithDetails(options = {}) {
    const {
      where = {},
      orderBy = { 'j.created_at': 'DESC' },
      limit,
      offset,
      includeStones = true
    } = options;

    let query = `
      SELECT 
        j.*,
        c.name as category_name,
        c.code as category_code,
        c.type as category_type,
        v.name as vendor_name,
        v.company as vendor_company,
        v.rating as vendor_rating
      FROM ${this.tableName} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN vendors v ON j.vendor_id = v.id
    `;

    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          whereConditions.push(`j.${key} IN (${placeholders})`);
          params.push(...value);
        } else if (typeof value === 'object' && value.operator) {
          whereConditions.push(`j.${key} ${value.operator} $${paramIndex++}`);
          params.push(value.value);
        } else {
          whereConditions.push(`j.${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    if (Object.keys(orderBy).length > 0) {
      const orderClauses = Object.entries(orderBy)
        .map(([column, direction]) => `${column} ${direction.toUpperCase()}`)
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
    const jewelry = result.rows;

    // Fetch stones for each jewelry piece if requested
    if (includeStones && jewelry.length > 0) {
      const jewelryIds = jewelry.map(item => item.id);
      const stonesResult = await this.query(
        `SELECT jewelry_id, stone_code, stone_name, weight, cost_price, sale_price 
         FROM jewelry_stones WHERE jewelry_id = ANY($1)`,
        [jewelryIds]
      );

      // Group stones by jewelry_id
      const stonesMap = {};
      stonesResult.rows.forEach(stone => {
        if (!stonesMap[stone.jewelry_id]) {
          stonesMap[stone.jewelry_id] = [];
        }
        stonesMap[stone.jewelry_id].push(stone);
      });

      // Add stones to jewelry pieces
      jewelry.forEach(piece => {
        piece.stones = stonesMap[piece.id] || [];
      });
    }

    return jewelry;
  }

  /**
   * Create jewelry with stones
   * @param {Object} jewelryData - Jewelry data
   * @param {Array} stones - Array of stone data
   * @returns {Promise<Object>} Created jewelry with stones
   */
  async createWithStones(jewelryData, stones = []) {
    const client = await this.beginTransaction();
    
    try {
      // Create jewelry piece
      const jewelryQuery = `
        INSERT INTO ${this.tableName} (
          code, name, description, category_id, vendor_id, 
          gross_weight, net_weight, gold_weight, gold_purity, 
          stone_weight, gold_rate, total_gold_price,
          total_stone_cost, wastage_percentage, total_wastage,
          making_charges, total_making_charges, total_cost_value,
          sale_price, certificate, status, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *
      `;

      const {
        code, name, description, category_id, vendor_id,
        gross_weight, net_weight, gold_weight, gold_purity,
        stone_weight, gold_rate, total_gold_price,
        total_stone_cost, wastage_percentage, total_wastage,
        making_charges, total_making_charges, total_cost_value,
        sale_price, certificate, status, notes, created_by
      } = jewelryData;

      const jewelryResult = await client.query(jewelryQuery, [
        code, name, description, category_id, vendor_id || null,
        gross_weight, net_weight, gold_weight || net_weight, gold_purity,
        stone_weight, gold_rate, total_gold_price,
        total_stone_cost, wastage_percentage, total_wastage,
        making_charges, total_making_charges, total_cost_value,
        sale_price, certificate, status || 'In Stock', notes, created_by
      ]);

      const jewelry = jewelryResult.rows[0];

      // Create stones if provided
      if (stones && stones.length > 0) {
        for (const stone of stones) {
          await client.query(
            `INSERT INTO jewelry_stones (jewelry_id, stone_code, stone_name, weight, cost_price, sale_price)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [jewelry.id, stone.stone_code, stone.stone_name, stone.weight, stone.cost_price, stone.sale_price]
          );
        }
      }

      await this.commitTransaction(client);

      // Fetch the complete jewelry with stones
      const completeJewelry = await this.findAllWithDetails({
        where: { id: jewelry.id }
      });

      return completeJewelry[0];
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    }
  }

  /**
   * Update jewelry with stones
   * @param {Number} id - Jewelry ID
   * @param {Object} jewelryData - Updated jewelry data
   * @param {Array} stones - Updated stones data
   * @returns {Promise<Object>} Updated jewelry with stones
   */
  async updateWithStones(id, jewelryData, stones = null) {
    const client = await this.beginTransaction();
    
    try {
      // Update jewelry piece
      const updateQuery = `
        UPDATE ${this.tableName}
        SET 
          name = $2, description = $3, category_id = $4, vendor_id = $5,
          gross_weight = $6, net_weight = $7, gold_weight = $8, gold_purity = $9,
          stone_weight = $10, gold_rate = $11, total_gold_price = $12,
          total_stone_cost = $13, wastage_percentage = $14, total_wastage = $15,
          making_charges = $16, total_making_charges = $17, total_cost_value = $18,
          sale_price = $19, certificate = $20, status = $21, notes = $22,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const {
        name, description, category_id, vendor_id,
        gross_weight, net_weight, gold_weight, gold_purity,
        stone_weight, gold_rate, total_gold_price,
        total_stone_cost, wastage_percentage, total_wastage,
        making_charges, total_making_charges, total_cost_value,
        sale_price, certificate, status, notes
      } = jewelryData;

      const jewelryResult = await client.query(updateQuery, [
        id, name, description, category_id, vendor_id || null,
        gross_weight, net_weight, gold_weight || net_weight, gold_purity,
        stone_weight, gold_rate, total_gold_price,
        total_stone_cost, wastage_percentage, total_wastage,
        making_charges, total_making_charges, total_cost_value,
        sale_price, certificate, status, notes
      ]);

      if (!jewelryResult.rows[0]) {
        throw new Error('Jewelry piece not found');
      }

      // Update stones if provided
      if (stones !== null) {
        // Delete existing stones
        await client.query('DELETE FROM jewelry_stones WHERE jewelry_id = $1', [id]);

        // Insert new stones
        if (stones.length > 0) {
          for (const stone of stones) {
            await client.query(
              `INSERT INTO jewelry_stones (jewelry_id, stone_code, stone_name, weight, cost_price, sale_price)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [id, stone.stone_code, stone.stone_name, stone.weight, stone.cost_price, stone.sale_price]
            );
          }
        }
      }

      await this.commitTransaction(client);

      // Fetch the complete updated jewelry with stones
      const completeJewelry = await this.findAllWithDetails({
        where: { id: id }
      });

      return completeJewelry[0];
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    }
  }

  /**
   * Find jewelry by status
   * @param {String} status - Jewelry status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry with specified status
   */
  async findByStatus(status, options = {}) {
    return this.findAllWithDetails({
      where: { status, ...options.where },
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Find jewelry by category
   * @param {Number} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry in category
   */
  async findByCategory(categoryId, options = {}) {
    return this.findAllWithDetails({
      where: { category_id: categoryId, ...options.where },
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Find jewelry by vendor
   * @param {Number} vendorId - Vendor ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of jewelry from vendor
   */
  async findByVendor(vendorId, options = {}) {
    return this.findAllWithDetails({
      where: { vendor_id: vendorId, ...options.where },
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Search jewelry by multiple criteria
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching jewelry
   */
  async search(searchCriteria = {}, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const {
      searchTerm,
      categoryId,
      vendorId,
      status,
      minPrice,
      maxPrice,
      goldPurity,
      includeStones = true
    } = searchCriteria;

    let query = `
      SELECT 
        j.*,
        c.name as category_name,
        c.code as category_code,
        v.name as vendor_name,
        v.company as vendor_company
      FROM ${this.tableName} j
      LEFT JOIN categories c ON j.category_id = c.id
      LEFT JOIN vendors v ON j.vendor_id = v.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Text search
    if (searchTerm) {
      query += ` AND (
        j.name ILIKE $${paramIndex} OR 
        j.code ILIKE $${paramIndex} OR 
        j.description ILIKE $${paramIndex} OR
        c.name ILIKE $${paramIndex} OR
        v.name ILIKE $${paramIndex}
      )`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Category filter
    if (categoryId) {
      query += ` AND j.category_id = $${paramIndex++}`;
      params.push(categoryId);
    }

    // Vendor filter
    if (vendorId) {
      query += ` AND j.vendor_id = $${paramIndex++}`;
      params.push(vendorId);
    }

    // Status filter
    if (status) {
      query += ` AND j.status = $${paramIndex++}`;
      params.push(status);
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== null) {
      query += ` AND j.sale_price >= $${paramIndex++}`;
      params.push(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      query += ` AND j.sale_price <= $${paramIndex++}`;
      params.push(maxPrice);
    }

    // Gold purity filter
    if (goldPurity) {
      query += ` AND j.gold_purity = $${paramIndex++}`;
      params.push(goldPurity);
    }

    query += ` ORDER BY j.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await this.query(query, params);
    const jewelry = result.rows;

    // Fetch stones if requested
    if (includeStones && jewelry.length > 0) {
      const jewelryIds = jewelry.map(item => item.id);
      const stonesResult = await this.query(
        `SELECT jewelry_id, stone_code, stone_name, weight, cost_price, sale_price 
         FROM jewelry_stones WHERE jewelry_id = ANY($1)`,
        [jewelryIds]
      );

      const stonesMap = {};
      stonesResult.rows.forEach(stone => {
        if (!stonesMap[stone.jewelry_id]) {
          stonesMap[stone.jewelry_id] = [];
        }
        stonesMap[stone.jewelry_id].push(stone);
      });

      jewelry.forEach(piece => {
        piece.stones = stonesMap[piece.id] || [];
      });
    }

    return jewelry;
  }

  /**
   * Get jewelry statistics
   * @returns {Promise<Object>} Jewelry statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_pieces,
        COUNT(CASE WHEN status = 'In Stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN status = 'Sold' THEN 1 END) as sold,
        COUNT(CASE WHEN status = 'Reserved' THEN 1 END) as reserved,
        COALESCE(SUM(total_cost_value), 0) as total_cost_value,
        COALESCE(SUM(sale_price), 0) as total_sale_value,
        COALESCE(AVG(sale_price), 0) as avg_sale_price,
        COALESCE(MIN(sale_price), 0) as min_sale_price,
        COALESCE(MAX(sale_price), 0) as max_sale_price,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days,
        COUNT(DISTINCT category_id) as unique_categories,
        COUNT(DISTINCT vendor_id) as unique_vendors
      FROM ${this.tableName}
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
        c.name as category_name,
        c.code as category_code,
        COUNT(j.id) as jewelry_count,
        COUNT(CASE WHEN j.status = 'In Stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN j.status = 'Sold' THEN 1 END) as sold,
        COALESCE(SUM(j.total_cost_value), 0) as total_cost_value,
        COALESCE(SUM(j.sale_price), 0) as total_sale_value,
        COALESCE(AVG(j.sale_price), 0) as avg_sale_price
      FROM categories c
      LEFT JOIN ${this.tableName} j ON c.id = j.category_id
      WHERE c.is_active = true
      GROUP BY c.id, c.name, c.code
      ORDER BY jewelry_count DESC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Get vendor-wise statistics
   * @returns {Promise<Array>} Array of vendor statistics
   */
  async getVendorStatistics() {
    const query = `
      SELECT 
        v.name as vendor_name,
        v.company as vendor_company,
        COUNT(j.id) as jewelry_count,
        COUNT(CASE WHEN j.status = 'In Stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN j.status = 'Sold' THEN 1 END) as sold,
        COALESCE(SUM(j.total_cost_value), 0) as total_cost_value,
        COALESCE(SUM(j.sale_price), 0) as total_sale_value,
        COALESCE(AVG(j.sale_price), 0) as avg_sale_price
      FROM vendors v
      LEFT JOIN ${this.tableName} j ON v.id = j.vendor_id
      WHERE v.is_active = true
      GROUP BY v.id, v.name, v.company
      ORDER BY jewelry_count DESC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Check if jewelry code is available
   * @param {String} code - Jewelry code
   * @param {Number} excludeId - Jewelry ID to exclude from check (for updates)
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
   * Update jewelry status
   * @param {Number} id - Jewelry ID
   * @param {String} status - New status
   * @returns {Promise<Object|null>} Updated jewelry
   */
  async updateStatus(id, status) {
    const validStatuses = ['In Stock', 'Sold', 'Reserved', 'Damaged', 'Lost'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return this.update(id, { status });
  }

  /**
   * Get jewelry stones
   * @param {Number} jewelryId - Jewelry ID
   * @returns {Promise<Array>} Array of stones
   */
  async getStones(jewelryId) {
    const query = `
      SELECT * FROM jewelry_stones 
      WHERE jewelry_id = $1 
      ORDER BY stone_code ASC
    `;
    const result = await this.query(query, [jewelryId]);
    return result.rows;
  }

  /**
   * Delete jewelry with stones
   * @param {Number} id - Jewelry ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const client = await this.beginTransaction();
    
    try {
      // Delete stones first (due to foreign key constraint)
      await client.query('DELETE FROM jewelry_stones WHERE jewelry_id = $1', [id]);
      
      // Delete jewelry piece
      const result = await client.query('DELETE FROM jewelry_pieces WHERE id = $1', [id]);
      
      await this.commitTransaction(client);
      return result.rowCount > 0;
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    }
  }
}

module.exports = JewelryModel;
