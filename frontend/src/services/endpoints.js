import api from './api';

// Unwrap { success, data } → data
// Important: Handle null values correctly (nullish coalescing treats null as nullish)
const unwrap = (res) => {
  if (!res.data) return res.data;
  return res.data.data !== undefined ? res.data.data : res.data;
};

/* ------------------------------ Auth ------------------------------ */
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me').then(unwrap),
  logout: () => api.post('/auth/logout'),
};

/* ----------------------------- Classes ---------------------------- */
export const classApi = {
  // teacher: own classes (optional { semester, academic_year } filter)
  listMine: (params = {}) => api.get('/classes/my-classes', { params }).then(unwrap),
  // distinct terms across teacher's classes
  myTerms: () => api.get('/classes/my-terms').then(unwrap),
  // current active term (single source of truth) → { semester, academic_year, label }
  currentTerm: () => api.get('/classes/current-term').then(unwrap),
  get: (id) => api.get(`/classes/${id}`).then(unwrap),
  create: (payload) => api.post('/classes', payload).then(unwrap),
  update: (id, payload) => api.put(`/classes/${id}`, payload).then(unwrap),
  remove: (id) => api.delete(`/classes/${id}`),
  // sessions of a class
  getSessions: (id) => api.get(`/classes/${id}/sessions`).then(unwrap),
  // active session of a class (or null)
  getActiveSession: (id) => api.get(`/classes/${id}/active-session`).then(unwrap),
  // all classes a student can browse/enroll (with is_enrolled flag; optional term filter)
  listAvailable: (params = {}) => api.get('/classes/available', { params }).then(unwrap),
  // students in class
  getStudents: (id) => api.get(`/classes/${id}/students`).then(unwrap),
  addStudent: (id, studentId) => api.post(`/classes/${id}/students`, { student_id: studentId }).then(unwrap),
  removeStudent: (id, studentId) => api.delete(`/classes/${id}/students/${studentId}`),
};

/* ---------------------------- Sessions ---------------------------- */
export const sessionApi = {
  create: (payload) => api.post('/sessions', payload).then(unwrap),
  quickStart: (classId) => api.post('/sessions/quick-start', { class_id: classId }).then(unwrap),
  listMine: (params = {}) => api.get('/sessions', { params }).then(unwrap),
  get: (id) => api.get(`/sessions/${id}`).then(unwrap),
  summary: (id) => api.get(`/sessions/${id}/summary`).then(unwrap),
  getQR: (id) => api.get(`/sessions/${id}/qr-code`).then(unwrap),
  setStatus: (id, status) => api.patch(`/sessions/${id}/status`, { status }).then(unwrap),
  getAttendance: (id, page = 1, limit = 50) =>
    api.get(`/sessions/${id}/attendance`, { params: { page, limit } }).then((r) => r.data),
  manualMark: (id, studentId, status) =>
    api.post(`/sessions/${id}/manual-mark`, { student_id: studentId, status }).then(unwrap),
};

/* --------------------------- Attendance --------------------------- */
export const attendanceApi = {
  // QR payload already contains the session id — server decodes it
  checkInQR: (qrData) =>
    api.post('/attendance/check-in/qr', { qr_data: qrData }).then(unwrap),
  // PIN is unique among active sessions — server resolves the session
  checkInPIN: (pinCode) =>
    api.post('/attendance/check-in/pin', { pin_code: pinCode }).then(unwrap),
  myHistory: (page = 1, limit = 50) =>
    api.get('/attendance/my-history', { params: { page, limit } }).then((r) => r.data),
  classAttendance: (classId, page = 1, limit = 50) =>
    api.get(`/attendance/class/${classId}`, { params: { page, limit } }).then((r) => r.data),
  // one student's per-session attendance within a class
  myClassHistory: (classId) => api.get(`/attendance/my-class/${classId}`).then(unwrap),
};

/* ---------------------------- Reports ----------------------------- */
export const reportApi = {
  classReport: (classId) => api.get(`/reports/class/${classId}`).then(unwrap),
  matrix: (classId) => api.get(`/reports/class/${classId}/matrix`).then(unwrap),
  exportCSV: (classId) =>
    api.get(`/reports/class/${classId}/export`, { responseType: 'blob' }).then((r) => r.data),
};

/* ----------------------------- Schedules ---------------------------- */
export const scheduleApi = {
  my: (params = {}) => api.get('/schedules/my', { params }).then(unwrap),
};

/* ------------------------------ Users (admin) ------------------------------ */
export const userApi = {
  list: () => api.get('/users').then(unwrap),
  summary: () => api.get('/users/summary').then(unwrap),
  create: (payload) => api.post('/users', payload).then(unwrap),
  remove: (id) => api.delete(`/users/${id}`),
};

/* -------------------------- Enrollments --------------------------- */
export const enrollmentApi = {
  enroll: (classId) => api.post('/enrollments', { class_id: classId }).then(unwrap),
  myClasses: () => api.get('/enrollments/my-classes').then(unwrap),
  drop: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
};

/* -------- Attendance status metadata (shared 5-status model) ------- */
export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'มาเรียน',  badge: 'present' },
  { value: 'late',    label: 'มาสาย',    badge: 'late' },
  { value: 'absent',  label: 'ขาดเรียน', badge: 'absent' },
  { value: 'leave',   label: 'ลา',       badge: 'pending' },
  { value: 'sick',    label: 'ป่วย',     badge: 'pending' },
];

export const statusLabel = (v) =>
  ATTENDANCE_STATUSES.find((s) => s.value === v)?.label || (v ? v[0].toUpperCase() + v.slice(1) : '—');

export const statusBadge = (v) =>
  ATTENDANCE_STATUSES.find((s) => s.value === v)?.badge || 'inactive';
