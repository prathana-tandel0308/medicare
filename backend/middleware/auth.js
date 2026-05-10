const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes / verify token
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user from token
    const user = await User.findById(decoded.id).select(
      '-password'
    );

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    return res.status(401).json({
      message: 'Not authorized, token failed',
    });
  }
};

// Role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(
          ', '
        )}`,
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  authorizeRoles,
};
