import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import StatsCard from '../../components/ui/StatsCard';
import ActionButton from '../../components/ui/ActionButton';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';
import { apiService, notificationService } from '../../services';
import { formatCurrency, formatDate } from '../../utils';

interface DashboardStats {
  todayTransactions: number;
  todayRevenue: number;
  fuelDispensed: number;
  pendingTransactions: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, station, logout, refreshStationData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayTransactions: 0,
    todayRevenue: 0,
    fuelDispensed: 0,
    pendingTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard focused, current station data:', {
        verificationStatus: station?.verificationStatus,
        businessAddress: station?.businessAddress,
        stationName: station?.stationName,
      });
      loadDashboardData();
    }, [station])
  );

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        // Only refresh station data when user manually pulls to refresh
        await refreshStationData();
      } else {
        setIsLoading(true);
      }

      // Get today's date range
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Fetch today's transactions
      const response = await apiService.getStationTransactions(
        0,
        100,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.data) {
        const transactions = response.data.content;
        const todayTransactions = transactions.length;
        const todayRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
        const fuelDispensed = transactions.reduce((sum, t) => sum + t.amount, 0);

        setStats({
          todayTransactions,
          todayRevenue,
          fuelDispensed,
          pendingTransactions: 0, // This would come from a different endpoint
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notificationService.showError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleScanQR = () => {
    navigation.navigate(SCREEN_NAMES.SCANNER as never);
  };

  const handleManualEntry = () => {
    navigation.navigate(SCREEN_NAMES.MANUAL_ENTRY as never);
  };

  const handleViewHistory = () => {
    navigation.navigate(SCREEN_NAMES.HISTORY as never);
  };

  const handleViewNotifications = () => {
    navigation.navigate(SCREEN_NAMES.NOTIFICATIONS as never);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.stationName}>{station?.stationName || 'Station'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Station Info */}
        <View style={styles.stationInfo}>
          <View style={styles.stationDetails}>
            <Text style={styles.stationAddress}>{station?.businessAddress}</Text>
            <Text style={styles.stationStatus}>
              Status: {station?.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <StatsCard
                  title="Transactions"
                  value={stats.todayTransactions}
                  icon="receipt-outline"
                  iconColor={COLORS.primary}
                  isLoading={isLoading}
                />
              </View>
              <View style={styles.statsItem}>
                <StatsCard
                  title="Revenue"
                  value={formatCurrency(stats.todayRevenue)}
                  icon="cash-outline"
                  iconColor={COLORS.success}
                  isLoading={isLoading}
                />
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <StatsCard
                  title="Fuel Dispensed"
                  value={`${(stats.fuelDispensed || 0).toFixed(1)}L`}
                  icon="car-outline"
                  iconColor={COLORS.warning}
                  isLoading={isLoading}
                />
              </View>
              <View style={styles.statsItem}>
                <StatsCard
                  title="Pending"
                  value={stats.pendingTransactions}
                  icon="time-outline"
                  iconColor={COLORS.info}
                  isLoading={isLoading}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <ActionButton
            title="Scan QR Code"
            subtitle="Scan vehicle QR code to start fuel dispensing"
            icon="qr-code-outline"
            onPress={handleScanQR}
            backgroundColor={COLORS.primary}
            size="large"
          />

          <ActionButton
            title="Manual Entry"
            subtitle="Enter vehicle registration number manually"
            icon="keypad-outline"
            onPress={handleManualEntry}
            backgroundColor={COLORS.secondary}
            size="medium"
          />

          <ActionButton
            title="Transaction History"
            subtitle="View all fuel dispensing transactions"
            icon="time-outline"
            onPress={handleViewHistory}
            backgroundColor={COLORS.info}
            size="medium"
          />

          <ActionButton
            title="Notifications"
            subtitle="Check system alerts and messages"
            icon="notifications-outline"
            onPress={handleViewNotifications}
            backgroundColor={COLORS.warning}
            size="medium"
          />
        </View>

        {/* Station Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Business Name:</Text>
              <Text style={styles.infoValue}>{station?.businessName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number:</Text>
              <Text style={styles.infoValue}>{station?.fuelRetailLicenseNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Operating Hours:</Text>
              <Text style={styles.infoValue}>
                {station?.openingTime} - {station?.closingTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>
                {station?.district}, {station?.province}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
  },
  stationName: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
  },
  logoutButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stationInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stationDetails: {
    alignItems: 'center',
  },
  stationAddress: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  stationStatus: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    gap: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statsItem: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
});

export default DashboardScreen;
