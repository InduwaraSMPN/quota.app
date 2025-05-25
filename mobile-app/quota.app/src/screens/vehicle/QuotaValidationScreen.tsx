import React from 'react';
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
import { formatLiters, formatDate } from '../../utils';

const QuotaValidationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, registrationNumber, validationData } = route.params as any;

  const isValid = validationData?.isValid;
  const quotaDetails = validationData?.quotaDetails;

  const handleProceedToDispensing = () => {
    navigation.navigate(SCREEN_NAMES.FUEL_DISPENSING as never, {
      vehicleId,
      registrationNumber,
      quotaDetails,
    } as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getStatusColor = () => {
    if (!isValid) return COLORS.error;
    if (quotaDetails?.remainingAmount && quotaDetails?.totalQuota &&
        quotaDetails.remainingAmount > quotaDetails.totalQuota * 0.25) return COLORS.success;
    return COLORS.warning;
  };

  const getStatusIcon = () => {
    if (!isValid) return 'close-circle';
    if (quotaDetails?.remainingAmount && quotaDetails?.totalQuota &&
        quotaDetails.remainingAmount > quotaDetails.totalQuota * 0.25) return 'checkmark-circle';
    return 'warning';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quota Validation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
          <Ionicons name={getStatusIcon()} size={64} color={getStatusColor()} />
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {isValid ? 'Quota Available' : 'Quota Unavailable'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isValid
              ? 'Vehicle is eligible for fuel dispensing'
              : validationData?.message || 'No active quota found'
            }
          </Text>
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Vehicle Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Registration:</Text>
            <Text style={styles.infoValue}>{registrationNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Make & Model:</Text>
            <Text style={styles.infoValue}>
              {validationData?.make} {validationData?.model}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fuel Type:</Text>
            <Text style={styles.infoValue}>{validationData?.fuelType}</Text>
          </View>
        </View>

        {/* Quota Details */}
        {isValid && quotaDetails && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Quota Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Quota:</Text>
              <Text style={styles.infoValue}>{formatLiters(quotaDetails.totalQuota)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Used Amount:</Text>
              <Text style={styles.infoValue}>{formatLiters(quotaDetails.usedAmount)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Remaining:</Text>
              <Text style={[styles.infoValue, { color: getStatusColor() }]}>
                {formatLiters(quotaDetails.remainingAmount)}
              </Text>
            </View>
            {quotaDetails.lastRefuelDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Refuel:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(quotaDetails.lastRefuelDate)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isValid ? (
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceedToDispensing}
            >
              <Ionicons name="arrow-forward" size={24} color={COLORS.textInverse} />
              <Text style={styles.proceedButtonText}>Proceed to Dispensing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
              <Text style={styles.retryButtonText}>Try Another Vehicle</Text>
            </TouchableOpacity>
          )}
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
  statusCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.xl,
    marginVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.base,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
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
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionContainer: {
    marginVertical: SPACING.xl,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderRadius: 12,
    height: 56,
  },
  proceedButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    marginLeft: SPACING.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});

export default QuotaValidationScreen;
