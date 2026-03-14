import apiClient from './client';

export const reportsApi = {
  // Upload report with file
  upload: (formData) => {
    return apiClient.post('/reports', formData);
    // Don't set any headers - let browser handle multipart/form-data
  },
  
  // Get my reports
  getMyReports: () => apiClient.get('/reports/my-reports'),
  
  // Get patient reports (for doctors)
  getPatientReports: (patientId) => apiClient.get(`/reports/patient/${patientId}`),
  
  // Share report with doctor
  share: (reportId, doctorId) => apiClient.put(`/reports/${reportId}/share`, { doctorId }),
  
  // Delete report
  delete: (reportId) => apiClient.delete(`/reports/${reportId}`),
};
