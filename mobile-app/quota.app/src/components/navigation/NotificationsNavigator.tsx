import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES, COLORS } from '../../constants';
import NotificationsScreen from '../../screens/settings/NotificationsScreen';

const Stack = createStackNavigator();

const NotificationsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsScreen}
      />
    </Stack.Navigator>
  );
};

export default NotificationsNavigator;
