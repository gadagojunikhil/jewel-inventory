const BaseService = require('./BaseService');
const { userModel } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Service - Handles user-related business logic
 */
class UserService extends BaseService {
  constructor() {
    super(userModel);
  }

  /**
   * Create a new user with password hashing
   * @param {Object} userData - User data
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Created user (without password)
   */
  async create(userData, context = {}) {
    return this.executeOperation('create_user', async () => {
      // Validate user data
      const validatedData = this.validateUserData(userData, 'create');

      // Check if username is available
      const isUsernameAvailable = await this.model.isUsernameAvailable(validatedData.username);
      if (!isUsernameAvailable) {
        throw new Error('Username is already taken');
      }

      // Check if email is available (if provided)
      if (validatedData.email) {
        const isEmailAvailable = await this.model.isEmailAvailable(validatedData.email);
        if (!isEmailAvailable) {
          throw new Error('Email is already registered');
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      validatedData.password_hash = await bcrypt.hash(validatedData.password, salt);
      delete validatedData.password; // Remove plain password

      // Add audit fields
      if (context.userId) {
        validatedData.created_by = context.userId;
      }

      return await this.model.create(validatedData);
    }, context);
  }

  /**
   * Update user with validation
   * @param {Number} id - User ID
   * @param {Object} userData - Updated user data
   * @param {Object} context - Context information
   * @returns {Promise<Object|null>} Updated user (without password)
   */
  async update(id, userData, context = {}) {
    return this.executeOperation('update_user', async () => {
      // Validate user data
      const validatedData = this.validateUserData(userData, 'update');

      // Check if username is available (excluding current user)
      if (validatedData.username) {
        const isUsernameAvailable = await this.model.isUsernameAvailable(validatedData.username, id);
        if (!isUsernameAvailable) {
          throw new Error('Username is already taken');
        }
      }

      // Check if email is available (excluding current user)
      if (validatedData.email) {
        const isEmailAvailable = await this.model.isEmailAvailable(validatedData.email, id);
        if (!isEmailAvailable) {
          throw new Error('Email is already registered');
        }
      }

      // Handle password update separately if provided
      if (validatedData.password) {
        const salt = await bcrypt.genSalt(10);
        validatedData.password_hash = await bcrypt.hash(validatedData.password, salt);
        delete validatedData.password;
      }

      return await this.model.update(id, validatedData);
    }, context);
  }

  /**
   * Authenticate user login
   * @param {String} identifier - Username or email
   * @param {String} password - Plain text password
   * @returns {Promise<Object>} Authentication result with token and user info
   */
  async authenticate(identifier, password) {
    return this.executeOperation('authenticate_user', async () => {
      if (!identifier || !password) {
        throw new Error('Username/email and password are required');
      }

      // Find user by username or email
      const user = await this.model.findByIdentifier(identifier);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is active
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Check if account is locked
      if (user.account_locked_until && new Date() < new Date(user.account_locked_until)) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        // Increment login attempts
        const newAttempts = (user.login_attempts || 0) + 1;
        const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts
        
        await this.model.updateLoginAttempts(user.id, newAttempts, lockUntil);
        throw new Error('Invalid credentials');
      }

      // Update last login and reset attempts
      await this.model.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Remove sensitive data
      delete user.password_hash;
      delete user.password_reset_token;

      return {
        token,
        user,
        expiresIn: process.env.JWT_EXPIRE || '7d'
      };
    });
  }

  /**
   * Change user password
   * @param {Number} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async changePassword(userId, currentPassword, newPassword) {
    return this.executeOperation('change_password', async () => {
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      // Get user with password hash
      const user = await this.model.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      
      if (!user.rows[0]) {
        throw new Error('User not found');
      }

      const userData = user.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      return await this.model.updatePassword(userId, newPasswordHash);
    });
  }

  /**
   * Get users with enhanced details
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users with creator info
   */
  async getAllWithDetails(options = {}) {
    return this.executeOperation('get_all_users_with_details', async () => {
      return await this.model.findAllWithCreator(options);
    });
  }

  /**
   * Search users
   * @param {String} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching users
   */
  async search(searchTerm, options = {}) {
    return this.executeOperation('search_users', async () => {
      return await this.model.search(searchTerm, options);
    });
  }

  /**
   * Get users by role
   * @param {String} role - User role
   * @returns {Promise<Array>} Array of users with specified role
   */
  async getUsersByRole(role) {
    return this.executeOperation('get_users_by_role', async () => {
      const validRoles = ['super_admin', 'admin', 'manager', 'user'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }

      return await this.model.findByRole(role);
    });
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics() {
    return this.executeOperation('get_user_statistics', async () => {
      return await this.model.getStatistics();
    });
  }

  /**
   * Validate user data
   * @param {Object} userData - User data to validate
   * @param {String} operation - Operation type (create, update)
   * @returns {Object} Validated user data
   */
  validateUserData(userData, operation = 'create') {
    const validatedData = this.validateData(userData, operation);

    // Required fields for creation
    if (operation === 'create') {
      if (!validatedData.username) {
        throw new Error('Username is required');
      }
      if (!validatedData.password) {
        throw new Error('Password is required');
      }
      if (!validatedData.first_name) {
        throw new Error('First name is required');
      }
      if (!validatedData.last_name) {
        throw new Error('Last name is required');
      }
      if (!validatedData.role) {
        validatedData.role = 'user'; // Default role
      }
    }

    // Validate username format
    if (validatedData.username) {
      if (!/^[a-zA-Z0-9_]{3,50}$/.test(validatedData.username)) {
        throw new Error('Username must be 3-50 characters and contain only letters, numbers, and underscores');
      }
    }

    // Validate email format
    if (validatedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(validatedData.email)) {
        throw new Error('Invalid email format');
      }
    }

    // Validate role
    if (validatedData.role) {
      const validRoles = ['super_admin', 'admin', 'manager', 'user'];
      if (!validRoles.includes(validatedData.role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
    }

    // Validate password
    if (validatedData.password) {
      this.validatePassword(validatedData.password);
    }

    // Sanitize string fields
    ['first_name', 'last_name', 'username'].forEach(field => {
      if (validatedData[field]) {
        validatedData[field] = validatedData[field].trim();
      }
    });

    return validatedData;
  }

  /**
   * Validate password strength
   * @param {String} password - Password to validate
   */
  validatePassword(password) {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one letter and one number');
    }
  }

  /**
   * Generate password reset token
   * @param {String} email - User email
   * @returns {Promise<Object>} Reset token info
   */
  async generatePasswordResetToken(email) {
    return this.executeOperation('generate_password_reset_token', async () => {
      const user = await this.model.findByEmail(email);
      if (!user) {
        throw new Error('User not found with this email');
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await this.model.setPasswordResetToken(user.id, resetToken, resetExpires);

      return {
        token: resetToken,
        expires: resetExpires,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      };
    });
  }

  /**
   * Reset password using token
   * @param {String} token - Reset token
   * @param {String} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async resetPassword(token, newPassword) {
    return this.executeOperation('reset_password', async () => {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'password_reset') {
          throw new Error('Invalid token purpose');
        }

        // Find user and verify token
        const user = await this.model.query(
          'SELECT * FROM users WHERE id = $1 AND password_reset_token = $2 AND password_reset_expires > NOW()',
          [decoded.userId, token]
        );

        if (!user.rows[0]) {
          throw new Error('Invalid or expired reset token');
        }

        // Validate new password
        this.validatePassword(newPassword);

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token
        return await this.model.updatePassword(decoded.userId, passwordHash);
      } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          throw new Error('Invalid or expired reset token');
        }
        throw error;
      }
    });
  }
}

module.exports = UserService;
