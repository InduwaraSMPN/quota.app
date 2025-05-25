import { useState, useEffect, useCallback } from 'react';
import networkMonitor, { NetworkStatus, NetworkEvent, NetworkEventType } from '../services/networkMonitor';
import logger, { LogCategory } from '../utils/logger';

// Hook return type
interface UseNetworkStatusReturn {
  // Current network status
  networkStatus: NetworkStatus | null;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  networkType: string | null;
  
  // Connection quality indicators
  connectionStrength: number | null;
  isConnectionExpensive: boolean | null;
  
  // Network details
  ssid: string | null;
  ipAddress: string | null;
  
  // Actions
  testConnectivity: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  
  // History and monitoring
  isMonitoring: boolean;
  connectivityHistory: NetworkEvent[];
  
  // Loading states
  isLoading: boolean;
  isTestingConnectivity: boolean;
}

// Hook options
interface UseNetworkStatusOptions {
  autoStart?: boolean;
  enableHistory?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onNetworkTypeChanged?: (newType: string, oldType: string) => void;
  onReachabilityChanged?: (isReachable: boolean | null) => void;
}

export const useNetworkStatus = (options: UseNetworkStatusOptions = {}): UseNetworkStatusReturn => {
  const {
    autoStart = true,
    enableHistory = false,
    onConnected,
    onDisconnected,
    onNetworkTypeChanged,
    onReachabilityChanged,
  } = options;

  // State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectivityHistory, setConnectivityHistory] = useState<NetworkEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);

  // Initialize network monitoring
  const initializeMonitoring = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!networkMonitor.isMonitoringActive()) {
        await networkMonitor.startMonitoring();
      }
      
      const currentStatus = networkMonitor.getCurrentStatus();
      setNetworkStatus(currentStatus);
      setIsMonitoring(networkMonitor.isMonitoringActive());
      
      if (enableHistory) {
        setConnectivityHistory(networkMonitor.getConnectivityHistory());
      }
      
      logger.debug(LogCategory.NETWORK, '🔧 Network status hook initialized', currentStatus);
    } catch (error) {
      logger.error(LogCategory.NETWORK, '❌ Failed to initialize network monitoring', error);
    } finally {
      setIsLoading(false);
    }
  }, [enableHistory]);

  // Handle network events
  const handleNetworkEvent = useCallback((event: NetworkEvent) => {
    const { type, currentStatus, previousStatus } = event;
    
    setNetworkStatus(currentStatus);
    
    if (enableHistory) {
      setConnectivityHistory(prev => [...prev, event]);
    }

    // Call appropriate callbacks
    switch (type) {
      case NetworkEventType.CONNECTED:
        onConnected?.();
        break;
        
      case NetworkEventType.DISCONNECTED:
        onDisconnected?.();
        break;
        
      case NetworkEventType.TYPE_CHANGED:
        if (previousStatus && onNetworkTypeChanged) {
          onNetworkTypeChanged(currentStatus.type, previousStatus.type);
        }
        break;
        
      case NetworkEventType.REACHABILITY_CHANGED:
        onReachabilityChanged?.(currentStatus.isInternetReachable);
        break;
    }
  }, [enableHistory, onConnected, onDisconnected, onNetworkTypeChanged, onReachabilityChanged]);

  // Test connectivity manually
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    setIsTestingConnectivity(true);
    try {
      const result = await networkMonitor.testConnectivity();
      logger.info(LogCategory.NETWORK, `🔍 Manual connectivity test: ${result ? 'success' : 'failed'}`);
      return result;
    } catch (error) {
      logger.error(LogCategory.NETWORK, '❌ Manual connectivity test error', error);
      return false;
    } finally {
      setIsTestingConnectivity(false);
    }
  }, []);

  // Refresh network status
  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      const currentStatus = networkMonitor.getCurrentStatus();
      setNetworkStatus(currentStatus);
      
      if (enableHistory) {
        setConnectivityHistory(networkMonitor.getConnectivityHistory());
      }
      
      logger.debug(LogCategory.NETWORK, '🔄 Network status refreshed', currentStatus);
    } catch (error) {
      logger.error(LogCategory.NETWORK, '❌ Failed to refresh network status', error);
    }
  }, [enableHistory]);

  // Effect to initialize monitoring and set up event listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setup = async () => {
      if (autoStart) {
        await initializeMonitoring();
      }

      // Subscribe to network events
      unsubscribe = networkMonitor.addEventListener(handleNetworkEvent);
    };

    setup();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [autoStart, initializeMonitoring, handleNetworkEvent]);

  // Derived values
  const isConnected = networkStatus?.isConnected ?? false;
  const isInternetReachable = networkStatus?.isInternetReachable ?? null;
  const networkType = networkStatus?.type ?? null;
  const connectionStrength = networkStatus?.details.strength ?? null;
  const isConnectionExpensive = networkStatus?.details.isConnectionExpensive ?? null;
  const ssid = networkStatus?.details.ssid ?? null;
  const ipAddress = networkStatus?.details.ipAddress ?? null;

  return {
    // Current network status
    networkStatus,
    isConnected,
    isInternetReachable,
    networkType,
    
    // Connection quality indicators
    connectionStrength,
    isConnectionExpensive,
    
    // Network details
    ssid,
    ipAddress,
    
    // Actions
    testConnectivity,
    refreshStatus,
    
    // History and monitoring
    isMonitoring,
    connectivityHistory,
    
    // Loading states
    isLoading,
    isTestingConnectivity,
  };
};

// Hook for simple connectivity check
export const useConnectivity = () => {
  const { isConnected, isInternetReachable, testConnectivity } = useNetworkStatus({
    autoStart: true,
    enableHistory: false,
  });

  return {
    isConnected,
    isInternetReachable,
    testConnectivity,
  };
};

// Hook for network type monitoring
export const useNetworkType = () => {
  const { networkType, networkStatus } = useNetworkStatus({
    autoStart: true,
    enableHistory: false,
  });

  const isWifi = networkType === 'wifi';
  const isCellular = networkType === 'cellular';
  const isEthernet = networkType === 'ethernet';
  const isUnknown = networkType === 'unknown' || networkType === 'none';

  return {
    networkType,
    isWifi,
    isCellular,
    isEthernet,
    isUnknown,
    connectionDetails: networkStatus?.details,
  };
};

export default useNetworkStatus;
