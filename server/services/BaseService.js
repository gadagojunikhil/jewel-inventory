/**
 * Base Service class providing common business logic operations
 * All other services extend this class for consistent business logic handling
 */
class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Get all records with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async getAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }
  }

  /**
   * Get record by ID
   * @param {Number} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid ID provided');
    }

    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Failed to fetch record: ${error.message}`);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @param {Object} context - Context information (user, etc.)
   * @returns {Promise<Object>} Created record
   */
  async create(data, context = {}) {
    try {
      // Add audit fields if context provided
      if (context.userId) {
        data.created_by = context.userId;
      }

      return await this.model.create(data);
    } catch (error) {
      throw new Error(`Failed to create record: ${error.message}`);
    }
  }

  /**
   * Update a record
   * @param {Number} id - Record ID
   * @param {Object} data - Updated data
   * @param {Object} context - Context information (user, etc.)
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async update(id, data, context = {}) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid ID provided');
    }

    try {
      // Check if record exists
      const existing = await this.model.findById(id);
      if (!existing) {
        throw new Error('Record not found');
      }

      return await this.model.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  /**
   * Delete a record
   * @param {Number} id - Record ID
   * @param {Object} context - Context information (user, etc.)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, context = {}) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid ID provided');
    }

    try {
      // Check if record exists
      const existing = await this.model.findById(id);
      if (!existing) {
        throw new Error('Record not found');
      }

      return await this.model.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Soft delete a record
   * @param {Number} id - Record ID
   * @param {Object} context - Context information (user, etc.)
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async softDelete(id, context = {}) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid ID provided');
    }

    try {
      return await this.model.softDelete(id);
    } catch (error) {
      throw new Error(`Failed to soft delete record: ${error.message}`);
    }
  }

  /**
   * Search records
   * @param {String} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching records
   */
  async search(searchTerm, options = {}) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      throw new Error('Invalid search term');
    }

    try {
      if (typeof this.model.search === 'function') {
        return await this.model.search(searchTerm, options);
      } else {
        // Fallback to basic filtering if search not implemented
        return await this.model.findAll({
          limit: options.limit || 50,
          offset: options.offset || 0
        });
      }
    } catch (error) {
      throw new Error(`Failed to search records: ${error.message}`);
    }
  }

  /**
   * Get record count
   * @param {Object} where - WHERE conditions
   * @returns {Promise<Number>} Count of records
   */
  async getCount(where = {}) {
    try {
      return await this.model.count(where);
    } catch (error) {
      throw new Error(`Failed to count records: ${error.message}`);
    }
  }

  /**
   * Check if record exists
   * @param {Object} where - WHERE conditions
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(where = {}) {
    try {
      return await this.model.exists(where);
    } catch (error) {
      throw new Error(`Failed to check record existence: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    try {
      if (typeof this.model.getStatistics === 'function') {
        return await this.model.getStatistics();
      } else {
        // Basic statistics if not implemented
        const total = await this.model.count();
        return { total };
      }
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Validate data before operations
   * @param {Object} data - Data to validate
   * @param {String} operation - Operation type (create, update)
   * @returns {Object} Validated data
   */
  validateData(data, operation = 'create') {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided');
    }

    // Basic validation - override in child classes for specific validation
    const validatedData = { ...data };

    // Remove undefined and null values
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] === undefined) {
        delete validatedData[key];
      }
    });

    return validatedData;
  }

  /**
   * Log service operations
   * @param {String} operation - Operation name
   * @param {Object} details - Operation details
   * @param {Object} context - Context information
   */
  log(operation, details = {}, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: this.constructor.name,
      operation,
      details,
      user: context.userId || 'system'
    };

    // In production, this would go to a proper logging service
    console.log('[SERVICE LOG]', JSON.stringify(logEntry));
  }

  /**
   * Handle service errors consistently
   * @param {Error} error - Original error
   * @param {String} operation - Operation that failed
   * @param {Object} context - Context information
   */
  handleError(error, operation, context = {}) {
    this.log(`${operation}_error`, { 
      error: error.message,
      stack: error.stack 
    }, context);

    // Rethrow with service context
    const serviceError = new Error(`${this.constructor.name} ${operation} failed: ${error.message}`);
    serviceError.originalError = error;
    throw serviceError;
  }

  /**
   * Execute operation with error handling and logging
   * @param {String} operation - Operation name
   * @param {Function} fn - Operation function
   * @param {Object} context - Context information
   * @returns {Promise<*>} Operation result
   */
  async executeOperation(operation, fn, context = {}) {
    try {
      this.log(`${operation}_start`, {}, context);
      const result = await fn();
      this.log(`${operation}_success`, { resultType: typeof result }, context);
      return result;
    } catch (error) {
      this.handleError(error, operation, context);
    }
  }
}

module.exports = BaseService;
