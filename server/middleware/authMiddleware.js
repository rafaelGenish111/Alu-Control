const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Ensure the user is authenticated (has a valid JWT token)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // extract token from Authorization header
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to request (without password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.log(`🔴 [protect] User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      console.log(`✅ [protect] User authenticated: ${req.user.email} (tenantId: ${req.user.tenantId || 'none'})`);
      next();
    } catch (error) {
      console.log(`🔴 [protect] Token verification failed: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log(`🔴 [protect] No authorization header`);
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Check role-based authorization (e.g. only super_admin)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        message: 'Not authorized, user not authenticated'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };