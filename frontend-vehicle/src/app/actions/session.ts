'use server';

import { cookies } from 'next/headers';

// Define types for our form data
export type LoginInfoData = {
  email: string;
};

export type EmailVerificationData = {
  verificationCode: string;
  verified?: boolean;
};

export type PasswordSetupData = {
  password: string;
  confirmPassword: string;
};

export type OwnerInfoData = {
  fullName: string;
  nicNumber: string;
  address: string;
  contactNumber: string;
};

export type VehicleInfoData = {
  registrationNumber: string;
  engineNumber: string;
  chassisNumber: string;
  make: string;
  model: string;
  yearOfManufacture: string;
  vehicleClass: string;
  typeOfBody: string;
  fuelType: string;
  engineCapacity: string;
  color: string;
  grossVehicleWeight: string;
  dateOfFirstRegistration: string;
  countryOfOrigin: string;
};

export type SignupFormData = {
  loginInfo: LoginInfoData;
  emailVerification?: EmailVerificationData;
  passwordSetup?: PasswordSetupData;
  ownerInfo: OwnerInfoData;
  vehicleInfo: VehicleInfoData;
  currentStep: number;
};

// Session cookie name
const SESSION_COOKIE_NAME = 'vehicle_signup_session';

// Save form data to session
export async function saveFormDataToSession(formData: SignupFormData): Promise<void> {
  const cookieStore = await cookies();

  // Encrypt sensitive data in a real application
  // For now, we'll just stringify the data
  const serializedData = JSON.stringify(formData);

  // Set the cookie with a 1-hour expiration
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: serializedData,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60, // 1 hour
    sameSite: 'strict',
  });
}

// Get form data from session
export async function getFormDataFromSession(): Promise<SignupFormData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as SignupFormData;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
}

// Clear session data
export async function clearSessionData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Submit the complete form data to the backend
export async function submitSignupForm(formData: SignupFormData): Promise<{
  success: boolean;
  message: string;
  dmtValidationFailed?: boolean;
  validationErrors?: string[];
}> {
  try {
    // Prepare the data for the backend
    const completeFormData = {
      email: formData.loginInfo.email,
      password: formData.passwordSetup?.password || '',
      fullName: formData.ownerInfo.fullName,
      nicNumber: formData.ownerInfo.nicNumber,
      address: formData.ownerInfo.address,
      contactNumber: formData.ownerInfo.contactNumber,
      vehicle: {
        registrationNumber: formData.vehicleInfo.registrationNumber,
        engineNumber: formData.vehicleInfo.engineNumber,
        chassisNumber: formData.vehicleInfo.chassisNumber,
        make: formData.vehicleInfo.make,
        model: formData.vehicleInfo.model,
        yearOfManufacture: formData.vehicleInfo.yearOfManufacture,
        vehicleClass: formData.vehicleInfo.vehicleClass,
        typeOfBody: formData.vehicleInfo.typeOfBody,
        fuelType: formData.vehicleInfo.fuelType,
        engineCapacity: formData.vehicleInfo.engineCapacity,
        color: formData.vehicleInfo.color,
        grossVehicleWeight: formData.vehicleInfo.grossVehicleWeight,
        dateOfFirstRegistration: formData.vehicleInfo.dateOfFirstRegistration,
        countryOfOrigin: formData.vehicleInfo.countryOfOrigin,
      }
    };

    // First, validate with DMT database
    try {
      const dmtValidationResponse = await fetch('http://localhost:8888/api/dmt/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: formData.vehicleInfo.registrationNumber,
          engineNumber: formData.vehicleInfo.engineNumber,
          chassisNumber: formData.vehicleInfo.chassisNumber,
          ownerNIC: formData.ownerInfo.nicNumber,
          ownerName: formData.ownerInfo.fullName
        }),
      });

      // Check if the response is ok before trying to parse it
      if (!dmtValidationResponse.ok) {
        console.error(`DMT validation failed with status: ${dmtValidationResponse.status}`);
        return {
          success: false,
          message: `DMT validation failed with status: ${dmtValidationResponse.status}. Please try again later.`,
          dmtValidationFailed: true,
          validationErrors: ['Unable to validate vehicle information at this time.']
        };
      }

      // Check if the response has content before parsing
      const contentType = dmtValidationResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type from DMT validation service:', contentType);
        return {
          success: false,
          message: 'Invalid response from DMT validation service. Please try again later.',
          dmtValidationFailed: true,
          validationErrors: ['Server returned an invalid response format.']
        };
      }

      // Parse the response
      const responseText = await dmtValidationResponse.text();
      console.log('DMT validation response:', responseText);

      if (!responseText || responseText.trim() === '') {
        console.error('Empty response from DMT validation service');
        return {
          success: false,
          message: 'Empty response from DMT validation service. Please try again later.',
          dmtValidationFailed: true,
          validationErrors: ['Server returned an empty response.']
        };
      }

      let dmtValidationResult;
      try {
        dmtValidationResult = JSON.parse(responseText);
        console.log('Parsed DMT validation result:', dmtValidationResult);
      } catch (error) {
        console.error('Error parsing DMT validation response:', error);
        return {
          success: false,
          message: 'Error parsing DMT validation response. Please try again later.',
          dmtValidationFailed: true,
          validationErrors: ['Server returned an invalid response.']
        };
      }

      // If DMT validation fails, return with validation errors
      if (dmtValidationResult.data && dmtValidationResult.data.valid === false) {
        const errors = dmtValidationResult.data.errors ||
                      ['The provided vehicle details do not match DMT records.'];

        console.error('DMT validation failed with errors:', errors);

        return {
          success: false,
          message: 'Vehicle information validation failed. Please check your details and try again.',
          dmtValidationFailed: true,
          validationErrors: errors
        };
      }
    } catch (error) {
      console.error('Error during DMT validation:', error);
      return {
        success: false,
        message: 'An error occurred during vehicle validation. Please try again later.',
        dmtValidationFailed: true,
        validationErrors: ['Technical error during validation process.']
      };
    }

    // If DMT validation passes, proceed with registration
    try {
      console.log("Sending registration data to backend:", completeFormData);

      const response = await fetch('http://localhost:8888/api/auth/register/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeFormData),
      });

      console.log("Registration response status:", response.status);

      // Try to parse the response as JSON
      let errorData;
      try {
        const responseText = await response.text();
        console.log("Registration response text:", responseText);

        if (responseText && responseText.trim() !== '') {
          errorData = JSON.parse(responseText);
          console.log("Parsed registration response:", errorData);
        }
      } catch (parseError) {
        console.error("Error parsing registration response:", parseError);
      }

      if (!response.ok) {
        return {
          success: false,
          message: errorData?.message || `Registration failed with status ${response.status}. Please try again.`
        };
      }

      // Clear session data after successful submission
      await clearSessionData();

      return {
        success: true,
        message: 'Registration successful! Your vehicle details have been verified.'
      };
    } catch (error) {
      console.error("Error during registration API call:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed due to a network error. Please try again.'
      };
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}
