const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lab_report', 'prescription', 'imaging', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  description: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
