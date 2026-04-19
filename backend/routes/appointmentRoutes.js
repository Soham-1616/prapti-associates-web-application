// ═══════════════════════════════════════════
//  ROUTES — Appointment & Contact
// ═══════════════════════════════════════════

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET /api/appointments — Get all appointments
router.get('/appointments', appointmentController.getAppointments);

// POST /api/appointments — Book an appointment
router.post('/appointments', appointmentController.bookAppointment);

// GET /api/appointments/approve?id=xxx — Approve appointment (from email link)
router.get('/appointments/approve', appointmentController.approveAppointment);

// GET /api/appointments/reject?id=xxx — Reject appointment (from email link)
router.get('/appointments/reject', appointmentController.rejectAppointment);

// POST /api/contact — Submit contact form
router.post('/contact', appointmentController.submitContact);

module.exports = router;
