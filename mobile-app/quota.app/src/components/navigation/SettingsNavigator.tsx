import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES, COLORS } from '../../constants';
import SettingsScreen from '../../screens/settings/SettingsScreen';
import ProfileScreen from '../../screens/settings/ProfileScreen';
import ProfileEditScreen from '../../screens/settings/ProfileEditScreen';
import AppSettingsScreen from '../../screens/settings/AppSettingsScreen';
import AboutScreen from '../../screens/settings/AboutScreen';
import { SitemapScreen } from '../../screens/debug';

const Stack = createStackNavigator();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name={SCREEN_NAMES.SETTINGS}
        component={SettingsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.PROFILE_EDIT}
        component={ProfileEditScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.APP_SETTINGS}
        component={AppSettingsScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ABOUT}
        component={AboutScreen}
      />
      <Stack.Screen
        name={SCREEN_NAMES.SITEMAP}
        component={SitemapScreen}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
