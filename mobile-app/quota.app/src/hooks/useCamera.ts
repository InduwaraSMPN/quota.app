import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { notificationService } from '../services';

interface UseCameraReturn {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  permissionStatus: string | null;
}

const useCamera = (): UseCameraReturn => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Camera.getCameraPermissionsAsync();
      setPermissionStatus(status);
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setHasPermission(false);
        notificationService.showCameraPermissionError();
        return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
      notificationService.showError('Failed to request camera permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermission,
    isLoading,
    requestPermission,
    permissionStatus,
  };
};

export default useCamera;
