// ---- Date/time formatting (dd/mm/yyyy + 24hr, no am/pm) ----

const pad = (n) => String(n).padStart(2, '0');

// Format date → dd/mm/yyyy
export const formatDate = (value) => {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// Format time → HH:MM (24hr). Accepts Date, ISO string, or "HH:MM[:SS]" string.
export const formatTime = (value) => {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
    const [h, m] = value.split(':');
    return `${pad(h)}:${pad(m)}`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Format date + time → dd/mm/yyyy HH:MM
export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${formatTime(d)}`;
};

// Sort array by property
export const sortBy = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Filter array by property
export const filterBy = (array, key, value) => {
  if (!Array.isArray(array)) return [];
  return array.filter((item) => item[key] === value);
};

// Group array by property
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Download CSV file
export const downloadCSV = (csvContent, filename = 'download.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate CSV from data
export const generateCSV = (data, headers) => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const rows = data.map((row) => csvHeaders.map((header) => {
    const value = row[header];
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value}"`;
    }
    return value;
  }));

  return [csvHeaders.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

// Download JSON file
export const downloadJSON = (data, filename = 'download.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Deep copy object
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Merge objects
export const mergeObjects = (target, source) => {
  return { ...target, ...source };
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Unique array items
export const unique = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  if (!key) return [...new Set(array)];
  return array.filter((item, index, arr) => arr.findIndex((i) => i[key] === item[key]) === index);
};

// Flatten array
export const flatten = (array) => {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
};

// Chunk array into smaller arrays
export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Remove duplicates from array of objects
export const removeDuplicates = (array, key) => {
  const seen = new Set();
  return array.filter((item) => {
    const k = key ? item[key] : item;
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
};

// Get differences between two arrays
export const difference = (arr1, arr2) => {
  return arr1.filter((item) => !arr2.includes(item));
};

// Get intersection of two arrays
export const intersection = (arr1, arr2) => {
  return arr1.filter((item) => arr2.includes(item));
};

// Capitalize string
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert camelCase to snake_case
export const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// Convert snake_case to camelCase
export const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

// Get random element from array
export const random = (array) => {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// Retry function with exponential backoff
export const retry = async (func, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await func();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};
