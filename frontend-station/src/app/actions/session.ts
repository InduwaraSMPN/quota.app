'use server';

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
  contactNumber: string;
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
  emailVerification?: EmailVerificationData;
  passwordSetup?: PasswordSetupData;
  ownerInfo: OwnerInfoData;
  businessInfo: BusinessInfoData;
  currentStep: number;
};
