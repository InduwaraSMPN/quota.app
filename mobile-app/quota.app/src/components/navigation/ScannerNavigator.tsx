import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES, COLORS } from '../../constants';
import QRScannerScreen from '../../screens/scanner/QRScannerScreen';
import ManualEntryScreen from '../../screens/scanner/ManualEntryScreen';
import VehicleDetailsScreen from '../../screens/vehicle/VehicleDetailsScreen';
import QuotaValidationScreen from '../../screens/vehicle/QuotaValidationScreen';
import FuelDispensingScreen from '../../screens/transaction/FuelDispensingScreen';
import DispensingConfirmationScreen from '../../screens/transaction/DispensingConfirmationScreen';
import TransactionSuccessScreen from '../../screens/transaction/TransactionSuccessScreen';

const Stack = createStackNavigator();

const ScannerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.QR_SCANNER}
        component={QRScannerScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.MANUAL_ENTRY}
        component={ManualEntryScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.VEHICLE_DETAILS}
        component={VehicleDetailsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.QUOTA_VALIDATION}
        component={QuotaValidationScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.FUEL_DISPENSING}
        component={FuelDispensingScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.DISPENSING_CONFIRMATION}
        component={DispensingConfirmationScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRANSACTION_SUCCESS}
        component={TransactionSuccessScreen}
      />
    </Stack.Navigator>
  );
};

export default ScannerNavigator;
