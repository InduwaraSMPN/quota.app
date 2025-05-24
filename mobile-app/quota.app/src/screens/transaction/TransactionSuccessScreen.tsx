import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { formatLiters, formatCurrency, formatDateTime } from '../../utils';

const TransactionSuccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionData, registrationNumber } = route.params as any;

  useEffect(() => {
    // Auto-navigate to dashboard after 10 seconds
    const timer = setTimeout(() => {
      handleBackToDashboard();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' as never }],
    });
  };

  const handleNewTransaction = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Scanner' as never }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={80} color={COLORS.textInverse} />
          </View>
          <Text style={styles.successTitle}>Transaction Successful!</Text>
          <Text style={styles.successSubtitle}>
            Fuel has been dispensed successfully
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Transaction Summary</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>#{transactionData?.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle:</Text>
            <Text style={styles.detailValue}>{registrationNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{formatLiters(transactionData?.amount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Cost:</Text>
            <Text style={styles.detailValue}>{formatCurrency(transactionData?.totalPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(transactionData?.transactionDate)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.newTransactionButton}
            onPress={handleNewTransaction}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.textInverse} />
            <Text style={styles.newTransactionButtonText}>New Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={handleBackToDashboard}
          >
            <Ionicons name="home-outline" size={24} color={COLORS.primary} />
            <Text style={styles.dashboardButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-redirect Notice */}
        <Text style={styles.autoRedirectText}>
          Returning to dashboard automatically in 10 seconds...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
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
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  newTransactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
  },
  newTransactionButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    marginLeft: SPACING.sm,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dashboardButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  autoRedirectText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TransactionSuccessScreen;
