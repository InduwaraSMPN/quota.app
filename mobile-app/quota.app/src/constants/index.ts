// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.71.74:8888',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  SEND_VERIFICATION: '/api/auth/send-verification-code',
  VERIFY_CODE: '/api/auth/verify-email-code',

  // Station (Mobile)
  STATION_DETAILS: '/api/mobile/station/details',
  STATION_TRANSACTIONS: '/api/mobile/station/transactions',
  STATION_NOTIFICATIONS: '/api/mobile/station/notifications',
  STATION_PROFILE: '/api/mobile/station/profile',

  // Vehicle & Quota
  VEHICLE_BY_REGISTRATION: '/api/station/quota/vehicle',
  VALIDATE_QUOTA: '/api/station/quota/validate',
  DISPENSE_FUEL: '/api/station/quota/dispense',

  // Registration
  STATION_REGISTER_STEP1: '/api/auth/register/station/step1',
  STATION_REGISTER_STEP2: '/api/auth/register/station/step2',
  STATION_REGISTER_STEP3: '/api/auth/register/station/step3',
  STATION_REGISTER_COMPLETE: '/api/auth/register/station/complete',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  STATION_DATA: 'station_data',
  RECENT_SEARCHES: 'recent_searches',
  SETTINGS: 'app_settings',
} as const;

// App Colors
export const COLORS = {
  primary: '#0066CC',
  primaryDark: '#004499',
  primaryLight: '#3385D6',
  secondary: '#FF6B35',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',

  // Grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Fuel Types
export const FUEL_TYPES = {
  OCTANE_92: '92 Octane Petrol',
  OCTANE_95: '95 Octane Petrol',
  AUTO_DIESEL: 'Auto Diesel',
  SUPER_DIESEL: 'Super Diesel',
  KEROSENE: 'Kerosene',
} as const;

// Vehicle Classes
export const VEHICLE_CLASSES = [
  'A1', 'A', 'B1', 'B', 'C1', 'C', 'CE', 'D1', 'D', 'DE', 'G1', 'G', 'J'
] as const;

// Quota Allocations (in liters)
export const QUOTA_ALLOCATIONS = {
  A1: 14,
  A: 14,
  B1: 14,
  B: 40,
  C1: 125,
  C: 125,
  CE: 125,
  D1: 125,
  D: 125,
  DE: 125,
  G1: 14,
  G: 14,
  J: 14,
} as const;

// QR Code Configuration
export const QR_CONFIG = {
  FORMAT_PREFIX: 'VEHICLE:',
  OWNER_PREFIX: ':OWNER:',
  SCAN_TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 1000, // 1 second
} as const;

// Camera Configuration
export const CAMERA_CONFIG = {
  QUALITY: 0.8,
  ASPECT_RATIO: [16, 9] as [number, number],
  FLASH_MODE: 'off' as const,
  FOCUS_MODE: 'on' as const,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Screen Names
export const SCREEN_NAMES = {
  // Auth Stack
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Main Tab Stack
  DASHBOARD: 'Dashboard',
  SCANNER: 'Scanner',
  HISTORY: 'History',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',

  // Scanner Stack
  QR_SCANNER: 'QRScanner',
  MANUAL_ENTRY: 'ManualEntry',
  VEHICLE_DETAILS: 'VehicleDetails',
  QUOTA_VALIDATION: 'QuotaValidation',
  FUEL_DISPENSING: 'FuelDispensing',
  DISPENSING_CONFIRMATION: 'DispensingConfirmation',
  TRANSACTION_SUCCESS: 'TransactionSuccess',

  // History Stack
  TRANSACTION_HISTORY: 'TransactionHistory',
  TRANSACTION_DETAILS: 'TransactionDetails',

  // Settings Stack
  PROFILE: 'Profile',
  PROFILE_EDIT: 'ProfileEdit',
  APP_SETTINGS: 'AppSettings',
  ABOUT: 'About',

  // Debug/Development
  SITEMAP: 'Sitemap',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  CAMERA_PERMISSION: 'Camera permission is required to scan QR codes.',
  QR_INVALID_FORMAT: 'Invalid QR code format. Please scan a valid vehicle QR code.',
  VEHICLE_NOT_FOUND: 'Vehicle not found. Please check the registration number.',
  INSUFFICIENT_QUOTA: 'Insufficient fuel quota remaining for this vehicle.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  TRANSACTION_SUCCESS: 'Fuel dispensed successfully!',
  QR_SCANNED: 'QR code scanned successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  NOTIFICATION_SENT: 'Notification sent successfully!',
} as const;

// Logging Configuration
export const LOGGING_CONFIG = {
  ENABLED: __DEV__, // Only enable in development
  LEVEL: __DEV__ ? 'DEBUG' : 'ERROR',
  ENABLE_COLORS: true,
  ENABLE_TIMESTAMPS: true,
  ENABLE_STACK_TRACE: true,
  MAX_LOG_ENTRIES: 1000,

  // API Logging
  LOG_API_REQUESTS: true,
  LOG_API_RESPONSES: true,
  LOG_API_ERRORS: true,
  LOG_REQUEST_HEADERS: __DEV__,
  LOG_REQUEST_BODY: __DEV__,
  LOG_RESPONSE_HEADERS: __DEV__,
  LOG_RESPONSE_DATA: __DEV__,

  // Network Logging
  LOG_NETWORK_CHANGES: true,
  LOG_NETWORK_DETAILS: __DEV__,
  NETWORK_CHECK_INTERVAL: 5000, // 5 seconds
  NETWORK_TIMEOUT: 5000, // 5 seconds

  // JWT Token Logging
  LOG_TOKEN_VALIDATION: __DEV__,
  LOG_TOKEN_REFRESH: true,
  LOG_TOKEN_EXPIRATION: true,

  // Performance Logging
  LOG_PERFORMANCE_METRICS: __DEV__,
  LOG_SLOW_REQUESTS: true,
  SLOW_REQUEST_THRESHOLD: 3000, // 3 seconds
} as const;

// Debug Configuration
export const DEBUG_CONFIG = {
  ENABLED: __DEV__,
  SHOW_PERFORMANCE_OVERLAY: false,
  SHOW_NETWORK_STATUS: __DEV__,
  SHOW_API_LOGS: __DEV__,
  ENABLE_FLIPPER: __DEV__,
  ENABLE_REACTOTRON: __DEV__,
} as const;
