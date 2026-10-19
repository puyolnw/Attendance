import api from './api';

const sessionService = {
  // Create attendance session
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get session details
  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get QR code for session
  getQRCode: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/qr`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh QR code
  refreshQRCode: async (sessionId) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/refresh-qr`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance records for session
  getAttendance: async (sessionId) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/attendance`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update attendance status manually
  updateStatus: async (sessionId, studentId, status) => {
    try {
      const response = await api.put(`/sessions/${sessionId}/attendance/${studentId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark attendance manually
  manualMark: async (sessionId, attendanceData) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/manual-mark`, attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get sessions for class
  getClassSessions: async (classId, filters = {}) => {
    try {
      const response = await api.get(`/classes/${classId}/sessions`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/sessions/${sessionId}/end`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default sessionService;
