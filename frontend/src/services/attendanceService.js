import api from './api';

const attendanceService = {
  // Check in by QR code
  checkInByQR: async (sessionId, qrData) => {
    try {
      const response = await api.post(`/attendance/check-in/qr`, {
        sessionId,
        qrData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check in by PIN code
  checkInByPIN: async (sessionId, pin) => {
    try {
      const response = await api.post(`/attendance/check-in/pin`, {
        sessionId,
        pin,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance history for student
  getHistory: async (filters = {}) => {
    try {
      const response = await api.get('/attendance/history', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance history for class (teacher only)
  getClassHistory: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/classes/${classId}/attendance`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get student's attendance in specific class
  getStudentClassAttendance: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/my-attendance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get detailed attendance record
  getRecord: async (attendanceId) => {
    try {
      const response = await api.get(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate report (teacher only)
  generateReport: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/classes/${classId}/report`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export attendance data as CSV
  exportAsCSV: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/export/csv`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default attendanceService;
