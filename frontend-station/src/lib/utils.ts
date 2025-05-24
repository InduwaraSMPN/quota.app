import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string to a human-readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format: "Jan 1, 2023, 12:00 PM"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
}

/**
 * Format a date string to a detailed date-time format
 * @param dateString The date string to format
 * @returns Formatted date-time string
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format: "January 1, 2023 at 12:00:00 PM"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return 'Error formatting date-time';
  }
}

/**
 * Safely format a date using date-fns format function
 * @param dateValue The date value (string, Date, or null/undefined)
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
    // Debug logging to see what we're receiving
    console.log('safeFormatDate input:', {
      value: dateValue,
      type: typeof dateValue,
      isArray: Array.isArray(dateValue),
      constructor: dateValue?.constructor?.name,
      keys: typeof dateValue === 'object' ? Object.keys(dateValue) : 'N/A'
    });

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
 * @param dateValue The date value (string, Date, or null/undefined)
 * @param fallback The fallback string to return if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDateShort(
  dateValue: string | Date | null | undefined,
  fallback: string = 'Not available'
): string {
  return safeFormatDate(dateValue, "MMM d, yyyy", fallback);
}

/**
 * Safely format a date for display with time (MMM d, yyyy h:mm a)
 * @param dateValue The date value (string, Date, or null/undefined)
 * @param fallback The fallback string to return if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDateWithTime(
  dateValue: string | Date | null | undefined,
  fallback: string = 'Not available'
): string {
  return safeFormatDate(dateValue, "MMM d, yyyy h:mm a", fallback);
}
