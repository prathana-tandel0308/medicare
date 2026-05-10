const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['Consultation', 'Follow-up', 'Emergency', 'Checkup'], default: 'Consultation' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'], default: 'Scheduled' },
  symptoms: { type: String },
  notes: { type: String },
  prescription: { type: String },
  fee: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
