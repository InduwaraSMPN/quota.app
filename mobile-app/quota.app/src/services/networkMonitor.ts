import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import logger, { LogCategory } from '../utils/logger';

// Network status interface
export interface NetworkStatus {
  isConnected: boolean;
  type: NetInfoStateType;
  isInternetReachable: boolean | null;
  details: {
    strength?: number;
    ssid?: string;
    bssid?: string;
    frequency?: number;
    ipAddress?: string;
    subnet?: string;
    isConnectionExpensive?: boolean;
  };
  timestamp: Date;
}

// Network event types
export enum NetworkEventType {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  TYPE_CHANGED = 'TYPE_CHANGED',
  REACHABILITY_CHANGED = 'REACHABILITY_CHANGED',
}

// Network event interface
export interface NetworkEvent {
  type: NetworkEventType;
  previousStatus?: NetworkStatus;
  currentStatus: NetworkStatus;
  timestamp: Date;
}

// Network monitor configuration
interface NetworkMonitorConfig {
  enabled: boolean;
  checkInterval: number; // in milliseconds
  reachabilityUrl: string;
  reachabilityTimeout: number; // in milliseconds
  logConnectivityChanges: boolean;
  logDetailedInfo: boolean;
}

class NetworkMonitor {
  private config: NetworkMonitorConfig;
  private currentStatus: NetworkStatus | null = null;
  private listeners: Array<(event: NetworkEvent) => void> = [];
  private unsubscribe: (() => void) | null = null;
  private isMonitoring = false;
  private connectivityHistory: NetworkEvent[] = [];
  private maxHistoryEntries = 100;

  constructor() {
    this.config = {
      enabled: true,
      checkInterval: 5000, // 5 seconds
      reachabilityUrl: 'https://www.google.com',
      reachabilityTimeout: 5000, // 5 seconds
      logConnectivityChanges: true,
      logDetailedInfo: __DEV__, // Only log detailed info in development
    };
  }

  // Configure network monitor
  configure(config: Partial<NetworkMonitorConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info(LogCategory.NETWORK, '🔧 Network monitor configured', this.config);
  }

