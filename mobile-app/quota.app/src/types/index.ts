// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  message?: string;
}

// Authentication Types
export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
  expiresIn: number;
}

export interface User {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

// Station Types
export interface StationOwner {
  id: number;
  fullName: string;
  nicNumber: string;
  contactNumber: string;
  user: User;
}

export interface FuelStation {
  id: number;
  owner: StationOwner;
  businessRegistrationNumber: string;
  businessName: string;
  businessAddress: string;
  stationName: string;
  openingTime: string;
  closingTime: string;
  fuelRetailLicenseNumber: string;
  isActive: boolean;
  verificationStatus: string;
  province: string;
  district: string;
}

// Vehicle Types
export interface Vehicle {
  id: number;
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  vehicleClass: string;
  owner: VehicleOwner;
}

export interface VehicleOwner {
  id: number;
  fullName: string;
  nicNumber: string;
  contactNumber: string;
  user: User;
}

// Fuel Types
export enum FuelType {
  OCTANE_92 = 'OCTANE_92',
  OCTANE_95 = 'OCTANE_95',
  AUTO_DIESEL = 'AUTO_DIESEL',
  SUPER_DIESEL = 'SUPER_DIESEL',
  KEROSENE = 'KEROSENE'
}

// Quota Types
export interface QuotaDetails {
  vehicleId: number;
  totalQuota: number;
  usedAmount: number;
  remainingAmount: number;
  quotaStatus: string;
  lastRefuelDate?: string;
  nextRefuelDate?: string;
}

// Transaction Types
export interface TransactionCreate {
  vehicleId: number;
  stationId: number;
  fuelType: FuelType;
  amount: number;
  unitPrice: number;
}

export interface TransactionDetails {
  id: number;
  vehicleId: number;
  vehicleRegistrationNumber: string;
  stationId: number;
  stationName: string;
  fuelType: FuelType;
  amount: number;
  unitPrice: number;
  totalPrice: number;
  transactionDate: string;
}

// Validation Types
export interface VehicleValidation {
  vehicleId: number;
  registrationNumber: string;
  make: string;
  model: string;
  fuelType: FuelType;
  quotaDetails?: QuotaDetails;
  isValid: boolean;
  message?: string;
}

// Navigation Types
export interface NavigationParams {
  vehicleId?: number;
  registrationNumber?: string;
  transactionId?: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ManualEntryForm {
  registrationNumber: string;
}

export interface FuelDispenseForm {
  vehicleId: number;
  fuelType: FuelType;
  amount: number;
  unitPrice: number;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'system' | 'transaction' | 'warning' | 'info';
}

// QR Code Types
export interface QRCodeData {
  registrationNumber: string;
  ownerId: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Camera Types
export interface CameraPermission {
  granted: boolean;
  canAskAgain: boolean;
}

// Storage Types
export interface StorageKeys {
  AUTH_TOKEN: 'auth_token';
  REFRESH_TOKEN: 'refresh_token';
  USER_DATA: 'user_data';
  STATION_DATA: 'station_data';
  RECENT_SEARCHES: 'recent_searches';
}
