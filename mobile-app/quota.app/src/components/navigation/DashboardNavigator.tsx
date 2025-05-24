import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES, COLORS } from '../../constants';
import DashboardScreen from '../../screens/dashboard/DashboardScreen';

const Stack = createStackNavigator();

const DashboardNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.DASHBOARD}
        component={DashboardScreen}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
