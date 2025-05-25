import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { getButtonStyle, getTextStyle } from '../../utils/theme';

interface ActionButtonProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const styles = useThemedStyles((theme) => createStyles(theme, variant, size));

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primaryForeground;
      case 'secondary':
        return theme.secondaryForeground;
      case 'outline':
        return theme.foreground;
      default:
        return theme.primaryForeground;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primaryForeground;
      case 'secondary':
        return theme.secondaryForeground;
      case 'outline':
        return theme.foreground;
      default:
        return theme.primaryForeground;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: getTextColor() }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: getTextColor() }]}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={getIconColor()} />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any, variant: string, size: string) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: variant === 'primary' ? theme.primary :
                   variant === 'secondary' ? theme.secondary :
                   'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? theme.border : 'transparent',
    paddingHorizontal: size === 'small' ? SPACING.md :
                      size === 'large' ? SPACING.xl : SPACING.lg,
    paddingVertical: size === 'small' ? SPACING.sm :
                    size === 'large' ? SPACING.lg : SPACING.md,
    minHeight: size === 'small' ? 56 : size === 'large' ? 88 : 72,
    ...SHADOWS.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    fontSize: size === 'small' ? TYPOGRAPHY.fontSizes.sm :
             size === 'large' ? TYPOGRAPHY.fontSizes.lg : TYPOGRAPHY.fontSizes.base,
    fontFamily: TYPOGRAPHY.fontFamily.sansSemiBold,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    opacity: 0.8,
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
});

export default ActionButton;
