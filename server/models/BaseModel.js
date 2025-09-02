const pool = require('../config/database');

/**
 * Base Model class providing common database operations
 * All other models extend this class for consistent database interactions
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  /**
   * Find all records with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {Object} options.where - WHERE conditions
   * @param {Object} options.orderBy - ORDER BY clause
   * @param {Number} options.limit - LIMIT clause
   * @param {Number} options.offset - OFFSET clause
   * @param {Array} options.select - SELECT columns
   * @returns {Promise<Array>} Array of records
   */
  async findAll(options = {}) {
    const {
      where = {},
      orderBy = {},
      limit,
      offset,
      select = ['*']
    } = options;

    let query = `SELECT ${select.join(', ')} FROM ${this.tableName}`;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle IN clause
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          whereConditions.push(`${key} IN (${placeholders})`);
          params.push(...value);
        } else if (typeof value === 'object' && value.operator) {
          // Handle custom operators like { operator: 'LIKE', value: '%search%' }
          whereConditions.push(`${key} ${value.operator} $${paramIndex++}`);
          params.push(value.value);
        } else {
          whereConditions.push(`${key} = $${paramIndex++}`);
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

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Find a single record by ID
   * @param {Number} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find a single record by conditions
   * @param {Object} where - WHERE conditions
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async findOne(where = {}) {
    const records = await this.findAll({ where, limit: 1 });
    return records[0] || null;
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record with ID
   */
  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Update a record by ID
   * @param {Number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   * @param {Number} id - Record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Soft delete a record by ID (sets is_active to false)
   * @param {Number} id - Record ID
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async softDelete(id) {
    return this.update(id, { is_active: false });
  }

  /**
   * Count records with optional filtering
   * @param {Object} where - WHERE conditions
   * @returns {Promise<Number>} Count of records
   */
  async count(where = {}) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];
    let paramIndex = 1;

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

    const result = await this.pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Execute a raw SQL query
   * @param {String} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async query(query, params = []) {
    return this.pool.query(query, params);
  }

  /**
   * Begin a database transaction
   * @returns {Promise<Object>} Database client with transaction
   */
  async beginTransaction() {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    return client;
  }

  /**
   * Commit a database transaction
   * @param {Object} client - Database client
   */
  async commitTransaction(client) {
    await client.query('COMMIT');
    client.release();
  }

  /**
   * Rollback a database transaction
   * @param {Object} client - Database client
   */
  async rollbackTransaction(client) {
    await client.query('ROLLBACK');
    client.release();
  }

  /**
   * Check if a record exists
   * @param {Object} where - WHERE conditions
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(where = {}) {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Batch insert multiple records
   * @param {Array} dataArray - Array of record data objects
   * @returns {Promise<Array>} Array of created records
   */
  async batchCreate(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }

    const client = await this.beginTransaction();
    try {
      const results = [];
      for (const data of dataArray) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
          INSERT INTO ${this.tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;

        const result = await client.query(query, values);
        results.push(result.rows[0]);
      }
      
      await this.commitTransaction(client);
      return results;
    } catch (error) {
      await this.rollbackTransaction(client);
      throw error;
    }
  }
}

module.exports = BaseModel;
