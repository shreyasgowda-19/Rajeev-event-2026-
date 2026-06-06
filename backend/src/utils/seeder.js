const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const dummyDoctors = [
  {
    name: "Dr. Rajesh Sharma",
    email: "dr.rajesh@medilink.com",
    phone: "+91 98765 43210",
    specialization: "Cardiologist",
    experience: 15,
    clinicAddress: "Heart Care Center, 123 MG Road, Mumbai 400001",
    clinicLocation: { type: "Point", coordinates: [72.8777, 19.0760] },
    licenseNumber: "MCI-12345-2010",
    consultationFee: 800,
    rating: 4.8,
    about: "Senior cardiologist with 15+ years experience in interventional cardiology and heart failure management.",
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "09:00", end: "17:00", isWorking: true },
      friday: { start: "09:00", end: "17:00", isWorking: true },
      saturday: { start: "10:00", end: "14:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "AIIMS Delhi", year: 2005 },
      { degree: "MD Cardiology", institution: "Mumbai University", year: 2010 }
    ]
  },
  {
    name: "Dr. Priya Patel",
    email: "dr.priya@medilink.com",
    phone: "+91 98765 43211",
    specialization: "Dermatologist",
    experience: 12,
    clinicAddress: "Skin Care Clinic, 456 Bandra West, Mumbai 400050",
    clinicLocation: { type: "Point", coordinates: [72.8296, 19.0600] },
    licenseNumber: "MCI-23456-2013",
    consultationFee: 600,
    rating: 4.9,
    about: "Expert in cosmetic dermatology, acne treatment, and skin cancer screening.",
    workingHours: {
      monday: { start: "10:00", end: "18:00", isWorking: true },
      tuesday: { start: "10:00", end: "18:00", isWorking: true },
      wednesday: { start: "10:00", end: "18:00", isWorking: true },
      thursday: { start: "10:00", end: "18:00", isWorking: true },
      friday: { start: "10:00", end: "18:00", isWorking: true },
      saturday: { start: "11:00", end: "15:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "KEM Hospital Mumbai", year: 2008 },
      { degree: "MD Dermatology", institution: "Nair Hospital", year: 2013 }
    ]
  },
  {
    name: "Dr. Amit Kumar",
    email: "dr.amit@medilink.com",
    phone: "+91 98765 43212",
    specialization: "Orthopedic",
    experience: 18,
    clinicAddress: "Bone & Joint Clinic, 789 Andheri East, Mumbai 400069",
    clinicLocation: { type: "Point", coordinates: [72.8691, 19.1197] },
    licenseNumber: "MCI-34567-2008",
    consultationFee: 900,
    rating: 4.7,
    about: "Specialist in joint replacement surgery, sports injuries, and spine disorders.",
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "09:00", end: "17:00", isWorking: true },
      friday: { start: "09:00", end: "17:00", isWorking: true },
      saturday: { start: "09:00", end: "13:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "Grant Medical College", year: 2003 },
      { degree: "MS Orthopedics", institution: "Seth GSMC", year: 2008 }
    ]
  },
  {
    name: "Dr. Sunita Desai",
    email: "dr.sunita@medilink.com",
    phone: "+91 98765 43213",
    specialization: "Pediatrician",
    experience: 14,
    clinicAddress: "Child Care Center, 321 Dadar West, Mumbai 400028",
    clinicLocation: { type: "Point", coordinates: [72.8400, 19.0178] },
    licenseNumber: "MCI-45678-2012",
    consultationFee: 500,
    rating: 4.9,
    about: "Child specialist focusing on pediatric nutrition, vaccinations, and developmental disorders.",
    workingHours: {
      monday: { start: "09:30", end: "18:30", isWorking: true },
      tuesday: { start: "09:30", end: "18:30", isWorking: true },
      wednesday: { start: "09:30", end: "18:30", isWorking: true },
      thursday: { start: "09:30", end: "18:30", isWorking: true },
      friday: { start: "09:30", end: "18:30", isWorking: true },
      saturday: { start: "10:00", end: "16:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "BJ Medical College Pune", year: 2007 },
      { degree: "DCH Pediatrics", institution: "Wadia Hospital", year: 2012 }
    ]
  },
  {
    name: "Dr. Vikram Mehta",
    email: "dr.vikram@medilink.com",
    phone: "+91 98765 43214",
    specialization: "Neurologist",
    experience: 16,
    clinicAddress: "Brain & Nerve Center, 555 Juhu, Mumbai 400049",
    clinicLocation: { type: "Point", coordinates: [72.8308, 19.1075] },
    licenseNumber: "MCI-56789-2010",
    consultationFee: 1000,
    rating: 4.8,
    about: "Neurology expert specializing in stroke management, epilepsy, and migraine treatment.",
    workingHours: {
      monday: { start: "10:00", end: "18:00", isWorking: true },
      tuesday: { start: "10:00", end: "18:00", isWorking: true },
      wednesday: { start: "10:00", end: "18:00", isWorking: true },
      thursday: { start: "10:00", end: "18:00", isWorking: true },
      friday: { start: "10:00", end: "18:00", isWorking: true },
      saturday: { start: "", end: "", isWorking: false },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "AIIMS Delhi", year: 2005 },
      { degree: "DM Neurology", institution: "NIMHANS Bangalore", year: 2010 }
    ]
  },
  {
    name: "Dr. Anjali Gupta",
    email: "dr.anjali@medilink.com",
    phone: "+91 98765 43215",
    specialization: "Gynecologist",
    experience: 13,
    clinicAddress: "Women's Health Clinic, 888 Borivali West, Mumbai 400092",
    clinicLocation: { type: "Point", coordinates: [72.8567, 19.2307] },
    licenseNumber: "MCI-67890-2013",
    consultationFee: 700,
    rating: 4.9,
    about: "Expert in high-risk pregnancies, fertility treatments, and minimally invasive surgeries.",
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "09:00", end: "17:00", isWorking: true },
      friday: { start: "09:00", end: "17:00", isWorking: true },
      saturday: { start: "10:00", end: "14:00", isWorking: true },
      sunday: { start: "", end: "", isWorking: false }
    },
    qualifications: [
      { degree: "MBBS", institution: "Lady Hardinge Medical College", year: 2008 },
      { degree: "MD Obstetrics & Gynecology", institution: "Cama Hospital", year: 2013 }
    ]
  }
];

