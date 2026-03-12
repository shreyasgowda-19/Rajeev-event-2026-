import { useState, useEffect } from 'react';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Calendar, Clock, MapPin, Video, X, CheckCircle, 
  AlertCircle, ChevronRight, Filter 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-warning-100 text-warning-600 dark:bg-warning-900/20',
    icon: AlertCircle 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-success-100 text-success-600 dark:bg-success-900/20',
    icon: CheckCircle 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-error-100 text-error-600 dark:bg-error-900/20',
    icon: X 
  },
};

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await appointmentsApi.getMyAppointments();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Fetch appointments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentsApi.updateStatus(appointmentId, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by patient'
      });
      fetchAppointments();
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel appointment');
    }
  };

  const filteredAppointments = filterStatus
    ? appointments.filter(a => a.status === filterStatus)
    : appointments;

  // Sort: upcoming first, then by date
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    return dateB - dateA;
  });

  const upcomingAppointments = sortedAppointments.filter(
    a => ['pending', 'confirmed'].includes(a.status) && new Date(a.appointmentDate) >= new Date()
  );

  const pastAppointments = sortedAppointments.filter(
    a => !upcomingAppointments.includes(a)
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">My Appointments</h1>
          <p className="text-theme-secondary mt-1">
            {upcomingAppointments.length} upcoming appointments
          </p>
        </div>
        
        <Link to="/doctors">
          <Button className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Book New</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-theme-secondary flex-shrink-0" />
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !filterStatus 
              ? 'bg-primary-600 text-white' 
              : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
          }`}
        >
          All
        </button>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === status
                ? 'bg-primary-600 text-white'
                : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Upcoming Section */}
      {upcomingAppointments.length > 0 && !filterStatus && (
        <div>
          <h2 className="text-lg font-semibold text-theme-primary mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
            Upcoming Appointments
          </h2>
          <div className="grid gap-4">
            {upcomingAppointments.map((apt) => (
              <AppointmentCard 
                key={apt._id} 
                appointment={apt} 
                onCancel={handleCancel}
                isUpcoming={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past/Appointment History */}
      <div>
        <h2 className="text-lg font-semibold text-theme-primary mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-theme-secondary" />
          {filterStatus ? 'Filtered Appointments' : 'Appointment History'}
        </h2>
        
        {pastAppointments.length === 0 && upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-theme-secondary">No appointments found</p>
              <Link to="/doctors" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                Book your first appointment
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pastAppointments.map((apt) => (
              <AppointmentCard 
                key={apt._id} 
                appointment={apt} 
                onCancel={handleCancel}
                isUpcoming={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, onCancel, isUpcoming }) {
  const status = statusConfig[appointment.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  const appointmentDate = new Date(appointment.appointmentDate);
  const isToday = new Date().toDateString() === appointmentDate.toDateString();
  
  return (
    <Card className={`transition-all hover:shadow-md ${isUpcoming ? 'border-l-4 border-l-primary-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Date & Time */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
              isToday ? 'bg-primary-600 text-white' : 'bg-theme-secondary text-theme-primary'
            }`}>
              <span className="text-xs font-medium uppercase">
                {appointmentDate.toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-xl font-bold">
                {appointmentDate.getDate()}
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold text-theme-primary text-lg">
                Dr. {appointment.doctor?.user?.name || 'Unknown'}
              </h3>
              <p className="text-primary-600 font-medium">
                {appointment.doctor?.specialization}
              </p>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-theme-secondary">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {appointment.timeSlot?.start} - {appointment.timeSlot?.end}
                </span>
                {isToday && (
                  <span className="text-primary-600 font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center justify-between md:justify-end space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${status.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{status.label}</span>
            </span>

            <div className="flex items-center space-x-2">
              {appointment.status === 'confirmed' && isUpcoming && (
                <>
                  {appointment.meetingLink && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join</span>
                    </a>
                  )}
                  <button
                    onClick={() => onCancel(appointment._id)}
                    className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                    title="Cancel appointment"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <Link 
                to={`/appointments/${appointment._id}`}
                className="p-2 text-theme-secondary hover:bg-theme-secondary rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Symptoms Preview */}
        {appointment.symptoms && (
          <div className="mt-4 pt-4 border-t border-theme">
            <p className="text-sm text-theme-secondary">
              <span className="font-medium">Symptoms:</span> {appointment.symptoms}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
