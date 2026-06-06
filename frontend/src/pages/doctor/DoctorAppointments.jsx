import { useState, useEffect } from 'react';
import { doctorsApi } from '../../api/doctors';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Calendar, Clock, User, Search, Filter, 
  CheckCircle, XCircle, Check, X, ChevronRight,
  Stethoscope, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusTabs = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-600' },
  { value: 'pending', label: 'Pending', color: 'bg-warning-100 text-warning-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-success-100 text-success-600' },
  { value: 'completed', label: 'Completed', color: 'bg-primary-100 text-primary-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-error-100 text-error-600' },
];

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const profileRes = await doctorsApi.getProfile();
      const doctorId = profileRes.data.doctor._id;
      
      const { data } = await doctorsApi.getAppointments(doctorId);
      setAppointments(data.appointments || []);
      setFilteredAppointments(data.appointments || []);
    } catch (error) {
      console.error('Fetch appointments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments
  useEffect(() => {
    let filtered = appointments;

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(apt => apt.status === activeTab);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.symptoms?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(apt => 
        new Date(apt.appointmentDate).toISOString().split('T')[0] === selectedDate
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
    
    setFilteredAppointments(filtered);
  }, [activeTab, searchQuery, selectedDate, appointments]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await appointmentsApi.updateStatus(appointmentId, { status });
      fetchAppointments();
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    }
  };

  const handleComplete = async (appointmentId) => {
    // Navigate to prescription creation
    window.location.href = `/doctor/prescriptions/new?appointment=${appointmentId}`;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">Appointments</h1>
          <p className="text-theme-secondary mt-1">
            Manage your patient appointments
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by patient name or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-shrink-0">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {selectedDate && (
              <Button variant="secondary" onClick={() => setSelectedDate('')}>
                Clear Date
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
              {tab.value === 'all' 
                ? appointments.length 
                : appointments.filter(a => a.status === tab.value).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-theme-secondary">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((apt) => {
            const isToday = new Date().toDateString() === new Date(apt.appointmentDate).toDateString();
            const canConfirm = apt.status === 'pending';
            const canComplete = apt.status === 'confirmed' && isToday;
            const canCancel = ['pending', 'confirmed'].includes(apt.status);

            return (
              <Card key={apt._id} className={`${isToday ? 'border-l-4 border-l-primary-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary-600">
                          {apt.patient?.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-theme-primary text-lg">
                            {apt.patient?.name}
                          </h3>
                          {isToday && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full font-medium">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-theme-secondary flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {apt.timeSlot?.start} - {apt.timeSlot?.end}
                        </p>
                        {apt.symptoms && (
                          <p className="text-sm text-theme-secondary mt-2 line-clamp-2">
                            <Stethoscope className="w-4 h-4 inline mr-1" />
                            {apt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        statusTabs.find(t => t.value === apt.status)?.color || 'bg-gray-100'
                      }`}>
                        {apt.status}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {canConfirm && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                            className="p-2 bg-success-100 text-success-600 rounded-lg hover:bg-success-200"
                            title="Confirm Appointment"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        
                        {canComplete && (
                          <Link to={`/doctor/prescriptions/new?appointment=${apt._id}&patient=${apt.patient?._id}`}>
                            <Button size="sm" className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Complete & Prescribe</span>
                            </Button>
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                            className="p-2 bg-error-100 text-error-600 rounded-lg hover:bg-error-200"
                            title="Cancel Appointment"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                        <Link 
                          to={`/doctor/patients/${apt.patient?._id}`}
                          className="p-2 bg-theme-secondary text-theme-secondary rounded-lg hover:bg-theme-hover"
                          title="View Patient"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
