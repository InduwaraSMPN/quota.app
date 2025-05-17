"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { LoginInformationSignup } from "@/components/auth/LoginInformationSignup";
import { EmailVerificationSignup } from "@/components/auth/EmailVerificationSignup";
import { PasswordSetupSignup } from "@/components/auth/PasswordSetupSignup";
import { PersonalInformationSignup } from "@/components/auth/PersonalInformationSignup";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  type SignupFormData,
  type LoginInfoData,
  type EmailVerificationData,
  type PasswordSetupData,
  type AdminInfoData
} from "@/app/actions/session";
import { sessionService } from "@/services/sessionService";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Define the steps for the signup process
enum SignupStep {
  LOGIN_INFO = 0,
  EMAIL_VERIFICATION = 1,
  PASSWORD_SETUP = 2,
  PERSONAL_INFO = 3,
}

// Step information for the indicator
const STEPS = [
  { id: SignupStep.LOGIN_INFO, label: "Login Information" },
  { id: SignupStep.EMAIL_VERIFICATION, label: "Email Verification" },
  { id: SignupStep.PASSWORD_SETUP, label: "Password Setup" },
  { id: SignupStep.PERSONAL_INFO, label: "Personal Information" },
];

// Step indicator component
interface StepIndicatorProps {
  currentStep: SignupStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4 mb-8 rounded-lg">
      <div className="flex justify-center items-center">
        <div className="flex items-center">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                {/* Step indicator circle */}
                <div className="relative flex items-center justify-center z-10">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                      isActive || isCompleted
                        ? "border-primary bg-primary"
                        : "border-muted-foreground bg-background"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-background" />
                    ) : isActive ? (
                      <div className="h-2 w-2 rounded-full bg-background"></div>
                    ) : null}
                  </div>
                </div>

                {/* Step label */}
                <div className="flex flex-col items-center mt-2 text-center w-full">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive || isCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    Step {step.id + 1}
                  </span>
                  <div className="flex flex-col items-center">
                    {step.label.split(" ").map((word, i) => (
                      <span
                        key={i}
                        className={cn(
                          "text-sm font-medium px-1 leading-tight",
                          isActive || isCompleted
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connector line between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-3 left-1/2 h-[2px] w-[calc(100%-1rem)]",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  // State to track the current step
  const [currentStep, setCurrentStep] = useState<SignupStep>(
    SignupStep.LOGIN_INFO
  );

  // State to store form data from each step
  const [formData, setFormData] = useState<{
    loginInfo: Partial<LoginInfoData>;
    emailVerification: Partial<EmailVerificationData>;
    passwordSetup: Partial<PasswordSetupData>;
    adminInfo: Partial<AdminInfoData>;
  }>({
    loginInfo: {},
    emailVerification: {},
    passwordSetup: {},
    adminInfo: {},
  });

  // State to track loading status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved form data from session on initial render
  useEffect(() => {
    const loadSessionData = async () => {
      console.log('Loading session data...');

      // First ping the session controller to check if it's accessible
      const pingResult = await sessionService.pingSession();
      console.log('Session ping result:', pingResult);

      if (!pingResult) {
        console.error('Session controller is not accessible');
        toast.error('Unable to connect to session service');
        return;
      }

      // If ping is successful, try to get registration data
      try {
        const sessionData = await sessionService.getRegistrationData();
        console.log('Session data loaded:', sessionData);

        if (sessionData) {
          setFormData({
            loginInfo: sessionData.loginInfo || {},
            emailVerification: sessionData.emailVerification || {},
            passwordSetup: sessionData.passwordSetup || {},
            adminInfo: sessionData.adminInfo || {},
          });
          setCurrentStep(sessionData.currentStep as SignupStep);
          console.log('Form data set from session');
        } else {
          console.log('No session data found');
        }
      } catch (error) {
        console.error('Error loading session data:', error);
        toast.error('Error loading saved data');
      }
    };

    loadSessionData();
  }, []);

  // Handle completion of login information step
  const handleLoginInfoNext = async (data: LoginInfoData) => {
    const updatedFormData = {
      ...formData,
      loginInfo: data,
    };

    setFormData(updatedFormData);
    setCurrentStep(SignupStep.EMAIL_VERIFICATION);

    // Save to session
    await sessionService.saveRegistrationData({
      ...updatedFormData,
      currentStep: SignupStep.EMAIL_VERIFICATION,
    } as SignupFormData);

    // Send verification code to the email
    try {
      console.log("Sending verification code to:", data.email);
      const response = await apiService.sendVerificationCode({ email: data.email });
      console.log("Send verification code response:", response);

      // Check for successful response in various formats
      if (
        (response.data && response.data.sent) || // JSON format
        (response.status === 200 && !response.error) || // Generic success
        (response.data && response.data.success === true) // Alternative format
      ) {
        console.log("Verification code sent successfully");
        toast.success("Verification code sent to your email");
      } else {
        const errorMessage = response.error || "Failed to send verification code";
        console.error("Send verification code error:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code. Please try again.");
    }
  };

  // Handle completion of personal information step
  const handlePersonalInfoSubmit = async (data: AdminInfoData) => {
    setIsSubmitting(true);
    console.log('Personal Info Submit - Data:', data);

    try {
      const updatedFormData = {
        ...formData,
        adminInfo: data,
      };
      console.log('Updated Form Data:', updatedFormData);

      // Save to session first
      await sessionService.saveRegistrationData({
        ...updatedFormData,
        currentStep: SignupStep.PERSONAL_INFO,
      } as SignupFormData);
      console.log('Saved to session');

      // Make sure email is verified before proceeding
      if (!updatedFormData.emailVerification?.verified) {
        console.log('Email not verified, redirecting to verification step');
        toast.error("Email verification is required before proceeding");
        setIsSubmitting(false);
        setCurrentStep(SignupStep.EMAIL_VERIFICATION);
        return;
      }

      // Save admin info to session
      const adminInfoSaved = await sessionService.saveAdminInfo(data);
      console.log('Admin info saved to session:', adminInfoSaved);

      // Submit admin info to the backend to complete registration
      console.log('Submitting to backend:', data);
      // Check the URL against the controller endpoint
      const apiUrl = 'http://localhost:8888/api/auth/register/admin/step3';
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      console.log('Backend response status:', response.status);

      const result = await response.json();
      console.log('Backend response data:', result);

      if (response.ok) {
        // Clear session data after successful registration
        await sessionService.clearRegistrationData();
        console.log('Registration successful, session cleared');
        toast.success("Registration successful!");

        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        console.error('Registration failed:', result);
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error("An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle completion of email verification step
  const handleEmailVerificationNext = async (data: EmailVerificationData) => {
    const updatedFormData = {
      ...formData,
      emailVerification: {
        ...data,
        verified: true,
      },
    };

    setFormData(updatedFormData);
    setCurrentStep(SignupStep.PASSWORD_SETUP);

    // Save to session
    await sessionService.saveRegistrationData({
      ...updatedFormData,
      currentStep: SignupStep.PASSWORD_SETUP,
    } as SignupFormData);

    // Also save email verification separately
    await sessionService.saveEmailVerification({
      verificationCode: data.verificationCode,
      verified: true
    });

    toast.success("Email verified successfully");
  };

  // Handle going back from email verification step
  const handleEmailVerificationBack = async () => {
    setCurrentStep(SignupStep.LOGIN_INFO);

    // Save current step to session
    await sessionService.saveRegistrationData({
      ...formData,
      currentStep: SignupStep.LOGIN_INFO,
    } as SignupFormData);
  };

  // Handle completion of password setup step
  const handlePasswordSetupNext = async (data: PasswordSetupData) => {
    const updatedFormData = {
      ...formData,
      passwordSetup: data,
    };

    setFormData(updatedFormData);
    setCurrentStep(SignupStep.PERSONAL_INFO);

    // Save to session
    await sessionService.saveRegistrationData({
      ...updatedFormData,
      currentStep: SignupStep.PERSONAL_INFO,
    } as SignupFormData);

    // Also save password separately
    await sessionService.savePasswordSetup(data);

    toast.success("Password created successfully");
  };

  // Handle going back from password setup step
  const handlePasswordSetupBack = async () => {
    setCurrentStep(SignupStep.EMAIL_VERIFICATION);

    // Save current step to session
    await sessionService.saveRegistrationData({
      ...formData,
      currentStep: SignupStep.EMAIL_VERIFICATION,
    } as SignupFormData);
  };

  // Handle going back from personal information step
  const handlePersonalInfoBack = async () => {
    setCurrentStep(SignupStep.PASSWORD_SETUP);

    // Save current step to session
    await sessionService.saveRegistrationData({
      ...formData,
      currentStep: SignupStep.PASSWORD_SETUP,
    } as SignupFormData);
  };

  return (
    <div className="flex flex-col min-h-svh w-full relative">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md flex flex-col">
          {/* Step indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Render the appropriate component based on the current step */}
          {currentStep === SignupStep.LOGIN_INFO && (
            <LoginInformationSignup
              onNext={handleLoginInfoNext}
              initialData={formData.loginInfo as LoginInfoData}
            />
          )}

          {currentStep === SignupStep.EMAIL_VERIFICATION && (
            <EmailVerificationSignup
              onNext={handleEmailVerificationNext}
              onBack={handleEmailVerificationBack}
              initialData={formData.emailVerification as EmailVerificationData}
              email={formData.loginInfo.email || ""}
            />
          )}

          {currentStep === SignupStep.PASSWORD_SETUP && (
            <PasswordSetupSignup
              onNext={handlePasswordSetupNext}
              onBack={handlePasswordSetupBack}
              initialData={formData.passwordSetup as PasswordSetupData}
            />
          )}

          {currentStep === SignupStep.PERSONAL_INFO && (
            <PersonalInformationSignup
              onNext={handlePersonalInfoSubmit}
              onBack={handlePersonalInfoBack}
              initialData={formData.adminInfo as AdminInfoData}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
