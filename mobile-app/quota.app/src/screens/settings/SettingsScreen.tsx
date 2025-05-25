import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/ui';
import { TYPOGRAPHY, SPACING, SCREEN_NAMES, BORDER_RADIUS } from '../../constants';
import { getCardStyle, getColorWithOpacity } from '../../utils/theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, station, logout } = useAuth();
  const { theme } = useTheme();
  const styles = useThemedStyles((theme) => createStyles(theme));

  const handleProfilePress = () => {
    navigation.navigate(SCREEN_NAMES.PROFILE as never);
  };

  const handleAppSettingsPress = () => {
    navigation.navigate(SCREEN_NAMES.APP_SETTINGS as never);
  };

  const handleAboutPress = () => {
    navigation.navigate(SCREEN_NAMES.ABOUT as never);
  };

  const handleSitemapPress = () => {
    navigation.navigate(SCREEN_NAMES.SITEMAP as never);
  };

  const handleLogout = async () => {
    await logout();
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    iconColor
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    iconColor?: string;
  }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon} size={24} color={iconColor || theme.mutedForeground} />
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color={theme.primary} />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{station?.owner?.fullName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profileStation}>{station?.stationName}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsItem
            icon="person-outline"
            title="Profile"
            subtitle="Manage your personal information"
            onPress={handleProfilePress}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.themeToggleContainer}>
            <ThemeToggle showLabel={true} />
          </View>
          <SettingsItem
            icon="settings-outline"
            title="Preferences"
            subtitle="Notifications, camera, and other settings"
            onPress={handleAppSettingsPress}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={handleAboutPress}
          />
          {__DEV__ && (
            <SettingsItem
              icon="map-outline"
              title="App Sitemap"
              subtitle="Development tool - View all app routes"
              onPress={handleSitemapPress}
              iconColor={theme.primary}
            />
          )}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showArrow={false}
            iconColor={theme.destructive}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.muted,
  },
  header: {
    backgroundColor: theme.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: theme.foreground,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.sansSemiBold,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: theme.card,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: getColorWithOpacity(theme.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: theme.foreground,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.sansBold,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: theme.mutedForeground,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  profileStation: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: theme.primary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    fontFamily: TYPOGRAPHY.fontFamily.sansMedium,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  section: {
    backgroundColor: theme.card,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: theme.mutedForeground,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    fontFamily: TYPOGRAPHY.fontFamily.sansSemiBold,
  },
  themeToggleContainer: {
    paddingHorizontal: SPACING.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: theme.foreground,
    marginBottom: 2,
    fontFamily: TYPOGRAPHY.fontFamily.sansMedium,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  settingsItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: theme.mutedForeground,
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
});

export default SettingsScreen;
