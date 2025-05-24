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
 * Parse XML string to JavaScript object
 */
const parseXML = (xmlString: string): any => {
  // Simple XML parser for the specific format we're receiving
  try {
    console.log('Parsing XML:', xmlString);

    // Check if it's an ApiResponse format
    if (xmlString.includes('<ApiResponse>')) {
      const success = xmlString.match(/<success>(.*?)<\/success>/)?.[1] === 'true';
      const message = xmlString.match(/<message>(.*?)<\/message>/)?.[1] || '';
      const timestamp = xmlString.match(/<timestamp>(.*?)<\/timestamp>/)?.[1] || '';

      // Extract data
      let data: any = {};
      if (xmlString.includes('<data>')) {
        const dataContent = xmlString.match(/<data>([\s\S]*?)<\/data>/)?.[1] || '';
        console.log('Data content:', dataContent);

        // Parse data content
        const sentMatch = dataContent.match(/<sent>(.*?)<\/sent>/);
        if (sentMatch) {
          data.sent = sentMatch[1] === 'true';
          console.log('Sent value:', data.sent);
        }

        const verifiedMatch = dataContent.match(/<verified>(.*?)<\/verified>/);
        if (verifiedMatch) {
          data.verified = verifiedMatch[1] === 'true';
          console.log('Verified value:', data.verified);
        }
      } else {
        // Check if sent is directly in the response (not nested in data)
        const sentMatch = xmlString.match(/<sent>(.*?)<\/sent>/);
        if (sentMatch) {
          data.sent = sentMatch[1] === 'true';
          console.log('Direct sent value:', data.sent);
        }

        // Check if verified is directly in the response (not nested in data)
        const verifiedMatch = xmlString.match(/<verified>(.*?)<\/verified>/);
        if (verifiedMatch) {
          data.verified = verifiedMatch[1] === 'true';
          console.log('Direct verified value:', data.verified);
        }
      }

      return {
        success,
        message,
        data,
        timestamp
      };
    }

    // Check if it's a Map format
    if (xmlString.includes('<Map>')) {
      const result: any = {};

      // Extract common fields
      const successMatch = xmlString.match(/<success>(.*?)<\/success>/);
      if (successMatch) {
        result.success = successMatch[1] === 'true';
      }

      const messageMatch = xmlString.match(/<message>(.*?)<\/message>/);
      if (messageMatch) {
        result.message = messageMatch[1];
      }

      // Extract email
      const emailMatch = xmlString.match(/<email>(.*?)<\/email>/);
      if (emailMatch) {
        result.email = emailMatch[1];
      }

      // Extract testCode
      const testCodeMatch = xmlString.match(/<testCode>(.*?)<\/testCode>/);
      if (testCodeMatch) {
        result.testCode = testCodeMatch[1];
      }

      return result;
    }

    // If we can't parse it, return the original string
    return { rawXml: xmlString };
  } catch (error) {
    console.error('Error parsing XML:', error);
    return { error: 'Failed to parse XML', rawXml: xmlString };
  }
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  try {
    // Get the content type
    const contentType = response.headers.get('Content-Type') || '';
    console.log('Response content type:', contentType);

    // Get the raw text
    const text = await response.text();
    console.log('Raw response text:', text);

    // If it's JSON
    if (contentType.includes('application/json') || text.trim().startsWith('{')) {
      try {
        const data = JSON.parse(text);

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
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        return {
          data: null,
          error: 'Invalid JSON response',
          status: response.status,
        };
      }
    }

    // If it's XML or looks like XML
    if (contentType.includes('application/xml') || text.trim().startsWith('<')) {
      const xmlData = parseXML(text);
      console.log('Parsed XML data:', xmlData);

      // Special handling for verification code responses
      if (text.includes('<sent>true</sent>') ||
          (xmlData.data && xmlData.data.sent === true) ||
          (xmlData.success && text.includes('Verification code sent successfully'))) {
        console.log('Detected successful verification code sending');
        return {
          data: { sent: true } as T,
          error: null,
          status: response.status,
        };
      }

      if (xmlData.success) {
        return {
          data: xmlData.data || xmlData,
          error: null,
          status: response.status,
        };
      }

      return {
        data: null,
        error: xmlData.message || 'Error in XML response',
        status: response.status,
      };
    }

    // If we don't know what it is
    return {
      data: null,
      error: 'Unknown response format',
      status: response.status,
    };
  } catch (error) {
    console.error('Error handling API response:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
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
      console.log('Sending verification code to:', data.email);
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      console.log('Send verification code response status:', response.status);
      return handleResponse(response);
    } catch (error) {
      console.error('Error sending verification code:', error);
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
      console.log('Verifying email code for:', data.email, 'with code:', data.code);
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-code`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(data),
        ...getCredentialOptions(),
      });

      console.log('Verify email code response status:', response.status);
      return handleResponse(response);
    } catch (error) {
      console.error('Error verifying email code:', error);
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
   * Get all vehicle owners with pagination, sorting, and filtering
   */
  getVehicleOwners: async (queryParams: string = ''): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams}`, {
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
   * Get vehicle owner details by ID
   */
  getVehicleOwnerById: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
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
   * Update vehicle owner information
   */
  updateVehicleOwner: async (id: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Update vehicle owner account status (enable/disable)
   */
  updateVehicleOwnerStatus: async (id: number, data: { isActive: boolean }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Get all users across all types with pagination, sorting, and filtering
   */
  getAllUsers: async (queryParams: string = ''): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users?${queryParams}`, {
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
   * Get user details by ID (works for all user types)
   */
  getUserById: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users/${id}`, {
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
   * Update user information (works for all user types)
   */
  updateUser: async (id: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Update user account status (enable/disable) - works for all user types
   */
  updateUserStatus: async (id: number, data: { isActive: boolean }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Delete user (soft delete by deactivating) - works for all user types
   */
  deleteUser: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/all-users/${id}`, {
        method: 'DELETE',
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
   * Get all fuel stations with pagination, sorting, and filtering
   */
  getFuelStations: async (queryParams: string = ''): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations?${queryParams}`, {
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
   * Get fuel station details by ID
   */
  getFuelStationById: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${id}`, {
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
   * Update fuel station information
   */
  updateFuelStation: async (id: number, data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Update fuel station verification status
   */
  updateFuelStationVerificationStatus: async (id: number, data: { status: string, rejectionReason?: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${id}/verification`, {
        method: 'PUT',
        headers: getAuthHeader(),
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
   * Get all transactions with pagination, sorting, and filtering
   */
  getAllTransactions: async (
    page: number = 0,
    size: number = 10,
    sort: string = 'transactionDate',
    direction: string = 'desc',
    filters: {
      vehicleId?: number,
      stationId?: number,
      startDate?: string,
      endDate?: string,
      fuelType?: string
    } = {}
  ): Promise<ApiResponse<any>> => {
    try {
      // Build the URL with query parameters
      let url = `${API_BASE_URL}/api/admin/transactions?page=${page}&size=${size}&sort=${sort}&direction=${direction}`;

      // Add optional filters if provided
      if (filters.vehicleId) url += `&vehicleId=${filters.vehicleId}`;
      if (filters.stationId) url += `&stationId=${filters.stationId}`;
      if (filters.startDate) url += `&startDate=${encodeURIComponent(filters.startDate)}`;
      if (filters.endDate) url += `&endDate=${encodeURIComponent(filters.endDate)}`;
      if (filters.fuelType) url += `&fuelType=${encodeURIComponent(filters.fuelType)}`;

      const response = await fetch(url, {
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
   * Get transaction details by ID
   */
  getTransactionById: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions/${id}`, {
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
   * Get transaction statistics
   */
  getTransactionStats: async (startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
    try {
      // Build the URL with query parameters
      let url = `${API_BASE_URL}/api/admin/transactions/stats`;

      // Add optional filters if provided
      if (startDate) url += `?startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `${startDate ? '&' : '?'}endDate=${encodeURIComponent(endDate)}`;

      const response = await fetch(url, {
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

  /**
   * Update admin profile
   */
  updateUserProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
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
   * Get vehicle classes with quota amounts
   */
  getVehicleClasses: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/vehicle-classes`, {
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
   * Update vehicle class quota amount
   */
  updateVehicleClassQuota: async (data: {
    vehicleClassId: number,
    fuelQuotaAmount: number,
    reason?: string
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/vehicle-classes/${data.vehicleClassId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          fuelQuotaAmount: data.fuelQuotaAmount,
          reason: data.reason
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
   * Allocate quota for a specific vehicle
   */
  allocateQuota: async (data: {
    vehicleId: number,
    allocatedAmount: number,
    allocationDate: string,
    expiryDate: string
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/allocate`, {
        method: 'POST',
        headers: getAuthHeader(),
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
   * Allocate quotas for all vehicles of a specific class
   */
  allocateQuotasByVehicleClass: async (data: {
    vehicleClassId: number,
    allocationDate: string,
    expiryDate: string
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/allocate-by-class/${data.vehicleClassId}`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          allocationDate: data.allocationDate,
          expiryDate: data.expiryDate
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
   * Get quota details for a specific vehicle
   */
  getQuotaDetailsByVehicleId: async (vehicleId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/details/${vehicleId}`, {
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
   * Get quota change history
   */
  getQuotaHistory: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota/history`, {
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
