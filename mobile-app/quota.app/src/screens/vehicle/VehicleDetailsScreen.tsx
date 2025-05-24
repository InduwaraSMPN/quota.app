import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';
import { apiService, notificationService } from '../../services';
import { getFuelTypeDisplayName, formatLiters } from '../../utils';

const VehicleDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, registrationNumber, vehicleData } = route.params as any;

  const [isLoading, setIsLoading] = useState(false);

  const handleValidateQuota = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.validateVehicleQuota(vehicleId);
      
      if (response.error || !response.data) {
        notificationService.showError(response.error || 'Validation failed');
        return;
      }

      navigation.navigate(SCREEN_NAMES.QUOTA_VALIDATION as never, {
        vehicleId,
        registrationNumber,
        validationData: response.data,
      } as never);
    } catch (error) {
      console.error('Error validating quota:', error);
      notificationService.showError('Failed to validate quota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Vehicle Info Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <Ionicons name="car" size={48} color={COLORS.primary} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.registrationNumber}>{registrationNumber}</Text>
              <Text style={styles.vehicleMakeModel}>
                {vehicleData?.make} {vehicleData?.model}
              </Text>
            </View>
          </View>

          <View style={styles.vehicleDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fuel Type:</Text>
              <Text style={styles.detailValue}>
                {getFuelTypeDisplayName(vehicleData?.fuelType)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle Class:</Text>
              <Text style={styles.detailValue}>{vehicleData?.vehicleClass}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Year:</Text>
              <Text style={styles.detailValue}>{vehicleData?.year}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.validateButton, isLoading && styles.validateButtonDisabled]}
          onPress={handleValidateQuota}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.textInverse} />
          <Text style={styles.validateButtonText}>
            {isLoading ? 'Validating...' : 'Check Fuel Quota'}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Next Steps</Text>
          <Text style={styles.instructionsText}>
            • Tap "Check Fuel Quota" to validate available quota{'\n'}
            • Review quota details and remaining balance{'\n'}
            • Proceed to fuel dispensing if quota is available
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    paddingHorizontal: SPACING.lg,
  },
  vehicleCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  vehicleInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  registrationNumber: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  vehicleMakeModel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  vehicleDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    marginVertical: SPACING.lg,
  },
  validateButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  validateButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    marginLeft: SPACING.sm,
  },
  instructionsCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.sm,
  },
});

export default VehicleDetailsScreen;
