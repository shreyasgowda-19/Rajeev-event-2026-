const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: String,
    end: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  symptoms: String,
  notes: String,
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  meetingLink: String, // For future telemedicine
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system']
  },
  cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
