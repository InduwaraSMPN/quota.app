import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, Image, Text } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface LogoProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

const LOGO_URL = 'https://ik.imagekit.io/pasindunaduninduwara/quota.app.logo.svg?updatedAt=1747030380891';

export const Logo: React.FC<LogoProps> = ({
  width = 240,
  height = 48,
  style,
  color
}) => {
  const [svgError, setSvgError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // If both SVG and Image fail, show text fallback
  if (svgError && imageError) {
    return (
      <View style={[styles.container, style, { width, height }]}>
        <Text style={[styles.fallbackText, { color, fontSize: height * 0.6 }]}>
          Quota.app
        </Text>
      </View>
    );
  }

  // Try Image fallback if SVG fails
  if (svgError) {
    return (
      <View style={[styles.container, style, { width, height }]}>
        <Image
          source={{ uri: LOGO_URL }}
          style={{ width, height }}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // Try SVG first
  return (
    <View style={[styles.container, style, { width, height }]}>
      <SvgUri
        uri={LOGO_URL}
        width={width}
        height={height}
        onError={() => setSvgError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Logo;
