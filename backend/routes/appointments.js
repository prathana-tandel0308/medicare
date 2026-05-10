const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// FIX: Destructure the import
const { authMiddleware } = require('../middleware/auth');

// GET all appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name patientId')
      .populate('doctor', 'name doctorId')
      .sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// GET single appointment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name patientId')
      .populate('doctor', 'name doctorId');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
});

// POST create appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
});

// PUT update appointment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update appointment', error: error.message });
  }
});

// DELETE appointment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
  }
});

module.exports = router;
