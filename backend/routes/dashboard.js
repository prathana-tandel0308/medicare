const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, activePatients] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ status: 'Active' }),
      Appointment.countDocuments(),
      Patient.countDocuments({ status: 'Active' })
    ]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayAppointments = await Appointment.countDocuments({ date: { $gte: today, $lte: todayEnd } });

    const recentPatients = await Patient.find().sort({ createdAt: -1 }).limit(5).select('name patientId status admittedDate bloodGroup');
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate('patient', 'name')
      .populate('doctor', 'name specialization');

    // Monthly appointment stats for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const statusDist = await Patient.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: { totalPatients, totalDoctors, totalAppointments, activePatients, todayAppointments },
      recentPatients,
      recentAppointments,
      monthlyStats,
      statusDist
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
