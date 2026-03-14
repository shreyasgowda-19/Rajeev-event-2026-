const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getMyReports,
  getPatientReports,
  shareReport,
  deleteReport
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Custom error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

// Upload report (Patient only)
router.post(
  '/', 
  auth, 
  authorize('patient'), 
  (req, res, next) => {
    // Wrap multer in try-catch to handle errors properly
    upload.single('file')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadReport
);

// Get my reports
router.get('/my-reports', auth, getMyReports);

// Get patient reports (Doctor only)
router.get('/patient/:patientId', auth, authorize('doctor'), getPatientReports);

// Share report with doctor (Patient only)
router.put('/:id/share', auth, authorize('patient'), shareReport);

// Delete report (Patient only)
router.delete('/:id', auth, authorize('patient'), deleteReport);

module.exports = router;
