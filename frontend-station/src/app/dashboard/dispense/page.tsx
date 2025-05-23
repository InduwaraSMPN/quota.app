"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { QRScanner } from "@/components/qr-scanner";
import { FuelDispensingForm } from "@/components/fuel-dispensing-form";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DispenseFuelPage() {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const [step, setStep] = useState<"scan" | "dispense" | "success">("scan");
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle successful QR scan
  const handleScanSuccess = async (scannedVehicleId: number) => {
    setVehicleId(scannedVehicleId);
    setIsLoading(true);
    setError(null);

    try {
      // Validate the vehicle quota
      const response = await apiService.validateVehicleQuota(scannedVehicleId);

      if (response.error) {
        setError(response.error);
        toast.error("Failed to validate vehicle quota");
      } else if (response.data) {
        setVehicleDetails(response.data);
        
        // Check if the vehicle has an active quota
        if (response.data.isValid) {
          setStep("dispense");
        } else {
          setError("This vehicle does not have an active quota or the quota is insufficient.");
          toast.error("Invalid quota");
        }
      }
    } catch (err) {
      console.error("Error validating vehicle quota:", err);
      setError("Failed to validate vehicle quota. Please try again.");
      toast.error("Failed to validate vehicle quota");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful fuel dispensing
  const handleDispensingSuccess = () => {
    setStep("success");
  };

  // Handle dispensing cancellation
  const handleDispensingCancel = () => {
    setStep("scan");
    setVehicleId(null);
    setVehicleDetails(null);
  };

  // Reset to scan step
  const handleReset = () => {
    setStep("scan");
    setVehicleId(null);
    setVehicleDetails(null);
  };

  // Combine loading states
  const isPageLoading = authLoading || isLoading;

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <MagicBackButton />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 container max-w-screen-lg mx-auto py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-8">Dispense Fuel</h1>

          {isPageLoading ? (
            <Loading />
          ) : authError ? (
            <ErrorMessage message={authError} />
          ) : !isAuthenticated ? (
            <ErrorMessage message="You must be logged in to access this page" />
          ) : (
            <div className="w-full max-w-md mx-auto">
              {step === "scan" && (
                <QRScanner onScanSuccess={handleScanSuccess} />
              )}

              {step === "dispense" && vehicleDetails && (
                <FuelDispensingForm
                  vehicleId={vehicleId!}
                  vehicleDetails={vehicleDetails}
                  onSuccess={handleDispensingSuccess}
                  onCancel={handleDispensingCancel}
                />
              )}

              {step === "success" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Transaction Successful</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    The fuel has been dispensed successfully and the quota has been updated.
                  </p>
                  <Button onClick={handleReset} className="w-full">
                    Dispense More Fuel
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-destructive/10 p-4 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
