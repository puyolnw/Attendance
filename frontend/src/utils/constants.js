// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT = 30000; // 30 seconds

// Roles
export const ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  ADMIN: 'admin',
};

// Role Labels
export const ROLE_LABELS = {
  teacher: 'Teacher',
  student: 'Student',
  admin: 'Administrator',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  PENDING: 'pending',
};

// Status Colors (Tailwind classes)
export const STATUS_COLORS = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
};

// Session Status
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  DROPPED: 'dropped',
  PENDING: 'pending',
};

// Check-in Methods
export const CHECKIN_METHODS = {
  QR: 'qr',
  PIN: 'pin',
  MANUAL: 'manual',
};

// Semester Options
export const SEMESTERS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
];

// Academic Year Options (last 5 years)
export const getAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({ value: year.toString(), label: `${year}` });
  }
  return years;
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  API: 'YYYY-MM-DD',
};

// Time Formats
export const TIME_FORMATS = {
  DISPLAY: 'HH:MM',
  DISPLAY_12H: '12H',
  DISPLAY_WITH_SECONDS: 'HH:MM:SS',
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  PIN_LENGTH: 6,
  MAX_FILE_SIZE_MB: 5,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  CLASSES: {
    LIST: '/classes',
    GET: (id) => `/classes/${id}`,
    CREATE: '/classes',
    UPDATE: (id) => `/classes/${id}`,
    DELETE: (id) => `/classes/${id}`,
    ENROLLMENTS: (id) => `/classes/${id}/enrollments`,
    SESSIONS: (id) => `/classes/${id}/sessions`,
    ATTENDANCE: (id) => `/classes/${id}/attendance`,
    REPORT: (id) => `/classes/${id}/report`,
    EXPORT: (id) => `/classes/${id}/export`,
  },
  ENROLLMENTS: {
    LIST: '/enrollments',
    GET: (id) => `/enrollments/${id}`,
    ENROLL: (classId) => `/enrollments/enroll/${classId}`,
    DROP: (classId) => `/enrollments/drop/${classId}`,
    MY_CLASSES: '/enrollments/my-classes',
  },
  SESSIONS: {
    LIST: '/sessions',
    GET: (id) => `/sessions/${id}`,
    CREATE: '/sessions',
    END: (id) => `/sessions/${id}/end`,
    QR: (id) => `/sessions/${id}/qr`,
    ATTENDANCE: (id) => `/sessions/${id}/attendance`,
  },
  ATTENDANCE: {
    CHECKIN_QR: '/attendance/check-in/qr',
    CHECKIN_PIN: '/attendance/check-in/pin',
    HISTORY: '/attendance/history',
    GET: (id) => `/attendance/${id}`,
  },
  REPORTS: {
    CLASS: (id) => `/reports/class/${id}`,
    STUDENT: (id) => `/reports/student/${id}`,
    STATISTICS: '/reports/statistics',
  },
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#2563eb', // blue-600
  SECONDARY: '#64748b', // slate-500
  SUCCESS: '#10b981', // emerald-500
  WARNING: '#f59e0b', // amber-500
  DANGER: '#ef4444', // red-500
  INFO: '#06b6d4', // cyan-500
};

// Toast Messages Duration (ms)
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully.',
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
};

// Permissions by Role
export const ROLE_PERMISSIONS = {
  teacher: [
    'view_classes',
    'create_class',
    'edit_class',
    'delete_class',
    'create_session',
    'view_attendance',
    'export_attendance',
    'view_reports',
  ],
  student: [
    'view_classes',
    'enroll_class',
    'drop_class',
    'check_in',
    'view_attendance_history',
  ],
  admin: [
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'view_all_classes',
    'view_all_reports',
    'view_statistics',
  ],
};
