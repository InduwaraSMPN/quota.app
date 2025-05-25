import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import logger, { LogLevel, LogCategory, LogEntry } from '../utils/logger';
import apiLogger from '../services/apiLogger';
import jwtLogger, { TokenEvent } from '../services/jwtLogger';
import networkMonitor, { NetworkEvent } from '../services/networkMonitor';
import { LOGGING_CONFIG } from '../constants';

// Logging context interface
interface LoggingContextType {
  // Logger configuration
  isLoggingEnabled: boolean;
  logLevel: LogLevel;
  
  // Log entries
  logEntries: LogEntry[];
  tokenEvents: TokenEvent[];
  networkEvents: NetworkEvent[];
  
  // Actions
  setLoggingEnabled: (enabled: boolean) => void;
  setLogLevel: (level: LogLevel) => void;
  clearLogs: () => void;
  clearTokenEvents: () => void;
  clearNetworkEvents: () => void;
  exportLogs: () => string;
  
  // Statistics
  totalLogEntries: number;
  errorCount: number;
  warningCount: number;
  activeRequestsCount: number;
  
  // Network status
  isNetworkMonitoring: boolean;
  isConnected: boolean;
  networkType: string | null;
}

const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

interface LoggingProviderProps {
  children: ReactNode;
}

export const LoggingProvider: React.FC<LoggingProviderProps> = ({ children }) => {
  // State
  const [isLoggingEnabled, setIsLoggingEnabledState] = useState(LOGGING_CONFIG.ENABLED);
  const [logLevel, setLogLevelState] = useState<LogLevel>(
    LOGGING_CONFIG.LEVEL === 'DEBUG' ? LogLevel.DEBUG : LogLevel.ERROR
  );
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [tokenEvents, setTokenEvents] = useState<TokenEvent[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [isNetworkMonitoring, setIsNetworkMonitoring] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [networkType, setNetworkType] = useState<string | null>(null);

  // Update logger configuration when state changes
  useEffect(() => {
    logger.configure({
      enabled: isLoggingEnabled,
      level: logLevel,
    });
  }, [isLoggingEnabled, logLevel]);

  // Initialize logging and monitoring
  useEffect(() => {
    const initializeLogging = async () => {
      try {
        // Set up network monitoring if enabled
        if (LOGGING_CONFIG.LOG_NETWORK_CHANGES && !networkMonitor.isMonitoringActive()) {
          await networkMonitor.startMonitoring();
          setIsNetworkMonitoring(true);
          
          // Get initial network status
          const status = networkMonitor.getCurrentStatus();
          if (status) {
            setIsConnected(status.isConnected);
            setNetworkType(status.type);
          }
        }

        // Set up network event listener
        const unsubscribeNetwork = networkMonitor.addEventListener((event: NetworkEvent) => {
          setNetworkEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
          setIsConnected(event.currentStatus.isConnected);
          setNetworkType(event.currentStatus.type);
        });

        // Periodic updates for log entries
        const updateInterval = setInterval(() => {
          // Update log entries
          const newLogEntries = logger.getLogEntries();
          setLogEntries(newLogEntries);

          // Update token events
          const newTokenEvents = jwtLogger.getTokenEvents();
          setTokenEvents(newTokenEvents);

          // Update network events
          const newNetworkEvents = networkMonitor.getConnectivityHistory();
          setNetworkEvents(newNetworkEvents);
        }, 1000); // Update every second

        // Cleanup function
        return () => {
          unsubscribeNetwork();
          clearInterval(updateInterval);
        };
      } catch (error) {
        console.error('Failed to initialize logging context:', error);
      }
    };

    initializeLogging();
  }, []);

  // Actions
  const setLoggingEnabled = (enabled: boolean) => {
    setIsLoggingEnabledState(enabled);
    logger.setEnabled(enabled);
    logger.info(LogCategory.GENERAL, `🔧 Logging ${enabled ? 'enabled' : 'disabled'}`);
  };

  const setLogLevel = (level: LogLevel) => {
    setLogLevelState(level);
    logger.setLevel(level);
    logger.info(LogCategory.GENERAL, `🔧 Log level set to ${LogLevel[level]}`);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogEntries([]);
    logger.info(LogCategory.GENERAL, '🗑️ Log entries cleared');
  };

  const clearTokenEvents = () => {
    jwtLogger.clearHistory();
    setTokenEvents([]);
    logger.info(LogCategory.AUTH, '🗑️ Token events cleared');
  };

  const clearNetworkEvents = () => {
    networkMonitor.clearHistory();
    setNetworkEvents([]);
    logger.info(LogCategory.NETWORK, '🗑️ Network events cleared');
  };

  const exportLogs = (): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      logEntries,
      tokenEvents,
      networkEvents,
      configuration: {
        isLoggingEnabled,
        logLevel: LogLevel[logLevel],
        isNetworkMonitoring,
      },
      statistics: {
        totalLogEntries: logEntries.length,
        errorCount: logEntries.filter(entry => entry.level === LogLevel.ERROR).length,
        warningCount: logEntries.filter(entry => entry.level === LogLevel.WARN).length,
        activeRequestsCount: apiLogger.getActiveRequestsCount(),
      },
    };

    logger.info(LogCategory.GENERAL, '📤 Logs exported', {
      totalEntries: logEntries.length,
      tokenEvents: tokenEvents.length,
      networkEvents: networkEvents.length,
    });

    return JSON.stringify(exportData, null, 2);
  };

  // Calculate statistics
  const totalLogEntries = logEntries.length;
  const errorCount = logEntries.filter(entry => entry.level === LogLevel.ERROR).length;
  const warningCount = logEntries.filter(entry => entry.level === LogLevel.WARN).length;
  const activeRequestsCount = apiLogger.getActiveRequestsCount();

  const contextValue: LoggingContextType = {
    // Logger configuration
    isLoggingEnabled,
    logLevel,
    
    // Log entries
    logEntries,
    tokenEvents,
    networkEvents,
    
    // Actions
    setLoggingEnabled,
    setLogLevel,
    clearLogs,
    clearTokenEvents,
    clearNetworkEvents,
    exportLogs,
    
    // Statistics
    totalLogEntries,
    errorCount,
    warningCount,
    activeRequestsCount,
    
    // Network status
    isNetworkMonitoring,
    isConnected,
    networkType,
  };

  return (
    <LoggingContext.Provider value={contextValue}>
      {children}
    </LoggingContext.Provider>
  );
};

// Hook to use logging context
export const useLogging = (): LoggingContextType => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
};

// Hook for simple logging
export const useLogger = () => {
  const { isLoggingEnabled } = useLogging();
  
  return {
    debug: (category: LogCategory, message: string, data?: any) => {
      if (isLoggingEnabled) logger.debug(category, message, data);
    },
    info: (category: LogCategory, message: string, data?: any) => {
      if (isLoggingEnabled) logger.info(category, message, data);
    },
    warn: (category: LogCategory, message: string, data?: any) => {
      if (isLoggingEnabled) logger.warn(category, message, data);
    },
    error: (category: LogCategory, message: string, data?: any) => {
      if (isLoggingEnabled) logger.error(category, message, data);
    },
  };
};

// Hook for network status
export const useNetworkLogging = () => {
  const { isConnected, networkType, networkEvents, isNetworkMonitoring } = useLogging();
  
  return {
    isConnected,
    networkType,
    networkEvents,
    isNetworkMonitoring,
    testConnectivity: () => networkMonitor.testConnectivity(),
  };
};

export default LoggingContext;
