import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS, LOGGING_CONFIG } from '../constants';
import {
  ApiResponse,
  AuthRequest,
  AuthResponse,
  FuelStation,
  TransactionCreate,
  TransactionDetails,
  VehicleValidation,
  Notification
} from '../types';
import { getErrorMessage } from '../utils';
import * as SecureStore from 'expo-secure-store';
import logger, { LogCategory } from '../utils/logger';
import apiLogger from './apiLogger';
import jwtLogger from './jwtLogger';
import networkMonitor from './networkMonitor';

class ApiService {
  private baseURL: string;
  private timeout: number;
  private isInitialized: boolean = false;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.initialize();
  }

  // Initialize logging and monitoring
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize network monitoring
      if (LOGGING_CONFIG.LOG_NETWORK_CHANGES) {
        await networkMonitor.startMonitoring();
        logger.info(LogCategory.API, 'API Service initialized with network monitoring');
      }

      // Log JWT token status on initialization
      await jwtLogger.logTokenRetrieved();

      this.isInitialized = true;
      logger.info(LogCategory.API, 'API Service fully initialized', {
        baseURL: this.baseURL,
        timeout: this.timeout,
        networkMonitoring: LOGGING_CONFIG.LOG_NETWORK_CHANGES,
      });
    } catch (error) {
      logger.error(LogCategory.API, 'Failed to initialize API Service', error);
    }
  }

  // Helper method to get auth headers
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);

    // Log token retrieval and validation
    if (token && LOGGING_CONFIG.LOG_TOKEN_VALIDATION) {
      try {
        // Check if token should be refreshed
        const shouldRefresh = await jwtLogger.shouldRefreshToken();
        if (shouldRefresh) {
          logger.warn(LogCategory.AUTH, 'Token refresh recommended before API call');
        }
      } catch (error) {
        logger.error(LogCategory.AUTH, 'Error checking token status', error);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Mobile-App': 'quota-app',
      'X-App-Version': '1.0.0',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (LOGGING_CONFIG.LOG_REQUEST_HEADERS) {
      logger.debug(LogCategory.API, 'Auth headers prepared', {
        hasToken: !!token,
        tokenLength: token?.length,
      });
    }

    return headers;
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
    const url = `${this.baseURL}${endpoint}`;
    let requestId: string | null = null;
    const startTime = Date.now();

    try {
      // Check network connectivity
      if (!networkMonitor.isConnected()) {
        logger.warn(LogCategory.NETWORK, 'No network connection available');
        throw new Error('No network connection');
      }

      const headers = await this.getAuthHeaders();

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        // Note: fetch doesn't support timeout directly, we'll implement it with AbortController
      };

      // Log API request
      if (LOGGING_CONFIG.LOG_API_REQUESTS) {
        requestId = apiLogger.logRequest(url, config);
      }

      // Implement timeout with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Log API response
      if (requestId && LOGGING_CONFIG.LOG_API_RESPONSES) {
        apiLogger.logResponse(requestId, response);
      }

      // Check for slow requests
      const duration = Date.now() - startTime;
      if (LOGGING_CONFIG.LOG_SLOW_REQUESTS && duration > LOGGING_CONFIG.SLOW_REQUEST_THRESHOLD) {
        logger.warn(LogCategory.API, `Slow API request detected: ${duration}ms`, {
          url,
          method: options.method || 'GET',
          duration,
        });
      }

      const apiResponse = await this.handleResponse<T>(response);

      // Log API response wrapper
      if (requestId && LOGGING_CONFIG.LOG_API_RESPONSES) {
        apiLogger.logApiResponse(requestId, apiResponse);
      }

      return apiResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = getErrorMessage(error);

      // Log API error
      if (requestId && LOGGING_CONFIG.LOG_API_ERRORS) {
        apiLogger.logError(requestId, errorMessage, url, options.method || 'GET');
      } else if (LOGGING_CONFIG.LOG_API_ERRORS) {
        logger.error(LogCategory.API, `API request failed: ${options.method || 'GET'} ${url}`, {
          error: errorMessage,
          duration,
        });
      }

      return {
        data: null,
        error: errorMessage,
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
    // Log refresh token attempt
    jwtLogger.logTokenRefreshStarted('Explicit refresh token call');

    const response = await this.makeRequest<AuthResponse>(
      `${API_ENDPOINTS.REFRESH_TOKEN}?refreshToken=${refreshToken}`,
      {
        method: 'POST',
      }
    );

    // Log refresh result
    if (response.error) {
      jwtLogger.logTokenRefreshFailed(response.error);
    } else if (response.data) {
      jwtLogger.logTokenRefreshSuccess(response.data.token, response.data.refreshToken);
      // Automatically save new tokens
      await this.saveTokens(response.data);
    }

    return response;
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
    // Convert numeric values to strings for BigDecimal compatibility
    const formattedData = {
      ...transactionData,
      amount: transactionData.amount.toString(),
      unitPrice: transactionData.unitPrice.toString(),
    };

    // Log the formatted data for debugging
    if (LOGGING_CONFIG.LOG_API_REQUESTS) {
      logger.debug(LogCategory.API, 'Dispensing fuel with data:', formattedData);
      logger.debug(LogCategory.API, 'Target endpoint:', `${this.baseURL}${API_ENDPOINTS.DISPENSE_FUEL}`);
    }

    try {
      const result = await this.makeRequest<TransactionDetails>(API_ENDPOINTS.DISPENSE_FUEL, {
        method: 'POST',
        body: JSON.stringify(formattedData),
      });

      // Log the result for debugging
      if (LOGGING_CONFIG.LOG_API_RESPONSES) {
        logger.debug(LogCategory.API, 'Dispense fuel result:', {
          success: !result.error,
          error: result.error,
          hasData: !!result.data
        });
      }

      return result;
    } catch (error) {
      logger.error(LogCategory.API, 'Dispense fuel error:', error);
      throw error;
    }
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
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseURL}/api/auth/test`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isConnected = response.ok;
      logger.info(LogCategory.NETWORK, `Connection test: ${isConnected ? 'success' : 'failed'}`, {
        status: response.status,
        url: `${this.baseURL}/api/auth/test`,
      });

      return isConnected;
    } catch (error) {
      logger.warn(LogCategory.NETWORK, 'Connection test failed', error);
      return false;
    }
  }

  // Token Management
  async saveTokens(authResponse: AuthResponse): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken);

      // Log token storage
      jwtLogger.logTokenStored(authResponse.token, authResponse.refreshToken);

      logger.info(LogCategory.AUTH, 'JWT tokens saved successfully');
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Error saving tokens', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      // Log token clearing
      jwtLogger.logTokenCleared('Manual logout');

      logger.info(LogCategory.AUTH, 'JWT tokens cleared successfully');
    } catch (error) {
      logger.error(LogCategory.AUTH, 'Error clearing tokens', error);
      throw error;
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