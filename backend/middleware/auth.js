const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    // Existing user check
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'receptionist',
    });

    // Token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);

    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Compare password using model method
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      message: 'Authentication failed',
      error: error.message,
    });
  }
});

// GET CURRENT USER
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Auth Check Error:', error);

    res.status(401).json({
      message: 'Invalid token',
    });
  }
});

module.exports = router;
