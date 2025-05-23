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
