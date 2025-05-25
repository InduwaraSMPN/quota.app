import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';
import { formatLiters, formatCurrency, validateAmount } from '../../utils';

const FuelDispensingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { vehicleId, registrationNumber, quotaDetails } = route.params as any;

  const [amount, setAmount] = useState('');
  const [unitPrice] = useState(150.00); // This would come from station settings
  const [error, setError] = useState('');

  const totalCost = parseFloat(amount) * unitPrice || 0;
  const maxAmount = quotaDetails?.remainingAmount || 0;

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setAmount(cleanText);
    if (error) setError('');
  };

  const handleConfirm = () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!validateAmount(amountNum, maxAmount)) {
      setError(`Amount cannot exceed ${formatLiters(maxAmount)}`);
      return;
    }

    navigation.navigate(SCREEN_NAMES.DISPENSING_CONFIRMATION as never, {
      vehicleId,
      registrationNumber,
      amount: amountNum,
      unitPrice,
      totalCost,
      quotaDetails,
    } as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const setQuickAmount = (percentage: number) => {
    if (maxAmount && maxAmount > 0) {
      const quickAmount = (maxAmount * percentage / 100).toFixed(1);
      setAmount(quickAmount);
      if (error) setError('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fuel Dispensing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Vehicle Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.registrationNumber}>{registrationNumber}</Text>
          <Text style={styles.availableQuota}>
            Available: {formatLiters(maxAmount)}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Fuel Amount (Liters)</Text>
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.0"
              placeholderTextColor={COLORS.gray400}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.unitText}>L</Text>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountSection}>
          <Text style={styles.quickAmountTitle}>Quick Select</Text>
          <View style={styles.quickAmountButtons}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickAmount(25)}
            >
              <Text style={styles.quickButtonText}>25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickAmount(50)}
            >
              <Text style={styles.quickButtonText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickAmount(75)}
            >
              <Text style={styles.quickButtonText}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => setQuickAmount(100)}
            >
              <Text style={styles.quickButtonText}>Max</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cost Calculation */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>Cost Calculation</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Unit Price:</Text>
            <Text style={styles.costValue}>{formatCurrency(unitPrice)}/L</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Amount:</Text>
            <Text style={styles.costValue}>{formatLiters(parseFloat(amount) || 0)}</Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Cost:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, (!amount || parseFloat(amount) <= 0) && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          <Ionicons name="checkmark" size={24} color={COLORS.textInverse} />
          <Text style={styles.confirmButtonText}>Confirm Amount</Text>
        </TouchableOpacity>
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
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    alignItems: 'center',
  },
  registrationNumber: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textInverse,
    letterSpacing: 2,
  },
  availableQuota: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    height: 80,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  amountInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes['3xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  unitText: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  quickAmountSection: {
    marginBottom: SPACING.xl,
  },
  quickAmountTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
  },
  costCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  costTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  costLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
  },
  costValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.primary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    marginBottom: SPACING.xl,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    marginLeft: SPACING.sm,
  },
});

export default FuelDispensingScreen;
