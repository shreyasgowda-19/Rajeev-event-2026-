const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { sendAppointmentNotification } = require('../utils/notificationService');

exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, medicines, diagnosis, notes, advice, followUpDate } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify doctor
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      doctor: req.user.id,
      patient: appointment.patient,
      medicines,
      diagnosis,
      notes,
      advice,
      followUpDate
    });

    // Update appointment with prescription
    appointment.prescription = prescription._id;
    appointment.status = 'completed';
    await appointment.save();

    // Send notification to patient
    const patient = await User.findById(appointment.patient);
    await sendAppointmentNotification(patient, 'prescription', {
      id: appointment._id
    });

    res.status(201).json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .populate({
        path: 'appointment',
        select: 'appointmentDate'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'name email')
      .populate('patient', 'name email')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Authorization
    if (
      prescription.patient._id.toString() !== req.user.id &&
      prescription.doctor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};