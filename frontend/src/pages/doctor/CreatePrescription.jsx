import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { prescriptionsApi } from '../../api/prescriptions';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Pill, Plus, X, ChevronLeft, User, Calendar, 
  Stethoscope, FileText, CheckCircle
} from 'lucide-react';

export function CreatePrescription() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointment');
  const patientId = searchParams.get('patient');

  const [patient, setPatient] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    advice: '',
    notes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [appointmentId, patientId]);

  const fetchData = async () => {
    try {
      if (appointmentId) {
        const { data } = await appointmentsApi.getById(appointmentId);
        setAppointment(data.appointment);
        setPatient(data.appointment.patient);
      }
      // Patient data would be fetched here if needed
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMedicines });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty medicines
      const validMedicines = formData.medicines.filter(m => m.name.trim() !== '');

      await prescriptionsApi.create({
        appointmentId,
        patientId: patient?._id,
        diagnosis: formData.diagnosis,
        medicines: validMedicines,
        advice: formData.advice,
        notes: formData.notes,
        followUpDate: formData.followUpDate
      });

      // Update appointment status to completed
      if (appointmentId) {
        await appointmentsApi.updateStatus(appointmentId, { status: 'completed' });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 2000);
    } catch (error) {
      console.error('Create prescription error:', error);
      alert('Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/doctor/appointments" className="inline-flex items-center text-theme-secondary hover:text-theme-primary">
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Appointments</span>
      </Link>

      {/* Patient Info Card */}
      {patient && (
        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-theme-primary">{patient.name}</h2>
              <p className="text-sm text-theme-secondary">
                {appointment && (
                  <>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                    <Stethoscope className="w-3 h-3 inline ml-2 mr-1" />
                    {appointment.symptoms?.substring(0, 50)}...
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <h1 className="text-3xl font-bold text-theme-primary">Create Prescription</h1>

      {success ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success-600" />
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Prescription Created!</h2>
            <p className="text-theme-secondary">Redirecting to appointments...</p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-primary-600" />
                <span>Diagnosis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Enter diagnosis..."
                className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                required
              />
            </CardContent>
          </Card>

          {/* Medicines */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-primary-600" />
                <span>Medicines</span>
              </CardTitle>
              <Button type="button" size="sm" onClick={addMedicine} className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="p-4 bg-theme-secondary rounded-lg relative">
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="absolute top-2 right-2 p-1 text-error-600 hover:bg-error-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Medicine Name *"
                      placeholder="e.g., Paracetamol"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      required={index === 0}
                    />
                    <Input
                      label="Dosage"
                      placeholder="e.g., 500mg"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    />
                    <Input
                      label="Frequency"
                      placeholder="e.g., Twice daily"
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                    />
                    <Input
                      label="Duration"
                      placeholder="e.g., 7 days"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-theme-primary mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Take after food"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advice & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span>Advice & Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  General Advice
                </label>
                <textarea
                  value={formData.advice}
                  onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                  placeholder="Diet, lifestyle recommendations..."
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other observations..."
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex space-x-3">
            <Link to="/doctor/appointments" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1"
              isLoading={isSubmitting}
            >
              Create Prescription
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
