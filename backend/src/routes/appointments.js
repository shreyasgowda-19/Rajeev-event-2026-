const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentById
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');  // ✅ Import BOTH

// Book appointment (Patient only)
router.post('/', auth, authorize('patient'), bookAppointment);

// Get my appointments (Any authenticated user)
router.get('/my-appointments', auth, getMyAppointments);

// Get single appointment (Any authenticated user)
router.get('/:id', auth, getAppointmentById);

// Update appointment status (Doctor or Patient)
router.put('/:id/status', auth, updateAppointmentStatus);

module.exports = router;
