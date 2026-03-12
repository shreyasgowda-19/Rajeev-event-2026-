import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Stethoscope, AlertCircle, User, Stethoscope as DoctorIcon } from 'lucide-react';

export function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Get location from browser (simplified - in production use proper geocoding)
      const location = {
        coordinates: [72.8777, 19.0760], // Default to Mumbai
        address: formData.address || 'Mumbai, India',
      };

      const userData = {
        ...formData,
        role,
        location,
      };

      const user = await register(userData);
      
      if (user.role === 'doctor') {
        navigate('/doctor/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary">
            Join <span className="text-primary-600">MediLink</span>
          </h1>
          <p className="mt-2 text-theme-secondary">
            Create your account to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 ? 'I am a...' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2 text-error-600 dark:text-error-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {step === 1 ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRoleSelect('patient')}
                  className="p-6 border-2 border-theme rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center group"
                >
                  <User className="w-10 h-10 mx-auto mb-3 text-primary-600" />
                  <h3 className="font-semibold text-theme-primary group-hover:text-primary-600">Patient</h3>
                  <p className="text-sm text-theme-secondary mt-1">Book appointments & manage health</p>
                </button>

                <button
                  onClick={() => handleRoleSelect('doctor')}
                  className="p-6 border-2 border-theme rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center group"
                >
                  <DoctorIcon className="w-10 h-10 mx-auto mb-3 text-primary-600" />
                  <h3 className="font-semibold text-theme-primary group-hover:text-primary-600">Doctor</h3>
                  <p className="text-sm text-theme-secondary mt-1">Manage patients & prescriptions</p>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <Input
                  label="Address"
                  placeholder="Your city or full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-theme-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
