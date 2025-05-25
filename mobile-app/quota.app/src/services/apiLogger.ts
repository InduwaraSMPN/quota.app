import logger, { LogCategory } from '../utils/logger';
import { ApiResponse } from '../types';

// Interface for API request logging
interface ApiRequestLog {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
}

// Interface for API response logging
interface ApiResponseLog {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

// Interface for API error logging
interface ApiErrorLog {
  requestId: string;
  error: Error | string;
  url: string;
  method: string;
  timestamp: Date;
  networkError: boolean;
}

class ApiLogger {
  private requestCounter = 0;
  private activeRequests = new Map<string, { startTime: number; url: string; method: string }>();

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${++this.requestCounter}_${Date.now()}`;
  }

  // Log API request
  logRequest(url: string, options: RequestInit = {}): string {
    const requestId = this.generateRequestId();
    const timestamp = new Date();
    const method = options.method || 'GET';

    // Store request start time for duration calculation
    this.activeRequests.set(requestId, {
      startTime: Date.now(),
      url,
      method,
    });

    // Prepare headers for logging (exclude sensitive data)
    const headers = this.sanitizeHeaders(options.headers as Record<string, string> || {});

    // Prepare body for logging (exclude sensitive data)
    const body = this.sanitizeRequestBody(options.body);

    const requestLog: ApiRequestLog = {
      id: requestId,
      url,
      method,
      headers,
      body,
      timestamp,
    };

    logger.info(
      LogCategory.API,
      `🚀 API Request [${requestId}]: ${method} ${url}`,
      requestLog
    );

    // Log detailed request information
    logger.debug(LogCategory.API, `Request Headers [${requestId}]:`, headers);
    if (body) {
      logger.debug(LogCategory.API, `Request Body [${requestId}]:`, body);
    }

    return requestId;
  }

  // Log API response
  logResponse<T>(requestId: string, response: Response, data?: T): void {
    const activeRequest = this.activeRequests.get(requestId);
    if (!activeRequest) {
      logger.warn(LogCategory.API, `No active request found for ID: ${requestId}`);
      return;
    }

    const duration = Date.now() - activeRequest.startTime;
    const timestamp = new Date();

    // Prepare headers for logging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const responseLog: ApiResponseLog = {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers,
      data: this.sanitizeResponseData(data),
      duration,
      timestamp,
    };

    // Choose log level based on status code
    const isSuccess = response.status >= 200 && response.status < 300;
    const isClientError = response.status >= 400 && response.status < 500;
    const isServerError = response.status >= 500;

    if (isSuccess) {
      logger.info(
        LogCategory.API,
        `✅ API Response [${requestId}]: ${response.status} ${response.statusText} (${duration}ms)`,
        responseLog
      );
    } else if (isClientError) {
      logger.warn(
        LogCategory.API,
        `⚠️ API Client Error [${requestId}]: ${response.status} ${response.statusText} (${duration}ms)`,
        responseLog
      );
    } else if (isServerError) {
      logger.error(
        LogCategory.API,
        `❌ API Server Error [${requestId}]: ${response.status} ${response.statusText} (${duration}ms)`,
        responseLog
      );
    }

    // Log response headers and data
    logger.debug(LogCategory.API, `Response Headers [${requestId}]:`, headers);
    if (data) {
      logger.debug(LogCategory.API, `Response Data [${requestId}]:`, data);
    }

    // Clean up active request
    this.activeRequests.delete(requestId);
  }

  // Log API error
  logError(requestId: string, error: Error | string, url?: string, method?: string): void {
    const activeRequest = this.activeRequests.get(requestId);
    const timestamp = new Date();

    // Determine if this is a network error
    const isNetworkError = this.isNetworkError(error);

    const errorLog: ApiErrorLog = {
      requestId,
      error: error instanceof Error ? error.message : error,
      url: url || activeRequest?.url || 'unknown',
      method: method || activeRequest?.method || 'unknown',
      timestamp,
      networkError: isNetworkError,
    };

    if (isNetworkError) {
      logger.error(
        LogCategory.NETWORK,
        `🌐 Network Error [${requestId}]: ${errorLog.error}`,
        errorLog
      );
    } else {
      logger.error(
        LogCategory.API,
        `💥 API Error [${requestId}]: ${errorLog.error}`,
        errorLog
      );
    }

    // Log full error details if it's an Error object
    if (error instanceof Error) {
      logger.debug(LogCategory.API, `Error Stack [${requestId}]:`, error.stack);
    }

    // Clean up active request
    this.activeRequests.delete(requestId);
  }

  // Log API response from ApiResponse wrapper
  logApiResponse<T>(requestId: string, apiResponse: ApiResponse<T>): void {
    const activeRequest = this.activeRequests.get(requestId);
    if (!activeRequest) {
      logger.warn(LogCategory.API, `No active request found for ID: ${requestId}`);
      return;
    }

    const duration = Date.now() - activeRequest.startTime;
    const timestamp = new Date();

    if (apiResponse.error) {
      logger.error(
        LogCategory.API,
        `❌ API Error Response [${requestId}]: ${apiResponse.error} (${duration}ms)`,
        {
          requestId,
          error: apiResponse.error,
          status: apiResponse.status,
          message: apiResponse.message,
          duration,
          timestamp,
        }
      );
    } else {
      logger.info(
        LogCategory.API,
        `✅ API Success Response [${requestId}]: Status ${apiResponse.status} (${duration}ms)`,
        {
          requestId,
          status: apiResponse.status,
          message: apiResponse.message,
          data: this.sanitizeResponseData(apiResponse.data),
          duration,
          timestamp,
        }
      );
    }

    // Clean up active request
    this.activeRequests.delete(requestId);
  }

  // Sanitize headers to remove sensitive information
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    
    // List of sensitive header keys to mask
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        const value = sanitized[key];
        if (value && value.length > 10) {
          sanitized[key] = `${value.substring(0, 10)}...***MASKED***`;
        } else {
          sanitized[key] = '***MASKED***';
        }
      }
    });

    return sanitized;
  }

  // Sanitize request body to remove sensitive information
  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    try {
      let parsedBody: any;
      
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          return body; // Return as-is if not JSON
        }
      } else {
        parsedBody = body;
      }

      if (typeof parsedBody === 'object' && parsedBody !== null) {
        const sanitized = { ...parsedBody };
        
        // List of sensitive field names to mask
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
        
        Object.keys(sanitized).forEach(key => {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '***MASKED***';
          }
        });

        return sanitized;
      }

      return parsedBody;
    } catch (error) {
      logger.warn(LogCategory.API, 'Failed to sanitize request body:', error);
      return body;
    }
  }

  // Sanitize response data to remove sensitive information
  private sanitizeResponseData(data: any): any {
    if (!data) return data;

    try {
      if (typeof data === 'object' && data !== null) {
        const sanitized = { ...data };
        
        // List of sensitive field names to mask
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
        
        Object.keys(sanitized).forEach(key => {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            const value = sanitized[key];
            if (typeof value === 'string' && value.length > 10) {
              sanitized[key] = `${value.substring(0, 10)}...***MASKED***`;
            } else {
              sanitized[key] = '***MASKED***';
            }
          }
        });

        return sanitized;
      }

      return data;
    } catch (error) {
      logger.warn(LogCategory.API, 'Failed to sanitize response data:', error);
      return data;
    }
  }

  // Check if error is a network-related error
  private isNetworkError(error: Error | string): boolean {
    const errorMessage = error instanceof Error ? error.message : error;
    const networkErrorPatterns = [
      'network request failed',
      'fetch failed',
      'connection refused',
      'timeout',
      'no internet',
      'offline',
      'dns',
      'unreachable',
    ];

    return networkErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern)
    );
  }

  // Get active requests count
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  // Get active requests details
  getActiveRequests(): Array<{ id: string; url: string; method: string; duration: number }> {
    const now = Date.now();
    return Array.from(this.activeRequests.entries()).map(([id, request]) => ({
      id,
      url: request.url,
      method: request.method,
      duration: now - request.startTime,
    }));
  }

  // Clear all active requests (useful for cleanup)
  clearActiveRequests(): void {
    this.activeRequests.clear();
  }
}

// Create singleton instance
const apiLogger = new ApiLogger();

export default apiLogger;
export { ApiRequestLog, ApiResponseLog, ApiErrorLog };
