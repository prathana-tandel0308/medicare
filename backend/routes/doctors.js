const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// FIX: Destructure the import
const { authMiddleware } = require('../middleware/auth');

// GET all doctors
router.get('/', authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
});

// GET single doctor
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctor', error: error.message });
  }
});

// POST create doctor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ message: 'Doctor created successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create doctor', error: error.message });
  }
});

// PUT update doctor
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update doctor', error: error.message });
  }
});

// DELETE doctor
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor', error: error.message });
  }
});

module.exports = router;
