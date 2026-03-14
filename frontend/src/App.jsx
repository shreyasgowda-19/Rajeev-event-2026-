import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/patient/Dashboard';
import { FindDoctors } from './pages/patient/FindDoctors';
import { DoctorDetail } from './pages/patient/DoctorDetail';
import { BookAppointment } from './pages/patient/BookAppointment';
import { Reports } from './pages/patient/Reports';
import { Appointments } from './pages/patient/Appointments';
import { Prescriptions } from './pages/patient/Prescriptions';
import { Profile } from './pages/patient/Profile';

// Doctor pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { PatientDetail } from './pages/doctor/PatientDetail';
import { CreatePrescription } from './pages/doctor/CreatePrescription';
import { DoctorProfile } from './pages/doctor/DoctorProfile';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-theme-secondary pt-4 pb-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}

// Public Route (no navbar)
function PublicRoute({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Patient Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <FindDoctors />
          </ProtectedRoute>
        } />

        <Route path="/doctors/:id" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorDetail />
          </ProtectedRoute>
        } />

        <Route path="/doctors/:id/book" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Appointments />
          </ProtectedRoute>
        } />

        <Route path="/prescriptions" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Prescriptions />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />

        <Route path="/doctor/patients/:id" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <PatientDetail />
          </ProtectedRoute>
        } />

        <Route path="/doctor/prescriptions/new" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <CreatePrescription />
          </ProtectedRoute>
        } />

        <Route path="/doctor/profile" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorProfile />
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
