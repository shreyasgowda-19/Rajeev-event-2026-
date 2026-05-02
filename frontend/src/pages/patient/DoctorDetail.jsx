import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorsApi } from '../../api/doctors';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
    MapPin, Star, Clock, DollarSign, Calendar,
    Award, Phone, Mail, ChevronLeft
} from 'lucide-react';

export function DoctorDetail() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDoctor();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const { data } = await doctorsApi.getById(id);
            setDoctor(data.doctor);
        } catch (error) {
            console.error('Fetch doctor error:', error);
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

    if (!doctor) {
        return (
            <div className="max-w-7xl mx-auto text-center py-12">
                <p className="text-theme-secondary">Doctor not found</p>
                <Link to="/doctors">
                    <Button variant="outline" className="mt-4">Back to Doctors</Button>
                </Link>
            </div>
        );
    }

    const workingDays = Object.entries(doctor.workingHours || {})
        .filter(([_, day]) => day.isWorking)
        .map(([day, hours]) => ({ day, ...hours }));
 
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Link to="/doctors" className="inline-flex items-center text-theme-secondary hover:text-theme-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Doctors</span>
            </Link>

            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            {doctor.user?.profilePhoto ? (
                                <img
                                    src={doctor.user.profilePhoto}
                                    alt={doctor.user.name}
                                    className="w-full h-full rounded-2xl object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-primary-600">
                                    {doctor.user?.name?.charAt(0) || 'D'}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-theme-primary">
                                        Dr. {doctor.user?.name}
                                    </h1>
                                    <p className="text-primary-600 text-lg font-medium mt-1">
                                        {doctor.specialization}
                                    </p>

                                    <div className="flex items-center space-x-4 mt-3 text-theme-secondary">
                                        <span className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {doctor.clinicAddress}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 bg-warning-50 dark:bg-warning-900/20 px-3 py-2 rounded-xl">
                                    <Star className="w-5 h-5 text-warning-500 fill-current" />
                                    <span className="text-lg font-bold text-warning-700 dark:text-warning-400">
                                        {doctor.rating || 'New'}
                                    </span>
                                    <span className="text-sm text-warning-600 dark:text-warning-400">
                                        ({doctor.totalReviews || 0} reviews)
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center space-x-2 bg-theme-secondary px-4 py-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-primary-600" />
                                    <div>
                                        <p className="text-xs text-theme-secondary">Experience</p>
                                        <p className="font-semibold text-theme-primary">{doctor.experience} years</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 bg-theme-secondary px-4 py-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-success-600" />
                                    <div>
                                        <p className="text-xs text-theme-secondary">Consultation Fee</p>
                                        <p className="font-semibold text-theme-primary">₹{doctor.consultationFee}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 bg-theme-secondary px-4 py-2 rounded-lg">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-theme-secondary">License</p>
                                        <p className="font-semibold text-theme-primary">{doctor.licenseNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${doctor.isAvailable
                                        ? 'bg-success-100 text-success-600 dark:bg-success-900/20'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                        }`}>
                                        {doctor.isAvailable ? 'Available Today' : 'Unavailable'}
                                    </span>
                                    {doctor.source === 'openstreetmap' && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                                            Real Hospital
                                        </span>
                                    )}
                                </div>

                                {/* Only show Book button for platform doctors */}
                                {doctor.source !== 'openstreetmap' ? (
                                    <Link to={`/doctors/${doctor._id}/book`}>
                                        <Button size="sm">Book Appointment</Button>
                                    </Link>
                                ) : (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${doctor.clinicLocation?.coordinates?.[1]},${doctor.clinicLocation?.coordinates?.[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" variant="outline">View on Map</Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* About */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-theme-secondary leading-relaxed">
                            {doctor.about || 'No information provided.'}
                        </p>

                        {/* Qualifications */}
                        {doctor.qualifications?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-theme-primary mb-3">Qualifications</h4>
                                <ul className="space-y-2">
                                    {doctor.qualifications.map((qual, idx) => (
                                        <li key={idx} className="flex items-start space-x-2 text-sm text-theme-secondary">
                                            <Award className="w-4 h-4 text-primary-600 mt-0.5" />
                                            <span>
                                                <span className="font-medium text-theme-primary">{qual.degree}</span>
                                                {' - '}{qual.institution} ({qual.year})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Working Hours */}
                <Card>
                    <CardHeader>
                        <CardTitle>Working Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {workingDays.length === 0 ? (
                                <p className="text-theme-secondary">No working hours set</p>
                            ) : (
                                workingDays.map(({ day, start, end }) => (
                                    <div
                                        key={day}
                                        className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                                    >
                                        <span className="capitalize font-medium text-theme-primary">{day}</span>
                                        <span className="text-theme-secondary">{start} - {end}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-theme">
                            <h4 className="font-semibold text-theme-primary mb-3">Contact</h4>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center text-theme-secondary">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {doctor.user?.phone || 'Not provided'}
                                </p>
                                <p className="flex items-center text-theme-secondary">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {doctor.user?.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
