import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Clock, Star, FileText, MapPin, 
  Phone, Mail, Edit2, Save, Camera, Award, Activity,
  LogOut, ChevronRight, Loader2
} from 'lucide-react';
import { doctorsApi } from '../../api/doctors';
import { appointmentsApi } from '../../api/appointments';
import toast from 'react-hot-toast';

export function DoctorProfile (){
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  // In DoctorProfile.jsx, modify loadProfile:
const loadProfile = async () => {
  try {
    setLoading(true);
    
    // Fetch profile first
    const profileRes = await doctorsApi.getProfile();
    setProfile(profileRes.data);
    setFormData(profileRes.data);
    
    // Fetch stats separately with error handling
    try {
      const statsRes = await doctorsApi.getStats();
      setStats(statsRes.data);
    } catch (statsError) {
      console.warn('Stats fetch failed:', statsError);
      // Set default stats so UI doesn't break
      setStats({
        totalPatients: 0,
        totalAppointments: 0,
        rating: profileRes.data.rating || 4.5,
        totalReviews: 0
      });
    }
    
    // Load appointments
    const apptRes = await doctorsApi.getAppointments(profileRes.data._id);
    setAppointments(apptRes.data?.slice(0, 5) || []);
    
  } catch (error) {
    toast.error('Failed to load profile');
    if (error.response?.status === 401) {
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await doctorsApi.updateProfile(formData);
      setProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.loading('Uploading image...', { id: 'upload' });
      await doctorsApi.uploadImage(formData);
      toast.success('Image uploaded', { id: 'upload' });
      loadProfile();
    } catch (error) {
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <ErrorState onRetry={loadProfile} />;

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients || 0, icon: User, color: 'bg-blue-500' },
    { label: 'Appointments', value: stats.totalAppointments || 0, icon: Calendar, color: 'bg-green-500' },
    { label: 'Rating', value: stats.rating || '4.5', icon: Star, color: 'bg-yellow-500' },
    { label: 'Experience', value: `${profile.experience || 0} yrs`, icon: Award, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">MedLink Doctor Portal</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Dr. {profile.name}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400"></div>
          
          <div className="px-6 pb-6">
            <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-4">
              {/* Avatar with Upload */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl">
                  <img 
                    src={profile.image || '/default-doctor.png'} 
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => { e.target.src = '/default-doctor.png'; }}
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="text-white" size={24} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Info Section */}
              <div className="flex-1 mt-4 md:mt-0 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    {isEditing ? (
                      <div className="space-y-2 max-w-md">
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className="w-full text-2xl font-bold border-b-2 border-blue-500 bg-transparent focus:outline-none px-1"
                          placeholder="Full Name"
                        />
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization || ''}
                          onChange={handleInputChange}
                          className="w-full text-blue-600 font-medium border-b border-gray-300 bg-transparent focus:outline-none px-1"
                          placeholder="Specialization"
                        />
                      </div>
                    ) : (
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dr. {profile.name}</h1>
                        <p className="text-blue-600 font-medium text-lg">{profile.specialization}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {profile.location || 'Location not set'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" /> 
                            {stats.rating || '4.5'} ({stats.totalReviews || 0} reviews)
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            profile.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {profile.isVerified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(profile);
                          }}
                          disabled={saving}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition shadow-sm"
                      >
                        <Edit2 size={18} /> Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition">
                  <div className={`p-3 ${stat.color} bg-opacity-10 rounded-lg`}>
                    <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'documents', label: 'Documents', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition font-medium ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm">
          {activeTab === 'overview' && (
            <OverviewTab 
              profile={profile} 
              isEditing={isEditing} 
              formData={formData}
              onChange={handleInputChange}
            />
          )}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'documents' && <DocumentsTab />}
        </div>
      </main>
    </div>
  );
};

