const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// FIX: Destructure the import to get the actual function
const { authMiddleware } = require('../middleware/auth');

// GET all patients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patients', error: error.message });
  }
});

// GET single patient
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient', error: error.message });
  }
});

// POST create patient
router.post('/', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ message: 'Patient created successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create patient', error: error.message });
  }
});

// PUT update patient
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update patient', error: error.message });
  }
});

// DELETE patient
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete patient', error: error.message });
  }
});

module.exports = router;
