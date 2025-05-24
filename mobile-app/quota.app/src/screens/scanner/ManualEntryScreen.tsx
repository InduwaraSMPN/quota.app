import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, SCREEN_NAMES } from '../../constants';
import { validateRegistrationNumber, formatRegistrationNumber, standardizeRegistrationNumber } from '../../utils';
import { apiService, storageService, notificationService } from '../../services';

interface RouteParams {
  initialRegistrationNumber?: string;
  error?: string;
}

const ManualEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [registrationNumber, setRegistrationNumber] = useState(
    params?.initialRegistrationNumber || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(params?.error || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await storageService.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleInputChange = (text: string) => {
    const formatted = formatRegistrationNumber(text);
    setRegistrationNumber(formatted);
    if (error) {
      setError('');
    }
  };

  const handleSearch = async () => {
    if (!registrationNumber.trim()) {
      setError('Please enter a registration number');
      return;
    }

    if (!validateRegistrationNumber(registrationNumber)) {
      setError('Please enter a valid registration number (e.g., ABC-1234)');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const standardizedRegNumber = standardizeRegistrationNumber(registrationNumber);
      
      // Save to recent searches
      await storageService.saveRecentSearch(standardizedRegNumber);
      
      // Get vehicle details
      const response = await apiService.getVehicleByRegistration(standardizedRegNumber);
      
      if (response.error || !response.data) {
        setError(response.error || 'Vehicle not found. Please check the registration number.');
        notificationService.showError('Vehicle not found');
        return;
      }

      const vehicleData = response.data;
      
      // Navigate to vehicle details
      navigation.navigate(SCREEN_NAMES.VEHICLE_DETAILS as never, {
        vehicleId: vehicleData.vehicleId,
        registrationNumber: vehicleData.registrationNumber,
        vehicleData,
      } as never);
    } catch (error) {
      console.error('Error searching vehicle:', error);
      setError('Failed to search vehicle. Please try again.');
      notificationService.showError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchSelect = (regNumber: string) => {
    setRegistrationNumber(formatRegistrationNumber(regNumber));
    setError('');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchSelect(item)}
    >
      <Ionicons name="time-outline" size={20} color={COLORS.gray400} />
      <Text style={styles.recentSearchText}>{formatRegistrationNumber(item)}</Text>
      <Ionicons name="arrow-forward-outline" size={16} color={COLORS.gray400} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Entry</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="keypad-outline" size={48} color={COLORS.primary} />
          <Text style={styles.instructionsTitle}>Enter Vehicle Registration</Text>
          <Text style={styles.instructionsText}>
            Type the vehicle registration number to search for fuel quota information
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Registration Number</Text>
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <TextInput
              style={styles.textInput}
              value={registrationNumber}
              onChangeText={handleInputChange}
              placeholder="e.g., ABC-1234"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              editable={!isLoading}
            />
            {registrationNumber.length > 0 && (
              <TouchableOpacity
                onPress={() => setRegistrationNumber('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            )}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading || !registrationNumber.trim()}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.searchButtonText}>Searching...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="search" size={20} color={COLORS.textInverse} />
              <Text style={styles.searchButtonText}>Search Vehicle</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            <FlatList
              data={recentSearches}
              renderItem={renderRecentSearchItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            • Registration numbers should be in format ABC-1234{'\n'}
            • Make sure the vehicle is registered in the system{'\n'}
            • Contact support if you continue having issues
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
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.base,
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    textAlign: 'center',
    letterSpacing: 2,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    marginBottom: SPACING.xl,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  searchButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchesContainer: {
    marginBottom: SPACING.xl,
  },
  recentSearchesTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  recentSearchText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    letterSpacing: 1,
  },
  helpSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  helpTitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.sm,
  },
});

export default ManualEntryScreen;
