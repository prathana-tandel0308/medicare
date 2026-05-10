const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: { type: String, unique: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, default: 0 },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  availability: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    startTime: String,
    endTime: String
  }],
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  fee: { type: Number, default: 500 },
  createdAt: { type: Date, default: Date.now }
});

doctorSchema.pre('save', async function (next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
