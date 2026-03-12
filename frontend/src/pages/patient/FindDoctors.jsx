import { useState, useEffect, useCallback } from 'react';
import { doctorsApi } from '../../api/doctors';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Search, MapPin, Star, Clock, DollarSign, 
  ChevronLeft, ChevronRight, Filter, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapComponent } from '../../components/maps/GoogleMap';

// Simple Map Component (placeholder - integrate Google Maps later)
function SimpleMap({ doctors, selectedDoctor, onSelectDoctor }) {
  return (
    <div className="w-full h-full bg-theme-secondary rounded-xl border border-theme relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-theme-secondary">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Map View</p>
          <p className="text-xs mt-1">Integrate Google Maps here</p>
        </div>
      </div>
      
      {/* Doctor markers simulation */}
      {doctors.map((doctor, index) => (
        <button
          key={doctor._id}
          onClick={() => onSelectDoctor(doctor)}
          className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            selectedDoctor?._id === doctor._id
              ? 'bg-primary-600 text-white scale-125 z-10'
              : 'bg-white dark:bg-gray-800 text-primary-600 border-2 border-primary-600 hover:scale-110'
          }`}
          style={{
            top: `${20 + (index * 15) % 60}%`,
            left: `${15 + (index * 20) % 70}%`,
          }}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}

export function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  // Get user's location
  const [userLocation, setUserLocation] = useState({
    lat: 19.0760, // Default Mumbai
    lng: 72.8777,
  });

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => console.log('Location access denied, using default')
      );
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [userLocation]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const { data } = await doctorsApi.getAll({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: 10000, // 10km
      });
      setDoctors(data.doctors || []);
      setFilteredDoctors(data.doctors || []);
    } catch (error) {
      console.error('Fetch doctors error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter doctors
  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.clinicAddress?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (specialization) {
      filtered = filtered.filter(d =>
        d.specialization?.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [searchQuery, specialization, doctors]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  const specializations = [
    'All',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedic',
    'Pediatrician',
    'General Physician',
    'Gynecologist',
    'Dentist',
  ];

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
          <h1 className="text-3xl font-bold text-theme-primary">Find Doctors</h1>
          <p className="text-theme-secondary mt-1">
            {filteredDoctors.length} doctors available near you
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-theme-secondary rounded-lg p-1 border border-theme">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-theme-primary shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white dark:bg-gray-700 text-theme-primary shadow-sm'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, specialization, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecialization(spec === 'All' ? '' : spec)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    (spec === 'All' && !specialization) || specialization === spec
                      ? 'bg-primary-600 text-white'
                      : 'bg-theme-secondary text-theme-secondary hover:bg-theme-hover'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctors List */}
        <div className={`${viewMode === 'map' ? 'hidden lg:block' : ''} lg:col-span-2 space-y-4`}>
          {paginatedDoctors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-theme-secondary">No doctors found matching your criteria</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setSearchQuery(''); setSpecialization(''); }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            paginatedDoctors.map((doctor) => (
              <Card 
                key={doctor._id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDoctor?._id === doctor._id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {doctor.user?.profilePhoto ? (
                        <img 
                          src={doctor.user.profilePhoto} 
                          alt={doctor.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          {doctor.user?.name?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-theme-primary text-lg">
                            Dr. {doctor.user?.name}
                          </h3>
                          <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-warning-50 dark:bg-warning-900/20 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-warning-500 fill-current" />
                          <span className="text-sm font-medium text-warning-700 dark:text-warning-400">
                            {doctor.rating || 'New'}
                          </span>
                        </div>
                      </div>

                      <p className="text-theme-secondary text-sm mt-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{doctor.clinicAddress}</span>
                      </p>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-theme-secondary">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {doctor.experience} years exp.
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ₹{doctor.consultationFee}
                        </span>
                        {doctor.distance && (
                          <span className="text-primary-600 font-medium">
                            {Math.round(doctor.distance / 1000)} km away
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doctor.isAvailable 
                              ? 'bg-success-100 text-success-600 dark:bg-success-900/20' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                          }`}>
                            {doctor.isAvailable ? 'Available Today' : 'Unavailable'}
                          </span>
                        </div>
                        <Link to={`/doctors/${doctor._id}/book`}>
                          <Button size="sm">Book Appointment</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-theme-secondary text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Map / Selected Doctor Detail */}
        <div className={`${viewMode === 'list' ? 'hidden lg:block' : ''} lg:col-span-1`}>
          {viewMode === 'map' ? (
            <div className="h-[600px]">
                          <MapComponent
                              doctors={filteredDoctors}
                              selectedDoctor={selectedDoctor}
                              onSelectDoctor={setSelectedDoctor}
                              userLocation={userLocation}
                          />
            </div>
          ) : selectedDoctor ? (
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Doctor Details</CardTitle>
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="p-1 hover:bg-theme-secondary rounded"
                  >
                    <X className="w-5 h-5 text-theme-secondary" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold text-primary-600">
                      {selectedDoctor.user?.name?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-theme-primary text-xl">
                    Dr. {selectedDoctor.user?.name}
                  </h3>
                  <p className="text-primary-600">{selectedDoctor.specialization}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-theme">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">Experience</span>
                    <span className="font-medium text-theme-primary">{selectedDoctor.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">Consultation Fee</span>
                    <span className="font-medium text-theme-primary">₹{selectedDoctor.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme-secondary">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                      <span className="font-medium text-theme-primary">{selectedDoctor.rating || 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-theme">
                  <p className="text-sm text-theme-secondary mb-2">Clinic Address</p>
                  <p className="text-theme-primary">{selectedDoctor.clinicAddress}</p>
                </div>

                {selectedDoctor.about && (
                  <div className="pt-4 border-t border-theme">
                    <p className="text-sm text-theme-secondary mb-2">About</p>
                    <p className="text-sm text-theme-primary">{selectedDoctor.about}</p>
                  </div>
                )}

                <Link to={`/doctors/${selectedDoctor._id}/book`}>
                  <Button className="w-full mt-4">Book Appointment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-theme-secondary">
              <p>Select a doctor to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
