"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  User,
  Fuel,
  History,
  QrCode,
  ChevronRight,
  Droplet,
  MapPin,
  Edit
} from "lucide-react";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { Vehicle } from "@/types/vehicle";
import { toast } from "sonner";

// Mock data for consumption history until API is implemented
const mockConsumptionHistory = [
  { date: "2023-06-10", amount: 3.5, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-25", amount: 4.0, station: "Fuel Station B", location: "Kandy" },
  { date: "2023-05-15", amount: 5.0, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-01", amount: 3.0, station: "Fuel Station C", location: "Galle" },
];



export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, error: authError, user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicle data when authenticated
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await apiService.getVehicleDetails();

        if (response.error) {
          setError(response.error);
          toast.error("Failed to load vehicle data");
        } else if (response.data) {
          setVehicles(Array.isArray(response.data) ? response.data : response.data.vehicles || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching vehicle data:", err);
        setError("Failed to load vehicle data. Please try again.");
        toast.error("Failed to load vehicle data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchVehicleData();
    }
  }, [isAuthenticated, authLoading]);

  // Combine loading states
  const isPageLoading = authLoading || isLoading;
  // Combine error states
  const pageError = authError || error;

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Loading state */}
      {isPageLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading dashboard..." />
        </div>
      )}

      {/* Error state */}
      {!isPageLoading && pageError && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage
            message={pageError}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Main content - only show when not loading and no errors */}
      {!isPageLoading && !pageError && (
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <MagicBackButton backLink="/" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Manage your fuel quota and vehicle information</p>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href="/dashboard/profile/edit">
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p>{user?.fullName || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">NIC Number</p>
                    <p>{user?.nicNumber || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                    <p>{user?.contactNumber || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user?.email || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-sm">{user?.address || "Not available"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles Information Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Your Vehicles</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href="/dashboard/vehicles">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.length > 0 ? (
                    <>
                      {vehicles.slice(0, 2).map((vehicle, index) => (
                        <div key={vehicle.id} className={`pb-3 ${index < vehicles.slice(0, 2).length - 1 ? 'border-b border-border' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                            <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{vehicle.fuelType}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {vehicle.registrationNumber}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Fuel className="h-3 w-3" />
                            <span>{vehicle.quota.remainingQuota} / {vehicle.quota.totalQuota} {vehicle.quota.quotaUnit}</span>
                          </div>
                        </div>
                      ))}

                      {vehicles.length > 2 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{vehicles.length - 2} more vehicles
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">No vehicles found</p>
                      <p className="text-xs text-muted-foreground mt-1">Add a vehicle to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button variant="default" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/vehicles">
                    Manage Vehicles
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/vehicles/add">
                    Add New Vehicle
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Consumption History Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Consumption History</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/dashboard/history">
                      <span>View All</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockConsumptionHistory.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                        <Droplet className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{item.amount} liters</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.station}, {item.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
      )}
    </div>
  );
}