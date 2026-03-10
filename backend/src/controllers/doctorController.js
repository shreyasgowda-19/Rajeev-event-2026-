const Doctor = require('../models/Doctor');
const User = require('../models/User');
const geolib = require('geolib');
const { searchNearbyHospitals, geocodeAddress, reverseGeocode } = require('../utils/nominatimService');

// Create doctor profile
exports.createDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      qualifications,
      clinicAddress,
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

    // Geocode the clinic address to get coordinates
    let clinicLocation = req.body.clinicLocation;
    
    if (clinicAddress && !clinicLocation) {
      const geocoded = await geocodeAddress(clinicAddress);
      if (geocoded) {
        clinicLocation = {
          type: 'Point',
          coordinates: [geocoded.lng, geocoded.lat]
        };
      }
    }

    const doctor = await Doctor.create({
      user: req.user.id,
      specialization,
      experience,
      qualifications,
      clinicAddress,
      clinicLocation: clinicLocation || {
        type: 'Point',
        coordinates: [0, 0]
      },
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
    console.error('Create doctor profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors with filters + real hospitals from Nominatim
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      lat,
      lng,
      radius = 10000, // 10km default
      sortBy = 'rating',
      includeRealHospitals = 'true' // New parameter
    } = req.query;

    let query = { isVerified: true, isAvailable: true };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone profilePhoto')
      .sort({ [sortBy]: -1 });

    // Filter by location if coordinates provided
    let platformDoctors = doctors;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const searchRadius = parseInt(radius);

      platformDoctors = doctors.filter(doctor => {
        if (!doctor.clinicLocation || !doctor.clinicLocation.coordinates) return false;
        
        const distance = geolib.getDistance(
          { latitude: userLat, longitude: userLng },
          { 
            latitude: doctor.clinicLocation.coordinates[1], 
            longitude: doctor.clinicLocation.coordinates[0] 
          }
        );
        return distance <= searchRadius;
      }).map(doctor => {
        const distance = geolib.getDistance(
          { latitude: userLat, longitude: userLng },
          { 
            latitude: doctor.clinicLocation.coordinates[1], 
            longitude: doctor.clinicLocation.coordinates[0] 
          }
        );
        return { 
          ...doctor.toObject(), 
          distance,
          source: 'platform' // Mark as platform doctor
        };
      });

      platformDoctors.sort((a, b) => a.distance - b.distance);
    }

    // Fetch real hospitals from OpenStreetMap if requested
    let realHospitals = [];
    if (lat && lng && includeRealHospitals === 'true') {
      realHospitals = await searchNearbyHospitals(lat, lng, radius);
      
      // Format to match doctor structure
      realHospitals = realHospitals.map(hospital => ({
        _id: `osm_${hospital.id}`,
        name: hospital.name,
        clinicAddress: hospital.address,
        clinicLocation: {
          type: 'Point',
          coordinates: [hospital.location.lng, hospital.location.lat]
        },
        specialization: detectSpecialization(hospital.name, hospital.type),
        distance: hospital.distance,
        phone: hospital.phone,
        website: hospital.website,
        openingHours: hospital.openingHours,
        emergency: hospital.emergency,
        source: 'openstreetmap',
        isRealHospital: true,
        rating: 0,
        experience: 0,
        user: {
          name: hospital.name,
          phone: hospital.phone || 'Not available'
        }
      }));
    }

    // Combine platform doctors and real hospitals
    const allResults = [...platformDoctors, ...realHospitals]
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    res.json({
      success: true,
      count: {
        platform: platformDoctors.length,
        realHospitals: realHospitals.length,
        total: allResults.length
      },
      doctors: allResults,
      searchLocation: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Detect specialization from hospital name
const detectSpecialization = (name, type) => {
  const name_lower = name.toLowerCase();
  
  const specializations = {
    'cardiac': 'Cardiology',
    'heart': 'Cardiology',
    'ortho': 'Orthopedics',
    'bone': 'Orthopedics',
    'pediatric': 'Pediatrics',
    'child': 'Pediatrics',
    'maternity': 'Gynecology',
    'women': 'Gynecology',
    'eye': 'Ophthalmology',
    'dental': 'Dentistry',
    'tooth': 'Dentistry',
    'mental': 'Psychiatry',
    'cancer': 'Oncology',
    'neuro': 'Neurology',
    'brain': 'Neurology',
    'skin': 'Dermatology',
    'kidney': 'Nephrology',
    'liver': 'Hepatology'
  };

  for (const [keyword, spec] of Object.entries(specializations)) {
    if (name_lower.includes(keyword)) return spec;
  }

  if (type === 'hospital') return 'Multi-Specialty';
  if (type === 'clinic') return 'General Practice';
  return 'General';
};

// Geocode address endpoint
exports.geocodeClinicAddress = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const result = await geocodeAddress(address);
    
    if (!result) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({
      success: true,
      location: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reverse geocode endpoint
exports.reverseGeocodeLocation = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const result = await reverseGeocode(lat, lng);
    
    if (!result) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({
      success: true,
      address: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single doctor
exports.getDoctorById = async (req, res) => {
  try {
    // Check if it's an OpenStreetMap ID
    if (req.params.id.startsWith('osm_')) {
      return res.status(400).json({ 
        message: 'Real hospital details not available. Please visit directly.' 
      });
    }

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
    
    // If address changed, re-geocode
    if (updates.clinicAddress && !updates.clinicLocation) {
      const geocoded = await geocodeAddress(updates.clinicAddress);
      if (geocoded) {
        updates.clinicLocation = {
          type: 'Point',
          coordinates: [geocoded.lng, geocoded.lat]
        };
      }
    }
    
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
