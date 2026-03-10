const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById
} = require('../controllers/prescriptionController');
const { auth, authorize } = require('../middleware/auth');  // ✅ Import BOTH

// Create prescription (Doctor only)
router.post('/', auth, authorize('doctor'), createPrescription);

// Get my prescriptions (Any authenticated user)
router.get('/my-prescriptions', auth, getMyPrescriptions);

// Get prescription by ID (Any authenticated user)
router.get('/:id', auth, getPrescriptionById);

module.exports = router;
