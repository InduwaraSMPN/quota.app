import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../../hooks';
import { WelcomeScreen, LoginScreen } from '../../screens/auth';
import MainTabNavigator from './MainTabNavigator';
import { COLORS } from '../../constants';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Hide welcome screen after auth check is complete
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show welcome screen on app start
  if (showWelcome || isLoading) {
    return (
      <WelcomeScreen onComplete={() => setShowWelcome(false)} />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {isAuthenticated ? (
        // Authenticated Stack
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // Authentication Stack
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
