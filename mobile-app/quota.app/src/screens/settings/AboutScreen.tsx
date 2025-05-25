import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { Logo } from '../../components/ui';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@quota.app');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://quota.app');
  };

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const LinkItem = ({
    icon,
    title,
    subtitle,
    onPress
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.linkItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <View style={styles.linkItemText}>
        <Text style={styles.linkItemTitle}>{title}</Text>
        <Text style={styles.linkItemSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Logo and Info */}
        <View style={styles.appSection}>
          <Logo width={240} height={48} />
          <Text style={styles.appTagline}>Fuel Station Operator</Text>
          <Text style={styles.appDescription}>
            Streamline your fuel dispensing operations with our comprehensive
            quota management system designed specifically for fuel station operators.
          </Text>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <InfoItem label="Version" value="1.0.0" />
          <InfoItem label="Build Number" value="100" />
          <InfoItem label="Release Date" value="January 2024" />
          <InfoItem label="Platform" value="React Native" />
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>QR Code Scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="car-outline" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>Vehicle Quota Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>Transaction History</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>Real-time Notifications</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.featureText}>Secure Authentication</Text>
            </View>
          </View>
        </View>

        {/* Support Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Contact</Text>
          <LinkItem
            icon="mail-outline"
            title="Contact Support"
            subtitle="Get help with technical issues"
            onPress={handleContactSupport}
          />
          <LinkItem
            icon="globe-outline"
            title="Visit Website"
            subtitle="Learn more about Quota.app"
            onPress={handleVisitWebsite}
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <InfoItem label="Developer" value="Quota.app Team" />
          <InfoItem label="Copyright" value="© 2024 Quota.app. All rights reserved." />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for using Quota.app to manage your fuel station operations efficiently.
          </Text>
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
  appSection: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  appDescription: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.sm,
    paddingHorizontal: SPACING.lg,
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
  },
  featuresList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  linkItemText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  linkItemTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  linkItemSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.sm,
  },
});

export default AboutScreen;
