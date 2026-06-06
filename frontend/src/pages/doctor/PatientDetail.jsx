import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsApi } from '../../api/reports';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  User, Calendar, FileText, ChevronLeft, 
  Phone, Mail, MapPin, Activity, Pill
} from 'lucide-react';

export function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      // Get shared reports
      const reportsRes = await reportsApi.getPatientReports(id);
      setReports(reportsRes.data.reports || []);

      // Get appointments with this patient
      const appointmentsRes = await appointmentsApi.getMyAppointments();
      const patientAppointments = appointmentsRes.data.appointments?.filter(
        apt => apt.patient?._id === id
      ) || [];
      setAppointments(patientAppointments);

      if (patientAppointments.length > 0) {
        setPatient(patientAppointments[0].patient);
        
        // Get prescriptions from appointments
        const prescriptionsList = patientAppointments
          .filter(apt => apt.prescription)
          .map(apt => apt.prescription);
        setPrescriptions(prescriptionsList);
      }
    } catch (error) {
      console.error('Fetch patient data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-theme-secondary">Patient not found</p>
        <Link to="/doctor/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/doctor/dashboard" className="inline-flex items-center text-theme-secondary hover:text-theme-primary">
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary-600">
                {patient.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-theme-primary">{patient.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-theme-secondary">
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {patient.phone || 'Not provided'}
                </span>
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {patient.email}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {patient.location?.address || 'Location not set'}
                </span>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Link to={`/doctor/prescriptions/new?patient=${id}`}>
                  <Button className="flex items-center space-x-2">
                    <Pill className="w-4 h-4" />
                    <span>Create Prescription</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-theme">
        {['overview', 'history', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-all ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{appointments.length}</p>
              <p className="text-theme-secondary">Total Visits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success-600">{prescriptions.length}</p>
              <p className="text-theme-secondary">Prescriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning-600">{reports.length}</p>
              <p className="text-theme-secondary">Shared Reports</p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 border-b border-theme last:border-0">
                  <div>
                    <p className="font-medium text-theme-primary">
                      {apt.status === 'completed' ? 'Consultation' : 'Appointment'}
                    </p>
                    <p className="text-sm text-theme-secondary">
                      {new Date(apt.appointmentDate).toLocaleDateString()} • {apt.status}
                    </p>
                  </div>
                  {apt.prescription && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                      Prescription issued
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Appointment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-theme-secondary text-center py-8">No appointment history</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="p-4 bg-theme-secondary rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-theme-primary">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-theme-secondary">
                          {apt.timeSlot?.start} - {apt.timeSlot?.end}
                        </p>
                        {apt.symptoms && (
                          <p className="text-sm text-theme-secondary mt-2">
                            Symptoms: {apt.symptoms}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'completed' ? 'bg-success-100 text-success-600' :
                        apt.status === 'cancelled' ? 'bg-error-100 text-error-600' :
                        'bg-warning-100 text-warning-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.prescription && (
                      <div className="mt-3 pt-3 border-t border-theme">
                        <p className="text-sm font-medium text-primary-600">Prescription issued</p>
                        <p className="text-xs text-theme-secondary">
                          {apt.prescription.medicines?.length} medications
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Shared Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-theme-secondary text-center py-8">No reports shared by patient</p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report._id} className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary-600" />
                      <div>
                        <p className="font-medium text-theme-primary">{report.title}</p>
                        <p className="text-sm text-theme-secondary">
                          {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a 
                      href={report.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Button size="sm" variant="outline">View</Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
