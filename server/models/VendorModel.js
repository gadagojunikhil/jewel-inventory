const BaseModel = require('./BaseModel');

/**
 * Vendor Model - Handles all vendor-related database operations
 */
class VendorModel extends BaseModel {
  constructor() {
    super('vendors');
  }

  /**
   * Find vendor by email
   * @param {String} email - Vendor email
   * @returns {Promise<Object|null>} Vendor record or null
   */
  async findByEmail(email) {
    return this.findOne({ email });
  }

  /**
   * Find vendor by GST number
   * @param {String} gstNumber - GST number
   * @returns {Promise<Object|null>} Vendor record or null
   */
  async findByGSTNumber(gstNumber) {
    return this.findOne({ gst_number: gstNumber });
  }

  /**
   * Find vendors by location
   * @param {Object} location - Location filter
   * @param {String} location.city - City name
   * @param {String} location.state - State name
   * @param {String} location.country - Country name
   * @returns {Promise<Array>} Array of vendors in location
   */
  async findByLocation(location = {}) {
    const where = { is_active: true };
    
    if (location.city) where.city = location.city;
    if (location.state) where.state = location.state;
    if (location.country) where.country = location.country;

    return this.findAll({
      where,
      orderBy: { name: 'ASC' }
    });
  }

  /**
   * Find vendors by rating range
   * @param {Number} minRating - Minimum rating (0-5)
   * @param {Number} maxRating - Maximum rating (0-5)
   * @returns {Promise<Array>} Array of vendors in rating range
   */
  async findByRating(minRating = 0, maxRating = 5) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE is_active = true 
        AND rating >= $1 
        AND rating <= $2
      ORDER BY rating DESC, name ASC
    `;
    
    const result = await this.query(query, [minRating, maxRating]);
    return result.rows;
  }

  /**
   * Get vendors with jewelry count and statistics
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of vendors with statistics
   */
  async findAllWithStats(options = {}) {
    const {
      where = { 'v.is_active': true },
      orderBy = { 'v.name': 'ASC' },
      limit,
      offset
    } = options;

    let query = `
      SELECT 
        v.*,
        COUNT(jp.id) as jewelry_count,
        COUNT(CASE WHEN jp.status = 'In Stock' THEN 1 END) as in_stock_count,
        COUNT(CASE WHEN jp.status = 'Sold' THEN 1 END) as sold_count,
        COALESCE(SUM(jp.total_cost), 0) as total_inventory_value,
        COALESCE(AVG(jp.sale_price), 0) as avg_sale_price,
        MAX(jp.created_at) as last_jewelry_added
      FROM ${this.tableName} v
      LEFT JOIN jewelry_pieces jp ON v.id = jp.vendor_id
    `;

    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` GROUP BY v.id`;

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
    return result.rows;
  }

  /**
   * Get vendor statistics
   * @param {Number} vendorId - Vendor ID
   * @returns {Promise<Object>} Vendor statistics
   */
  async getVendorStats(vendorId) {
    const query = `
      SELECT 
        v.name,
        v.company,
        v.rating,
        COUNT(jp.id) as total_jewelry_pieces,
        COUNT(CASE WHEN jp.status = 'In Stock' THEN 1 END) as in_stock,
        COUNT(CASE WHEN jp.status = 'Sold' THEN 1 END) as sold,
        COUNT(CASE WHEN jp.status = 'Reserved' THEN 1 END) as reserved,
        COALESCE(SUM(jp.total_cost), 0) as total_cost_value,
        COALESCE(SUM(jp.sale_price), 0) as total_sale_value,
        COALESCE(AVG(jp.sale_price), 0) as avg_sale_price,
        COALESCE(MIN(jp.sale_price), 0) as min_sale_price,
        COALESCE(MAX(jp.sale_price), 0) as max_sale_price,
        MIN(jp.created_at) as first_jewelry_date,
        MAX(jp.created_at) as last_jewelry_date
      FROM ${this.tableName} v
      LEFT JOIN jewelry_pieces jp ON v.id = jp.vendor_id
      WHERE v.id = $1
      GROUP BY v.id, v.name, v.company, v.rating
    `;
    
    const result = await this.query(query, [vendorId]);
    return result.rows[0] || null;
  }

  /**
   * Get overall vendor statistics
   * @returns {Promise<Object>} Overall vendor statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_vendors,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_vendors,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as high_rated_vendors,
        COUNT(CASE WHEN rating >= 3 AND rating < 4 THEN 1 END) as medium_rated_vendors,
        COUNT(CASE WHEN rating < 3 THEN 1 END) as low_rated_vendors,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(DISTINCT city) as unique_cities,
        COUNT(DISTINCT state) as unique_states,
        COUNT(DISTINCT country) as unique_countries,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days
      FROM ${this.tableName}
    `;
    
