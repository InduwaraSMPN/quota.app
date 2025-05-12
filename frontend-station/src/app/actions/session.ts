'use server';

import { cookies } from 'next/headers';

// Define types for our form data
export type LoginInfoData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type OwnerInfoData = {
  fullName: string;
  nicNumber: string;
  mobileNumber: string;
};

export type BusinessInfoData = {
  businessRegistrationNumber: string;
  businessName: string;
  businessAddress: string;
  province: string;
  district: string;
  stationName: string;
  fuelTypes: string[];
  openingTime: string;
  closingTime: string;
  fuelRetailLicenseNumber: string;
};

export type SignupFormData = {
  loginInfo: LoginInfoData;
  ownerInfo: OwnerInfoData;
  businessInfo: BusinessInfoData;
  currentStep: number;
};

// Session cookie name
const SESSION_COOKIE_NAME = 'station_signup_session';

// Save form data to session
export async function saveFormDataToSession(formData: SignupFormData): Promise<void> {
  const cookieStore = cookies();
  
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
  const cookieStore = cookies();
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
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Submit the complete form data to the backend
export async function submitSignupForm(formData: SignupFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Prepare the data for the backend
    const completeFormData = {
      email: formData.loginInfo.email,
      password: formData.loginInfo.password,
      fullName: formData.ownerInfo.fullName,
      nicNumber: formData.ownerInfo.nicNumber,
      mobileNumber: formData.ownerInfo.mobileNumber,
      business: {
        businessRegistrationNumber: formData.businessInfo.businessRegistrationNumber,
        businessName: formData.businessInfo.businessName,
        businessAddress: formData.businessInfo.businessAddress,
        province: formData.businessInfo.province,
        district: formData.businessInfo.district,
        stationName: formData.businessInfo.stationName,
        fuelTypes: formData.businessInfo.fuelTypes,
        openingTime: formData.businessInfo.openingTime,
        closingTime: formData.businessInfo.closingTime,
        fuelRetailLicenseNumber: formData.businessInfo.fuelRetailLicenseNumber,
      }
    };

    // Make API call to backend
    const response = await fetch('http://localhost:8888/api/auth/register/station', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completeFormData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.message || 'Registration failed. Please try again.' 
      };
    }

    // Clear session data after successful submission
    await clearSessionData();
    
    return { 
      success: true, 
      message: 'Registration successful!' 
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    };
  }
}
