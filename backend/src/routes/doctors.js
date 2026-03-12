const express = require('express');
const router = express.Router();
const {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments,
  geocodeClinicAddress,      // NEW
  reverseGeocodeLocation   // NEW
} = require('../controllers/doctorController');
const { auth, authorize } = require('../middleware/auth');

// Create doctor profile
router.post('/profile', auth, createDoctorProfile);

// Get all doctors (with real hospital search)
router.get('/', auth, getAllDoctors);

// Geocoding endpoints
router.post('/geocode', auth, geocodeClinicAddress);
router.get('/reverse-geocode', auth, reverseGeocodeLocation);

// Get single doctor
router.get('/:id', auth, getDoctorById);

// Update doctor profile
router.put('/profile', auth, authorize('doctor'), updateDoctorProfile);

// Get doctor appointments
router.get('/:doctorId/appointments', auth, authorize('doctor'), getDoctorAppointments);

module.exports = router;
