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
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    // Parse the JSON response
    const data = await response.json();

    if (response.ok) {
      return {
        data,
        error: null,
        status: response.status,
      };
    }

    return {
      data: null,
      error: data.message || 'An error occurred',
      status: response.status,
    };
  } catch (error) {
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
   * Check station verification status
   */
  checkStationVerificationStatus: async (data: { email: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/station/verification-status`, {
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
   * Get station details
   */
  getStationDetails: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/station/details`, {
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
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
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
};
