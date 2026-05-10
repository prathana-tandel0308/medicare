const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { date, status, doctor, patient, page = 1, limit = 10 } = req.query;
    const query = {};
    if (date) { const d = new Date(date); const next = new Date(d); next.setDate(d.getDate() + 1); query.date = { $gte: d, $lt: next }; }
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (patient) query.patient = patient;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId phone')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appointments, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } })
      .populate('patient', 'name patientId')
      .populate('doctor', 'name specialization')
      .sort({ time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id).populate('patient').populate('doctor');
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const apt = new Appointment(req.body);
    await apt.save();
    const populated = await apt.populate('patient', 'name').populate('doctor', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const apt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name patientId')
      .populate('doctor', 'name specialization');
    if (!apt) return res.status(404).json({ message: 'Not found' });
    res.json(apt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
