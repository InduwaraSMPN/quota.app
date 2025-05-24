// API service for making requests to the backend

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8888';

// Default headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Interface for API response
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Add authorization header with JWT token
 */
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token
    ? {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      }
    : DEFAULT_HEADERS;
};

/**
 * Add credentials to fetch options
 */
const getCredentialOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    credentials: 'include', // Include cookies in requests
  };
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    // Parse the JSON response
    const data = await response.json();

    if (response.ok) {
      return {
        data: data.data || data,
        error: null,
        status: response.status,
      };
    }

    // Handle error response
    return {
      data: null,
      error: data.message || 'An error occurred',
      status: response.status,
    };
  } catch (error) {
    console.error('Error parsing API response:', error);
    return {
      data: null,
      error: 'Failed to parse response',
      status: response.status,
    };
  }
};

/**
 * API service for making requests to the backend
 */
export const apiService = {
  /**
   * Get registration data from session
   */
  getRegistrationData: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/registration-data`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update registration data in session
   */
  updateRegistrationData: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/registration-data`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Clear registration data from session
   */
  clearRegistrationData: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/registration-data`, {
        method: 'DELETE',
        headers: DEFAULT_HEADERS,
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update login information in session
   */
  updateLoginInfo: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/login-info`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update password in session
   */
  updatePassword: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/password`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update owner information in session
   */
  updateOwnerInfo: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/owner-info`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update vehicle information in session
   */
  updateVehicleInfo: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/vehicle-info`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update email verified status in session
   */
  updateEmailVerified: async (data: { verified: boolean }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/email-verified`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update current step in session
   */
  updateCurrentStep: async (data: { currentStep: number }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/current-step`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Send email verification code
   */
  sendVerificationCode: async (data: { email: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Verify email code
   */
  verifyEmailCode: async (data: { email: string, code: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-code`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },
  /**
   * Validate vehicle information against DMT database
   */
  validateVehicleWithDMT: async (vehicleData: any, ownerData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dmt/validate`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          registrationNumber: vehicleData.registrationNumber,
          engineNumber: vehicleData.engineNumber,
          chassisNumber: vehicleData.chassisNumber,
          ownerNIC: ownerData.nicNumber,
          ownerName: ownerData.fullName
        }),
        ...getCredentialOptions(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },
  /**
   * Login user
   */
  login: async (username: string, password: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, password }),
        ...getCredentialOptions(),
      });

      const result = await handleResponse(response);

      // Check for specific error conditions
      if (!result.data) {
        if (response.status === 401) {
          return {
            data: null,
            error: result.error || 'Invalid email or password',
            status: 401,
          };
        } else if (response.status === 403) {
          return {
            data: null,
            error: result.error || 'Access denied',
            status: 403,
          };
        }
      }

      // Check if the user is inactive
      if (result.data && result.data.isActive === false) {
        return {
          data: null,
          error: 'Your account is inactive. Please contact support.',
          status: 403,
        };
      }

      // Check if the email is not verified
      if (result.data && result.data.emailVerified === false) {
        return {
          data: null,
          error: 'Your email is not verified. Please verify your email first.',
          status: 403,
        };
      }

      return result;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get user profile
   */
  getUserProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get vehicle details
   */
  getVehicleDetails: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle/details`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get fuel quota information for all vehicles
   */
  getFuelQuota: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quota/details`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get fuel quota information for a specific vehicle
   */
  getFuelQuotaByVehicleId: async (vehicleId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quota/details/${vehicleId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get consumption history for all vehicles
   */
  getConsumptionHistory: async (page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quota/consumption/history?page=${page}&size=${size}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get consumption history for a specific vehicle
   */
  getConsumptionHistoryByVehicleId: async (vehicleId: number, page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quota/consumption/history/${vehicleId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Get notifications
   */
  getNotifications: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle-owner/profile`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(profileData),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Update vehicle details
   */
  updateVehicleDetails: async (vehicleData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle/details`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(vehicleData),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },

  /**
   * Add a new vehicle to the authenticated user
   */
  addVehicle: async (vehicleData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicle/add`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(vehicleData),
      });

      return handleResponse(response);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  },
};
