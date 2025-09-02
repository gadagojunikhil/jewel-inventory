const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user with detailed information (case-insensitive username)
    const userQuery = `
      SELECT 
        id, first_name, last_name, username, email, password_hash, role,
        is_password_reset_required, last_login, login_attempts, 
        account_locked_until, is_active
      FROM users 
      WHERE LOWER(username) = LOWER($1) AND is_active = true
    `;
    
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      const lockTimeRemaining = Math.ceil((new Date(user.account_locked_until) - new Date()) / (1000 * 60));
      return res.status(423).json({ 
        error: `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
        accountLocked: true,
        lockTimeRemaining
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      let lockUntil = null;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (newAttempts >= 5) {
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await pool.query(
        'UPDATE users SET login_attempts = $1, account_locked_until = $2 WHERE id = $3',
        [newAttempts, lockUntil, user.id]
      );
      
      if (lockUntil) {
        return res.status(423).json({ 
          error: 'Too many failed attempts. Account locked for 30 minutes.',
          accountLocked: true,
          lockTimeRemaining: 30
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid username or password',
        attemptsRemaining: 5 - newAttempts
      });
    }

    // Reset login attempts and update last login
    await pool.query(
      'UPDATE users SET login_attempts = 0, account_locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Store user in session instead of generating JWT
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      username: user.username,
      email: user.email,
      role: user.role
    };

    req.session.user = userData;

    const response = {
      success: true,
      message: 'Login successful',
      user: userData
    };

    // Check if password reset is required
    if (user.is_password_reset_required) {
      response.passwordResetRequired = true;
      response.message = 'Login successful. Password reset required.';
    }

    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during login',
      details: error.message 
    });
  }
};

// Validate session and get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    
    const userQuery = `
      SELECT 
        id, first_name, last_name, username, email, role,
        is_password_reset_required, last_login, is_active
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(userQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        username: user.username,
        email: user.email,
        role: user.role,
        passwordResetRequired: user.is_password_reset_required,
        lastLogin: user.last_login
      }
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user information',
      details: error.message 
    });
  }
};

// Logout (destroy session)
const logout = async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Logout failed' 
        });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({ 
        success: true,
        message: 'Logout successful' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Logout failed' 
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  logout
};
