import api from './api';

const reportService = {
  // Get class attendance report
  getClassReport: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/reports/class/${classId}`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get student attendance report
  getStudentReport: async (studentId, filters = {}) => {
    try {
      const response = await api.get(`/reports/student/${studentId}`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get session report
  getSessionReport: async (sessionId) => {
    try {
      const response = await api.get(`/reports/session/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export class report as CSV
  exportClassReportCSV: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/reports/class/${classId}/export/csv`, {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export class report as PDF
  exportClassReportPDF: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/reports/class/${classId}/export/pdf`, {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export student report as CSV
  exportStudentReportCSV: async (studentId, filters = {}) => {
    try {
      const response = await api.get(`/reports/student/${studentId}/export/csv`, {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance statistics
  getStatistics: async (filters = {}) => {
    try {
      const response = await api.get('/reports/statistics', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get teacher dashboard summary
  getTeacherSummary: async () => {
    try {
      const response = await api.get('/reports/teacher-summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin dashboard summary
  getAdminSummary: async () => {
    try {
      const response = await api.get('/reports/admin-summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default reportService;
