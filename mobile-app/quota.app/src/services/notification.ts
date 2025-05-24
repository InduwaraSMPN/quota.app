import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { COLORS } from '../constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Toast Notifications
  showSuccess(message: string, title?: string): void {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  showError(message: string, title?: string): void {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  showWarning(message: string, title?: string): void {
    Toast.show({
      type: 'info',
      text1: title || 'Warning',
      text2: message,
      position: 'bottom',
      visibilityTime: 3500,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  showInfo(message: string, title?: string): void {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  hideToast(): void {
    Toast.hide();
  }

  // Local Push Notifications
  async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null means immediate
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Haptic Feedback
  async triggerHaptic(type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }

  // Transaction-specific notifications
  showTransactionSuccess(amount: number, vehicleReg: string): void {
    this.showSuccess(
      `${amount}L fuel dispensed to ${vehicleReg}`,
      'Transaction Successful'
    );
    this.triggerHaptic('success');
  }

  showTransactionError(message: string): void {
    this.showError(message, 'Transaction Failed');
    this.triggerHaptic('error');
  }

  // QR Scanner notifications
  showQRSuccess(registrationNumber: string): void {
    this.showSuccess(
      `Vehicle ${registrationNumber} scanned successfully`,
      'QR Code Detected'
    );
    this.triggerHaptic('success');
  }

  showQRError(message: string): void {
    this.showError(message, 'QR Scan Failed');
    this.triggerHaptic('error');
  }

  // Authentication notifications
  showLoginSuccess(): void {
    this.showSuccess('Welcome back!', 'Login Successful');
    this.triggerHaptic('success');
  }

  showLoginError(message: string): void {
    this.showError(message, 'Login Failed');
    this.triggerHaptic('error');
  }

  showLogoutSuccess(): void {
    this.showInfo('You have been logged out', 'Goodbye');
  }

  // Network notifications
  showNetworkError(): void {
    this.showError(
      'Please check your internet connection',
      'Network Error'
    );
  }

  showConnectionRestored(): void {
    this.showSuccess('Connection restored', 'Back Online');
  }

  // Permission notifications
  showCameraPermissionError(): void {
    this.showError(
      'Camera access is required to scan QR codes',
      'Permission Required'
    );
  }

  // Validation notifications
  showValidationError(message: string): void {
    this.showWarning(message, 'Validation Error');
    this.triggerHaptic('warning');
  }

  // Generic loading notification
  showLoading(message: string = 'Loading...'): void {
    this.showInfo(message);
  }

  // Quota-specific notifications
  showInsufficientQuota(remaining: number): void {
    this.showWarning(
      `Only ${remaining}L quota remaining`,
      'Low Quota Warning'
    );
    this.triggerHaptic('warning');
  }

  showQuotaExceeded(): void {
    this.showError(
      'Requested amount exceeds available quota',
      'Quota Exceeded'
    );
    this.triggerHaptic('error');
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
