# Mobile App Backend Terminal Output Logging

This document describes the comprehensive logging system implemented for debugging backend API interactions, network connectivity, and JWT token management in the Quota App mobile application.

## Overview

The logging system provides detailed terminal output for:

1. **API Request/Response Logging** - Complete HTTP request and response details
2. **Network Connectivity Monitoring** - Real-time network status tracking
3. **JWT Token Management** - Token validation, refresh, and expiration tracking
4. **Error Logging** - Comprehensive error tracking with stack traces
5. **Performance Monitoring** - Request timing and slow request detection

## Features

### 🚀 API Logging
- **Request Logging**: URL, method, headers, request body
- **Response Logging**: Status code, response headers, response body
- **Error Logging**: Network errors, HTTP errors, timeout errors
- **Performance Tracking**: Request duration, slow request detection
- **Security**: Automatic sanitization of sensitive data (passwords, tokens)

### 🌐 Network Monitoring
- **Connectivity Status**: Real-time connection status
- **Network Type Detection**: WiFi, Cellular, Ethernet detection
- **Connection Quality**: Signal strength, connection cost
- **Reachability Testing**: Internet connectivity validation
- **Event History**: Complete connectivity change history

### 🔐 JWT Token Logging
- **Token Lifecycle**: Storage, retrieval, validation events
- **Expiration Tracking**: Token expiry warnings and notifications
- **Refresh Monitoring**: Automatic refresh attempts and results
- **Security Validation**: Token format and signature validation
- **Error Handling**: Token parsing and validation errors

### 📊 Performance Monitoring
- **Request Timing**: Detailed timing for all API calls
- **Slow Request Detection**: Automatic detection of slow requests
- **Active Request Tracking**: Monitor concurrent API requests
- **Memory Usage**: Log entry management and cleanup

## Configuration

### Environment-Based Configuration

The logging system automatically adjusts based on the environment:

```typescript
// Development Mode (__DEV__ = true)
- All logging enabled
- Detailed request/response data
- Network monitoring active
- JWT token validation logging
- Performance metrics tracking

// Production Mode (__DEV__ = false)
- Only error logging enabled
- Minimal data logging
- Security-focused logging
- Performance optimized
```

### Customizable Settings

Configure logging behavior in `src/constants/index.ts`:

```typescript
export const LOGGING_CONFIG = {
  ENABLED: __DEV__,
  LEVEL: __DEV__ ? 'DEBUG' : 'ERROR',
  
  // API Logging
  LOG_API_REQUESTS: true,
  LOG_API_RESPONSES: true,
  LOG_REQUEST_HEADERS: __DEV__,
  LOG_REQUEST_BODY: __DEV__,
  
  // Network Logging
  LOG_NETWORK_CHANGES: true,
  LOG_NETWORK_DETAILS: __DEV__,
  
  // JWT Token Logging
  LOG_TOKEN_VALIDATION: __DEV__,
  LOG_TOKEN_REFRESH: true,
  
  // Performance
  LOG_SLOW_REQUESTS: true,
  SLOW_REQUEST_THRESHOLD: 3000, // 3 seconds
};
```

## Usage

### Basic Logging

```typescript
import { useLogger } from '../context/LoggingContext';
import { LogCategory } from '../utils/logger';

const MyComponent = () => {
  const { debug, info, warn, error } = useLogger();

  const handleAction = () => {
    info(LogCategory.GENERAL, 'User action performed', { action: 'button_click' });
  };

  return (
    // Your component JSX
  );
};
```

### Network Status Monitoring

```typescript
import { useNetworkLogging } from '../context/LoggingContext';

const NetworkComponent = () => {
  const { isConnected, networkType, testConnectivity } = useNetworkLogging();

  useEffect(() => {
    if (!isConnected) {
      // Handle offline state
    }
  }, [isConnected]);

  return (
    <View>
      <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      <Text>Type: {networkType}</Text>
      <Button title="Test Connection" onPress={testConnectivity} />
    </View>
  );
};
```

### API Service Integration

The API service automatically logs all requests when properly configured:

```typescript
// API calls are automatically logged
const response = await apiService.login(credentials);
// Logs: Request details, response status, timing, errors
```

### Debug Screen

Access the debug screen to view logs in real-time:

```typescript
import LogViewerScreen from '../screens/debug/LogViewerScreen';

// Navigate to the debug screen to view:
// - All log entries with filtering
// - JWT token events
// - Network connectivity history
// - Performance statistics
```

## Log Categories

The system uses categorized logging for better organization:

