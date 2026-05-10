const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables FIRST
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Updated CORS to allow Vercel + local development
const corsOptions = {
  origin: [
    'https://medicare-gamma-nine.vercel.app', 
    'http://localhost:5173', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hospital MS API Running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// =========================================================
// ⚠️ ONE-TIME FIX ROUTE - ADD THIS HERE
// This forces the admin user into the database Render is using
// =========================================================
app.post('/api/fix-seed-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Delete any existing broken admin
    await User.deleteOne({ email: 'admin@medicore.com' });
    
    // Create a fresh admin with plain password 
    // (The User model will automatically hash it via bcrypt)
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@medicore.com',
      password: 'admin123', 
      role: 'admin',
    });

    res.json({ 
      message: '✅ Admin user force-created in this database!', 
      userId: user._id,
      email: user.email 
    });
  } catch (error) {
    res.status(500).json({ message: 'Fix failed', error: error.message });
  }
});
// =========================================================

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});

// DB Connection + Server Start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not set in your .env file!');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('\n❌ ERROR: JWT_SECRET is not set in your .env file!');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log(`   DB: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Failed!', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
});

module.exports = app;
