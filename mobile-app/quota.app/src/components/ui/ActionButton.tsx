import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface ActionButtonProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  backgroundColor?: string;
  iconColor?: string;
  textColor?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  backgroundColor = COLORS.primary,
  iconColor = COLORS.textInverse,
  textColor = COLORS.textInverse,
  disabled = false,
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.container, { backgroundColor }];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }
    
    return baseStyle;
  };

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

  const getTitleStyle = () => {
    const baseStyle = [styles.title, { color: textColor }];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.titleSmall);
        break;
      case 'large':
        baseStyle.push(styles.titleLarge);
        break;
      default:
        baseStyle.push(styles.titleMedium);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={getIconSize()} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={getTitleStyle()}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: SPACING.md,
    shadowColor: COLORS.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 56,
  },
  medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 72,
  },
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 88,
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
  },
  titleSmall: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
  },
  titleMedium: {
    fontSize: TYPOGRAPHY.fontSizes.base,
  },
  titleLarge: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    opacity: 0.8,
    marginTop: 2,
  },
});

export default ActionButton;
