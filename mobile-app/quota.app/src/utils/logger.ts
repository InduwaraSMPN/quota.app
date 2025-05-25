import { API_CONFIG } from '../constants';

// Log levels for different types of logging
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Log categories for better organization
export enum LogCategory {
  API = 'API',
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  STORAGE = 'STORAGE',
  NAVIGATION = 'NAVIGATION',
  QR_SCANNER = 'QR_SCANNER',
  NOTIFICATIONS = 'NOTIFICATIONS',
  GENERAL = 'GENERAL',
}

// Configuration for logging
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  enableColors: boolean;
  enableTimestamps: boolean;
  enableStackTrace: boolean;
  maxLogEntries: number;
}

// Log entry structure
interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  stackTrace?: string;
}

// Color codes for terminal output
const LOG_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
};

// Category colors
const CATEGORY_COLORS = {
  [LogCategory.API]: '\x1b[94m',        // Bright Blue
  [LogCategory.NETWORK]: '\x1b[95m',    // Bright Magenta
  [LogCategory.AUTH]: '\x1b[93m',       // Bright Yellow
  [LogCategory.STORAGE]: '\x1b[96m',    // Bright Cyan
  [LogCategory.NAVIGATION]: '\x1b[92m', // Bright Green
  [LogCategory.QR_SCANNER]: '\x1b[91m', // Bright Red
  [LogCategory.NOTIFICATIONS]: '\x1b[97m', // Bright White
  [LogCategory.GENERAL]: '\x1b[90m',    // Bright Black (Gray)
};

class Logger {
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];
  private logId = 0;

  constructor() {
    this.config = {
      enabled: __DEV__, // Only enable in development mode
      level: __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR,
      enableColors: true,
      enableTimestamps: true,
      enableStackTrace: true,
      maxLogEntries: 1000,
    };
  }

  // Configure logger settings
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Private method to create log entry
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any
  ): LogEntry {
    const entry: LogEntry = {
      id: (++this.logId).toString(),
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    if (this.config.enableStackTrace && level >= LogLevel.WARN) {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  // Private method to format log message for console
  private formatConsoleMessage(entry: LogEntry): string {
    const { level, category, message, timestamp } = entry;
    
    let formattedMessage = '';

    // Add timestamp
    if (this.config.enableTimestamps) {
      const timeStr = timestamp.toISOString();
      formattedMessage += this.config.enableColors 
        ? `${LOG_COLORS.DIM}${timeStr}${LOG_COLORS.RESET} `
        : `${timeStr} `;
    }

    // Add level
    const levelStr = LogLevel[level].padEnd(5);
    if (this.config.enableColors) {
      formattedMessage += `${LOG_COLORS[level]}${LOG_COLORS.BOLD}[${levelStr}]${LOG_COLORS.RESET} `;
    } else {
      formattedMessage += `[${levelStr}] `;
    }

    // Add category
    if (this.config.enableColors) {
      formattedMessage += `${CATEGORY_COLORS[category]}${LOG_COLORS.BOLD}[${category}]${LOG_COLORS.RESET} `;
    } else {
      formattedMessage += `[${category}] `;
    }

    // Add message
    formattedMessage += message;

    return formattedMessage;
  }

  // Private method to log to console
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enabled || entry.level < this.config.level) {
      return;
    }

    const formattedMessage = this.formatConsoleMessage(entry);

    // Choose appropriate console method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data || '');
        if (entry.stackTrace && this.config.enableStackTrace) {
          console.error('Stack trace:', entry.stackTrace);
        }
        break;
    }

    // Log data object if present
    if (entry.data && typeof entry.data === 'object') {
      console.log('Data:', entry.data);
    }
  }

  // Private method to store log entry
  private storeLogEntry(entry: LogEntry): void {
    this.logEntries.push(entry);

    // Maintain max log entries limit
    if (this.logEntries.length > this.config.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxLogEntries);
    }
  }

  // Main logging method
  private log(level: LogLevel, category: LogCategory, message: string, data?: any): void {
    const entry = this.createLogEntry(level, category, message, data);
    
    this.logToConsole(entry);
    this.storeLogEntry(entry);
  }

  // Public logging methods
  debug(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  // Get stored log entries
  getLogEntries(category?: LogCategory, level?: LogLevel): LogEntry[] {
    let entries = [...this.logEntries];

    if (category) {
      entries = entries.filter(entry => entry.category === category);
    }

    if (level !== undefined) {
      entries = entries.filter(entry => entry.level >= level);
    }

    return entries;
  }

  // Clear log entries
  clearLogs(): void {
    this.logEntries = [];
    this.logId = 0;
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  // Enable/disable logging
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  // Set log level
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
export { LogEntry, LoggerConfig };
