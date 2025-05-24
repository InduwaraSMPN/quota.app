import { FUEL_TYPES, QR_CONFIG } from '../constants';
import { FuelType, QRCodeData } from '../types';

// Date Utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Number Utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatLiters = (liters: number): string => {
  return `${formatNumber(liters)} L`;
};

// String Utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatRegistrationNumber = (regNumber: string): string => {
  // Remove any existing hyphens and convert to uppercase
  const clean = regNumber.replace(/-/g, '').toUpperCase();
  
  // Add hyphen after 3 characters if length > 3
  if (clean.length > 3) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return clean;
};

export const standardizeRegistrationNumber = (regNumber: string): string => {
  // Remove hyphens and convert to uppercase for API calls
  return regNumber.replace(/-/g, '').toUpperCase();
};

// Fuel Type Utilities
export const getFuelTypeDisplayName = (fuelType: FuelType): string => {
  return FUEL_TYPES[fuelType] || fuelType;
};

export const getFuelTypeColor = (fuelType: FuelType): string => {
  const colors = {
    [FuelType.OCTANE_92]: '#FF6B35',
    [FuelType.OCTANE_95]: '#FF8C42',
    [FuelType.AUTO_DIESEL]: '#2E8B57',
    [FuelType.SUPER_DIESEL]: '#228B22',
    [FuelType.KEROSENE]: '#4169E1',
  };
  return colors[fuelType] || '#6B7280';
};

// QR Code Utilities
export const parseQRCode = (qrData: string): QRCodeData | null => {
  try {
    // Expected format: VEHICLE:{registrationNumber}:OWNER:{ownerId}
    const parts = qrData.split(':');
    
    if (parts.length === 4 && parts[0] === 'VEHICLE' && parts[2] === 'OWNER') {
      return {
        registrationNumber: parts[1],
        ownerId: parts[3],
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

export const generateQRCode = (registrationNumber: string, ownerId: string): string => {
  return `${QR_CONFIG.FORMAT_PREFIX}${registrationNumber}${QR_CONFIG.OWNER_PREFIX}${ownerId}`;
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRegistrationNumber = (regNumber: string): boolean => {
  // Sri Lankan vehicle registration format: ABC1234 or ABC-1234
  const regexWithHyphen = /^[A-Z]{2,3}-?[0-9]{4}$/;
  const regexWithoutHyphen = /^[A-Z]{2,3}[0-9]{4}$/;
  
  const clean = regNumber.replace(/-/g, '').toUpperCase();
  return regexWithHyphen.test(regNumber) || regexWithoutHyphen.test(clean);
};

export const validateAmount = (amount: number, maxAmount: number): boolean => {
  return amount > 0 && amount <= maxAmount;
};

// Error Handling Utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  return 'An unexpected error occurred';
};

// Storage Utilities
export const safeJsonParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return '{}';
  }
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Array Utilities
export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

// Device Utilities
export const isTablet = (width: number, height: number): boolean => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  return minDimension >= 600 && maxDimension >= 960;
};

// Color Utilities
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Sleep Utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
