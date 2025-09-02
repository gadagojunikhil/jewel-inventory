const BaseModel = require('./BaseModel');

/**
 * User Model - Handles all user-related database operations
 */
class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Find user by username
   * @param {String} username - Username
   * @returns {Promise<Object|null>} User record or null
   */
  async findByUsername(username) {
    return this.findOne({ username });
  }

  /**
   * Find user by email
   * @param {String} email - Email address
   * @returns {Promise<Object|null>} User record or null
   */
  async findByEmail(email) {
    return this.findOne({ email });
  }

  /**
   * Find user by username or email
   * @param {String} identifier - Username or email
   * @returns {Promise<Object|null>} User record or null
   */
  async findByIdentifier(identifier) {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE username = $1 OR email = $1
      LIMIT 1
    `;
    const result = await this.query(query, [identifier]);
    return result.rows[0] || null;
  }

  /**
   * Find all users with their creation info
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of user records with creator info
   */
  async findAllWithCreator(options = {}) {
    const {
      where = {},
      orderBy = { created_at: 'DESC' },
      limit,
      offset
    } = options;

    let query = `
      SELECT 
        u.*,
        creator.username as created_by_username,
        creator.first_name as created_by_first_name,
        creator.last_name as created_by_last_name
      FROM ${this.tableName} u
      LEFT JOIN users creator ON u.created_by = creator.id
    `;

    const params = [];
    let paramIndex = 1;

    // Build WHERE clause
    const whereConditions = [];
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        whereConditions.push(`u.${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Build ORDER BY clause
    if (Object.keys(orderBy).length > 0) {
      const orderClauses = Object.entries(orderBy)
        .map(([column, direction]) => `u.${column} ${direction.toUpperCase()}`)
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
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  async create(userData) {
    const user = await super.create(userData);
    // Remove password_hash from returned user
    delete user.password_hash;
    return user;
  }

  /**
   * Update user and return without password
   * @param {Number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object|null>} Updated user (without password)
   */
  async update(id, userData) {
    const user = await super.update(id, userData);
    if (user) {
      delete user.password_hash;
    }
    return user;
  }

  /**
   * Update user password
   * @param {Number} id - User ID
   * @param {String} passwordHash - New password hash
   * @returns {Promise<Object|null>} Updated user (without password)
   */
  async updatePassword(id, passwordHash) {
    return this.update(id, { 
      password_hash: passwordHash,
      is_password_reset_required: false,
      password_reset_token: null,
      password_reset_expires: null
    });
  }

  /**
   * Set password reset token
   * @param {Number} id - User ID
   * @param {String} token - Reset token
   * @param {Date} expires - Token expiration date
   * @returns {Promise<Object|null>} Updated user
   */
  async setPasswordResetToken(id, token, expires) {
    return this.update(id, {
      password_reset_token: token,
      password_reset_expires: expires
    });
  }

  /**
   * Update login attempts
   * @param {Number} id - User ID
   * @param {Number} attempts - Number of attempts
   * @param {Date} lockedUntil - Lock expiration (optional)
   * @returns {Promise<Object|null>} Updated user
   */
  async updateLoginAttempts(id, attempts, lockedUntil = null) {
    return this.update(id, {
      login_attempts: attempts,
      account_locked_until: lockedUntil
    });
  }

  /**
   * Update last login time
   * @param {Number} id - User ID
   * @returns {Promise<Object|null>} Updated user
   */
  async updateLastLogin(id) {
    return this.update(id, {
      last_login: new Date(),
      login_attempts: 0,
      account_locked_until: null
    });
  }

  /**
   * Get users by role
   * @param {String} role - User role
   * @returns {Promise<Array>} Array of users with specified role
   */
  async findByRole(role) {
    return this.findAll({ 
      where: { role, is_active: true },
      orderBy: { created_at: 'DESC' }
    });
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
        COUNT(CASE WHEN last_login > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as active_last_30_days,
        COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as created_last_30_days
      FROM ${this.tableName}
    `;
    
    const result = await this.query(query);
    return result.rows[0];
  }

  /**
   * Search users by name, username, or email
   * @param {String} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching users
   */
  async search(searchTerm, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const query = `
      SELECT u.*, 
        creator.username as created_by_username
      FROM ${this.tableName} u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE 
        u.first_name ILIKE $1 OR 
        u.last_name ILIKE $1 OR 
        u.username ILIKE $1 OR 
        u.email ILIKE $1 OR
        CONCAT(u.first_name, ' ', u.last_name) ILIKE $1
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await this.query(query, [searchPattern, limit, offset]);
    
    // Remove password hashes
    return result.rows.map(user => {
      delete user.password_hash;
      return user;
    });
  }

  /**
   * Check if username is available
   * @param {String} username - Username to check
   * @param {Number} excludeId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if available, false if taken
   */
  async isUsernameAvailable(username, excludeId = null) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE username = $1`;
    const params = [username];
    
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Check if email is available
   * @param {String} email - Email to check
   * @param {Number} excludeId - User ID to exclude from check (for updates)
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
}

module.exports = UserModel;
