const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email.toLowerCase(), hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already taken by another user' });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
      paramCount++;
    }

    if (role) {
      updateFields.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of the last admin user
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      ['admin']
    );

    const userToDelete = existingUser.rows[0];
    const isAdmin = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (isAdmin.rows[0].role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin user' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Change password
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [id]
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
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
