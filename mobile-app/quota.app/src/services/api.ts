import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from '../constants';
import { 
  ApiResponse, 
  AuthRequest, 
  AuthResponse, 
  FuelStation, 
  TransactionCreate, 
  TransactionDetails, 
  VehicleValidation,
  QuotaDetails,
  Notification
} from '../types';
import { getErrorMessage } from '../utils';
import * as SecureStore from 'expo-secure-store';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Helper method to get auth headers
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          data: data.data || data,
          error: null,
          status: response.status,
          message: data.message,
        };
      } else {
        return {
          data: null,
          error: data.error || data.message || 'Request failed',
          status: response.status,
          message: data.message,
        };
      }
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        status: response.status,
      };
    }
  }

  // Helper method to make API requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.getAuthHeaders();
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        timeout: this.timeout,
      };

      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        status: 0,
      };
    }
  }

  // Authentication Methods
  async login(credentials: AuthRequest): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>(
      `${API_ENDPOINTS.REFRESH_TOKEN}?refreshToken=${refreshToken}`,
      {
        method: 'POST',
      }
    );
  }

  async sendVerificationCode(email: string): Promise<ApiResponse<{ sent: boolean }>> {
    return this.makeRequest<{ sent: boolean }>(API_ENDPOINTS.SEND_VERIFICATION, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyCode(email: string, code: string): Promise<ApiResponse<{ verified: boolean }>> {
    return this.makeRequest<{ verified: boolean }>(API_ENDPOINTS.VERIFY_CODE, {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  // Station Methods
  async getStationDetails(): Promise<ApiResponse<FuelStation>> {
    return this.makeRequest<FuelStation>(API_ENDPOINTS.STATION_DETAILS);
  }

  async getStationTransactions(
    page: number = 0,
    size: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ content: TransactionDetails[]; totalElements: number }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    return this.makeRequest<{ content: TransactionDetails[]; totalElements: number }>(
      `${API_ENDPOINTS.STATION_TRANSACTIONS}?${params}`
    );
  }

  async getStationNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.makeRequest<Notification[]>(API_ENDPOINTS.STATION_NOTIFICATIONS);
  }

  async updateStationProfile(profileData: any): Promise<ApiResponse<FuelStation>> {
    return this.makeRequest<FuelStation>(API_ENDPOINTS.STATION_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Vehicle & Quota Methods
  async getVehicleByRegistration(registrationNumber: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(
      `${API_ENDPOINTS.VEHICLE_BY_REGISTRATION}/${registrationNumber}`
    );
  }

  async validateVehicleQuota(vehicleId: number): Promise<ApiResponse<VehicleValidation>> {
    return this.makeRequest<VehicleValidation>(
      `${API_ENDPOINTS.VALIDATE_QUOTA}/${vehicleId}`
    );
  }

  async dispenseFuel(transactionData: TransactionCreate): Promise<ApiResponse<TransactionDetails>> {
    return this.makeRequest<TransactionDetails>(API_ENDPOINTS.DISPENSE_FUEL, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Registration Methods (for station owners)
  async registerStep1(loginInfo: { email: string }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(API_ENDPOINTS.STATION_REGISTER_STEP1, {
      method: 'POST',
      body: JSON.stringify(loginInfo),
    });
  }

  async registerStep2(passwordInfo: { password: string }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(API_ENDPOINTS.STATION_REGISTER_STEP2, {
      method: 'POST',
      body: JSON.stringify(passwordInfo),
    });
  }

  async registerStep3(ownerInfo: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(API_ENDPOINTS.STATION_REGISTER_STEP3, {
      method: 'POST',
      body: JSON.stringify(ownerInfo),
    });
  }

  async completeRegistration(businessInfo: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(API_ENDPOINTS.STATION_REGISTER_COMPLETE, {
      method: 'POST',
      body: JSON.stringify(businessInfo),
    });
  }

  // Utility Methods
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/test`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Token Management
  async saveTokens(authResponse: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting stored refresh token:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
