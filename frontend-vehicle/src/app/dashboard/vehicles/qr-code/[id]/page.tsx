"use client";

import { useEffect, useState, use } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { QRCodeGenerator } from "@/components/qr-code";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";

/**
 * Vehicle QR Code Page
 *
 * Displays a QR code for a specific vehicle that can be scanned
 * at fuel stations for quick identification and quota verification.
 *
 * @param params - Contains the vehicle ID from the URL
 */
export default function VehicleQRCodePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Unwrap the params Promise using React.use()
  const unwrappedParams = 'then' in params ? use(params) : params;
  const vehicleId = unwrappedParams.id;

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle data for QR code generation
  useEffect(() => {
    const fetchVehicle = async () => {
      // Check if we have a valid ID and authentication
      if (!isAuthenticated || !vehicleId) {
        setIsLoading(false);
        if (!vehicleId) {
          setError("Invalid vehicle ID");
          toast.error("Invalid vehicle ID");
        }
        return;
      }

      try {
        setIsLoading(true);

        // TODO: Replace with specific vehicle API endpoint when available
        // For now, fetch all vehicles and find the matching one
        const response = await apiService.getVehicleDetails();

        if (response.error) {
          setError(response.error);
          toast.error("Failed to load vehicle data");
        } else if (response.data) {
          const vehicles = Array.isArray(response.data) ? response.data : response.data.vehicles || [];
          const foundVehicle = vehicles.find((v: Vehicle) => v.id === vehicleId);

          if (foundVehicle) {
            setVehicle(foundVehicle);
            setError(null);
          } else {
            setVehicle(null);
            setError("Vehicle not found");
          }
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to load vehicle data. Please try again.");
        toast.error("Failed to load vehicle data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchVehicle();
    }
  }, [vehicleId, isAuthenticated, authLoading]);

  // Combine loading states
  const isPageLoading = authLoading || isLoading;

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        {!isPageLoading && vehicle && vehicleId && (
          <QRCodeGenerator
            vehicleId={vehicleId}
            vehicleData={vehicle}
            backLink="/dashboard/vehicles"
          />
        )}

        {/* Loading or Not Found State */}
        {(isPageLoading || !vehicle) && (
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {isPageLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p>Loading vehicle information...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-destructive/10 p-3 rounded-full inline-flex mb-4">
                    <QrCode className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Vehicle Not Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find the vehicle you're looking for. It may have been removed or the ID is incorrect.
                  </p>
                  <Button asChild>
                    <a href="/dashboard/vehicles">
                      Return to Vehicles
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
