import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { apiService, notificationService } from '../../services';

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const { station } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: station?.owner?.fullName || '',
    contactNumber: station?.owner?.contactNumber || '',
    stationName: station?.stationName || '',
    businessAddress: station?.businessAddress || '',
    openingTime: station?.openingTime || '',
    closingTime: station?.closingTime || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.updateStationProfile(formData);
      
      if (response.error) {
        notificationService.showError(response.error);
        return;
      }

      notificationService.showSuccess('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      notificationService.showError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder,
    multiline = false,
    editable = true 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    editable?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
          !editable && styles.disabledInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        multiline={multiline}
        editable={editable}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InputField
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            placeholder="Enter your full name"
          />
          <InputField
            label="Contact Number"
            value={formData.contactNumber}
            onChangeText={(text) => handleInputChange('contactNumber', text)}
            placeholder="Enter your contact number"
          />
        </View>

        {/* Station Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Station Information</Text>
          <InputField
            label="Station Name"
            value={formData.stationName}
            onChangeText={(text) => handleInputChange('stationName', text)}
            placeholder="Enter station name"
          />
          <InputField
            label="Business Address"
            value={formData.businessAddress}
            onChangeText={(text) => handleInputChange('businessAddress', text)}
            placeholder="Enter business address"
            multiline
          />
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          <InputField
            label="Opening Time"
            value={formData.openingTime}
            onChangeText={(text) => handleInputChange('openingTime', text)}
            placeholder="e.g., 06:00"
          />
          <InputField
            label="Closing Time"
            value={formData.closingTime}
            onChangeText={(text) => handleInputChange('closingTime', text)}
            placeholder="e.g., 22:00"
          />
        </View>

        {/* Read-only Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Read-only Information</Text>
          <InputField
            label="Business Registration Number"
            value={station?.businessRegistrationNumber || ''}
            onChangeText={() => {}}
            editable={false}
          />
          <InputField
            label="Fuel Retail License Number"
            value={station?.fuelRetailLicenseNumber || ''}
            onChangeText={() => {}}
            editable={false}
          />
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
  saveButton: {
    padding: SPACING.xs,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.primary,
  },
  saveButtonTextDisabled: {
    color: COLORS.gray400,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: COLORS.gray100,
    color: COLORS.textSecondary,
  },
});

export default ProfileEditScreen;
