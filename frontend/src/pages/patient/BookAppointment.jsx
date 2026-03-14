import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorsApi } from '../../api/doctors';
import { appointmentsApi } from '../../api/appointments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Calendar, Clock, ChevronLeft, CheckCircle, 
  AlertCircle, Stethoscope, MapPin, Loader2
} from 'lucide-react';

export function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    timeSlot: { start: '', end: '' },
    symptoms: '',
    notes: ''
  });

  // Available time slots
  const availableSlots = [
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '14:00', end: '14:30' },
    { start: '14:30', end: '15:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
    { start: '16:30', end: '17:00' },
  ];

  useEffect(() => {
    // Validate ID is not OpenStreetMap
    if (id?.startsWith('osm_')) {
      setError('Cannot book appointments with external hospitals. Please visit the hospital directly.');
      setIsLoading(false);
      return;
    }

    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const { data } = await doctorsApi.getById(id);
      setDoctor(data.doctor);
    } catch (err) {
      console.error('Fetch doctor error:', err);
      setError(err.response?.data?.message || 'Failed to load doctor details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, appointmentDate: e.target.value });
    if (e.target.value) setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, timeSlot: slot });
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await appointmentsApi.book({
        doctorId: id,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        symptoms: formData.symptoms,
        notes: formData.notes
      });

      alert('Appointment booked successfully!');
      navigate('/appointments');
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/doctors" className="inline-flex items-center text-theme-secondary hover:text-theme-primary">
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Doctors</span>
        </Link>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error-500" />
            <h2 className="text-xl font-semibold text-theme-primary mb-2">Booking Not Available</h2>
            <p className="text-theme-secondary mb-4">{error}</p>
            <Link to="/doctors">
              <Button>Find Other Doctors</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to={`/doctors/${id}`} className="inline-flex items-center text-theme-secondary hover:text-theme-primary transition-colors">
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Doctor</span>
      </Link>

      {/* Doctor Summary */}
      <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-theme-primary">Dr. {doctor.user?.name}</h2>
            <p className="text-sm text-primary-600">{doctor.specialization}</p>
            <p className="text-xs text-theme-secondary flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {doctor.clinicAddress}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">Book Appointment</h1>
        <p className="text-theme-secondary mt-1">Complete the 3 steps below</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step >= s 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'bg-theme-secondary text-theme-secondary'
            }`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 rounded ${
                step > s ? 'bg-primary-600' : 'bg-theme-secondary'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2 text-error-600 dark:text-error-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Step 1: Select Date'}
            {step === 2 && 'Step 2: Select Time'}
            {step === 3 && 'Step 3: Confirm Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Date Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  value={formData.appointmentDate}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-theme-secondary">
                💡 You can book appointments up to 30 days in advance
              </p>
            </div>
          )}

          {/* Step 2: Time Slot Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-theme-primary font-medium">
                  {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Change Date
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      formData.timeSlot.start === slot.start
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 shadow-md'
                        : 'border-theme hover:border-primary-300 text-theme-primary hover:bg-theme-secondary'
                    }`}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1 opacity-70" />
                    <span className="text-sm font-medium">{slot.start}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Confirm Details */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-theme-secondary p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <span className="text-theme-secondary">Doctor</span>
                  <span className="font-medium text-theme-primary">Dr. {doctor.user?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <span className="text-theme-secondary">Date</span>
                  <span className="font-medium text-theme-primary">
                    {new Date(formData.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <span className="text-theme-secondary">Time</span>
                  <span className="font-medium text-theme-primary">
                    {formData.timeSlot.start} - {formData.timeSlot.end}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-secondary">Consultation Fee</span>
                  <span className="font-bold text-success-600 text-lg">₹{doctor.consultationFee}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Symptoms / Reason for Visit *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe your symptoms or reason for visit..."
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other information you'd like to share with the doctor..."
                  className="w-full px-4 py-3 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isSubmitting}
                  disabled={!formData.symptoms.trim()}
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
