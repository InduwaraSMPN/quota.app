import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { getCardStyle, getColorWithOpacity } from '../../utils/theme';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  onPress,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const styles = useThemedStyles((theme) => createStyles(theme));

  const CardComponent = onPress ? TouchableOpacity : View;
  const effectiveIconColor = iconColor || theme.primary;

  return (
    <CardComponent
      style={styles.container}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getColorWithOpacity(effectiveIconColor, 0.1) }]}>
          <Ionicons name={icon} size={24} color={effectiveIconColor} />
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={theme.mutedForeground} />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </>
        )}
      </View>
    </CardComponent>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    ...getCardStyle(theme),
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: theme.mutedForeground,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.sansMedium,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  value: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: theme.foreground,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.sansBold,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: theme.mutedForeground,
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  loadingContainer: {
    paddingVertical: SPACING.sm,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: theme.mutedForeground,
    fontStyle: 'italic',
    fontFamily: TYPOGRAPHY.fontFamily.sans,
  },
});

export default StatsCard;
