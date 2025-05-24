import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useCamera } from '../../hooks';
import { COLORS, SPACING, TYPOGRAPHY, QR_CONFIG } from '../../constants';
import { parseQRCode } from '../../utils';
import { notificationService } from '../../services';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

interface QRScannerProps {
  onQRCodeScanned: (registrationNumber: string, ownerId: string) => void;
  onManualEntry: () => void;
  onClose: () => void;
  isActive: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onQRCodeScanned,
  onManualEntry,
  onClose,
  isActive,
}) => {
  const { hasPermission, requestPermission } = useCamera();
  const [isScanning, setIsScanning] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    // Animate scanning line
    if (isScanning && isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isScanning, isActive]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanning || !isActive || data === lastScannedCode) {
      return;
    }

    setLastScannedCode(data);
    setIsScanning(false);

    // Parse QR code data
    const qrData = parseQRCode(data);
    
    if (qrData) {
      notificationService.showQRSuccess(qrData.registrationNumber);
      notificationService.triggerHaptic('success');
      onQRCodeScanned(qrData.registrationNumber, qrData.ownerId);
    } else {
      notificationService.showQRError('Invalid QR code format');
      notificationService.triggerHaptic('error');
      
      // Resume scanning after error
      setTimeout(() => {
        setIsScanning(true);
        setLastScannedCode(null);
      }, 2000);
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const resumeScanning = () => {
    setIsScanning(true);
    setLastScannedCode(null);
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color={COLORS.gray400} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Please allow camera access to scan QR codes
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashEnabled ? 'on' : 'off'}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textInverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFlash}>
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={24}
              color={COLORS.textInverse}
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Area */}
        <View style={styles.scanningArea}>
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={[styles.overlaySection, styles.overlayTop]} />
            
            {/* Middle section with scan area */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                {/* Corner indicators */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                {/* Scanning line animation */}
                {isScanning && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [
                          {
                            translateY: animatedValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, SCAN_AREA_SIZE - 4],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom overlay */}
            <View style={[styles.overlaySection, styles.overlayBottom]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {isScanning ? 'Position QR code within the frame' : 'QR Code Detected!'}
          </Text>
          <Text style={styles.instructionText}>
            {isScanning
              ? 'The QR code will be scanned automatically'
              : 'Processing vehicle information...'}
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onManualEntry}>
            <Ionicons name="keypad-outline" size={24} color={COLORS.textInverse} />
            <Text style={styles.actionButtonText}>Manual Entry</Text>
          </TouchableOpacity>
          
          {!isScanning && (
            <TouchableOpacity style={styles.actionButton} onPress={resumeScanning}>
              <Ionicons name="refresh-outline" size={24} color={COLORS.textInverse} />
              <Text style={styles.actionButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.textPrimary,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.fontSizes.base,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
  },
  scanningArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTop: {
    height: (height - SCAN_AREA_SIZE) / 2 - 100,
  },
  overlayBottom: {
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  instructionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textInverse,
    textAlign: 'center',
    opacity: 0.8,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 50,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
});

export default QRScanner;
