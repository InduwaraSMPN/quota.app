import { LIGHT_THEME, DARK_THEME, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

type Theme = typeof LIGHT_THEME;

// Helper function to get color with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle rgba colors
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  
  // Handle rgb colors
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  return color;
};

// Common style patterns
export const getCardStyle = (theme: Theme) => ({
  backgroundColor: theme.card,
  borderRadius: BORDER_RADIUS.lg,
  borderWidth: 1,
  borderColor: theme.border,
  ...SHADOWS.sm,
});

export const getButtonStyle = (theme: Theme, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseStyle = {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    ...SHADOWS.sm,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.secondary,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.border,
        shadowOpacity: 0,
        elevation: 0,
      };
    default:
      return baseStyle;
  }
};

export const getTextStyle = (
  theme: Theme, 
  variant: 'primary' | 'secondary' | 'muted' | 'inverse' = 'primary'
) => {
  const baseStyle = {
    fontFamily: TYPOGRAPHY.fontFamily.sans,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        color: theme.foreground,
      };
    case 'secondary':
      return {
        ...baseStyle,
        color: theme.mutedForeground,
      };
    case 'muted':
      return {
        ...baseStyle,
        color: theme.mutedForeground,
      };
    case 'inverse':
      return {
        ...baseStyle,
        color: theme.primaryForeground,
      };
    default:
      return baseStyle;
  }
};

export const getInputStyle = (theme: Theme) => ({
  backgroundColor: theme.background,
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: BORDER_RADIUS.lg,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  fontSize: TYPOGRAPHY.fontSizes.base,
  color: theme.foreground,
  fontFamily: TYPOGRAPHY.fontFamily.sans,
});

// Fuel type colors that work with both themes
export const getFuelTypeColor = (fuelType: string, theme: Theme): string => {
  const fuelColors = {
    'OCTANE_92': theme.chart1,
    'OCTANE_95': theme.chart2,
    'AUTO_DIESEL': theme.chart3,
    'SUPER_DIESEL': theme.chart4,
    'KEROSENE': theme.chart5,
  };
  
  return fuelColors[fuelType as keyof typeof fuelColors] || theme.mutedForeground;
};

// Status colors that adapt to theme
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info', theme: Theme): string => {
  const statusColors = {
    success: '#28A745',
    warning: '#FFC107',
    error: theme.destructive,
    info: theme.ring,
  };
  
  return statusColors[status];
};

// Helper to create consistent spacing
export const createSpacing = (...values: (keyof typeof SPACING)[]): number[] => {
  return values.map(value => SPACING[value]);
};

// Helper to create consistent typography styles
export const createTypographyStyle = (
  size: keyof typeof TYPOGRAPHY.fontSizes,
  weight: keyof typeof TYPOGRAPHY.fontWeights = 'normal',
  letterSpacing: keyof typeof TYPOGRAPHY.letterSpacing = 'normal'
) => ({
  fontSize: TYPOGRAPHY.fontSizes[size],
  fontWeight: TYPOGRAPHY.fontWeights[weight],
  letterSpacing: TYPOGRAPHY.letterSpacing[letterSpacing],
  fontFamily: TYPOGRAPHY.fontFamily.sans,
});

// Helper to create consistent border radius
export const createBorderRadius = (size: keyof typeof BORDER_RADIUS) => ({
  borderRadius: BORDER_RADIUS[size],
});

// Helper to create consistent shadows
export const createShadow = (size: keyof typeof SHADOWS) => SHADOWS[size];