    const result = await this.query(query);
    return result.rows[0];
  }

  /**
   * Get location-wise vendor distribution
   * @returns {Promise<Array>} Array of location statistics
   */
  async getLocationDistribution() {
    const query = `
      SELECT 
        country,
        state,
        city,
        COUNT(*) as vendor_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
        ROUND(AVG(rating), 2) as avg_rating
      FROM ${this.tableName}
      GROUP BY country, state, city
      ORDER BY country ASC, state ASC, city ASC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Search vendors by name, company, email, or location
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching vendors
   */
  async search(searchTerm, options = {}) {
    const { 
      limit = 50, 
      offset = 0, 
      includeInactive = false,
      minRating = null,
      location = null 
    } = options;
    
    let query = `
      SELECT 
        v.*,
        COUNT(jp.id) as jewelry_count
      FROM ${this.tableName} v
      LEFT JOIN jewelry_pieces jp ON v.id = jp.vendor_id
      WHERE 
        (v.name ILIKE $1 OR 
         v.company ILIKE $1 OR 
         v.email ILIKE $1 OR 
         v.city ILIKE $1 OR 
         v.state ILIKE $1 OR
         v.contact_person ILIKE $1)
    `;

    const params = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (!includeInactive) {
      query += ` AND v.is_active = $${paramIndex++}`;
      params.push(true);
    }

    if (minRating !== null) {
      query += ` AND v.rating >= $${paramIndex++}`;
      params.push(minRating);
    }

    if (location) {
      if (location.city) {
        query += ` AND v.city = $${paramIndex++}`;
        params.push(location.city);
      }
      if (location.state) {
        query += ` AND v.state = $${paramIndex++}`;
        params.push(location.state);
      }
      if (location.country) {
        query += ` AND v.country = $${paramIndex++}`;
        params.push(location.country);
      }
    }

    query += ` GROUP BY v.id ORDER BY v.name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Check if vendor email is available
   * @param {String} email - Vendor email
   * @param {Number} excludeId - Vendor ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isEmailAvailable(email, excludeId = null) {
    if (!email) return true; // Email is optional
    
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = $1`;
    const params = [email];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Check if GST number is available
   * @param {String} gstNumber - GST number
   * @param {Number} excludeId - Vendor ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isGSTNumberAvailable(gstNumber, excludeId = null) {
    if (!gstNumber) return true; // GST number is optional
    
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE gst_number = $1`;
    const params = [gstNumber];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Update vendor rating
   * @param {Number} id - Vendor ID
   * @param {Number} rating - New rating (0-5)
   * @returns {Promise<Object|null>} Updated vendor
   */
  async updateRating(id, rating) {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    
    return this.update(id, { rating });
  }

  /**
   * Get top vendors by jewelry count
   * @param {Number} limit - Number of top vendors to return
   * @returns {Promise<Array>} Array of top vendors
   */
  async getTopVendorsByJewelryCount(limit = 10) {
    const query = `
      SELECT 
        v.*,
        COUNT(jp.id) as jewelry_count,
        COALESCE(SUM(jp.total_cost), 0) as total_inventory_value
      FROM ${this.tableName} v
      LEFT JOIN jewelry_pieces jp ON v.id = jp.vendor_id
      WHERE v.is_active = true
      GROUP BY v.id
      ORDER BY jewelry_count DESC, total_inventory_value DESC
      LIMIT $1
    `;
    
    const result = await this.query(query, [limit]);
    return result.rows;
  }

  /**
   * Get vendors with recent activity
   * @param {Number} days - Number of days to look back
   * @returns {Promise<Array>} Array of vendors with recent activity
   */
  async getVendorsWithRecentActivity(days = 30) {
    const query = `
      SELECT 
        v.*,
        COUNT(jp.id) as recent_jewelry_count,
        MAX(jp.created_at) as last_jewelry_date
      FROM ${this.tableName} v
      JOIN jewelry_pieces jp ON v.id = jp.vendor_id
      WHERE 
        v.is_active = true 
        AND jp.created_at > CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY v.id
      ORDER BY last_jewelry_date DESC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }
}

module.exports = VendorModel;
