import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';

interface RouteInfo {
  name: string;
  description: string;
  category: string;
  navigable?: boolean;
  params?: string;
}

const SitemapScreen: React.FC = () => {
  const navigation = useNavigation();

  const routes: RouteInfo[] = [
    // Auth Stack
    {
      name: SCREEN_NAMES.WELCOME,
      description: 'Welcome screen shown on app start',
      category: 'Authentication',
      navigable: false,
    },
    {
      name: SCREEN_NAMES.LOGIN,
      description: 'Login screen for station operators',
      category: 'Authentication',
      navigable: false,
    },

    // Main Tab Navigation
    {
      name: SCREEN_NAMES.DASHBOARD,
      description: 'Main dashboard with station stats and quick actions',
      category: 'Main Tabs',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.SCANNER,
      description: 'QR code scanner for vehicle identification',
      category: 'Main Tabs',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.HISTORY,
      description: 'Transaction history and details',
      category: 'Main Tabs',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.NOTIFICATIONS,
      description: 'System notifications and alerts',
      category: 'Main Tabs',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.SETTINGS,
      description: 'App settings and user profile',
      category: 'Main Tabs',
      navigable: true,
    },

    // Scanner Flow
    {
      name: SCREEN_NAMES.QR_SCANNER,
      description: 'Camera-based QR code scanner',
      category: 'Scanner Flow',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.MANUAL_ENTRY,
      description: 'Manual vehicle registration entry',
      category: 'Scanner Flow',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.VEHICLE_DETAILS,
      description: 'Display vehicle information and quota',
      category: 'Scanner Flow',
      navigable: true,
      params: 'registrationNumber, ownerId',
    },
    {
      name: SCREEN_NAMES.QUOTA_VALIDATION,
      description: 'Validate fuel quota before dispensing',
      category: 'Scanner Flow',
      navigable: true,
      params: 'vehicleData, requestedAmount',
    },
    {
      name: SCREEN_NAMES.FUEL_DISPENSING,
      description: 'Fuel dispensing interface with controls',
      category: 'Scanner Flow',
      navigable: true,
      params: 'transactionData',
    },
    {
      name: SCREEN_NAMES.DISPENSING_CONFIRMATION,
      description: 'Confirm fuel dispensing details',
      category: 'Scanner Flow',
      navigable: true,
      params: 'transactionData',
    },
    {
      name: SCREEN_NAMES.TRANSACTION_SUCCESS,
      description: 'Transaction completion confirmation',
      category: 'Scanner Flow',
      navigable: true,
      params: 'transactionResult',
    },

    // History Stack
    {
      name: SCREEN_NAMES.TRANSACTION_HISTORY,
      description: 'List of all transactions',
      category: 'History',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.TRANSACTION_DETAILS,
      description: 'Detailed view of a specific transaction',
      category: 'History',
      navigable: true,
      params: 'transactionId',
    },

    // Settings Stack
    {
      name: SCREEN_NAMES.PROFILE,
      description: 'User profile information',
      category: 'Settings',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.PROFILE_EDIT,
      description: 'Edit user profile details',
      category: 'Settings',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.APP_SETTINGS,
      description: 'Application settings and preferences',
      category: 'Settings',
      navigable: true,
    },
    {
      name: SCREEN_NAMES.ABOUT,
      description: 'About the application',
      category: 'Settings',
      navigable: true,
    },
  ];

  const groupedRoutes = routes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<string, RouteInfo[]>);

  const handleRoutePress = (route: RouteInfo) => {
    if (!route.navigable) {
      Alert.alert(
        'Navigation Not Available',
        `The ${route.name} screen is not directly navigable from this context.`
      );
      return;
    }

    try {
      // @ts-ignore - Dynamic navigation
      navigation.navigate(route.name);
    } catch (error) {
      Alert.alert(
        'Navigation Error',
        `Could not navigate to ${route.name}. This might require specific parameters or authentication state.`
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return 'log-in-outline';
      case 'Main Tabs':
        return 'apps-outline';
      case 'Scanner Flow':
        return 'qr-code-outline';
      case 'History':
        return 'time-outline';
      case 'Settings':
        return 'settings-outline';
      default:
        return 'folder-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>App Sitemap</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Development tool showing all available routes in the mobile app.
            Tap on navigable routes to test navigation.
          </Text>
        </View>

        {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.categoryTitle}>{category}</Text>
              <Text style={styles.routeCount}>({categoryRoutes.length})</Text>
            </View>

            {categoryRoutes.map((route) => (
              <TouchableOpacity
                key={route.name}
                style={[
                  styles.routeItem,
                  !route.navigable && styles.routeItemDisabled,
                ]}
                onPress={() => handleRoutePress(route)}
                disabled={!route.navigable}
              >
                <View style={styles.routeHeader}>
                  <Text
                    style={[
                      styles.routeName,
                      !route.navigable && styles.routeNameDisabled,
                    ]}
                  >
                    {route.name}
                  </Text>
                  {route.navigable && (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.gray400}
                    />
                  )}
                </View>
                <Text style={styles.routeDescription}>{route.description}</Text>
                {route.params && (
                  <Text style={styles.routeParams}>
                    Parameters: {route.params}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Total Routes: {routes.length} | Navigable: {routes.filter(r => r.navigable).length}
          </Text>
          <Text style={styles.footerText}>
            quota.app Mobile v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: 8,
    marginVertical: SPACING.md,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  routeCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray400,
  },
  routeItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  routeItemDisabled: {
    backgroundColor: COLORS.gray50,
    opacity: 0.7,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  routeName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flex: 1,
  },
  routeNameDisabled: {
    color: COLORS.gray400,
  },
  routeDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  routeParams: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    marginTop: SPACING.lg,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray400,
    marginBottom: SPACING.xs,
  },
});

export default SitemapScreen;
