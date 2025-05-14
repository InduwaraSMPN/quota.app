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

export type AdminInfoData = {
  fullName: string;
  employeeId: string;
  contactNumber: string;
  department: string;
  emergencyContactNumber: string;
  address: string;
};

export type SignupFormData = {
  loginInfo: LoginInfoData;
  emailVerification?: EmailVerificationData;
  passwordSetup?: PasswordSetupData;
  adminInfo: AdminInfoData;
  currentStep: number;
};
