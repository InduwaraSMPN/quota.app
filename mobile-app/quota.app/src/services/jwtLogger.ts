import logger, { LogCategory } from '../utils/logger';
import { LOGGING_CONFIG } from '../constants';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

// JWT Token information interface
interface TokenInfo {
  token: string;
  isValid: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
  subject: string | null;
  issuer: string | null;
  audience: string | null;
  timeToExpiry: number | null; // in milliseconds
}

// JWT Token event types
export enum TokenEventType {
  TOKEN_STORED = 'TOKEN_STORED',
  TOKEN_RETRIEVED = 'TOKEN_RETRIEVED',
  TOKEN_VALIDATED = 'TOKEN_VALIDATED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_STARTED = 'TOKEN_REFRESH_STARTED',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_CLEARED = 'TOKEN_CLEARED',
  TOKEN_DECODE_ERROR = 'TOKEN_DECODE_ERROR',
}

// JWT Token event interface
interface TokenEvent {
  type: TokenEventType;
  timestamp: Date;
  tokenInfo?: Partial<TokenInfo>;
  error?: string;
  metadata?: any;
}

class JwtLogger {
  private tokenEvents: TokenEvent[] = [];
  private maxEvents = 100;
  private refreshAttempts = 0;
  private lastRefreshTime: Date | null = null;

  // Log token storage
  logTokenStored(token: string, refreshToken?: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_VALIDATION) return;

