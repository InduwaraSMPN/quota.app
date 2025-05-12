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
// Import the API service (commented out for now as we're using mock data)
// import { apiService } from "@/services/api";
// import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";

// Mock data for the dashboard
const mockUserData = {
  fullName: "John Doe",
  nicNumber: "123456789V",
  address: "123 Main Street, Colombo",
  contactNumber: "+94712345678",
  email: "john.doe@example.com"
};

// Mock data for multiple vehicles
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

// We'll use the mockVehiclesData directly in the components

const mockConsumptionHistory = [
  { date: "2023-06-10", amount: 3.5, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-25", amount: 4.0, station: "Fuel Station B", location: "Kandy" },
  { date: "2023-05-15", amount: 5.0, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-01", amount: 3.0, station: "Fuel Station C", location: "Galle" },
];



export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the auth hook to check authentication
  useEffect(() => {
    // In a Todo, we would use the useAuth hook
    // For now, we'll simulate authentication
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Mock authentication check
        // Check if token exists, but we'll always set authenticated to true for demo
        const hasToken = !!localStorage.getItem("token");
        console.log("Token exists:", hasToken);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsAuthenticated(true); // For demo purposes, always set to true
        setIsClient(true);
        setError(null);
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate. Please try again.");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      // In a Todo, redirect to login page
      // Uncomment the following line to enable redirection
      // window.location.href = "/auth/login";
    }
  }, [isClient, isAuthenticated]);

  // In a Todo, we would fetch data from the API
  // For example:
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       // Fetch user profile
  //       const profileResponse = await apiService.getUserProfile();
  //       if (profileResponse.data) {
  //         setUserData(profileResponse.data);
  //       }
  //
  //       // Fetch vehicle details
  //       const vehicleResponse = await apiService.getVehicleDetails();
  //       if (vehicleResponse.data) {
  //         setVehicleData(vehicleResponse.data);
  //       }
  //
  //       // Fetch quota information
  //       const quotaResponse = await apiService.getFuelQuota();
  //       if (quotaResponse.data) {
  //         setQuotaData(quotaResponse.data);
  //       }
  //
  //       // Fetch consumption history
  //       const historyResponse = await apiService.getConsumptionHistory();
  //       if (historyResponse.data) {
  //         setConsumptionHistory(historyResponse.data);
  //       }
  //
  //       // Fetch notifications
  //       const notificationsResponse = await apiService.getNotifications();
  //       if (notificationsResponse.data) {
  //         setNotifications(notificationsResponse.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     }
  //   };
  //
  //   if (isAuthenticated) {
  //     fetchDashboardData();
  //   }
  // }, [isAuthenticated]);

  // We'll calculate quota percentages directly in the components

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading dashboard..." />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Main content - only show when not loading and no errors */}
      {!isLoading && !error && (
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
            {/* Left Column - Profile and Vehicle Info */}
            <div className="md:col-span-1 space-y-6">
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
                      <p>{mockUserData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NIC Number</p>
                      <p>{mockUserData.nicNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                      <p>{mockUserData.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{mockUserData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-sm">{mockUserData.address}</p>
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
                    {mockVehiclesData.slice(0, 2).map((vehicle, index) => (
                      <div key={vehicle.id} className={`pb-3 ${index < mockVehiclesData.slice(0, 2).length - 1 ? 'border-b border-border' : ''}`}>
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

                    {mockVehiclesData.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{mockVehiclesData.length - 2} more vehicles
                      </p>
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
            </div>

            {/* Middle Column - Empty */}
            <div className="md:col-span-1 space-y-6">
              {/* This column is intentionally left empty after removing the Fuel Quota and QR Code cards */}
            </div>

            {/* Right Column - Consumption History and Notifications */}
            <div className="md:col-span-1 space-y-6">
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
      </div>
      )}
    </div>
  );
}