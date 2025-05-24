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
  dateValue: string | Date | null | undefined,
  formatString: string,
  fallback: string = 'N/A'
): string {
  if (!dateValue) return fallback;

  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    // Check if date is valid
    if (!date || isNaN(date.getTime())) {
      return fallback;
    }

    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date with date-fns:', error);
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
