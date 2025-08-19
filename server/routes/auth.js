const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Login
router.post('/login', authController.login);

// Get current user (requires authentication)
router.get('/me', auth, authController.getCurrentUser);

// Logout
router.post('/logout', auth, authController.logout);

// Change password (user changing their own password)
router.put('/change-password', auth, userController.changePassword);

// Get password requirements
router.get('/password-requirements', userController.getPasswordRequirements);

module.exports = router;