// Sub-components
const OverviewTab = ({ profile, isEditing, formData, onChange }) => {
  const fields = [
    { label: 'About', name: 'about', type: 'textarea', icon: FileText, rows: 4 },
    { label: 'Education', name: 'education', type: 'text', icon: Award },
    { label: 'Years of Experience', name: 'experience', type: 'number', icon: Activity },
    { label: 'License Number', name: 'licenseNumber', type: 'text', icon: FileText },
    { label: 'Consultation Fee ($)', name: 'consultationFee', type: 'number', icon: Activity },
    { label: 'Phone Number', name: 'phone', type: 'tel', icon: Phone },
    { label: 'Email Address', name: 'email', type: 'email', icon: Mail },
    { label: 'Hospital/Clinic Name', name: 'hospital', type: 'text', icon: MapPin },
    { label: 'Address', name: 'address', type: 'textarea', icon: MapPin, rows: 2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <User size={20} className="text-blue-600" />
        Professional Information
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {fields.map((field) => (
          <div key={field.name} className={`space-y-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <field.icon size={16} className="text-gray-400" />
              {field.label}
            </label>
            {isEditing ? (
              field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onChange}
                  rows={field.rows || 3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              )
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700 min-h-[40px] flex items-center">
                {profile[field.name] || <span className="text-gray-400 italic">Not provided</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Specializations */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Specializations</h4>
        <div className="flex flex-wrap gap-2">
          {(profile.specializations || [profile.specialization]).filter(Boolean).map((spec, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScheduleTab = () => {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Tuesday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Wednesday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Thursday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Friday', enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    { day: 'Saturday', enabled: false, slots: [] },
    { day: 'Sunday', enabled: false, slots: [] },
  ]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (idx) => {
    const newSchedule = [...schedule];
    newSchedule[idx].enabled = !newSchedule[idx].enabled;
    setSchedule(newSchedule);
  };

  const addSlot = (dayIdx) => {
    const newSchedule = [...schedule];
    newSchedule[dayIdx].slots.push({ start: '09:00', end: '17:00' });
    setSchedule(newSchedule);
  };

  const removeSlot = (dayIdx, slotIdx) => {
    const newSchedule = [...schedule];
    newSchedule[dayIdx].slots.splice(slotIdx, 1);
    setSchedule(newSchedule);
  };

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[dayIdx].slots[slotIdx][field] = value;
    setSchedule(newSchedule);
  };

  const saveSchedule = async () => {
    try {
      setSaving(true);
      await doctorsApi.updateSchedule(schedule.filter(d => d.enabled));
      toast.success('Schedule updated successfully');
    } catch (error) {
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Availability</h3>
          <p className="text-sm text-gray-500">Set your available time slots for appointments</p>
        </div>
        <button 
          onClick={saveSchedule}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map((day, dayIdx) => (
          <div key={day.day} className={`border rounded-xl p-4 transition ${
            day.enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(dayIdx)}
                  className={`w-12 h-6 rounded-full transition relative ${
                    day.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                    day.enabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
                <span className={`font-medium ${day.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {day.day}
                </span>
              </div>
              {day.enabled && (
                <button 
                  onClick={() => addSlot(dayIdx)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Time Slot
                </button>
              )}
            </div>
            
            {day.enabled && (
              <div className="space-y-2 pl-15">
                {day.slots.map((slot, slotIdx) => (
                  <div key={slotIdx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 ml-12">
                    <Clock size={16} className="text-gray-400" />
                    <input 
                      type="time" 
                      value={slot.start}
                      onChange={(e) => updateSlot(dayIdx, slotIdx, 'start', e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input 
                      type="time" 
                      value={slot.end}
                      onChange={(e) => updateSlot(dayIdx, slotIdx, 'end', e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    {day.slots.length > 1 && (
                      <button 
                        onClick={() => removeSlot(dayIdx, slotIdx)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AppointmentsTab = ({ appointments }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No appointments yet</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {appt.patientName?.[0] || 'P'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{appt.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appt.date).toLocaleDateString()} at {appt.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                  {appt.status}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await doctorsApi.getReviews();
      setReviews(res.data || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId, replyText) => {
    try {
      await doctorsApi.replyToReview(reviewId, replyText);
      toast.success('Reply posted');
      loadReviews();
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading reviews...</div>;

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Reviews</h3>
      
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No reviews yet</p>
        </div>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review._id} review={review} onReply={handleReply} />
        ))
      )}
    </div>
  );
};

const ReviewCard = ({ review, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(review._id, replyText);
    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {review.patientName?.[0] || 'P'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.patientName}</p>
            <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={16} fill="currentColor" />
          <span className="font-bold">{review.rating}</span>
        </div>
      </div>
      
      <p className="text-gray-700">{review.comment}</p>
      
      {review.reply ? (
        <div className="bg-blue-50 rounded-lg p-3 mt-2">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Your reply:</span> {review.reply}
          </p>
        </div>
      ) : isReplying ? (
        <div className="space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            rows={2}
          />
          <div className="flex gap-2">
            <button 
              onClick={submitReply}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post Reply
            </button>
            <button 
              onClick={() => setIsReplying(false)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsReplying(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reply to review
        </button>
      )}
    </div>
  );
};

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'certificate');

    try {
      setUploading(true);
      toast.loading('Uploading...', { id: 'doc' });
      await doctorsApi.uploadDocument(formData);
      toast.success('Document uploaded', { id: 'doc' });
      loadDocuments();
    } catch (error) {
      toast.error('Upload failed', { id: 'doc' });
    } finally {
      setUploading(false);
    }
  };

  const loadDocuments = async () => {
    // Implementation depends on your backend
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents & Certificates</h3>
          <p className="text-sm text-gray-500">Upload your medical license, degrees, and certifications</p>
        </div>
        <label className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition flex items-center gap-2 ${uploading ? 'opacity-50' : ''}`}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-red-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.type} • {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Download">
                <Activity size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Utility Components
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-16 bg-white border-b"></div>
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-2xl h-80"></div>
      <div className="bg-white rounded-xl h-12"></div>
      <div className="bg-white rounded-2xl h-96"></div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Activity className="text-red-600" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load profile</h3>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Try Again
      </button>
    </div>
  </div>
);
