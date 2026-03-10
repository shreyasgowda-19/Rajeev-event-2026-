const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getMyReports,
  getPatientReports,
  shareReport,
  deleteReport
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');  // ✅ Import BOTH auth and authorize
const upload = require('../middleware/upload');

// Upload report (Patient only)
router.post('/', auth, authorize('patient'), upload.single('file'), uploadReport);

// Get my reports (Any authenticated user)
router.get('/my-reports', auth, getMyReports);

// Get patient reports (Doctor only - to view patient's shared reports)
router.get('/patient/:patientId', auth, authorize('doctor'), getPatientReports);

// Share report with doctor (Patient only)
router.put('/:id/share', auth, authorize('patient'), shareReport);

// Delete report (Patient only)
router.delete('/:id', auth, authorize('patient'), deleteReport);

module.exports = router;
