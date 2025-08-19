const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    valid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      ...(password.length < minLength ? ['Password must be at least 8 characters long'] : []),
      ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain at least one number'] : []),
      ...(!hasSpecialChar ? ['Password must contain at least one special character'] : [])
    ]
  };
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.role,
        u.is_password_reset_required,
        u.last_login,
        u.login_attempts,
        u.account_locked_until,
        u.is_active,
        u.created_at,
        u.updated_at,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      WHERE u.is_active = true
      ORDER BY u.first_name, u.last_name
    `;
    
    const result = await pool.query(query);
    
    const users = result.rows.map(user => ({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`,
      isLocked: user.account_locked_until && new Date(user.account_locked_until) > new Date()
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.role,
        u.is_password_reset_required,
        u.last_login,
        u.login_attempts,
        u.account_locked_until,
        u.is_active,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`,
      isLocked: user.account_locked_until && new Date(user.account_locked_until) > new Date()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      role = 'user'
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username) {
      return res.status(400).json({ 
        error: 'First name, last name, and username are required' 
      });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR (email = $2 AND email IS NOT NULL)',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Default password
    const defaultPassword = 'User@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const query = `
      INSERT INTO users (
        first_name, last_name, username, email, password_hash, role, 
        is_password_reset_required, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      RETURNING id, first_name, last_name, username, email, role, is_password_reset_required, created_at
    `;
    
    const values = [
      firstName,
      lastName,
      username,
      email || null,
      passwordHash,
      role,
      req.userId // Current user creating this user
    ];
    
    const result = await pool.query(query, values);
    const user = result.rows[0];
    
    res.status(201).json({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`,
      defaultPassword // Send this back so admin knows the default password
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      username,
      email,
      role,
      isActive
    } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username/email conflicts with other users
    if (username || email) {
      const conflictQuery = `
        SELECT id FROM users 
        WHERE (username = $1 OR (email = $2 AND email IS NOT NULL)) 
        AND id != $3 AND is_active = true
      `;
      const conflictResult = await pool.query(conflictQuery, [username, email, id]);
      
      if (conflictResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Username or email already exists' 
        });
      }
    }

    const query = `
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        username = COALESCE($3, username),
        email = COALESCE($4, email),
        role = COALESCE($5, role),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, first_name, last_name, username, email, role, is_active, updated_at
    `;
    
    const values = [firstName, lastName, username, email, role, isActive, id];
    const result = await pool.query(query, values);
    
    const user = result.rows[0];
    res.json({
      ...user,
      fullName: `${user.first_name} ${user.last_name}`
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true
      RETURNING id, first_name, last_name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
};

// Reset user password (Admin function)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Only admin, manager, or super_admin can reset passwords
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let passwordToSet;
    if (newPassword) {
      // Validate the new password
      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Password does not meet requirements',
          details: validation.errors
        });
      }
      passwordToSet = newPassword;
    } else {
      // Use default password
      passwordToSet = 'User@123';
    }

    const passwordHash = await bcrypt.hash(passwordToSet, 12);

    const query = `
      UPDATE users 
      SET 
        password_hash = $1,
        is_password_reset_required = true,
        login_attempts = 0,
        account_locked_until = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
      RETURNING id, first_name, last_name, username
    `;
    
    const result = await pool.query(query, [passwordHash, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Password reset successfully',
      user: result.rows[0],
      temporaryPassword: newPassword ? undefined : passwordToSet
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error.message 
    });
  }
};

// Change password (User function)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'New password does not meet requirements',
        details: validation.errors
      });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const updateQuery = `
      UPDATE users 
      SET 
        password_hash = $1,
        is_password_reset_required = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name
    `;
    
    const result = await pool.query(updateQuery, [newPasswordHash, userId]);
    
    res.json({ 
      message: 'Password changed successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Failed to change password',
      details: error.message 
    });
  }
};

// Get password requirements
const getPasswordRequirements = (req, res) => {
  res.json({
    requirements: [
      'Minimum 8 characters',
      'At least 1 uppercase letter (A-Z)',
      'At least 1 lowercase letter (a-z)',
      'At least 1 number (0-9)',
      'At least 1 special character (!@#$%^&*(),.?":{}|<>)'
    ]
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  changePassword,
  getPasswordRequirements
};
