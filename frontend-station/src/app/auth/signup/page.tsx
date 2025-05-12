"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { LoginInformationSignup } from "@/components/auth/LoginInformationSignup";
import { EmailVerificationSignup } from "@/components/auth/EmailVerificationSignup";
import { OwnerInformationSignup } from "@/components/auth/OwnerInformationSignup";
import { BusinessInformationSignup } from "@/components/auth/BusinessInformationSignup";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";
import {
  saveFormDataToSession,
  getFormDataFromSession,
  submitSignupForm,
  type SignupFormData,
  type LoginInfoData,
  type EmailVerificationData,
  type OwnerInfoData,
  type BusinessInfoData
} from "@/app/actions/session";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Define the steps for the signup process
enum SignupStep {
  LOGIN_INFO = 0,
  EMAIL_VERIFICATION = 1,
  OWNER_INFO = 2,
  BUSINESS_INFO = 3,
}

// Step information for the indicator
const STEPS = [
  { id: SignupStep.LOGIN_INFO, label: "Login Information" },
  { id: SignupStep.EMAIL_VERIFICATION, label: "Email Verification" },
  { id: SignupStep.OWNER_INFO, label: "Owner Information" },
  { id: SignupStep.BUSINESS_INFO, label: "Business Information" },
];

// Step indicator component
interface StepIndicatorProps {
  currentStep: SignupStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full bg-background p-4 mb-8 rounded-lg">
      <div className="flex justify-center items-center">
        <div className="flex items-center w-full max-w-md">
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
    ownerInfo: Partial<OwnerInfoData>;
    businessInfo: Partial<BusinessInfoData>;
  }>({
    loginInfo: {},
    emailVerification: {},
    ownerInfo: {},
    businessInfo: {},
  });

  // State to track loading status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved form data from session on initial render
  useEffect(() => {
    const loadSessionData = async () => {
      const sessionData = await getFormDataFromSession();
      if (sessionData) {
        setFormData({
          loginInfo: sessionData.loginInfo || {},
          emailVerification: sessionData.emailVerification || {},
          ownerInfo: sessionData.ownerInfo || {},
          businessInfo: sessionData.businessInfo || {},
        });
        setCurrentStep(sessionData.currentStep as SignupStep);
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
    await saveFormDataToSession({
      ...updatedFormData,
      currentStep: SignupStep.EMAIL_VERIFICATION,
    } as SignupFormData);

    // Send verification code to the email
    try {
      // In a real implementation, this would call the API to send the verification code
      // For now, we'll simulate a successful send after a short delay
      toast.success("Verification code sent to your email");

      // Uncomment this for real implementation
      /*
      const response = await apiService.sendVerificationCode({ email: data.email });
      if (response.data && response.data.sent) {
        toast.success("Verification code sent to your email");
      } else {
        toast.error(response.error || "Failed to send verification code");
      }
      */
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Failed to send verification code. Please try again.");
    }
  };

  // Handle completion of owner information step
  const handleOwnerInfoNext = async (data: OwnerInfoData) => {
    const updatedFormData = {
      ...formData,
      ownerInfo: data,
    };

    setFormData(updatedFormData);
    setCurrentStep(SignupStep.BUSINESS_INFO);

    // Save to session
    await saveFormDataToSession({
      ...updatedFormData,
      currentStep: SignupStep.BUSINESS_INFO,
    } as SignupFormData);

    toast.success("Owner information saved");
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
    setCurrentStep(SignupStep.OWNER_INFO);

    // Save to session
    await saveFormDataToSession({
      ...updatedFormData,
      currentStep: SignupStep.OWNER_INFO,
    } as SignupFormData);

    toast.success("Email verified successfully");
  };

  // Handle going back from email verification step
  const handleEmailVerificationBack = async () => {
    setCurrentStep(SignupStep.LOGIN_INFO);

    // Save current step to session
    await saveFormDataToSession({
      ...formData,
      currentStep: SignupStep.LOGIN_INFO,
    } as SignupFormData);
  };

  // Handle going back from owner information step
  const handleOwnerInfoBack = async () => {
    setCurrentStep(SignupStep.EMAIL_VERIFICATION);

    // Save current step to session
    await saveFormDataToSession({
      ...formData,
      currentStep: SignupStep.EMAIL_VERIFICATION,
    } as SignupFormData);
  };

  // Handle completion of business information step
  const handleBusinessInfoSubmit = async (data: BusinessInfoData) => {
    setIsSubmitting(true);

    try {
      const updatedFormData = {
        ...formData,
        businessInfo: data,
      };

      // Save to session first
      await saveFormDataToSession({
        ...updatedFormData,
        currentStep: SignupStep.BUSINESS_INFO,
      } as SignupFormData);

      // Make sure email is verified before submitting
      if (!updatedFormData.emailVerification?.verified) {
        toast.error("Email verification is required before registration");
        setIsSubmitting(false);
        setCurrentStep(SignupStep.EMAIL_VERIFICATION);
        return;
      }

      // Submit the complete form data to the backend
      const result = await submitSignupForm({
        ...updatedFormData,
        currentStep: SignupStep.BUSINESS_INFO,
      } as SignupFormData);

      if (result.success) {
        toast.success("Registration successful!");

        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle going back from business information step
  const handleBusinessInfoBack = async () => {
    setCurrentStep(SignupStep.OWNER_INFO);

    // Save current step to session
    await saveFormDataToSession({
      ...formData,
      currentStep: SignupStep.OWNER_INFO,
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

          {currentStep === SignupStep.OWNER_INFO && (
            <OwnerInformationSignup
              onNext={handleOwnerInfoNext}
              onBack={handleOwnerInfoBack}
              initialData={formData.ownerInfo as OwnerInfoData}
            />
          )}

          {currentStep === SignupStep.BUSINESS_INFO && (
            <BusinessInformationSignup
              onSubmit={handleBusinessInfoSubmit}
              onBack={handleBusinessInfoBack}
              initialData={formData.businessInfo as BusinessInfoData}
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