  // Start monitoring network status
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn(LogCategory.NETWORK, '⚠️ Network monitoring already started');
      return;
    }

    if (!this.config.enabled) {
      logger.info(LogCategory.NETWORK, '📴 Network monitoring disabled');
      return;
    }

    try {
      logger.info(LogCategory.NETWORK, '🚀 Starting network monitoring...');

      // Get initial network state
      const initialState = await NetInfo.fetch();
      this.currentStatus = this.parseNetInfoState(initialState);
      
      logger.info(
        LogCategory.NETWORK,
        '📡 Initial network status',
        this.currentStatus
      );

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        this.handleNetworkStateChange(state);
      });

      this.isMonitoring = true;
      logger.info(LogCategory.NETWORK, '✅ Network monitoring started successfully');

    } catch (error) {
      logger.error(LogCategory.NETWORK, '❌ Failed to start network monitoring', error);
      throw error;
    }
  }

  // Stop monitoring network status
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      logger.warn(LogCategory.NETWORK, '⚠️ Network monitoring not started');
      return;
    }

    logger.info(LogCategory.NETWORK, '🛑 Stopping network monitoring...');

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.isMonitoring = false;
    logger.info(LogCategory.NETWORK, '✅ Network monitoring stopped');
  }

  // Handle network state changes
  private handleNetworkStateChange(state: NetInfoState): void {
    const newStatus = this.parseNetInfoState(state);
    const previousStatus = this.currentStatus;

    if (!previousStatus) {
      this.currentStatus = newStatus;
      return;
    }

    // Determine what changed
    const events: NetworkEvent[] = [];

    // Check connection status change
    if (previousStatus.isConnected !== newStatus.isConnected) {
      const eventType = newStatus.isConnected 
        ? NetworkEventType.CONNECTED 
        : NetworkEventType.DISCONNECTED;
      
      events.push({
        type: eventType,
        previousStatus,
        currentStatus: newStatus,
        timestamp: new Date(),
      });
    }

    // Check network type change
    if (previousStatus.type !== newStatus.type) {
      events.push({
        type: NetworkEventType.TYPE_CHANGED,
        previousStatus,
        currentStatus: newStatus,
        timestamp: new Date(),
      });
    }

    // Check internet reachability change
    if (previousStatus.isInternetReachable !== newStatus.isInternetReachable) {
      events.push({
        type: NetworkEventType.REACHABILITY_CHANGED,
        previousStatus,
        currentStatus: newStatus,
        timestamp: new Date(),
      });
    }

    // Update current status
    this.currentStatus = newStatus;

    // Process events
    events.forEach(event => {
      this.processNetworkEvent(event);
    });
  }

  // Process network event
  private processNetworkEvent(event: NetworkEvent): void {
    // Add to history
    this.connectivityHistory.push(event);
    if (this.connectivityHistory.length > this.maxHistoryEntries) {
      this.connectivityHistory = this.connectivityHistory.slice(-this.maxHistoryEntries);
    }

    // Log event
    if (this.config.logConnectivityChanges) {
      this.logNetworkEvent(event);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error(LogCategory.NETWORK, '❌ Error in network event listener', error);
      }
    });
  }

  // Log network event
  private logNetworkEvent(event: NetworkEvent): void {
    const { type, currentStatus, previousStatus } = event;

    switch (type) {
      case NetworkEventType.CONNECTED:
        logger.info(
          LogCategory.NETWORK,
          `🌐 Network connected: ${currentStatus.type}`,
          this.config.logDetailedInfo ? currentStatus : undefined
        );
        break;

      case NetworkEventType.DISCONNECTED:
        logger.warn(
          LogCategory.NETWORK,
          '📴 Network disconnected',
          this.config.logDetailedInfo ? { previousStatus, currentStatus } : undefined
        );
        break;

      case NetworkEventType.TYPE_CHANGED:
        logger.info(
          LogCategory.NETWORK,
          `🔄 Network type changed: ${previousStatus?.type} → ${currentStatus.type}`,
          this.config.logDetailedInfo ? { previousStatus, currentStatus } : undefined
        );
        break;

      case NetworkEventType.REACHABILITY_CHANGED:
        const reachabilityStatus = currentStatus.isInternetReachable 
          ? 'reachable' 
          : 'unreachable';
        logger.info(
          LogCategory.NETWORK,
          `🌍 Internet reachability changed: ${reachabilityStatus}`,
          this.config.logDetailedInfo ? { previousStatus, currentStatus } : undefined
        );
        break;
    }
  }

  // Parse NetInfo state to our NetworkStatus format
  private parseNetInfoState(state: NetInfoState): NetworkStatus {
    return {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
      details: {
        strength: state.details?.strength,
        ssid: state.details?.ssid,
        bssid: state.details?.bssid,
        frequency: state.details?.frequency,
        ipAddress: state.details?.ipAddress,
        subnet: state.details?.subnet,
        isConnectionExpensive: state.details?.isConnectionExpensive,
      },
      timestamp: new Date(),
    };
  }

  // Get current network status
  getCurrentStatus(): NetworkStatus | null {
    return this.currentStatus;
  }

  // Check if currently connected
  isConnected(): boolean {
    return this.currentStatus?.isConnected ?? false;
  }

  // Check if internet is reachable
  isInternetReachable(): boolean | null {
    return this.currentStatus?.isInternetReachable ?? null;
  }

  // Get network type
  getNetworkType(): NetInfoStateType | null {
    return this.currentStatus?.type ?? null;
  }

  // Add event listener
  addEventListener(listener: (event: NetworkEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get connectivity history
  getConnectivityHistory(): NetworkEvent[] {
    return [...this.connectivityHistory];
  }

  // Clear connectivity history
  clearHistory(): void {
    this.connectivityHistory = [];
    logger.info(LogCategory.NETWORK, '🗑️ Network connectivity history cleared');
  }

  // Test internet connectivity manually
  async testConnectivity(): Promise<boolean> {
    logger.info(LogCategory.NETWORK, '🔍 Testing internet connectivity...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.reachabilityTimeout);

      const response = await fetch(this.config.reachabilityUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isReachable = response.ok;
      logger.info(
        LogCategory.NETWORK,
        `🌍 Connectivity test result: ${isReachable ? 'reachable' : 'unreachable'}`,
        { url: this.config.reachabilityUrl, status: response.status }
      );

      return isReachable;
    } catch (error) {
      logger.warn(LogCategory.NETWORK, '⚠️ Connectivity test failed', error);
      return false;
    }
  }

  // Get monitoring status
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  // Get configuration
  getConfig(): NetworkMonitorConfig {
    return { ...this.config };
  }
}

// Create singleton instance
const networkMonitor = new NetworkMonitor();

export default networkMonitor;
export { NetworkMonitorConfig };
