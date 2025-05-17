// Session service for managing registration data through backend API

import {
  LoginInfoData,
  EmailVerificationData,
  PasswordSetupData,
  AdminInfoData,
  SignupFormData
} from '@/app/actions/session';

/**
 * Session service for managing registration data through backend API
 */
export const sessionService = {
  /**
   * Test if the session controller is accessible
   */
  pingSession: async (): Promise<boolean> => {
    try {
      console.log('Pinging session controller...');
      const response = await fetch('http://localhost:8888/api/session/ping', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      });

      console.log('Ping response status:', response.status);
      console.log('Ping response headers:', Object.fromEntries(response.headers.entries()));

      // Get the raw text first
      const rawText = await response.text();
      console.log('Raw ping response:', rawText);

      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          console.log('Parsed ping response:', data);
          return response.ok;
        } catch (parseError) {
          console.error('Error parsing ping response:', parseError);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error pinging session controller:', error);
      return false;
    }
  },
  /**
   * Get all registration data from the session
   */
  getRegistrationData: async (): Promise<SignupFormData | null> => {
    try {
      console.log('Fetching registration data...');
      const response = await fetch('http://localhost:8888/api/session/registration-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
      });

      console.log('Registration data response status:', response.status);
      console.log('Registration data response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('Error fetching registration data:', response.status, response.statusText);

        // Get the raw response text to see what's being returned
        const rawText = await response.text();
        console.error('Raw error response:', rawText);

        // Check if it's an HTML error page
        if (rawText.includes('<!DOCTYPE html>') || rawText.includes('<html>')) {
          console.error('Received HTML error page instead of JSON');
        }

        return null;
      }

      // Get the raw response text first
      const rawText = await response.text();
      console.log('Raw registration data response:', rawText);

      // Only try to parse if we have valid JSON
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          console.log('Parsed registration data:', data);

          if (data.data) {
            // Convert backend DTO to frontend format
            return {
              loginInfo: data.data.loginInfo || { email: '' },
              emailVerification: data.data.emailVerification || { verificationCode: '', verified: false },
              passwordSetup: data.data.passwordSetup || { password: '', confirmPassword: '' },
              adminInfo: data.data.adminInfo || {
                fullName: '',
                employeeId: '',
                contactNumber: '',
                department: '',
                emergencyContactNumber: '',
                address: ''
              },
              currentStep: data.data.currentStep || 0
            };
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('Invalid JSON response:', rawText);
          return null;
        }
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
      const response = await fetch('http://localhost:8888/api/session/registration-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      return response.ok;
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
      const response = await fetch('http://localhost:8888/api/session/registration-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return response.ok;
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
      const response = await fetch('http://localhost:8888/api/session/login-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInfo),
        credentials: 'include',
      });

      return response.ok;
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
      const response = await fetch('http://localhost:8888/api/session/email-verified', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verified: emailVerification.verified || false
        }),
        credentials: 'include',
      });

      return response.ok;
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
      const response = await fetch('http://localhost:8888/api/session/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordSetup),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving password setup:', error);
      return false;
    }
  },

  /**
   * Save admin information to the session
   */
  saveAdminInfo: async (adminInfo: AdminInfoData): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8888/api/session/admin-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminInfo),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving admin info:', error);
      return false;
    }
  },



  /**
   * Save current step to the session
   */
  saveCurrentStep: async (currentStep: number): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8888/api/session/current-step', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentStep }),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving current step:', error);
      return false;
    }
  }
};
