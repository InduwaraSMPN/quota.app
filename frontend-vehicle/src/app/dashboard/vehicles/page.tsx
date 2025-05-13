"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

// Mock data for vehicles
const mockVehiclesData = [
  {
    id: "1",
    registrationNumber: "ABC1234",
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
    registrationNumber: "XYZ5678",
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehiclesData);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // Function to handle vehicle deletion
  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    setVehicleToDelete(null);
  };

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <MagicBackButton backLink="/dashboard" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Your Vehicles</h1>
                <p className="text-muted-foreground">Manage your vehicles and their fuel quotas</p>
              </div>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/vehicles/add">
                <Plus className="h-4 w-4" />
                Add New Vehicle
              </Link>
            </Button>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vehicle.make} {vehicle.model}</CardTitle>
                      <CardDescription>{vehicle.registrationNumber}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/dashboard/vehicles/edit/${vehicle.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setVehicleToDelete(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your vehicle
                              and remove all associated data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setVehicleToDelete(null)}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => vehicleToDelete && handleDeleteVehicle(vehicleToDelete)}
                            >
                              Delete Vehicle
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="text-sm">{vehicle.yearOfManufacture}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fuel Type</p>
                      <p className="text-sm">{vehicle.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engine</p>
                      <p className="text-sm">{vehicle.engineCapacity} cc</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Color</p>
                      <p className="text-sm">{vehicle.color}</p>
                    </div>
                  </div>

                  {/* Quota Information */}
                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Fuel Quota</p>
                      <p className="text-sm font-medium">
                        {vehicle.quota.remainingQuota} / {vehicle.quota.totalQuota} {vehicle.quota.quotaUnit}
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`${(vehicle.quota.remainingQuota / vehicle.quota.totalQuota) * 100 > 50 ? "bg-green-500" : (vehicle.quota.remainingQuota / vehicle.quota.totalQuota) * 100 > 25 ? "bg-yellow-500" : "bg-red-500"} h-full transition-all duration-500 ease-in-out`}
                        style={{ width: `${(vehicle.quota.remainingQuota / vehicle.quota.totalQuota) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next refill: {vehicle.quota.nextRefill}
                    </p>
                  </div>

                  {/* QR Code Preview */}
                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-2 rounded border border-border">
                        <QRCodeSVG
                          value={`VEHICLE:${vehicle.registrationNumber}`}
                          size={40}
                          level="M"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium">QR Code</p>
                        <p className="text-xs text-muted-foreground">For fuel stations</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="h-8">
                      <Link href={`/dashboard/vehicles/qr-code/${vehicle.id}`}>
                        <span className="sr-only">View QR Code</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {vehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You haven't added any vehicles yet. Add your first vehicle to start managing your fuel quota.
              </p>
              <Button asChild>
                <Link href="/dashboard/vehicles/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}