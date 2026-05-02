import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Calendar, Users, Clock, CheckCircle, XCircle, 
  TrendingUp, DollarSign, Activity, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doctorsApi } from '../../api/doctors';
import { appointmentsApi } from '../../api/appointments';

export function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    monthlyEarnings: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get doctor profile and appointments
      const profileRes = await doctorsApi.getProfile();
      const doctorId = profileRes.data.doctor._id;
      
      const appointmentsRes = await doctorsApi.getAppointments(doctorId);
      const appointments = appointmentsRes.data.appointments || [];

      // Today's appointments
      const today = new Date().toDateString();
      const todayApts = appointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      );

      // Pending appointments
      const pending = appointments.filter(apt => apt.status === 'pending');

      // Calculate stats
      const uniquePatients = [...new Set(appointments.map(apt => apt.patient?._id?.toString()))];
      const monthlyEarnings = appointments
        .filter(apt => apt.status === 'completed' && new Date(apt.appointmentDate).getMonth() === new Date().getMonth())
        .reduce((sum, apt) => sum + (apt.doctor?.consultationFee || 500), 0);

      setStats({
        todayAppointments: todayApts.length,
        pendingAppointments: pending.length,
        totalPatients: uniquePatients.length,
        monthlyEarnings
      });

      setTodayAppointments(todayApts.slice(0, 5));
      
      // Get recent unique patients
      const patientMap = new Map();
      appointments.forEach(apt => {
        if (apt.patient && !patientMap.has(apt.patient._id)) {
          patientMap.set(apt.patient._id, {
            ...apt.patient,
            lastVisit: apt.appointmentDate
          });
        }
      });
      setRecentPatients(Array.from(patientMap.values()).slice(0, 5));
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await appointmentsApi.updateStatus(appointmentId, { status });
      fetchDashboardData();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning-100 text-warning-600',
      confirmed: 'bg-success-100 text-success-600',
      completed: 'bg-primary-100 text-primary-600',
      cancelled: 'bg-error-100 text-error-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">
          Welcome, Dr. {user?.name?.split(' ')[1] || user?.name} 👋
        </h1>
        <p className="text-theme-secondary mt-1">
          Here's your practice overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.todayAppointments}</p>
            <p className="text-sm text-theme-secondary">Today's Appointments</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-xl">
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.pendingAppointments}</p>
            <p className="text-sm text-theme-secondary">Pending Requests</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
            <Users className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalPatients}</p>
            <p className="text-sm text-theme-secondary">Total Patients</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">₹{stats.monthlyEarnings}</p>
            <p className="text-sm text-theme-secondary">This Month</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span>Today's Schedule</span>
            </CardTitle>
            <Link to="/doctor/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div 
                    key={apt._id} 
                    className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary-600">
                          {apt.patient?.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-theme-primary">{apt.patient?.name}</p>
                        <p className="text-sm text-theme-secondary">
                          {apt.timeSlot?.start} • {apt.symptoms?.substring(0, 30)}...
                        </p>
                      </div>
                    </div>
                    
                    {apt.status === 'pending' ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                          className="p-1.5 bg-success-100 text-success-600 rounded-lg hover:bg-success-200"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                          className="p-1.5 bg-error-100 text-error-600 rounded-lg hover:bg-error-200"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-success-600" />
              <span>Recent Patients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No patients yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <Link
                    key={patient._id}
                    to={`/doctor/patients/${patient._id}`}
                    className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-success-600">
                          {patient.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-theme-primary">{patient.name}</p>
                        <p className="text-sm text-theme-secondary">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-theme-secondary" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/doctor/appointments">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Appointments</span>
              </Button>
            </Link>
            <Link to="/doctor/profile">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">My Profile</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Earnings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
