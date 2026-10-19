import api from './api';

const classService = {
  // Get all classes (with filtering)
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/classes', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single class
  getById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new class
  create: async (classData) => {
    try {
      const response = await api.post('/classes', classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update class
  update: async (classId, classData) => {
    try {
      const response = await api.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete class
  delete: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get class enrollments
  getEnrollments: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/enrollments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get teacher's classes
  getTeacherClasses: async () => {
    try {
      const response = await api.get('/classes/teacher/my-classes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get available classes for students
  getAvailableClasses: async (filters = {}) => {
    try {
      const response = await api.get('/classes/available', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default classService;
