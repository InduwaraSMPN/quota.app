import { notificationService } from '../services';

interface UseToastReturn {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hide: () => void;
}

const useToast = (): UseToastReturn => {
  return {
    showSuccess: (message: string, title?: string) => {
      notificationService.showSuccess(message, title);
    },
    showError: (message: string, title?: string) => {
      notificationService.showError(message, title);
    },
    showWarning: (message: string, title?: string) => {
      notificationService.showWarning(message, title);
    },
    showInfo: (message: string, title?: string) => {
      notificationService.showInfo(message, title);
    },
    hide: () => {
      notificationService.hideToast();
    },
  };
};

export default useToast;
