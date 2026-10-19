// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!re.test(email)) return 'Invalid email format';
  return null;
};

// Validate password
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: [],
  };

  if (password.length >= 8) strength.score++;
  else strength.feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) strength.score++;
  else strength.feedback.push('At least one lowercase letter');

  if (/[A-Z]/.test(password)) strength.score++;
  else strength.feedback.push('At least one uppercase letter');

  if (/[0-9]/.test(password)) strength.score++;
  else strength.feedback.push('At least one number');

  if (/[^a-zA-Z0-9]/.test(password)) strength.score++;
  else strength.feedback.push('At least one special character');

  return strength;
};

// Validate PIN (6 digits)
export const validatePIN = (pin) => {
  if (!pin) return 'PIN is required';
  if (!/^\d{6}$/.test(pin)) return 'PIN must be 6 digits';
  return null;
};

// Validate name
export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return 'Phone is required';
  const re = /^[\d\s\-\+\(\)]+$/;
  if (!re.test(phone)) return 'Invalid phone format';
  return null;
};

// Validate URL
export const validateURL = (url) => {
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL';
  }
};

// Validate file size
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

// Validate file type
export const validateFileType = (file, allowedTypes = []) => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

// Validate required field
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Validate min length
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

// Validate max length
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

// Validate number range
export const validateRange = (value, min, max, fieldName = 'This field') => {
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    return 'End date must be after start date';
  }
  return null;
};

// Validate date not in past
export const validateFutureDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  if (d < today) {
    return 'Date must be in the future';
  }
  return null;
};

// Validate date not in future
export const validatePastDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  if (d > today) {
    return 'Date must be in the past';
  }
  return null;
};
