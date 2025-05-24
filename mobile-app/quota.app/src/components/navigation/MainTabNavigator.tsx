import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SCREEN_NAMES } from '../../constants';
import DashboardNavigator from './DashboardNavigator';
import ScannerNavigator from './ScannerNavigator';
import HistoryNavigator from './HistoryNavigator';
import NotificationsNavigator from './NotificationsNavigator';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case SCREEN_NAMES.DASHBOARD:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case SCREEN_NAMES.SCANNER:
              iconName = focused ? 'qr-code' : 'qr-code-outline';
              break;
            case SCREEN_NAMES.HISTORY:
              iconName = focused ? 'time' : 'time-outline';
              break;
            case SCREEN_NAMES.NOTIFICATIONS:
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case SCREEN_NAMES.SETTINGS:
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.gray200,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name={SCREEN_NAMES.DASHBOARD}
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.SCANNER}
        component={ScannerNavigator}
        options={{
          tabBarLabel: 'Scanner',
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.HISTORY}
        component={HistoryNavigator}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsNavigator}
        options={{
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.SETTINGS}
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
