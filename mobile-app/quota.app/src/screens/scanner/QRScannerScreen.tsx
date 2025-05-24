import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import QRScanner from '../../components/scanner/QRScanner';
import { SCREEN_NAMES } from '../../constants';
import { apiService, storageService } from '../../services';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isActive, setIsActive] = useState(false);

  // Handle screen focus/blur
  useFocusEffect(
    React.useCallback(() => {
      setIsActive(true);
      
      // Handle Android back button
      const onBackPress = () => {
        handleClose();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        setIsActive(false);
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  const handleQRCodeScanned = async (registrationNumber: string, ownerId: string) => {
    try {
      // Save to recent searches
      await storageService.saveRecentSearch(registrationNumber);
      
      // Get vehicle details by registration number
      const response = await apiService.getVehicleByRegistration(registrationNumber);
      
      if (response.error || !response.data) {
        // Navigate to manual entry with the scanned registration number
        navigation.navigate(SCREEN_NAMES.MANUAL_ENTRY as never, {
          initialRegistrationNumber: registrationNumber,
          error: response.error || 'Vehicle not found',
        } as never);
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
      console.error('Error processing QR code:', error);
      navigation.navigate(SCREEN_NAMES.MANUAL_ENTRY as never, {
        initialRegistrationNumber: registrationNumber,
        error: 'Failed to process QR code',
      } as never);
    }
  };

  const handleManualEntry = () => {
    navigation.navigate(SCREEN_NAMES.MANUAL_ENTRY as never);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <QRScanner
        onQRCodeScanned={handleQRCodeScanned}
        onManualEntry={handleManualEntry}
        onClose={handleClose}
        isActive={isActive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default QRScannerScreen;
