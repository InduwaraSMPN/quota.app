import { format } from "date-fns";

/**
 * Format a date string to a human-readable format (DD MMM YYYY)
 *
 * @param dateString The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return date.toLocaleDateString('en-US', options);
}

/**
 * Format a date string to a human-readable format with time (DD MMM YYYY, HH:MM)
 *
 * @param dateString The date string to format
 * @returns The formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  return `${formattedDate}, ${formattedTime}`;
}

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 *
 * @param dateString The date string to format
 * @returns The relative time string
 */
export function getRelativeTimeString(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInSecs = Math.round(diffInMs / 1000);
  const diffInMins = Math.round(diffInSecs / 60);
  const diffInHours = Math.round(diffInMins / 60);
  const diffInDays = Math.round(diffInHours / 24);

  if (diffInSecs < 0) {
    // Past
    if (diffInSecs > -60) return 'just now';
    if (diffInMins > -60) return `${Math.abs(diffInMins)} minute${Math.abs(diffInMins) !== 1 ? 's' : ''} ago`;
    if (diffInHours > -24) return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
    if (diffInDays > -7) return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  } else {
    // Future
    if (diffInSecs < 60) return 'in a few seconds';
    if (diffInMins < 60) return `in ${diffInMins} minute${diffInMins !== 1 ? 's' : ''}`;
    if (diffInHours < 24) return `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    if (diffInDays < 7) return `in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    return formatDate(dateString);
  }
}

/**
 * Safely format a date using date-fns format function
 * Handles LocalDateTime objects that come from backend as arrays or objects
 * @param dateValue The date value (string, Date, array, object, or null/undefined)
 * @param formatString The format string for date-fns
 * @param fallback The fallback string to return if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  dateValue: any,
  formatString: string,
  fallback: string = 'N/A'
): string {
  if (!dateValue) return fallback;

  try {
    let date: Date;

    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && dateValue !== null) {
      // Handle LocalDateTime objects that might come from backend
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        // Handle array format like [2025, 5, 24, 15, 15, 42, 239286000]
        const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateValue;
        date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
      } else if (dateValue.year && dateValue.month && dateValue.day) {
        // Handle object format like {year: 2025, month: 5, day: 24, hour: 15, minute: 15, second: 42}
        const { year, month, day, hour = 0, minute = 0, second = 0 } = dateValue;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        // Try to convert object to string and parse
        date = new Date(String(dateValue));
      }
    } else {
      console.warn('Invalid date value type:', typeof dateValue, dateValue);
      return fallback;
    }

    // Check if date is valid and has getTime method
    if (!date || typeof date.getTime !== 'function' || isNaN(date.getTime())) {
      console.warn('Invalid date object:', date);
      return fallback;
    }

    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date with date-fns:', error, 'Input:', dateValue);
    return fallback;
  }
}

/**
 * Safely format a date for display in short format (MMM d, yyyy)
 * @param dateValue The date value (string, Date, array, object, or null/undefined)
 * @param fallback The fallback string to return if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDateShort(
  dateValue: any,
  fallback: string = 'Not available'
): string {
  return safeFormatDate(dateValue, "MMM d, yyyy", fallback);
}

/**
 * Safely format a date for display with time (MMM d, yyyy h:mm a)
 * @param dateValue The date value (string, Date, array, object, or null/undefined)
 * @param fallback The fallback string to return if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDateWithTime(
  dateValue: any,
  fallback: string = 'Not available'
): string {
  return safeFormatDate(dateValue, "MMM d, yyyy h:mm a", fallback);
}

/**
 * Enhanced formatDateTime that can handle LocalDateTime arrays from backend
 * @param dateValue The date value (string, Date, array, object, or null/undefined)
 * @returns Formatted date and time string
 */
export function formatDateTimeEnhanced(dateValue: any): string {
  return safeFormatDateWithTime(dateValue, 'Invalid date');
}
