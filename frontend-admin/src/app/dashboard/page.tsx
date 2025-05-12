"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { MagicBackButton } from "@/components/ui/magic-back-button";
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
  Users,
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
  Fuel
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";

// Mock data for the admin dashboard
const mockAdminData = {
  fullName: "Admin User",
  employeeId: "EMP-001",
  email: "admin@quota.app",
  department: "IT Administration",
  role: "System Administrator",
  lastLogin: "2023-06-25 14:30:45"
};

const mockSystemStats = {
  totalVehicleOwners: 1250,
  totalStationOwners: 85,
  totalFuelStations: 120,
  totalTransactions: 15680,
  fuelAllocated: 125000,
  fuelConsumed: 98500,
  activeUsers: 950,
  pendingApprovals: 15
};

const mockRecentTransactions = [
  { id: "TRX-001", date: "2023-06-28", vehicleOwner: "John Doe", station: "Fuel Station A", amount: 5.5, status: "Completed" },
  { id: "TRX-002", date: "2023-06-28", vehicleOwner: "Jane Smith", station: "Fuel Station B", amount: 4.2, status: "Completed" },
  { id: "TRX-003", date: "2023-06-27", vehicleOwner: "Robert Johnson", station: "Fuel Station C", amount: 6.0, status: "Completed" },
  { id: "TRX-004", date: "2023-06-27", vehicleOwner: "Emily Davis", station: "Fuel Station A", amount: 3.8, status: "Completed" },
  { id: "TRX-005", date: "2023-06-26", vehicleOwner: "Michael Wilson", station: "Fuel Station D", amount: 5.0, status: "Completed" }
];

const mockSystemNotifications = [
  { id: 1, type: "warning", message: "Fuel station 'Station X' reported technical issues with QR scanning", date: "2023-06-28" },
  { id: 2, type: "info", message: "Monthly quota allocation completed successfully", date: "2023-06-25" },
  { id: 3, type: "warning", message: "System backup scheduled for tonight at 02:00 AM", date: "2023-06-24" },
  { id: 4, type: "info", message: "15 new vehicle owners registered this week", date: "2023-06-22" }
];

const mockPendingApprovals = [
  { id: "REQ-001", type: "Station Registration", name: "City Fuel Station", date: "2023-06-27" },
  { id: "REQ-002", type: "Quota Increase", name: "John Doe", date: "2023-06-26" },
  { id: "REQ-003", type: "Vehicle Registration", name: "Emily Davis", date: "2023-06-25" },
  { id: "REQ-004", type: "Station Registration", name: "Highway Fuels", date: "2023-06-24" },
  { id: "REQ-005", type: "Quota Increase", name: "Michael Wilson", date: "2023-06-23" }
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
                <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage fuel quota system and users</p>
              </div>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                System Settings
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Vehicle Owners</p>
                  <p className="text-2xl font-bold">{mockSystemStats.totalVehicleOwners}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Station Owners</p>
                  <p className="text-2xl font-bold">{mockSystemStats.totalStationOwners}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Fuel Stations</p>
                  <p className="text-2xl font-bold">{mockSystemStats.totalFuelStations}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{mockSystemStats.pendingApprovals}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Admin Profile and Fuel Allocation */}
            <div className="md:col-span-1 space-y-6">
              {/* Admin Profile Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Admin Profile</CardTitle>
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
                      <p>{mockAdminData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                      <p>{mockAdminData.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Department</p>
                      <p>{mockAdminData.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <p>{mockAdminData.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{mockAdminData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                      <p className="text-sm">{mockAdminData.lastLogin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fuel Allocation Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Fuel Allocation</CardTitle>
                  </div>
                  <CardDescription>
                    System-wide fuel allocation status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Allocated</span>
                      <span className="text-lg font-bold">{mockSystemStats.fuelAllocated} liters</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Consumed</span>
                      <span className="text-lg font-bold">{mockSystemStats.fuelConsumed} liters</span>
                    </div>

                    {/* Consumption Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-in-out"
                        style={{ width: `${(mockSystemStats.fuelConsumed / mockSystemStats.fuelAllocated) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0 liters</span>
                      <span>{mockSystemStats.fuelAllocated} liters</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/fuel-allocation">
                      Manage Fuel Allocation
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Middle Column - Recent Transactions and Pending Approvals */}
            <div className="md:col-span-1 space-y-6">
              {/* Recent Transactions Card */}
              <Card>
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
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{transaction.vehicleOwner}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{transaction.station}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Approvals Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Pending Approvals</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1" asChild>
                      <Link href="/dashboard/station-verifications">
                        <span>View All</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPendingApprovals.map((approval, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{approval.type}</p>
                            <p className="text-sm text-muted-foreground">{approval.date}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{approval.name}</p>
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
                      <Link href="/dashboard/users">
                        <Users className="h-5 w-5" />
                        <span>Manage Users</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/stations">
                        <Building className="h-5 w-5" />
                        <span>Manage Stations</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/station-verifications">
                        <FileText className="h-5 w-5" />
                        <span>Station Verifications</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/quota">
                        <Fuel className="h-5 w-5" />
                        <span>Adjust Quotas</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/reports">
                        <BarChart3 className="h-5 w-5" />
                        <span>View Reports</span>
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