async function seedDoctors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    for (const docData of dummyDoctors) {
      // Check if user exists
      let user = await User.findOne({ email: docData.email });
      
      if (!user) {
        // Create user
        user = await User.create({
          name: docData.name,
          email: docData.email,
          password: 'doctor123', // Default password for testing
          role: 'doctor',
          phone: docData.phone,
          location: {
            coordinates: docData.clinicLocation.coordinates,
            address: docData.clinicAddress
          },
          isVerified: true
        });
        console.log(`✅ Created user: ${user.name}`);
      }

      // Check if doctor profile exists
      let doctor = await Doctor.findOne({ user: user._id });
      
      if (!doctor) {
        // Create doctor profile
        doctor = await Doctor.create({
          user: user._id,
          specialization: docData.specialization,
          experience: docData.experience,
          qualifications: docData.qualifications,
          clinicAddress: docData.clinicAddress,
          clinicLocation: docData.clinicLocation,
          licenseNumber: docData.licenseNumber,
          consultationFee: docData.consultationFee,
          rating: docData.rating,
          about: docData.about,
          workingHours: docData.workingHours,
          isAvailable: true,
          isVerified: true
        });
        console.log(`✅ Created doctor profile: ${doctor.specialization}`);
      }
    }

    console.log('\n🎉 Successfully seeded all dummy doctors!');
    console.log('\nTest accounts:');
    console.log('Email: dr.rajesh@medilink.com, Password: doctor123');
    console.log('Email: dr.priya@medilink.com, Password: doctor123');
    console.log('... and 4 more doctors');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDoctors();
}

module.exports = seedDoctors;
