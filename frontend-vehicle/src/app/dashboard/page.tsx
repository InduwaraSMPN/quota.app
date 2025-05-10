"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
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
  Car,
  User,
  Fuel,
  History,
  Bell,
  QrCode,
  Settings,
  AlertTriangle,
  ChevronRight,
  Droplet,
  Clock,
  MapPin,
  Edit,
  HelpCircle
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

const mockVehicleData = {
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
  dateOfFirstRegistration: "2020-01-15"
};

const mockQuotaData = {
  totalQuota: 20,
  remainingQuota: 12.5,
  quotaUnit: "liters",
  lastUpdated: "2023-06-15",
  nextRefill: "2023-07-01"
};

const mockConsumptionHistory = [
  { date: "2023-06-10", amount: 3.5, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-25", amount: 4.0, station: "Fuel Station B", location: "Kandy" },
  { date: "2023-05-15", amount: 5.0, station: "Fuel Station A", location: "Colombo" },
  { date: "2023-05-01", amount: 3.0, station: "Fuel Station C", location: "Galle" },
];

const mockNotifications = [
  { id: 1, type: "info", message: "Your fuel quota will be refilled on July 1st", date: "2023-06-20" },
  { id: 2, type: "warning", message: "You have used 60% of your monthly quota", date: "2023-06-18" },
  { id: 3, type: "info", message: "New fuel station added in your area", date: "2023-06-15" },
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

  // Calculate quota percentage
  const quotaPercentage = (mockQuotaData.remainingQuota / mockQuotaData.totalQuota) * 100;
  const quotaColor = quotaPercentage > 50 ? "bg-green-500" : quotaPercentage > 25 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your fuel quota and vehicle information</p>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/qrcode">
                <QrCode className="h-4 w-4" />
                View Full QR Code
              </Link>
            </Button>
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

              {/* Vehicle Information Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Vehicle Information</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href="/dashboard/vehicle/edit">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                      <p>{mockVehicleData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Make & Model</p>
                      <p>{mockVehicleData.make} {mockVehicleData.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Year of Manufacture</p>
                      <p>{mockVehicleData.yearOfManufacture}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                      <p>{mockVehicleData.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Engine Capacity</p>
                      <p>{mockVehicleData.engineCapacity} cc</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/vehicle">
                      View Full Vehicle Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Middle Column - Quota and QR Code */}
            <div className="md:col-span-1 space-y-6">
              {/* Fuel Quota Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Fuel Quota</CardTitle>
                  </div>
                  <CardDescription>
                    Current allocation for {mockVehicleData.fuelType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Remaining Quota</span>
                      <span className="text-lg font-bold">{mockQuotaData.remainingQuota} {mockQuotaData.quotaUnit}</span>
                    </div>

                    {/* Quota Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className={`${quotaColor} h-full transition-all duration-500 ease-in-out`}
                        style={{ width: `${quotaPercentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0 {mockQuotaData.quotaUnit}</span>
                      <span>{mockQuotaData.totalQuota} {mockQuotaData.quotaUnit}</span>
                    </div>

                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Allocation</span>
                        <span>{mockQuotaData.totalQuota} {mockQuotaData.quotaUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span>{mockQuotaData.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Next Refill</span>
                        <span>{mockQuotaData.nextRefill}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Your QR Code</CardTitle>
                  </div>
                  <CardDescription>
                    Present this at fuel stations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border border-border">
                    <QRCodeSVG
                      value={`VEHICLE:${mockVehicleData.registrationNumber}`}
                      size={180}
                      level="M"
                    />
                  </div>
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Vehicle ID: {mockVehicleData.registrationNumber}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/qrcode">
                      Customize & Download
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
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
                        <div className="bg-primary/10 rounded-full p-2 mt-1">
                          <Droplet className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{item.amount} {mockQuotaData.quotaUnit}</p>
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

              {/* Notifications Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockNotifications.length > 0 ? (
                      mockNotifications.map((notification) => (
                        <div key={notification.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className={`rounded-full p-2 mt-1 ${
                            notification.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                          }`}>
                            {notification.type === "warning" ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm">{notification.message}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{notification.date}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No notifications</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/profile">
                  <Settings className="h-5 w-5" />
                  <span>Update Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/vehicle">
                  <Car className="h-5 w-5" />
                  <span>Update Vehicle</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/stations">
                  <MapPin className="h-5 w-5" />
                  <span>Find Stations</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link href="/dashboard/support">
                  <HelpCircle className="h-5 w-5" />
                  <span>Get Support</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}