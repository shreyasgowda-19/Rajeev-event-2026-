import apiClient from './client';

export const prescriptionsApi = {
  create: (data) => apiClient.post('/prescriptions', data),
  getMyPrescriptions: () => apiClient.get('/prescriptions/my-prescriptions'),
  getById: (id) => apiClient.get(`/prescriptions/${id}`),
};
