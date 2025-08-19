const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth, managerAuth, superAdminAuth } = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user (admin only)
router.post('/', (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Insufficient permissions to create users' });
  }
  next();
}, userController.createUser);

// Update user
router.put('/:id', (req, res, next) => {
  // Users can update themselves, admins can update anyone
  if (parseInt(req.params.id) !== req.userId && req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Insufficient permissions to update this user' });
  }
  next();
}, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Insufficient permissions to delete users' });
  }
  next();
}, userController.deleteUser);

// Reset user password (admin only)
router.post('/:id/reset-password', (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Insufficient permissions to reset passwords' });
  }
  next();
}, userController.resetUserPassword);

// Change own password
router.put('/change-password', userController.changePassword);

// Get password requirements
router.get('/password-requirements', userController.getPasswordRequirements);

module.exports = router;
