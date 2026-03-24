// ═══════════════════════════════════════════
//  ROUTES — Appointment & Contact
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// POST /api/appointments — Book an appointment
router.post('/appointments', appointmentController.bookAppointment);

// POST /api/contact — Submit contact form
router.post('/contact', appointmentController.submitContact);

module.exports = router;
