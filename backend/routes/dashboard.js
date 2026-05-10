const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// FIX: Destructure the import
const { authMiddleware } = require('../middleware/auth');

// GET dashboard stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const criticalPatients = await Patient.countDocuments({ status: 'Critical' });

    res.status(200).json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      activePatients,
      criticalPatients
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

module.exports = router;
