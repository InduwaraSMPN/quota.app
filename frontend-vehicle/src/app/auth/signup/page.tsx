"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { LoginInformationSignup } from "@/components/auth/LoginInformationSignup";
import { OwnerInformationSignup } from "@/components/auth/OwnerInformationSignup";
import { VehicleInformationSignup } from "@/components/auth/VehicleInformationSignup";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

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

    // In a Todo, would handle the API response here
    // and redirect the user to a success page or login page
  };

  // Handle going back from vehicle information step
  const handleVehicleInfoBack = () => {
    setCurrentStep(SignupStep.OWNER_INFO);
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
    </div>
  );
}
