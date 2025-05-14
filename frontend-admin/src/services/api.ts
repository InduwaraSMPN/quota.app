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
 * Get credential options for fetch
 */
const getCredentialOptions = () => {
  return {
    credentials: 'include' as RequestCredentials,
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
   * Send email verification code
   */
  sendVerificationCode: async (data: { email: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
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
      if (result.data && typeof result.data === 'object' && result.data !== null &&
          'isActive' in result.data && result.data.isActive === false) {
        return {
          data: null,
          error: 'Your account is inactive. Please contact support.',
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
   * Get admin profile
   */
  getAdminProfile: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
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
   * Get system statistics
   */
  getSystemStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
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
   * Get all vehicle owners
   */
  getVehicleOwners: async (page: number = 1, limit: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/vehicle-owners?page=${page}&limit=${limit}`, {
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
   * Get all station owners
   */
  getStationOwners: async (page: number = 1, limit: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/station-owners?page=${page}&limit=${limit}`, {
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
   * Get all fuel stations
   */
  getFuelStations: async (page: number = 1, limit: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations?page=${page}&limit=${limit}`, {
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
   * Get recent transactions
   */
  getRecentTransactions: async (limit: number = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions/recent?limit=${limit}`, {
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
   * Get system notifications
   */
  getSystemNotifications: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
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
   * Get station verifications
   */
  getStationVerifications: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/station-verifications`, {
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
   * Update station verification status
   */
  updateStationVerificationStatus: async (data: {
    verificationId: string;
    status: string;
    rejectionReason?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/station-verifications/${data.verificationId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          status: data.status,
          rejectionReason: data.rejectionReason
        }),
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
   * Update admin information in session
   */
  updateAdminInfo: async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/admin-info`, {
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
};
