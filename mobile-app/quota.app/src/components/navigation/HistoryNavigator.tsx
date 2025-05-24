import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES, COLORS } from '../../constants';
import TransactionHistoryScreen from '../../screens/transaction/TransactionHistoryScreen';
import TransactionDetailsScreen from '../../screens/transaction/TransactionDetailsScreen';

const Stack = createStackNavigator();

const HistoryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.TRANSACTION_HISTORY}
        component={TransactionHistoryScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.TRANSACTION_DETAILS}
        component={TransactionDetailsScreen}
      />
    </Stack.Navigator>
  );
};

export default HistoryNavigator;
