import apiClient from './client';

export const doctorsApi = {
  // Existing methods
  getAll: (params) => apiClient.get('/doctors', { params }),
  getById: (id) => apiClient.get(`/doctors/${id}`),
  createProfile: (data) => apiClient.post('/doctors/profile', data),
  updateProfile: (data) => apiClient.put('/doctors/profile', data),
  getAppointments: (doctorId) => apiClient.get(`/doctors/${doctorId}/appointments`),
  
  // NEW: Profile-specific methods for DoctorProfile.jsx
  getProfile: () => apiClient.get('/doctors/profile'),
  
  uploadImage: (formData) => apiClient.post('/doctors/upload-image', formData),
  
  updateSchedule: (schedule) => apiClient.put('/doctors/schedule', { schedule }),
  
  uploadDocument: (formData) => apiClient.post('/doctors/documents', formData),
  
  getReviews: () => apiClient.get('/doctors/reviews'),
  
  replyToReview: (reviewId, reply) => apiClient.put(`/doctors/reviews/${reviewId}/reply`, { reply }),
  
  getStats: () => apiClient.get('/doctors/stats'),
};
