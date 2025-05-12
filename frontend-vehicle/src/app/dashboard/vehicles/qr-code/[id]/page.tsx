"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

// Mock data for vehicles
const mockVehiclesData = [
  {
    id: "1",
    registrationNumber: "ABC-1234",
    engineNumber: "ENG123456",
    chassisNumber: "CHS123456",
    make: "Toyota",
    model: "Corolla",
    yearOfManufacture: "2020",
    vehicleClass: "Car",
    typeOfBody: "Sedan",
    fuelType: "Petrol",
    engineCapacity: "1500",
    color: "White",
    dateOfFirstRegistration: "2020-01-15",
    quota: {
      totalQuota: 20,
      remainingQuota: 12.5,
      quotaUnit: "liters",
      lastUpdated: "2023-06-15",
      nextRefill: "2023-07-01"
    }
  },
  {
    id: "2",
    registrationNumber: "XYZ-5678",
    engineNumber: "ENG789012",
    chassisNumber: "CHS789012",
    make: "Honda",
    model: "Civic",
    yearOfManufacture: "2021",
    vehicleClass: "Car",
    typeOfBody: "Sedan",
    fuelType: "Petrol",
    engineCapacity: "1800",
    color: "Blue",
    dateOfFirstRegistration: "2021-03-20",
    quota: {
      totalQuota: 25,
      remainingQuota: 18.2,
      quotaUnit: "liters",
      lastUpdated: "2023-06-18",
      nextRefill: "2023-07-01"
    }
  }
];

export default function VehicleQRCodePage({ params }: { params: { id: string } }) {
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch vehicle data
    const fetchVehicle = () => {
      setIsLoading(true);
      setTimeout(() => {
        const foundVehicle = mockVehiclesData.find(v => v.id === params.id);
        setVehicle(foundVehicle || null);
        setIsLoading(false);
      }, 500);
    };

    fetchVehicle();
  }, [params.id]);

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <MagicBackButton backLink="/dashboard/vehicles" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vehicle QR Code</h1>
              <p className="text-muted-foreground">Present this QR code at fuel stations</p>
            </div>
          </div>

          {/* QR Code Card */}
          {!isLoading && vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>{vehicle.make} {vehicle.model}</CardTitle>
                <CardDescription>Registration Number: {vehicle.registrationNumber}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-6 rounded-lg border border-border mb-4">
                  <QRCodeSVG
                    value={`VEHICLE:${vehicle.registrationNumber}`}
                    size={250}
                    level="M"
                  />
                </div>
                <div className="text-center space-y-1 mb-6">
                  <p className="text-sm font-medium">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.registrationNumber}</p>
                  <p className="text-xs text-muted-foreground">Scan this code at fuel stations to identify your vehicle</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Loading or Not Found State */}
          {(isLoading || !vehicle) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {isLoading ? (
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
    </div>
  );
}
