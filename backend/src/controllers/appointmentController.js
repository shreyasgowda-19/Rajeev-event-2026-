const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { sendAppointmentConfirmation } = require('../utils/emailService');
const { sendAppointmentNotification } = require('../utils/notificationService');

// Book appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.start': timeSlot.start,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      appointmentDate,
      timeSlot,
      symptoms,
      status: 'pending'
    });

    // Populate for notification
    await appointment.populate('doctor');
    await appointment.populate('patient');

    // Send notification to doctor
    const doctorUser = await User.findById(appointment.doctor.user);
    if (doctorUser && doctorUser.fcmToken) {
      await sendAppointmentNotification(doctorUser, 'booked', {
        patientName: appointment.patient.name,
        id: appointment._id
      });
    }

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my appointments
exports.getMyAppointments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      query = { doctor: doctor._id };
    } else {
      query = { patient: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone profilePhoto')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone profilePhoto' }
      })
      .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization check
    const doctor = await Doctor.findById(appointment.doctor);
    const isAuthorized = 
      req.user.role === 'admin' ||
      (req.user.role === 'doctor' && doctor && doctor.user.toString() === req.user.id) ||
      (req.user.role === 'patient' && appointment.patient._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
      appointment.cancelledBy = req.user.role;
    }

    await appointment.save();

    // Send notifications
    if (status === 'confirmed') {
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
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
