const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes / verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found
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

    // Find user from token payload
    const user = await User.findById(decoded.id).select(
      '-password'
    );

    if (!user) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    return res.status(401).json({
      message: 'Not authorized, token invalid',
    });
  }
};

// Optional role-based access control
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
