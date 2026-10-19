import api from './api';

const enrollmentService = {
  // Enroll student in class
  enroll: async (classId) => {
    try {
      const response = await api.post(`/enrollments/enroll/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my enrolled classes
  getMyClasses: async () => {
    try {
      const response = await api.get('/enrollments/my-classes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Drop class
  dropClass: async (classId) => {
    try {
      const response = await api.post(`/enrollments/drop/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get enrollment details
  getEnrollmentDetails: async (enrollmentId) => {
    try {
      const response = await api.get(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all enrollments for class (teacher only)
  getClassEnrollments: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/enrollments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove student from class (teacher/admin only)
  removeStudent: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/enrollments/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default enrollmentService;