    const tokenInfo = this.parseToken(token);
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_STORED,
      timestamp: new Date(),
      tokenInfo,
      metadata: {
        hasRefreshToken: !!refreshToken,
        tokenLength: token.length,
      },
    };

    this.addEvent(event);

    logger.info(
      LogCategory.AUTH,
      '🔐 JWT token stored',
      {
        isValid: tokenInfo.isValid,
        expiresAt: tokenInfo.expiresAt,
        timeToExpiry: tokenInfo.timeToExpiry,
        hasRefreshToken: !!refreshToken,
      }
    );

    // Log warning if token expires soon
    if (tokenInfo.timeToExpiry && tokenInfo.timeToExpiry < 300000) { // 5 minutes
      logger.warn(
        LogCategory.AUTH,
        '⚠️ JWT token expires soon',
        { timeToExpiry: tokenInfo.timeToExpiry }
      );
    }
  }

  // Log token retrieval
  async logTokenRetrieved(): Promise<void> {
    if (!LOGGING_CONFIG.LOG_TOKEN_VALIDATION) return;

    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      if (!token) {
        logger.debug(LogCategory.AUTH, '🔍 No JWT token found in storage');
        return;
      }

      const tokenInfo = this.parseToken(token);
      const event: TokenEvent = {
        type: TokenEventType.TOKEN_RETRIEVED,
        timestamp: new Date(),
        tokenInfo,
        metadata: {
          hasRefreshToken: !!refreshToken,
        },
      };

      this.addEvent(event);

      logger.debug(
        LogCategory.AUTH,
        '🔍 JWT token retrieved from storage',
        {
          isValid: tokenInfo.isValid,
          isExpired: tokenInfo.isExpired,
          expiresAt: tokenInfo.expiresAt,
          timeToExpiry: tokenInfo.timeToExpiry,
        }
      );

      // Log if token is expired
      if (tokenInfo.isExpired) {
        this.logTokenExpired(token);
      }
    } catch (error) {
      logger.error(LogCategory.AUTH, '❌ Failed to retrieve JWT token', error);
    }
  }

  // Log token validation
  logTokenValidation(token: string, isValid: boolean, error?: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_VALIDATION) return;

    const tokenInfo = this.parseToken(token);
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_VALIDATED,
      timestamp: new Date(),
      tokenInfo,
      error,
    };

    this.addEvent(event);

    if (isValid) {
      logger.debug(
        LogCategory.AUTH,
        '✅ JWT token validation successful',
        {
          expiresAt: tokenInfo.expiresAt,
          timeToExpiry: tokenInfo.timeToExpiry,
        }
      );
    } else {
      logger.warn(
        LogCategory.AUTH,
        '❌ JWT token validation failed',
        { error, tokenInfo }
      );
    }
  }

  // Log token expiration
  logTokenExpired(token: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_EXPIRATION) return;

    const tokenInfo = this.parseToken(token);
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_EXPIRED,
      timestamp: new Date(),
      tokenInfo,
    };

    this.addEvent(event);

    logger.warn(
      LogCategory.AUTH,
      '⏰ JWT token has expired',
      {
        expiresAt: tokenInfo.expiresAt,
        expiredSince: tokenInfo.timeToExpiry ? Math.abs(tokenInfo.timeToExpiry) : null,
      }
    );
  }

  // Log token refresh start
  logTokenRefreshStarted(reason?: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_REFRESH) return;

    this.refreshAttempts++;
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_REFRESH_STARTED,
      timestamp: new Date(),
      metadata: {
        reason,
        attemptNumber: this.refreshAttempts,
        lastRefreshTime: this.lastRefreshTime,
      },
    };

    this.addEvent(event);

    logger.info(
      LogCategory.AUTH,
      `🔄 JWT token refresh started (attempt ${this.refreshAttempts})`,
      { reason, lastRefreshTime: this.lastRefreshTime }
    );
  }

  // Log token refresh success
  logTokenRefreshSuccess(newToken: string, newRefreshToken?: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_REFRESH) return;

    this.lastRefreshTime = new Date();
    const tokenInfo = this.parseToken(newToken);
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_REFRESH_SUCCESS,
      timestamp: new Date(),
      tokenInfo,
      metadata: {
        attemptNumber: this.refreshAttempts,
        hasNewRefreshToken: !!newRefreshToken,
      },
    };

    this.addEvent(event);

    logger.info(
      LogCategory.AUTH,
      `✅ JWT token refresh successful (attempt ${this.refreshAttempts})`,
      {
        newExpiresAt: tokenInfo.expiresAt,
        newTimeToExpiry: tokenInfo.timeToExpiry,
        hasNewRefreshToken: !!newRefreshToken,
      }
    );

    // Reset refresh attempts on success
    this.refreshAttempts = 0;
  }

  // Log token refresh failure
  logTokenRefreshFailed(error: string): void {
    if (!LOGGING_CONFIG.LOG_TOKEN_REFRESH) return;

    const event: TokenEvent = {
      type: TokenEventType.TOKEN_REFRESH_FAILED,
      timestamp: new Date(),
      error,
      metadata: {
        attemptNumber: this.refreshAttempts,
      },
    };

    this.addEvent(event);

    logger.error(
      LogCategory.AUTH,
      `❌ JWT token refresh failed (attempt ${this.refreshAttempts})`,
      { error }
    );
  }

  // Log token clearing
  logTokenCleared(reason?: string): void {
    const event: TokenEvent = {
      type: TokenEventType.TOKEN_CLEARED,
      timestamp: new Date(),
      metadata: { reason },
    };

    this.addEvent(event);

    logger.info(LogCategory.AUTH, '🗑️ JWT tokens cleared', { reason });

    // Reset state
    this.refreshAttempts = 0;
    this.lastRefreshTime = null;
  }

  // Parse JWT token to extract information
  private parseToken(token: string): TokenInfo {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload (second part)
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));

      const now = Date.now();
      const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;
      const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
      const isExpired = expiresAt ? expiresAt.getTime() < now : false;
      const timeToExpiry = expiresAt ? expiresAt.getTime() - now : null;

      return {
        token: `${token.substring(0, 20)}...`, // Truncated for logging
        isValid: true,
        isExpired,
        expiresAt,
        issuedAt,
        subject: payload.sub || null,
        issuer: payload.iss || null,
        audience: payload.aud || null,
        timeToExpiry,
      };
    } catch (error) {
      const event: TokenEvent = {
        type: TokenEventType.TOKEN_DECODE_ERROR,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };

      this.addEvent(event);

      logger.error(LogCategory.AUTH, '❌ Failed to parse JWT token', error);

      return {
        token: `${token.substring(0, 20)}...`,
        isValid: false,
        isExpired: true,
        expiresAt: null,
        issuedAt: null,
        subject: null,
        issuer: null,
        audience: null,
        timeToExpiry: null,
      };
    }
  }

  // Base64 URL decode helper
  private base64UrlDecode(str: string): string {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode
    return atob(str);
  }

  // Add event to history
  private addEvent(event: TokenEvent): void {
    this.tokenEvents.push(event);
    if (this.tokenEvents.length > this.maxEvents) {
      this.tokenEvents = this.tokenEvents.slice(-this.maxEvents);
    }
  }

  // Get token events history
  getTokenEvents(): TokenEvent[] {
    return [...this.tokenEvents];
  }

  // Get refresh attempts count
  getRefreshAttempts(): number {
    return this.refreshAttempts;
  }

  // Get last refresh time
  getLastRefreshTime(): Date | null {
    return this.lastRefreshTime;
  }

  // Clear token events history
  clearHistory(): void {
    this.tokenEvents = [];
    logger.info(LogCategory.AUTH, '🗑️ JWT token events history cleared');
  }

  // Check if token needs refresh (within 5 minutes of expiry)
  async shouldRefreshToken(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return false;

      const tokenInfo = this.parseToken(token);
      const shouldRefresh = tokenInfo.timeToExpiry !== null && tokenInfo.timeToExpiry < 300000; // 5 minutes

      if (shouldRefresh) {
        logger.info(
          LogCategory.AUTH,
          '⏰ Token refresh recommended',
          { timeToExpiry: tokenInfo.timeToExpiry }
        );
      }

      return shouldRefresh;
    } catch (error) {
      logger.error(LogCategory.AUTH, '❌ Failed to check token refresh status', error);
      return false;
    }
  }
}

// Create singleton instance
const jwtLogger = new JwtLogger();

export default jwtLogger;
export { TokenInfo, TokenEvent, TokenEventType };
