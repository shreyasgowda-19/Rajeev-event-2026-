const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  phone: String,
  profilePhoto: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    address: String
  },
  dateOfBirth: Date,
  bloodGroup: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  fcmToken: String, // For push notifications
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
