import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogging } from '../../context/LoggingContext';
import { LogLevel, LogCategory } from '../../utils/logger';

const LogViewerScreen: React.FC = () => {
  const {
    logEntries,
    tokenEvents,
    networkEvents,
    isLoggingEnabled,
    logLevel,
    totalLogEntries,
    errorCount,
    warningCount,
    activeRequestsCount,
    isConnected,
    networkType,
    setLoggingEnabled,
    setLogLevel,
    clearLogs,
    clearTokenEvents,
    clearNetworkEvents,
    exportLogs,
  } = useLogging();

  const [selectedTab, setSelectedTab] = useState<'logs' | 'tokens' | 'network' | 'stats'>('logs');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [selectedLogLevel, setSelectedLogLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Filter log entries based on selected filters
  const filteredLogEntries = useMemo(() => {
    let filtered = logEntries;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    if (selectedLogLevel !== 'ALL') {
      filtered = filtered.filter(entry => entry.level >= selectedLogLevel);
    }

    return filtered.slice(-100); // Show last 100 entries
  }, [logEntries, selectedCategory, selectedLogLevel]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh is handled automatically by the context
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExportLogs = async () => {
    try {
      const logsData = exportLogs();
      await Share.share({
        message: logsData,
        title: 'Quota App Debug Logs',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearLogs },
      ]
    );
  };

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return '#6B7280';
      case LogLevel.INFO: return '#10B981';
      case LogLevel.WARN: return '#F59E0B';
      case LogLevel.ERROR: return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: LogCategory): string => {
    const colors = {
      [LogCategory.API]: '#3B82F6',
      [LogCategory.NETWORK]: '#8B5CF6',
      [LogCategory.AUTH]: '#F59E0B',
      [LogCategory.STORAGE]: '#06B6D4',
      [LogCategory.NAVIGATION]: '#10B981',
      [LogCategory.QR_SCANNER]: '#EF4444',
      [LogCategory.NOTIFICATIONS]: '#F3F4F6',
      [LogCategory.GENERAL]: '#6B7280',
    };
    return colors[category] || '#6B7280';
  };

  const renderLogEntry = (entry: any, index: number) => (
    <View key={entry.id || index} style={styles.logEntry}>
      <View style={styles.logHeader}>
        <Text style={[styles.timestamp, { color: '#6B7280' }]}>
          {new Date(entry.timestamp).toLocaleTimeString()}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getLogLevelColor(entry.level) }]}>
            <Text style={styles.badgeText}>{LogLevel[entry.level]}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getCategoryColor(entry.category) }]}>
            <Text style={styles.badgeText}>{entry.category}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.logMessage}>{entry.message}</Text>
      {entry.data && (
        <Text style={styles.logData}>{JSON.stringify(entry.data, null, 2)}</Text>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'logs':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.filters}>
              <Text style={styles.filterLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['ALL', ...Object.values(LogCategory)].map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterButton,
                      selectedCategory === category && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category as LogCategory | 'ALL')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedCategory === category && styles.filterButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filters}>
              <Text style={styles.filterLabel}>Level:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['ALL', ...Object.keys(LogLevel).filter(key => isNaN(Number(key)))].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterButton,
                      selectedLogLevel === level && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedLogLevel(level === 'ALL' ? 'ALL' : LogLevel[level as keyof typeof LogLevel])}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedLogLevel === level && styles.filterButtonTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {filteredLogEntries.map(renderLogEntry)}
          </ScrollView>
        );

      case 'tokens':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {tokenEvents.slice(-50).map((event, index) => (
              <View key={index} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={styles.timestamp}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.badgeText}>{event.type}</Text>
                  </View>
                </View>
                {event.error && <Text style={styles.errorText}>{event.error}</Text>}
                {event.tokenInfo && (
                  <Text style={styles.logData}>
                    {JSON.stringify(event.tokenInfo, null, 2)}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        );

      case 'network':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.networkStatus}>
              <Text style={styles.statusTitle}>Network Status</Text>
              <Text style={[styles.statusText, { color: isConnected ? '#10B981' : '#EF4444' }]}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Text>
              <Text style={styles.statusText}>Type: {networkType || 'Unknown'}</Text>
            </View>

            {networkEvents.slice(-50).map((event, index) => (
              <View key={index} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={styles.timestamp}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: '#8B5CF6' }]}>
                    <Text style={styles.badgeText}>{event.type}</Text>
                  </View>
                </View>
                <Text style={styles.logData}>
                  {JSON.stringify(event.currentStatus, null, 2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        );

      case 'stats':
        return (
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalLogEntries}</Text>
                <Text style={styles.statLabel}>Total Logs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>{errorCount}</Text>
                <Text style={styles.statLabel}>Errors</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>{warningCount}</Text>
                <Text style={styles.statLabel}>Warnings</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>{activeRequestsCount}</Text>
                <Text style={styles.statLabel}>Active Requests</Text>
              </View>
            </View>

            <View style={styles.configSection}>
              <Text style={styles.sectionTitle}>Configuration</Text>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Logging Enabled:</Text>
                <TouchableOpacity
                  style={[styles.toggle, isLoggingEnabled && styles.toggleActive]}
                  onPress={() => setLoggingEnabled(!isLoggingEnabled)}
                >
                  <Text style={styles.toggleText}>
                    {isLoggingEnabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Log Level:</Text>
                <Text style={styles.configValue}>{LogLevel[logLevel]}</Text>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportLogs}>
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClearLogs}>
            <Text style={styles.actionButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        {['logs', 'tokens', 'network', 'stats'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab as any)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  filters: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  logEntry: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  logMessage: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 4,
  },
  networkStatus: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: '45%',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  configSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  configLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  configValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  toggle: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LogViewerScreen;
