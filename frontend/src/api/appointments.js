import apiClient from './client';

export const appointmentsApi = {
  book: (data) => apiClient.post('/appointments', data),
  getMyAppointments: () => apiClient.get('/appointments/my-appointments'),
  getById: (id) => apiClient.get(`/appointments/${id}`),
  updateStatus: (id, data) => apiClient.put(`/appointments/${id}/status`, data),
};
