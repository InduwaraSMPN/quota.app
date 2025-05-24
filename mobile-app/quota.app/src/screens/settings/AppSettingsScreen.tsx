import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { storageService, notificationService } from '../../services';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    autoLogoutTimer: 30,
    soundEnabled: true,
    hapticEnabled: true,
    cameraFlashEnabled: false,
    notifications: {
      transactions: true,
      system: true,
      warnings: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await storageService.saveSettings(newSettings);
      setSettings(newSettings);
      notificationService.showSuccess('Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      notificationService.showError('Failed to save settings');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const SettingsToggle = ({ 
    title, 
    subtitle, 
    value, 
    onToggle 
  }: {
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemText}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.gray300, true: COLORS.primary + '40' }}
        thumbColor={value ? COLORS.primary : COLORS.gray400}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingsToggle
            title="Sound Effects"
            subtitle="Play sounds for actions and notifications"
            value={settings.soundEnabled}
            onToggle={(value) => handleToggle('soundEnabled', value)}
          />
          <SettingsToggle
            title="Haptic Feedback"
            subtitle="Vibrate for touch feedback and alerts"
            value={settings.hapticEnabled}
            onToggle={(value) => handleToggle('hapticEnabled', value)}
          />
        </View>

        {/* Camera Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera</Text>
          <SettingsToggle
            title="Flash by Default"
            subtitle="Enable camera flash when scanning QR codes"
            value={settings.cameraFlashEnabled}
            onToggle={(value) => handleToggle('cameraFlashEnabled', value)}
          />
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingsToggle
            title="Transaction Notifications"
            subtitle="Get notified about fuel dispensing transactions"
            value={settings.notifications.transactions}
            onToggle={(value) => handleNotificationToggle('transactions', value)}
          />
          <SettingsToggle
            title="System Notifications"
            subtitle="Receive system updates and maintenance alerts"
            value={settings.notifications.system}
            onToggle={(value) => handleNotificationToggle('system', value)}
          />
          <SettingsToggle
            title="Warning Notifications"
            subtitle="Get alerts for errors and important warnings"
            value={settings.notifications.warnings}
            onToggle={(value) => handleNotificationToggle('warnings', value)}
          />
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemText}>
              <Text style={styles.settingsItemTitle}>Auto-logout Timer</Text>
              <Text style={styles.settingsItemSubtitle}>
                Automatically logout after {settings.autoLogoutTimer} minutes of inactivity
              </Text>
            </View>
            <Text style={styles.settingsValue}>{settings.autoLogoutTimer}m</Text>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemText}>
              <Text style={styles.settingsItemTitle}>App Version</Text>
              <Text style={styles.settingsItemSubtitle}>Current version of the application</Text>
            </View>
            <Text style={styles.settingsValue}>1.0.0</Text>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingsItemText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingsItemTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.fontSizes.sm,
  },
  settingsValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
  },
});

export default AppSettingsScreen;
