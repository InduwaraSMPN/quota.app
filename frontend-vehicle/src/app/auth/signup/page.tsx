"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { LoginInformationSignup } from "@/components/auth/LoginInformationSignup";
import { OwnerInformationSignup } from "@/components/auth/OwnerInformationSignup";
import { VehicleInformationSignup } from "@/components/auth/VehicleInformationSignup";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

// Define the steps for the signup process
enum SignupStep {
  LOGIN_INFO = 0,
  OWNER_INFO = 1,
  VEHICLE_INFO = 2,
}

// Step information for the indicator
const STEPS = [
  { id: SignupStep.LOGIN_INFO, label: "Login Information" },
  { id: SignupStep.OWNER_INFO, label: "Owner Information" },
  { id: SignupStep.VEHICLE_INFO, label: "Vehicle Information" },
];

// Step indicator component
interface StepIndicatorProps {
  currentStep: SignupStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full bg-card p-3 sm:p-4 mb-6">
      <div className="flex justify-between items-center px-2 sm:px-6">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step indicator circle */}
              <div className="relative flex items-center justify-center z-10">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                ) : (
                  <div
                    className={cn(
                      "h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2",
                      isActive
                        ? "border-primary bg-primary/20"
                        : "border-muted-foreground bg-transparent"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step label */}
              <div className="flex flex-col items-center mt-2 text-center">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Step {step.id + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium mt-1 hidden sm:block",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium mt-1 sm:hidden",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label.split(" ")[0]}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute top-[10px] sm:top-3 left-[calc(50%+8px)] sm:left-[calc(50%+10px)] h-[2px]",
                    "w-[calc(100%-8px)] sm:w-[calc(100%)]",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  // State to track the current step
  const [currentStep, setCurrentStep] = useState<SignupStep>(
    SignupStep.LOGIN_INFO
  );

  // State to store form data from each step
  const [formData, setFormData] = useState({
    loginInfo: {},
    ownerInfo: {},
    vehicleInfo: {},
  });

  // Handle completion of login information step
  const handleLoginInfoNext = (data: any) => {
    setFormData((prev) => ({ ...prev, loginInfo: data }));
    setCurrentStep(SignupStep.OWNER_INFO);
  };

  // Handle completion of owner information step
  const handleOwnerInfoNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ownerInfo: data }));
    setCurrentStep(SignupStep.VEHICLE_INFO);
  };

  // Handle going back from owner information step
  const handleOwnerInfoBack = () => {
    setCurrentStep(SignupStep.LOGIN_INFO);
  };

  // Handle completion of vehicle information step
  const handleVehicleInfoSubmit = async (data: any) => {
    setFormData((prev) => ({ ...prev, vehicleInfo: data }));

    // Combine all form data
    const completeFormData = {
      ...formData.loginInfo,
      ...formData.ownerInfo,
      ...data,
    };

    // Here you would typically send the data to your backend API
    console.log("Complete form data:", completeFormData);

    // For now, just log the data
    alert("Signup successful! Check console for form data.");

    // In a real application, you would handle the API response here
    // and redirect the user to a success page or login page
  };

  // Handle going back from vehicle information step
  const handleVehicleInfoBack = () => {
    setCurrentStep(SignupStep.OWNER_INFO);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Render the appropriate component based on the current step */}
        {currentStep === SignupStep.LOGIN_INFO && (
          <LoginInformationSignup onNext={handleLoginInfoNext} />
        )}

        {currentStep === SignupStep.OWNER_INFO && (
          <OwnerInformationSignup
            onNext={handleOwnerInfoNext}
            onBack={handleOwnerInfoBack}
          />
        )}

        {currentStep === SignupStep.VEHICLE_INFO && (
          <VehicleInformationSignup
            onSubmit={handleVehicleInfoSubmit}
            onBack={handleVehicleInfoBack}
          />
        )}
      </div>
    </div>
  );
}
