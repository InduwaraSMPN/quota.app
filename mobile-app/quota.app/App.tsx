import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/context/AuthContext';
import { LoggingProvider } from './src/context/LoggingContext';
import AppNavigator from './src/components/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <LoggingProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </AuthProvider>
      </LoggingProvider>
    </SafeAreaProvider>
  );
}
