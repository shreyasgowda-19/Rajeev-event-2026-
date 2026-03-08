# Rajeev-event-2026

# MediLink – Smart Patient-Doctor Bridge

**Tagline**  
Securely connect patients' health history with nearby trusted doctors — in one simple platform.

## The Problem

Patients struggle to share complete medical history with new doctors.  
Finding the right nearby specialist quickly is hard, especially in emergencies or new cities.  
Doctors waste time without quick access to past reports and prescriptions.

## What MediLink Does

Key features (MVP focused for 24-hour hackathon):

- Patients can **upload & store** health reports (PDFs/images) securely
- View personal **health timeline** — simple chronological view of all reports & prescriptions
- **Find nearby doctors** filtered by specialization + distance (geo-search)
- **Book appointments** with confirmation
- Doctors can view patient history (with permission) and write **digital prescriptions**
- Basic **notifications**: email + push for appointment updates & new prescriptions

## Unique / Winning Edge

- **Smart Health Timeline** — visual history of reports over years (easy for doctors to scan quickly)
- **Location-based doctor discovery** + rating/specialization filter (very practical in India)
- (Optional quick demo win) Simple report summary on upload (rule-based or fake AI: "High blood sugar detected")

## Target Users

- Patients (urban + semi-urban, frequent OPD visitors)
- Doctors (independent / small clinics)
- (Stretch) Admin panel to verify/approve doctors

## Tech Stack (Honest MVP Scope)

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Atlas)
- **Authentication & Push Notifications**: Firebase (Auth + FCM)
- **Email Notifications**: Nodemailer
- **Geo-location / Maps**: MongoDB 2dsphere geospatial queries

## Why This Project Stands Out

- Solves a **real daily pain point** in Indian healthcare: fragmented medical records + hard-to-find doctors
- Feels genuinely useful beyond the hackathon — friends and family could actually use it
- Strong **visual wow factor**: interactive health timeline + doctor cards + map pins
- Demonstrates solid full-stack balance: authentication, file uploads, geo-queries, notifications
- Realistic and achievable MVP within 24 hours (especially with demo data)

## 24-Hour Build Prioritization

1. Authentication (login/register + role system)  
2. Patient & Doctor basic profiles  
3. Report upload & storage  
4. Doctor discovery list (with fake/mock geo data initially)  
5. Appointment booking + prescription writing flow  
6. Basic notifications (email + push)

**Polish focus (last hours)**:  
Clean & modern UI, 4–5 dummy patients/doctors, beautiful cards & timeline view.
