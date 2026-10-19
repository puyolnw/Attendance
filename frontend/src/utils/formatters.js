// Format date to readable format
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MMM DD, YYYY':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    default:
      return d.toLocaleDateString();
  }
};

// Format time to readable format
export const formatTime = (date, format = 'HH:MM') => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'HH:MM':
      return `${hours}:${minutes}`;
    case 'HH:MM:SS':
      return `${hours}:${minutes}:${seconds}`;
    case '12H':
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    default:
      return d.toLocaleTimeString();
  }
};

// Format datetime
export const formatDateTime = (date, dateFormat = 'MM/DD/YYYY', timeFormat = 'HH:MM') => {
  if (!date) return '';
  return `${formatDate(date, dateFormat)} ${formatTime(date, timeFormat)}`;
};

// Format status with label
export const formatStatus = (status) => {
  const statusMap = {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    pending: 'Pending',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive',
  };

  return statusMap[status] || status;
};

// Format duration (e.g., "2 hours 30 minutes")
export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);

  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '';
  return `${value.toFixed(decimals)}%`;
};

// Format number with thousand separator
export const formatNumber = (number) => {
  if (typeof number !== 'number') return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency
export const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

// Truncate string
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

// Format initials from name
export const formatInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};
