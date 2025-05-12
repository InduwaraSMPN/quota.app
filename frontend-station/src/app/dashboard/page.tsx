"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
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
  User,
  Building,
  History,
  Bell,
  Settings,
  AlertTriangle,
  ChevronRight,
  Clock,
  BarChart3,
  Edit,
  FileText,
  Fuel,
  Droplet,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";

// Mock data for the station dashboard
const mockStationData = {
  stationName: "City Fuel Station",
  registrationNumber: "FS-2023-001",
  ownerName: "Jane Smith",
  address: "123 Main Street, Colombo 05",
  contactNumber: "+94712345678",
  email: "citystation@example.com",
  operatingHours: "6:00 AM - 10:00 PM",
  lastLogin: "2023-06-25 14:30:45"
};

const mockFuelInventory = {
  petrol92: { total: 5000, remaining: 3200, unit: "liters" },
  petrol95: { total: 3000, remaining: 1800, unit: "liters" },
  diesel: { total: 8000, remaining: 5500, unit: "liters" },
  superDiesel: { total: 2000, remaining: 1200, unit: "liters" }
};

const mockTransactionStats = {
  today: 45,
  thisWeek: 320,
  thisMonth: 1250,
  totalTransactions: 15680,
  totalRevenue: 3250000,
  averagePerDay: 42
};

const mockRecentTransactions = [
  { id: "TRX-001", date: "2023-06-28", time: "14:30", vehicleOwner: "John Doe", vehicleId: "ABC-1234", fuelType: "Petrol 92", amount: 5.5, status: "Completed" },
  { id: "TRX-002", date: "2023-06-28", time: "13:15", vehicleOwner: "Jane Smith", vehicleId: "DEF-5678", fuelType: "Diesel", amount: 4.2, status: "Completed" },
  { id: "TRX-003", date: "2023-06-27", time: "16:45", vehicleOwner: "Robert Johnson", vehicleId: "GHI-9012", fuelType: "Petrol 95", amount: 6.0, status: "Completed" },
  { id: "TRX-004", date: "2023-06-27", time: "10:20", vehicleOwner: "Emily Davis", vehicleId: "JKL-3456", fuelType: "Diesel", amount: 3.8, status: "Completed" },
  { id: "TRX-005", date: "2023-06-26", time: "11:05", vehicleOwner: "Michael Wilson", vehicleId: "MNO-7890", fuelType: "Petrol 92", amount: 5.0, status: "Completed" }
];

const mockSystemNotifications = [
  { id: 1, type: "warning", message: "Petrol 95 inventory below 30%. Consider restocking soon.", date: "2023-06-28" },
  { id: 2, type: "info", message: "System maintenance scheduled for tonight at 02:00 AM", date: "2023-06-25" },
  { id: 3, type: "info", message: "New fuel price update effective from July 1st", date: "2023-06-24" },
  { id: 4, type: "warning", message: "Diesel pump #3 reported technical issues", date: "2023-06-22" }
];

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the auth hook to check authentication
  useEffect(() => {
    // In a real application, we would use the useAuth hook
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
      // In a real application, redirect to login page
      // Uncomment the following line to enable redirection
      // window.location.href = "/auth/login";
    }
  }, [isClient, isAuthenticated]);

  // Calculate inventory percentages
  const calculatePercentage = (remaining: number, total: number) => {
    return (remaining / total) * 100;
  };

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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Station Dashboard</h1>
              <p className="text-muted-foreground">Manage your fuel station operations</p>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/scanner">
                <FileText className="h-4 w-4" />
                QR Scanner
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Today's Transactions</p>
                  <p className="text-2xl font-bold">{mockTransactionStats.today}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{mockTransactionStats.thisWeek}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{mockTransactionStats.thisMonth}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Average Per Day</p>
                  <p className="text-2xl font-bold">{mockTransactionStats.averagePerDay}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Station Profile and Fuel Inventory */}
            <div className="md:col-span-1 space-y-6">
              {/* Station Profile Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Station Profile</CardTitle>
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
                      <p className="text-sm font-medium text-muted-foreground">Station Name</p>
                      <p>{mockStationData.stationName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                      <p>{mockStationData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                      <p>{mockStationData.ownerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                      <p>{mockStationData.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{mockStationData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Operating Hours</p>
                      <p className="text-sm">{mockStationData.operatingHours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fuel Inventory Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Fuel Inventory</CardTitle>
                  </div>
                  <CardDescription>
                    Current fuel stock levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Petrol 92 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Petrol 92</span>
                        <span className="text-sm font-medium">{mockFuelInventory.petrol92.remaining} / {mockFuelInventory.petrol92.total} {mockFuelInventory.petrol92.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                          style={{ width: `${calculatePercentage(mockFuelInventory.petrol92.remaining, mockFuelInventory.petrol92.total)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Petrol 95 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Petrol 95</span>
                        <span className="text-sm font-medium">{mockFuelInventory.petrol95.remaining} / {mockFuelInventory.petrol95.total} {mockFuelInventory.petrol95.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-yellow-500 h-full transition-all duration-500 ease-in-out"
                          style={{ width: `${calculatePercentage(mockFuelInventory.petrol95.remaining, mockFuelInventory.petrol95.total)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Diesel */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Diesel</span>
                        <span className="text-sm font-medium">{mockFuelInventory.diesel.remaining} / {mockFuelInventory.diesel.total} {mockFuelInventory.diesel.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                          style={{ width: `${calculatePercentage(mockFuelInventory.diesel.remaining, mockFuelInventory.diesel.total)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Super Diesel */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Super Diesel</span>
                        <span className="text-sm font-medium">{mockFuelInventory.superDiesel.remaining} / {mockFuelInventory.superDiesel.total} {mockFuelInventory.superDiesel.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                          style={{ width: `${calculatePercentage(mockFuelInventory.superDiesel.remaining, mockFuelInventory.superDiesel.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/inventory">
                      Manage Inventory
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Middle Column - Recent Transactions */}
            <div className="md:col-span-1 space-y-6">
              {/* Recent Transactions Card */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1" asChild>
                      <Link href="/dashboard/transactions">
                        <span>View All</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                          <Fuel className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{transaction.amount} liters</p>
                            <p className="text-sm text-muted-foreground">{transaction.date} {transaction.time}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{transaction.vehicleOwner}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Droplet className="h-3 w-3" />
                            <span>{transaction.fuelType} - {transaction.vehicleId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - System Notifications and Quick Actions */}
            <div className="md:col-span-1 space-y-6">
              {/* System Notifications Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">System Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSystemNotifications.length > 0 ? (
                      mockSystemNotifications.map((notification) => (
                        <div key={notification.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
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

              {/* Quick Actions Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/scanner">
                        <FileText className="h-5 w-5" />
                        <span>QR Scanner</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/inventory">
                        <Fuel className="h-5 w-5" />
                        <span>Inventory</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/reports">
                        <BarChart3 className="h-5 w-5" />
                        <span>Reports</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/settings">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                    </Button>
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