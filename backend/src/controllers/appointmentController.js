const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendAppointmentConfirmation } = require('../utils/emailService');
const { sendAppointmentNotification } = require('../utils/notificationService');

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms, notes } = req.body;

    // Validate doctorId is a valid MongoDB ObjectId (not OpenStreetMap)
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid doctor ID. Can only book appointments with registered MediLink doctors, not external hospitals.' 
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.start': timeSlot.start,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false,
        message: 'This time slot is already booked. Please select another time.' 
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      symptoms,
      notes,
      status: 'pending'
    });

    // Populate for response
    await appointment.populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name email phone' }
    });
    await appointment.populate('patient', 'name email');

    // Send notification to doctor
    try {
      const doctorUser = await User.findById(doctor.user);
      if (doctorUser && doctorUser.fcmToken) {
        await sendAppointmentNotification(doctorUser, 'booked', {
          patientName: appointment.patient.name,
          id: appointment._id
        });
      }
    } catch (notifError) {
      console.log('Notification failed (non-critical):', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to book appointment' 
    });
  }
};

// Get my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor profile not found' 
        });
      }
      query = { doctor: doctor._id };
    } else {
      query = { patient: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone profilePhoto')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone profilePhoto specialization' }
      })
      .populate('prescription')
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email fcmToken')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email fcmToken' }
      });

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Authorization check
    const doctor = await Doctor.findById(appointment.doctor);
    const isAuthorized = 
      req.user.role === 'admin' ||
      (req.user.role === 'doctor' && doctor && doctor.user.toString() === req.user.id) ||
      (req.user.role === 'patient' && appointment.patient._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this appointment' 
      });
    }

    appointment.status = status;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
      appointment.cancelledBy = req.user.role;
    }

    await appointment.save();

    // Send notifications
    if (status === 'confirmed') {
      try {
        // Email to patient
        await sendAppointmentConfirmation(
          appointment.patient,
          appointment,
          { name: appointment.doctor.user.name }
        );
        
        // Push notification to patient
        if (appointment.patient.fcmToken) {
          await sendAppointmentNotification(appointment.patient, 'confirmed', {
            doctorName: appointment.doctor.user.name,
            id: appointment._id
          });
        }
      } catch (notifError) {
        console.log('Notification failed (non-critical):', notifError.message);
      }
    }

    res.json({
      success: true,
      message: `Appointment ${status}`,
      appointment
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get single appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth bloodGroup profilePhoto')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone profilePhoto' }
      })
      .populate('prescription');

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
