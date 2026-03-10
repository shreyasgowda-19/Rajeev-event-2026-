const express = require('express');
const router = express.Router();
const {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments
} = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');  // ✅ Import BOTH

// Create doctor profile (User must be creating doctor profile)
router.post('/profile', auth, createDoctorProfile);

// Get all doctors (Public - no auth required, but we'll keep auth for consistency)
router.get('/', auth, getAllDoctors);

// Get single doctor (Public)
router.get('/:id', auth, getDoctorById);

// Update doctor profile (Doctor only)
router.put('/profile', auth, authorize('doctor'), updateDoctorProfile);

// Get doctor appointments (Doctor only)
router.get('/:doctorId/appointments', auth, authorize('doctor'), getDoctorAppointments);

module.exports = router;
