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
};
