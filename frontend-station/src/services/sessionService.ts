// Session service for managing registration data through backend API

import { apiService } from './api';
import {
  LoginInfoData,
  EmailVerificationData,
  PasswordSetupData,
  OwnerInfoData,
  BusinessInfoData,
  SignupFormData
} from '@/app/actions/session';

/**
 * Session service for managing registration data through backend API
 */
export const sessionService = {
  /**
   * Get all registration data from the session
   */
  getRegistrationData: async (): Promise<SignupFormData | null> => {
    try {
      const response = await apiService.getRegistrationData();

      if (response.data) {
        // Convert backend DTO to frontend format
        return {
          loginInfo: response.data.loginInfo || { email: '' },
          emailVerification: response.data.emailVerification || { verificationCode: '', verified: false },
          passwordSetup: response.data.passwordSetup || { password: '', confirmPassword: '' },
          ownerInfo: response.data.ownerInfo || { fullName: '', nicNumber: '', contactNumber: '' },
          businessInfo: response.data.businessInfo || {
            businessRegistrationNumber: '',
            businessName: '',
            businessAddress: '',
            province: '',
            district: '',
            stationName: '',
            fuelTypes: [],
            openingTime: '',
            closingTime: '',
            fuelRetailLicenseNumber: ''
          },
          currentStep: response.data.currentStep || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting registration data:', error);
      return null;
    }
  },

  /**
   * Save all registration data to the session
   */
  saveRegistrationData: async (formData: SignupFormData): Promise<boolean> => {
    try {
      const response = await apiService.updateRegistrationData(formData);
      return response.status === 200;
    } catch (error) {
      console.error('Error saving registration data:', error);
      return false;
    }
  },

  /**
   * Clear all registration data from the session
   */
  clearRegistrationData: async (): Promise<boolean> => {
    try {
      const response = await apiService.clearRegistrationData();
      return response.status === 200;
    } catch (error) {
      console.error('Error clearing registration data:', error);
      return false;
    }
  },

  /**
   * Save login information to the session
   */
  saveLoginInfo: async (loginInfo: LoginInfoData): Promise<boolean> => {
    try {
      const response = await apiService.updateLoginInfo(loginInfo);
      return response.status === 200;
    } catch (error) {
      console.error('Error saving login info:', error);
      return false;
    }
  },

  /**
   * Save email verification data to the session
   */
  saveEmailVerification: async (emailVerification: EmailVerificationData): Promise<boolean> => {
    try {
      // Update email verified status
      const verifiedResponse = await apiService.updateEmailVerified({
        verified: emailVerification.verified || false
      });

      return verifiedResponse.status === 200;
    } catch (error) {
      console.error('Error saving email verification:', error);
      return false;
    }
  },

  /**
   * Save password setup data to the session
   */
  savePasswordSetup: async (passwordSetup: PasswordSetupData): Promise<boolean> => {
    try {
      const response = await apiService.updatePassword(passwordSetup);
      return response.status === 200;
    } catch (error) {
      console.error('Error saving password setup:', error);
      return false;
    }
  },

  /**
   * Save owner information to the session
   */
  saveOwnerInfo: async (ownerInfo: OwnerInfoData): Promise<boolean> => {
    try {
      const response = await apiService.updateOwnerInfo(ownerInfo);
      return response.status === 200;
    } catch (error) {
      console.error('Error saving owner info:', error);
      return false;
    }
  },

  /**
   * Save business information to the session
   */
  saveBusinessInfo: async (businessInfo: BusinessInfoData): Promise<boolean> => {
    try {
      const response = await apiService.updateBusinessInfo(businessInfo);
      return response.status === 200;
    } catch (error) {
      console.error('Error saving business info:', error);
      return false;
    }
  },

  /**
   * Save current step to the session
   */
  saveCurrentStep: async (currentStep: number): Promise<boolean> => {
    try {
      const response = await apiService.updateCurrentStep({ currentStep });
      return response.status === 200;
    } catch (error) {
      console.error('Error saving current step:', error);
      return false;
    }
  }
};
