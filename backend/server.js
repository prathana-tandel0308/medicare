const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
// Updated CORS to allow Vercel + local development
app.use(cors());
app.use(express.json());

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
    db:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  });
});

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
  console.error(
    '\n❌ ERROR: MONGODB_URI is not set in your .env file!'
  );
  console.error(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  );
  console.error('📋 Steps to fix:');
  console.error(
    '  1. Go to https://cloud.mongodb.com and create a FREE cluster'
  );
  console.error(
    '  2. Click "Connect" → "Drivers" → copy the connection string'
  );
  console.error(
    '  3. Create a file called .env in the backend/ folder'
  );
  console.error(
    '  4. Add this line (replace with YOUR actual string):'
  );
  console.error(
    '     MONGODB_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/hospital_ms'
  );
  console.error(
    '  5. Also add: JWT_SECRET=any_random_secret_string'
  );
  console.error('  6. Run: npm run dev again');
  console.error(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  );

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
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('   Error:', err.message);

    console.error('\n📋 Common fixes:');
    console.error(
      '  • Check your MONGODB_URI in .env is correct'
    );
    console.error(
      '  • Go to Atlas → Network Access → Add IP: 0.0.0.0/0 (allow all)'
    );
    console.error(
      '  • Make sure your Atlas username/password are correct'
    );
    console.error(
      '  • Ensure the cluster is not paused (free tier auto-pauses)\n'
    );

    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `   Health check: http://localhost:${PORT}/api/health\n`
    );
  });
});

module.exports = app;
