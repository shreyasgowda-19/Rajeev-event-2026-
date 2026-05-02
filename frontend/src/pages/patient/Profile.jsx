import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateUser({
        name: formData.name,
        phone: formData.phone,
        location: {
          ...user?.location,
          address: formData.address,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">My Profile</h1>
        <p className="text-theme-secondary mt-1">Manage your personal information</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-3 relative">
              {user?.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary-600" />
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-theme-primary">{user?.name}</h2>
            <p className="text-theme-secondary capitalize">{user?.role}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label="Email"
              type="email"
              value={user?.email}
              disabled={true}
              icon={<Mail className="w-5 h-5" />}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              icon={<Phone className="w-5 h-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-theme bg-theme-primary text-theme-primary placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