- **API**: HTTP requests, responses, and API-related operations
- **NETWORK**: Network connectivity, status changes, reachability
- **AUTH**: Authentication, JWT tokens, login/logout events
- **STORAGE**: Local storage operations, cache management
- **NAVIGATION**: Screen navigation, route changes
- **QR_SCANNER**: QR code scanning operations
- **NOTIFICATIONS**: Push notifications, local notifications
- **GENERAL**: General application events

## Log Levels

Hierarchical log levels for filtering:

- **DEBUG**: Detailed debugging information (development only)
- **INFO**: General information messages
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failures and exceptions

## Terminal Output Examples

### API Request Logging
```
2024-01-15 10:30:15.123 [INFO ] [API] 🚀 API Request [req_1_1705312215123]: POST http://localhost:8888/api/auth/login
2024-01-15 10:30:15.124 [DEBUG] [API] Request Headers [req_1_1705312215123]: {"Content-Type": "application/json"}
2024-01-15 10:30:15.125 [DEBUG] [API] Request Body [req_1_1705312215123]: {"email": "user@example.com", "password": "***MASKED***"}
```

### API Response Logging
```
2024-01-15 10:30:15.456 [INFO ] [API] ✅ API Response [req_1_1705312215123]: 200 OK (333ms)
2024-01-15 10:30:15.457 [DEBUG] [API] Response Headers [req_1_1705312215123]: {"content-type": "application/json"}
2024-01-15 10:30:15.458 [DEBUG] [API] Response Data [req_1_1705312215123]: {"token": "eyJ0eXAiOiJKV1Q...***MASKED***"}
```

### Network Status Logging
```
2024-01-15 10:30:20.789 [INFO ] [NETWORK] 🌐 Network connected: wifi
2024-01-15 10:30:25.123 [WARN ] [NETWORK] 📴 Network disconnected
2024-01-15 10:30:30.456 [INFO ] [NETWORK] 🔄 Network type changed: none → cellular
```

### JWT Token Logging
```
2024-01-15 10:30:15.500 [INFO ] [AUTH] 🔐 JWT token stored
2024-01-15 10:30:15.501 [WARN ] [AUTH] ⚠️ Token refresh recommended before API call
2024-01-15 10:30:16.000 [INFO ] [AUTH] 🔄 JWT token refresh started (attempt 1)
2024-01-15 10:30:16.234 [INFO ] [AUTH] ✅ JWT token refresh successful (attempt 1)
```

### Error Logging
```
2024-01-15 10:30:25.789 [ERROR] [NETWORK] 🌐 Network Error [req_2_1705312225789]: fetch failed
2024-01-15 10:30:25.790 [ERROR] [API] ❌ API Error [req_2_1705312225789]: Network request failed
```

## Performance Considerations

- **Memory Management**: Automatic cleanup of old log entries
- **Production Optimization**: Minimal logging in production builds
- **Async Operations**: Non-blocking logging operations
- **Sanitization**: Automatic removal of sensitive data
- **Configurable Limits**: Adjustable log retention and detail levels

## Security Features

- **Data Sanitization**: Automatic masking of passwords, tokens, and sensitive fields
- **Production Safety**: Reduced logging in production environments
- **Header Filtering**: Sensitive headers are automatically masked
- **Token Truncation**: JWT tokens are truncated for logging safety

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check if logging is enabled in configuration
2. **Network monitoring not working**: Ensure @react-native-community/netinfo is installed
3. **Performance issues**: Reduce log level or disable detailed logging
4. **Memory usage**: Check log retention settings and clear old logs

### Debug Commands

```typescript
// Clear all logs
const { clearLogs } = useLogging();
clearLogs();

// Export logs for analysis
const { exportLogs } = useLogging();
const logsData = exportLogs();

// Check network status
const { testConnectivity } = useNetworkLogging();
const isReachable = await testConnectivity();
```

## Integration with Development Tools

The logging system integrates well with:

- **React Native Debugger**: View logs in the debugger console
- **Flipper**: Enhanced debugging with network inspection
- **Metro Bundler**: Terminal output during development
- **VS Code**: Integrated terminal logging during development

## Best Practices

1. **Use appropriate log levels**: DEBUG for detailed info, ERROR for failures
2. **Categorize logs properly**: Use specific categories for better filtering
3. **Avoid logging sensitive data**: The system auto-sanitizes, but be cautious
4. **Monitor performance**: Use slow request detection to identify bottlenecks
5. **Regular cleanup**: Clear logs periodically to manage memory usage
6. **Production considerations**: Ensure minimal logging in production builds

This comprehensive logging system provides complete visibility into your mobile app's backend interactions, making debugging and monitoring significantly easier during development and testing phases.
