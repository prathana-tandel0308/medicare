const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

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
    jwt_secret_set: !!process.env.JWT_SECRET, // Tells us if JWT_SECRET exists
  });
});

// =========================================================
// 🔍 DIAGNOSTIC ROUTE 1: Check if Admin exists in DB
// =========================================================
app.get('/api/check-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@medicore.com' });
    
    res.json({
      adminExists: !!admin,
      adminPasswordLength: admin ? admin.password.length : 0,
      hint: admin ? (admin.password.length < 20 ? 'PASSWORD IS PLAINTEXT (BAD)' : 'PASSWORD IS HASHED (GOOD)') : 'No admin found'
    });
  } catch (error) {
    res.status(500).json({ message: 'Check failed', error: error.message });
  }
});

// =========================================================
// 🔍 DIAGNOSTIC ROUTE 2: Force create Admin (GET request for browser)
// =========================================================
app.get('/api/force-create-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    await User.deleteOne({ email: 'admin@medicore.com' });
    
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@medicore.com',
      password: 'admin123', // Model will hash this automatically
      role: 'admin',
    });

    res.json({ 
      message: '✅ Admin force-created!', 
      email: user.email,
      passwordLength: user.password.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Fix failed', error: error.message });
  }
});
// =========================================================

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ ERROR: MONGODB_URI is not set!');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('✅ MongoDB Atlas Connected!');
  } catch (err) {
    console.error('\n❌ MongoDB Connection Failed!', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

module.exports = app;
