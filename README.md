# Rajeev-event-2026
 
# 🩺 MediLink – Smart Patient-Doctor Bridge

&gt; **Tagline:** Connect patients and nearby doctors through a simple digital health record and appointment platform.

## 🎯 Problem Statement

Healthcare information is often scattered and difficult to access. Patients frequently face problems such as:
- Medical reports stored in **different hospitals or paper files**
- Difficulty **finding nearby trusted doctors**
- Trouble **sharing medical history quickly**
- Doctors spending extra time understanding patient history

Because of this, consultations become slower and less effective.

---

## 💡 Solution

**MediLink** is a simple platform that connects patients and doctors. It allows patients to:
- Store health reports digitally
- Find nearby doctors based on specialization
- Book appointments
- Share reports with doctors instantly

Doctors can:
- View patient history
- Manage appointments
- Write digital prescriptions

The system creates a **simple digital bridge between patients and doctors**.

---

## ✨ Core Features (MVP)

### 1. Patient Health Record Storage
Patients can upload:
- Medical reports
- Lab results
- Prescriptions

All reports are stored securely in the patient profile.

### 2. Health Timeline
Reports and prescriptions are displayed in a **chronological timeline**, making it easy for doctors to quickly understand patient history.

### 3. Nearby Doctor Discovery
Patients can search doctors by:
- Specialization
- Distance
- Ratings

The system uses location-based search to show nearby doctors.

### 4. Appointment Booking
Patients can:
- Select a doctor
- Choose appointment time
- Book a visit

Doctors receive the appointment request in their dashboard.

### 5. Digital Prescription
Doctors can:
- View patient reports
- Add prescriptions
- Share medical notes

Prescriptions appear in the patient timeline.

### 6. Notifications
Users receive notifications when:
- Appointment is booked
- Appointment is confirmed
- Doctor uploads prescription

Notifications are sent through:
- Email
- Push notifications

---

## 👥 Target Users

| Role | Description |
|------|-------------|
| **Patients** | People who need a simple way to store health records and find doctors |
| **Doctors** | Clinics and independent doctors who want faster access to patient history |
| **Admin** | System administrators who verify doctors and manage the platform |

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | Firebase Authentication |
| **Notifications** | Firebase Cloud Messaging, Nodemailer (Email) |
| **Version Control** | GitHub |

---

## 🏗 System Architecture

Users (Patient / Doctor / Admin)
│
│
Frontend – React + Tailwind
│
│ API Requests
│
Backend – Node.js + Express
│
│
MongoDB Database
│
├── Users
├── Doctors
├── Reports
├── Appointments
└── Prescriptions
│
│
Firebase Services
├── Authentication
└── Push Notifications


---

## 🔄 System Workflow

### Patient Workflow
1. Patient registers or logs in
2. Patient creates a health profile
3. Patient uploads medical reports
4. Patient searches for nearby doctors
5. Patient books an appointment

### Doctor Workflow
1. Doctor logs into the system
2. Doctor views appointment requests
3. Doctor accesses patient medical reports
4. Doctor writes a prescription

### Notification Workflow

Patient books appointment

↓

Backend processes request

↓

Doctor receives notification

↓

Doctor confirms appointment

↓

Patient receives confirmation email



---

## 🗄 Database Structure

### Users
```json
{
  "name": "String",
  "email": "String",
  "role": "patient | doctor | admin",
  "profilePhoto": "String",
  "location": "Object"
}

```

### Doctors

```{
  "userId": "ObjectId",
  "specialization": "String",
  "experience": "Number",
  "clinicAddress": "String",
  "rating": "Number",
  "location": "Object"
}
```

### Reports

```
{
  "patientId": "ObjectId",
  "reportTitle": "String",
  "reportFile": "String",
  "uploadDate": "Date"
}
```

### Appointments
```
{
  "doctorId": "ObjectId",
  "patientId": "ObjectId",
  "medicines": "Array",
  "notes": "String",
  "createdAt": "Date"
}
```

### Prescriptions

```
{
  "doctorId": "ObjectId",
  "patientId": "ObjectId",
  "medicines": "Array",
  "notes": "String",
  "createdAt": "Date"
}
```

| Type                    | Description                                               | Examples                                        |
| ----------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| **Unit Testing**        | Testing individual backend APIs                           | Login API, Appointment API                      |
| **Integration Testing** | Testing communication between Frontend, Backend, Database | End-to-end API flows                            |
| **Manual Testing**      | Testing user actions                                      | Registration, Upload reports, Book appointments |

## 🚀 Deployment

### Process
1. Code pushed to GitHub
2. Build and testing executed
3. Frontend deployed to **Vercel**
4. Backend deployed to **Render**

### Benefits
- Fast deployment
- Continuous updates
- Reliable hosting

---

## 🌟 Why This Project Matters

MediLink solves a real healthcare problem:
- Medical records are scattered
- Patients struggle to find doctors
- Doctors lack patient history

This platform creates a **simple digital connection between patients and doctors**, improving healthcare efficiency.

---

## 🔮 Future Improvements

- [ ] AI-based health report analysis
- [ ] Telemedicine video consultation
- [ ] Integration with wearable health devices
- [ ] National digital health record system
