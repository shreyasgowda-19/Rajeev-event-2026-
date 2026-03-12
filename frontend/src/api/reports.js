import apiClient from './client';

export const reportsApi = {
  upload: (formData) => apiClient.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyReports: () => apiClient.get('/reports/my-reports'),
  getPatientReports: (patientId) => apiClient.get(`/reports/patient/${patientId}`),
  share: (reportId, doctorId) => apiClient.put(`/reports/${reportId}/share`, { doctorId }),
  delete: (reportId) => apiClient.delete(`/reports/${reportId}`),
};
