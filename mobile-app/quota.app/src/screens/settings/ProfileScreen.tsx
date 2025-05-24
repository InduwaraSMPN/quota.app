import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, station } = useAuth();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    navigation.navigate(SCREEN_NAMES.PROFILE_EDIT as never);
  };

  const ProfileItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.profileName}>{station?.owner?.fullName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.sectionContent}>
            <ProfileItem label="Full Name" value={station?.owner?.fullName || 'N/A'} />
            <ProfileItem label="NIC Number" value={station?.owner?.nicNumber || 'N/A'} />
            <ProfileItem label="Contact Number" value={station?.owner?.contactNumber || 'N/A'} />
            <ProfileItem label="Email Address" value={user?.email || 'N/A'} />
          </View>
        </View>

        {/* Station Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <View style={styles.sectionContent}>
            <ProfileItem label="Station Name" value={station?.stationName || 'N/A'} />
            <ProfileItem label="Business Name" value={station?.businessName || 'N/A'} />
            <ProfileItem label="Registration Number" value={station?.businessRegistrationNumber || 'N/A'} />
            <ProfileItem label="License Number" value={station?.fuelRetailLicenseNumber || 'N/A'} />
            <ProfileItem label="Address" value={station?.businessAddress || 'N/A'} />
            <ProfileItem label="Province" value={station?.province || 'N/A'} />
            <ProfileItem label="District" value={station?.district || 'N/A'} />
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <View style={styles.sectionContent}>
            <ProfileItem 
              label="Opening Time" 
              value={station?.openingTime || 'N/A'} 
            />
            <ProfileItem 
              label="Closing Time" 
              value={station?.closingTime || 'N/A'} 
            />
          </View>
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.sectionContent}>
            <ProfileItem 
              label="Verification Status" 
              value={station?.verificationStatus || 'N/A'} 
            />
            <ProfileItem 
              label="Account Status" 
              value={station?.isActive ? 'Active' : 'Inactive'} 
            />
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
  editButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
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
  sectionContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  profileItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  profileLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  profileValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
  },
});

export default ProfileScreen;
