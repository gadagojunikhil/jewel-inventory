const BaseModel = require('./BaseModel');

/**
 * Estimate Model - Handles all estimate-related database operations
 */
class EstimateModel extends BaseModel {
  constructor() {
    super('estimates');
  }

  /**
   * Find estimate by estimate number
   * @param {String} estimateNumber - Estimate number
   * @returns {Promise<Object|null>} Estimate record or null
   */
  async findByEstimateNumber(estimateNumber) {
    return this.findOne({ estimate_number: estimateNumber });
  }

  /**
   * Find estimates by customer phone
   * @param {String} customerPhone - Customer phone number
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of estimates for customer
   */
  async findByCustomerPhone(customerPhone, options = {}) {
    return this.findAll({
      where: { customer_phone: customerPhone, ...options.where },
      orderBy: { estimate_date: 'DESC', ...options.orderBy },
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Find estimates by currency
   * @param {String} currency - Currency (INR/USD)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of estimates in currency
   */
  async findByCurrency(currency, options = {}) {
    return this.findAll({
      where: { currency, ...options.where },
      orderBy: { estimate_date: 'DESC', ...options.orderBy },
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Find estimates by status
   * @param {String} status - Estimate status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of estimates with status
   */
  async findByStatus(status, options = {}) {
    return this.findAll({
      where: { status, ...options.where },
      orderBy: { estimate_date: 'DESC', ...options.orderBy },
      limit: options.limit,
      offset: options.offset
    });
  }

  /**
   * Search estimates by customer name or phone
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching estimates
   */
  async searchByCustomer(searchTerm, options = {}) {
    const { limit = 50, offset = 0, currency = null, status = null } = options;
    
    let query = `
      SELECT * FROM ${this.tableName}
      WHERE 
        (customer_name ILIKE $1 OR 
         customer_phone ILIKE $1 OR 
         customer_email ILIKE $1)
    `;

    const params = [`%${searchTerm}%`];
    let paramIndex = 2;

    if (currency) {
      query += ` AND currency = $${paramIndex++}`;
      params.push(currency);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY estimate_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Create estimate with auto-generated estimate number
   * @param {Object} estimateData - Estimate data
   * @returns {Promise<Object>} Created estimate
   */
  async create(estimateData) {
    // Generate estimate number if not provided
    if (!estimateData.estimate_number) {
      const estimateNumber = await this.generateEstimateNumber(estimateData.currency || 'INR');
      estimateData.estimate_number = estimateNumber;
    }

    return super.create(estimateData);
  }

  /**
   * Generate unique estimate number
   * @param {String} currency - Currency type (INR/USD)
   * @returns {Promise<String>} Generated estimate number
   */
  async generateEstimateNumber(currency) {
    const query = `SELECT generate_estimate_number($1) as estimate_number`;
    const result = await this.query(query, [currency]);
    return result.rows[0].estimate_number;
  }

  /**
   * Get estimates within date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of estimates in date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE estimate_date BETWEEN $1 AND $2
      ORDER BY estimate_date DESC
    `;
    
    const result = await this.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Get estimate statistics
   * @returns {Promise<Object>} Estimate statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_estimates,
        COUNT(CASE WHEN currency = 'INR' THEN 1 END) as inr_estimates,
        COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_estimates,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_estimates,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_estimates,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_estimates,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_estimates,
        COALESCE(SUM(CASE WHEN currency = 'INR' THEN grand_total_inr END), 0) as total_inr_value,
        COALESCE(SUM(CASE WHEN currency = 'USD' THEN grand_total_usd END), 0) as total_usd_value,
        COALESCE(AVG(CASE WHEN currency = 'INR' THEN grand_total_inr END), 0) as avg_inr_value,
        COALESCE(AVG(CASE WHEN currency = 'USD' THEN grand_total_usd END), 0) as avg_usd_value,
        COUNT(CASE WHEN estimate_date > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days,
        COUNT(CASE WHEN valid_until < CURRENT_DATE AND status = 'active' THEN 1 END) as expired_active
      FROM ${this.tableName}
    `;
    
    const result = await this.query(query);
    return result.rows[0];
  }

  /**
   * Get monthly estimate statistics
   * @param {Number} months - Number of months to look back
   * @returns {Promise<Array>} Array of monthly statistics
   */
  async getMonthlyStatistics(months = 12) {
    const query = `
      SELECT 
        DATE_TRUNC('month', estimate_date) as month,
        COUNT(*) as total_estimates,
        COUNT(CASE WHEN currency = 'INR' THEN 1 END) as inr_count,
        COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_count,
        COALESCE(SUM(CASE WHEN currency = 'INR' THEN grand_total_inr END), 0) as inr_value,
        COALESCE(SUM(CASE WHEN currency = 'USD' THEN grand_total_usd END), 0) as usd_value,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count
      FROM ${this.tableName}
      WHERE estimate_date > CURRENT_DATE - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', estimate_date)
      ORDER BY month DESC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Get customer statistics
   * @returns {Promise<Array>} Array of customer statistics
   */
  async getCustomerStatistics() {
    const query = `
      SELECT 
        customer_name,
        customer_phone,
        customer_email,
        COUNT(*) as total_estimates,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_estimates,
        COALESCE(SUM(CASE WHEN currency = 'INR' THEN grand_total_inr END), 0) as total_inr_value,
        COALESCE(SUM(CASE WHEN currency = 'USD' THEN grand_total_usd END), 0) as total_usd_value,
        MIN(estimate_date) as first_estimate_date,
        MAX(estimate_date) as last_estimate_date
      FROM ${this.tableName}
      GROUP BY customer_name, customer_phone, customer_email
      HAVING COUNT(*) > 0
      ORDER BY total_estimates DESC, total_inr_value DESC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Update estimate status
   * @param {Number} id - Estimate ID
   * @param {String} status - New status
   * @returns {Promise<Object|null>} Updated estimate
   */
  async updateStatus(id, status) {
    const validStatuses = ['active', 'converted', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    return this.update(id, { status });
  }

  /**
   * Convert estimate to sale
   * @param {Number} id - Estimate ID
   * @param {Object} conversionData - Conversion metadata
   * @returns {Promise<Object|null>} Updated estimate
   */
  async convertToSale(id, conversionData = {}) {
    const updateData = {
      status: 'converted',
      ...conversionData
    };
    
    return this.update(id, updateData);
  }

  /**
   * Get estimates expiring soon
   * @param {Number} days - Number of days ahead to check
   * @returns {Promise<Array>} Array of estimates expiring soon
   */
  async findExpiringSoon(days = 7) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE 
        status = 'active' 
        AND valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY valid_until ASC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Get expired estimates
   * @returns {Promise<Array>} Array of expired estimates
   */
  async findExpired() {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE 
        status = 'active' 
        AND valid_until < CURRENT_DATE
      ORDER BY valid_until ASC
    `;
    
    const result = await this.query(query);
    return result.rows;
  }

  /**
   * Auto-expire old estimates
   * @param {Number} graceDays - Grace period before auto-expiring
   * @returns {Promise<Number>} Number of estimates expired
   */
  async autoExpireEstimates(graceDays = 0) {
    const query = `
      UPDATE ${this.tableName}
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE 
        status = 'active' 
        AND valid_until < CURRENT_DATE - INTERVAL '${graceDays} days'
      RETURNING id
    `;
    
    const result = await this.query(query);
    return result.rowCount;
  }

  /**
   * Get estimate conversion rate
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Conversion rate statistics
   */
  async getConversionRate(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.currency) {
      whereClause += ` AND currency = $${paramIndex++}`;
      params.push(filters.currency);
    }

    if (filters.startDate) {
      whereClause += ` AND estimate_date >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND estimate_date <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    const query = `
      SELECT 
        COUNT(*) as total_estimates,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_estimates,
        ROUND(
          COUNT(CASE WHEN status = 'converted' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as conversion_rate_percent
      FROM ${this.tableName}
      ${whereClause}
    `;
    
    const result = await this.query(query, params);
    return result.rows[0];
  }

  /**
   * Duplicate estimate (create new estimate from existing one)
   * @param {Number} id - Original estimate ID
   * @param {Object} overrides - Fields to override
   * @returns {Promise<Object>} New estimate
   */
  async duplicate(id, overrides = {}) {
    const original = await this.findById(id);
    if (!original) {
      throw new Error('Original estimate not found');
    }

    // Remove fields that should not be duplicated
    const estimateData = { ...original };
    delete estimateData.id;
    delete estimateData.estimate_number;
    delete estimateData.created_at;
    delete estimateData.updated_at;

    // Apply overrides
    Object.assign(estimateData, overrides);

    // Create new estimate
    return this.create(estimateData);
  }
}

module.exports = EstimateModel;
