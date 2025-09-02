const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Set user data from session
    const user = req.session.user;
    req.userId = user.id;
    req.userRole = user.role;
    req.username = user.username;
    req.fullName = user.fullName;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin' && req.userRole !== 'manager') {
      return res.status(403).json({ error: 'Admin or Manager access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
};

const managerAuth = async (req, res, next) => {
  try {
    if (req.userRole !== 'manager' && req.userRole !== 'admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Manager access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
};

const superAdminAuth = async (req, res, next) => {
  try {
    if (req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Forbidden' });
  }
};

module.exports = { auth, adminAuth, managerAuth, superAdminAuth };