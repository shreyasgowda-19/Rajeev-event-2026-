const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'patient',
      phone,
      location,
      firebaseUid: 'local_' + Date.now()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account uses Firebase login. Please use Firebase authentication.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.role;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// DELETE USER FUNCTION - NEW!
// ============================================

// Delete own account (User can delete themselves)
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all related data based on role
    if (user.role === 'doctor') {
      // Find doctor profile
      const doctor = await Doctor.findOne({ user: userId });
      
      if (doctor) {
        // Delete all appointments of this doctor
        await Appointment.deleteMany({ doctor: doctor._id });
        
        // Delete doctor profile
        await Doctor.findByIdAndDelete(doctor._id);
      }
    } else if (user.role === 'patient') {
      // Delete all patient data
      await Report.deleteMany({ patient: userId });
      await Appointment.deleteMany({ patient: userId });
      await Prescription.deleteMany({ patient: userId });
    }

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete any user by ID
exports.deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account through this route' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all related data based on role
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      
      if (doctor) {
        await Appointment.deleteMany({ doctor: doctor._id });
        await Doctor.findByIdAndDelete(doctor._id);
      }
    } else if (user.role === 'patient') {
      await Report.deleteMany({ patient: userId });
      await Appointment.deleteMany({ patient: userId });
      await Prescription.deleteMany({ patient: userId });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: `User ${user.email} deleted successfully`
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
