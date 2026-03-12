import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Calendar, FileText, Pill, Stethoscope, 
  ChevronRight, Clock, MapPin, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../../api/appointments';
import { reportsApi } from '../../api/reports';
import { prescriptionsApi } from '../../api/prescriptions';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalReports: 0,
    activePrescriptions: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, reportsRes, prescriptionsRes] = await Promise.all([
        appointmentsApi.getMyAppointments(),
        reportsApi.getMyReports(),
        prescriptionsApi.getMyPrescriptions(),
      ]);

      const appointments = appointmentsRes.data.appointments || [];
      const reports = reportsRes.data.reports || [];
      const prescriptions = prescriptionsRes.data.prescriptions || [];

      // Upcoming appointments (future dates, not cancelled)
      const upcoming = appointments.filter(
        a => new Date(a.appointmentDate) > new Date() && a.status !== 'cancelled'
      );

      // Active prescriptions (not expired)
      const activePrescriptions = prescriptions.filter(p => p.isActive);

      setStats({
        upcomingAppointments: upcoming.length,
        totalReports: reports.length,
        activePrescriptions: activePrescriptions.length,
      });

      setRecentAppointments(appointments.slice(0, 3));
      setRecentReports(reports.slice(0, 3));
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
      confirmed: 'bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-400',
      completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      cancelled: 'bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-400',
    };
    return colors[status] || colors.pending;
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
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-theme-secondary mt-1">
            Here's your health overview for today
          </p>
        </div>
        <Link to="/doctors">
          <Button className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4" />
            <span>Find Doctor</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
            <Calendar className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.upcomingAppointments}</p>
            <p className="text-sm text-theme-secondary">Upcoming Appointments</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-xl">
            <FileText className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.totalReports}</p>
            <p className="text-sm text-theme-secondary">Health Reports</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-xl">
            <Pill className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-theme-primary">{stats.activePrescriptions}</p>
            <p className="text-sm text-theme-secondary">Active Prescriptions</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span>Recent Appointments</span>
            </CardTitle>
            <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No appointments yet</p>
                <Link to="/doctors" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                  Book your first appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div 
                    key={apt._id} 
                    className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg border border-theme"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-theme-primary">
                          Dr. {apt.doctor?.user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-theme-secondary flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.timeSlot?.start}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-success-600" />
              <span>Recent Reports</span>
            </CardTitle>
            <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-theme-secondary">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reports uploaded</p>
                <Link to="/reports" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                  Upload your first report
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div 
                    key={report._id} 
                    className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg border border-theme"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-success-100 dark:bg-success-900/20 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-success-600" />
                      </div>
                      <div>
                        <p className="font-medium text-theme-primary truncate max-w-[150px]">
                          {report.title}
                        </p>
                        <p className="text-sm text-theme-secondary">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-theme-secondary capitalize">
                      {report.type}
                    </span>
                  </div>
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
            <Link to="/doctors">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm">Find Doctor</span>
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Upload Report</span>
              </Button>
            </Link>
            <Link to="/appointments">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">My Appointments</span>
              </Button>
            </Link>
            <Link to="/prescriptions">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center space-y-2">
                <Pill className="w-6 h-6" />
                <span className="text-sm">Prescriptions</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
