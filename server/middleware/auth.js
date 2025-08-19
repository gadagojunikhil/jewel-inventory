const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      req.username = decoded.username;
      req.fullName = decoded.fullName;
      req.user = {
        id: decoded.userId,
        role: decoded.role,
        username: decoded.username,
        fullName: decoded.fullName
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
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