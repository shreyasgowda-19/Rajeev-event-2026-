const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../config/firebase');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { firebaseUid, email, name, role, phone, location } = req.body;

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(firebaseUid);
    
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({
      firebaseUid: decodedToken.uid,
      email,
      name,
      role: role || 'patient',
      phone,
      location
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
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { firebaseToken, fcmToken } = req.body;

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(firebaseToken);
    
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Update FCM token for push notifications
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
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
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('doctorProfile');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.role; // Prevent role modification
    delete updates.firebaseUid;

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
