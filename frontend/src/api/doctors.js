import apiClient from './client';

export const doctorsApi = {
  getAll: (params) => apiClient.get('/doctors', { params }),
  getById: (id) => apiClient.get(`/doctors/${id}`),
  createProfile: (data) => apiClient.post('/doctors/profile', data),
  updateProfile: (data) => apiClient.put('/doctors/profile', data),
  getAppointments: (doctorId) => apiClient.get(`/doctors/${doctorId}/appointments`),
};
