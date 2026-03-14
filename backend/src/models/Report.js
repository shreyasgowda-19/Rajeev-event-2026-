const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['lab_report', 'prescription', 'imaging', 'discharge_summary', 'other'],
    default: 'other'
  },
  // Local file storage info
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  // File stored locally or externally
  storageType: {
    type: String,
    enum: ['local', 'firebase'],
    default: 'local'
  },
  description: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full file path
reportSchema.virtual('fullFilePath').get(function() {
  if (this.storageType === 'local') {
    return `${process.env.BACKEND_URL || 'http://localhost:5000'}${this.fileUrl}`;
  }
  return this.fileUrl;
});

module.exports = mongoose.model('Report', reportSchema);
