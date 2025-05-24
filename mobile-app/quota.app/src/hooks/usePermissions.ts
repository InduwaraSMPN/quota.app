import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';

interface UsePermissionsReturn {
  cameraPermission: boolean;
  notificationPermission: boolean;
  requestCameraPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  checkAllPermissions: () => Promise<void>;
}

const usePermissions = (): UsePermissionsReturn => {
  const [cameraPermission, setCameraPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    // Check camera permission
    const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
    setCameraPermission(cameraStatus === 'granted');

    // Check notification permission
    const { status: notificationStatus } = await Notifications.getPermissionsAsync();
    setNotificationPermission(notificationStatus === 'granted');
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setCameraPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotificationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return {
    cameraPermission,
    notificationPermission,
    requestCameraPermission,
    requestNotificationPermission,
    checkAllPermissions,
  };
};

export default usePermissions;
