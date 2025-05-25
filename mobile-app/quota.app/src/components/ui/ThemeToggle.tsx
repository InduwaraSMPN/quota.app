import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { getCardStyle } from '../../utils/theme';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false,
  size = 'medium',
}) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const styles = useThemedStyles((theme) => createStyles(theme, size));

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 28;
      default:
        return 20;
    }
  };

  const handleThemeToggle = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  if (showLabel) {
    return (
      <TouchableOpacity style={styles.containerWithLabel} onPress={handleThemeToggle}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getThemeIcon() as keyof typeof Ionicons.glyphMap} 
            size={getIconSize()} 
            color={theme.foreground} 
          />
        </View>
        <Text style={styles.label}>{getThemeLabel()}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleThemeToggle}>
      <Ionicons 
        name={getThemeIcon() as keyof typeof Ionicons.glyphMap} 
        size={getIconSize()} 
        color={theme.foreground} 
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, size: string) => StyleSheet.create({
  container: {
    width: size === 'small' ? 32 : size === 'large' ? 48 : 40,
    height: size === 'small' ? 32 : size === 'large' ? 48 : 40,
    borderRadius: size === 'small' ? 16 : size === 'large' ? 24 : 20,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    ...SHADOWS.sm,
  },
  containerWithLabel: {
    ...getCardStyle(theme),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  label: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: theme.foreground,
    fontFamily: TYPOGRAPHY.fontFamily.sansMedium,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
});

export default ThemeToggle;
