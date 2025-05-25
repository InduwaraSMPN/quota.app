// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.133.111:8888',
  TIMEOUT: 60000, // Increased to 60 seconds for debugging
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

// Theme Colors - Matching frontend-station design system
export const LIGHT_THEME = {
  background: '#faf9f5',
  foreground: '#3d3929',
  card: '#faf9f5',
  cardForeground: '#141413',
  popover: '#ffffff',
  popoverForeground: '#28261b',
  primary: '#9f0707',
  primaryForeground: '#ffffff',
  secondary: '#e9e6dc',
  secondaryForeground: '#535146',
  muted: '#ede9de',
  mutedForeground: '#83827d',
  accent: '#e9e6dc',
  accentForeground: '#28261b',
  destructive: '#141413',
  destructiveForeground: '#ffffff',
  border: '#dad9d4',
  input: '#b4b2a7',
  ring: '#207fde',

  // Chart colors
  chart1: '#b05730',
  chart2: '#9c87f5',
  chart3: '#ded8c4',
  chart4: '#dbd3f0',
  chart5: '#b4552d',

  // Sidebar colors
  sidebar: '#f5f4ee',
  sidebarForeground: '#3d3d3a',
  sidebarPrimary: '#c96442',
  sidebarPrimaryForeground: '#fbfbfb',
  sidebarAccent: '#e9e6dc',
  sidebarAccentForeground: '#343434',
  sidebarBorder: '#ebebeb',
  sidebarRing: '#b5b5b5',
} as const;

export const DARK_THEME = {
  background: '#262624',
  foreground: '#c3c0b6',
  card: '#262624',
  cardForeground: '#faf9f5',
  popover: '#30302e',
  popoverForeground: '#e5e5e2',
  primary: '#9f0707',
  primaryForeground: '#ffffff',
  secondary: '#faf9f5',
  secondaryForeground: '#30302e',
  muted: '#1b1b19',
  mutedForeground: '#b7b5a9',
  accent: '#1a1915',
  accentForeground: '#f5f4ee',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#3e3e38',
  input: '#52514a',
  ring: '#207fde',

  // Chart colors
  chart1: '#b05730',
  chart2: '#9c87f5',
  chart3: '#1a1915',
  chart4: '#2f2b48',
  chart5: '#b4552d',

  // Sidebar colors
  sidebar: '#1f1e1d',
  sidebarForeground: '#c3c0b6',
  sidebarPrimary: '#343434',
  sidebarPrimaryForeground: '#fbfbfb',
  sidebarAccent: '#0f0f0e',
  sidebarAccentForeground: '#c3c0b6',
  sidebarBorder: '#ebebeb',
  sidebarRing: '#b5b5b5',
} as const;

// Legacy colors for backward compatibility (will be deprecated)
export const COLORS = {
  primary: LIGHT_THEME.primary,
  primaryDark: '#7a0505',
  primaryLight: '#b91a1a',
  secondary: LIGHT_THEME.chart1,
  success: '#28A745',
  warning: '#FFC107',
  error: LIGHT_THEME.destructive,
  info: LIGHT_THEME.ring,

  // Grays - mapped to new theme
  gray50: LIGHT_THEME.muted,
  gray100: LIGHT_THEME.secondary,
  gray200: LIGHT_THEME.border,
  gray300: LIGHT_THEME.input,
  gray400: LIGHT_THEME.mutedForeground,
  gray500: LIGHT_THEME.secondaryForeground,
  gray600: LIGHT_THEME.foreground,
  gray700: LIGHT_THEME.cardForeground,
  gray800: '#0f0f0e',
  gray900: '#0a0a09',

  // Background
  background: LIGHT_THEME.background,
  backgroundSecondary: LIGHT_THEME.secondary,
  surface: LIGHT_THEME.card,

  // Text
  textPrimary: LIGHT_THEME.foreground,
  textSecondary: LIGHT_THEME.mutedForeground,
  textLight: LIGHT_THEME.input,
  textInverse: LIGHT_THEME.primaryForeground,
} as const;

// Typography - Matching frontend-station design system
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'SpaceGrotesk-Regular', // Will need to be loaded
    sansMedium: 'SpaceGrotesk-Medium',
    sansSemiBold: 'SpaceGrotesk-SemiBold',
    sansBold: 'SpaceGrotesk-Bold',
    mono: 'Menlo', // Fallback for monospace
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
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
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0.05, // Matching frontend-station tracking-normal
    wide: 0.075,
    wider: 0.1,
    widest: 0.15,
  },
} as const;

// Spacing - Enhanced to match design system
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
  '6xl': 128,
} as const;

// Border Radius - Matching frontend-station design system
export const BORDER_RADIUS = {
  sm: 4,  // calc(0.5rem - 4px) = 4px
  md: 6,  // calc(0.5rem - 2px) = 6px
  lg: 8,  // 0.5rem = 8px
  xl: 12, // calc(0.5rem + 4px) = 12px
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Shadows - Matching frontend-station design system
export const SHADOWS = {
  '2xs': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
  },
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
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
