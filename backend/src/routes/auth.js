const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  deleteMyAccount,       
  deleteUserById,       
  getAllUsers            
} = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.delete('/me', auth, deleteMyAccount);  // Delete own account

// Admin only routes
router.get('/users', auth, authorize('admin'), getAllUsers);
router.delete('/users/:userId', auth, authorize('admin'), deleteUserById);

module.exports = router;