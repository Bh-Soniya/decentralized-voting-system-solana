/**
 * Format a date string to local date and time
 * @param dateString - ISO date string from backend
 * @returns Formatted local date and time string
 */
export const formatLocalDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format a date string to local date only
 * @param dateString - ISO date string from backend
 * @returns Formatted local date string
 */
export const formatLocalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Convert datetime-local input value to ISO string for backend
 * @param datetimeLocal - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns ISO string in UTC
 */
export const datetimeLocalToISO = (datetimeLocal: string): string => {
  // datetime-local gives us local time without timezone info
  // Create Date object which treats it as local time
  const date = new Date(datetimeLocal);
  // Convert to ISO string (UTC)
  return date.toISOString();
};

/**
 * Convert ISO string to datetime-local input value
 * @param isoString - ISO date string from backend
 * @returns Value for datetime-local input (YYYY-MM-DDTHH:mm)
 */
export const isoToDatetimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  // Get local time components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
