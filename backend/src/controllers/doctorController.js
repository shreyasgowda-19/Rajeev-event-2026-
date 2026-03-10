const Doctor = require('../models/Doctor');
const User = require('../models/User');
const geolib = require('geolib');

// Create doctor profile
exports.createDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      qualifications,
      clinicAddress,
      clinicLocation,
      licenseNumber,
      consultationFee,
      workingHours,
      about
    } = req.body;

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: req.user.id });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctor = await Doctor.create({
      user: req.user.id,
      specialization,
      experience,
      qualifications,
      clinicAddress,
      clinicLocation,
      licenseNumber,
      consultationFee: consultationFee || 0,
      workingHours,
      about
    });

    // Update user role to doctor
    await User.findByIdAndUpdate(req.user.id, { role: 'doctor' });

    res.status(201).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors with filters
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      lat,
      lng,
      radius = 10000, // 10km default
      sortBy = 'rating'
    } = req.query;

    let query = { isVerified: true, isAvailable: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone profilePhoto')
      .sort({ [sortBy]: -1 });

    // Filter by location if coordinates provided
    if (lat && lng) {
      doctors = doctors.filter(doctor => {
        const distance = geolib.getDistance(
          { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          { 
            latitude: doctor.clinicLocation.coordinates[1], 
            longitude: doctor.clinicLocation.coordinates[0] 
          }
        );
        return distance <= parseInt(radius);
      });

      // Add distance to each doctor
      doctors = doctors.map(doctor => {
        const distance = geolib.getDistance(
          { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          { 
            latitude: doctor.clinicLocation.coordinates[1], 
            longitude: doctor.clinicLocation.coordinates[0] 
          }
        );
        return { ...doctor.toObject(), distance };
      });

      doctors.sort((a, b) => a.distance - b.distance);
    }

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single doctor
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone profilePhoto');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'name email phone profilePhoto')
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
