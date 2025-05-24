"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
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
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { safeFormatDateWithTime } from "@/lib/utils";
import { FuelConsumptionCard } from "@/components/fuel-consumption-card";



export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();

  // Fetch admin profile and system stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch admin profile
        const profileResponse = await apiService.getAdminProfile();
        if (profileResponse.error) {
          console.error("Error fetching admin profile:", profileResponse.error);
          toast.error("Failed to load admin profile");
          setAdminData(null);
        } else if (profileResponse.data) {
          setAdminData(profileResponse.data);
        } else {
          setAdminData(null);
          toast.error("No admin profile data available");
        }

        // Fetch system statistics
        const statsResponse = await apiService.getSystemStats();
        if (statsResponse.error) {
          console.error("Error fetching system stats:", statsResponse.error);
          toast.error("Failed to load system statistics");
          setSystemStats(null);
        } else if (statsResponse.data) {
          setSystemStats(statsResponse.data);
        } else {
          setSystemStats(null);
          toast.error("No system statistics available");
        }

        // Fetch recent transactions
        const transactionsResponse = await apiService.getRecentTransactions(5);
        if (transactionsResponse.error) {
          console.error("Error fetching recent transactions:", transactionsResponse.error);
          toast.error("Failed to load recent transactions");
          setRecentTransactions([]);
        } else if (transactionsResponse.data && Array.isArray(transactionsResponse.data)) {
          setRecentTransactions(transactionsResponse.data);
        } else {
          setRecentTransactions([]);
        }

        // Fetch system notifications
        const notificationsResponse = await apiService.getSystemNotifications();
        if (notificationsResponse.error) {
          console.error("Error fetching system notifications:", notificationsResponse.error);
          toast.error("Failed to load system notifications");
          setSystemNotifications([]);
        } else if (notificationsResponse.data && Array.isArray(notificationsResponse.data)) {
          setSystemNotifications(notificationsResponse.data);
        } else {
          setSystemNotifications([]);
        }

        // Fetch pending approvals (station verifications)
        const approvalsResponse = await apiService.getStationVerifications();
        if (approvalsResponse.error) {
          console.error("Error fetching station verifications:", approvalsResponse.error);
          toast.error("Failed to load station verifications");
          setPendingApprovals([]);
        } else if (approvalsResponse.data && Array.isArray(approvalsResponse.data)) {
          // Filter only pending verifications
          const pendingVerifications = approvalsResponse.data
            .filter(verification => verification.status === "PENDING")
            .map(verification => ({
              id: verification.id,
              type: "Station Registration",
              name: verification.stationName || verification.businessName,
              date: new Date(verification.createdAt).toISOString().split('T')[0]
            }));

          setPendingApprovals(pendingVerifications);
        } else {
          setPendingApprovals([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load dashboard data");

        // Reset all state to empty values
        setAdminData(null);
        setSystemStats(null);
        setRecentTransactions([]);
        setSystemNotifications([]);
        setPendingApprovals([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

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
            {systemStats ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Vehicle Owners</p>
                      <p className="text-2xl font-bold">{systemStats.totalVehicleOwners}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Station Owners</p>
                      <p className="text-2xl font-bold">{systemStats.totalStationOwners}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Fuel Stations</p>
                      <p className="text-2xl font-bold">{systemStats.totalFuelStations}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                      <p className="text-2xl font-bold">{systemStats.pendingApprovals}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-4 text-center py-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-muted-foreground">No system statistics available</p>
                  </CardContent>
                </Card>
              </div>
            )}
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
                    {adminData ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p>{adminData.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                          <p>{adminData.employeeId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Department</p>
                          <p>{adminData.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Role</p>
                          <p>{adminData.role}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p>{adminData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                          <p className="text-sm">{adminData.lastLogin}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No admin profile data available</p>
                      </div>
                    )}
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
                    {systemStats ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Allocated</span>
                          <span className="text-lg font-bold">{systemStats.fuelAllocated} liters</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Consumed</span>
                          <span className="text-lg font-bold">{systemStats.fuelConsumed} liters</span>
                        </div>

                        {/* Consumption Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(systemStats.fuelConsumed / systemStats.fuelAllocated) * 100}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0 liters</span>
                          <span>{systemStats.fuelAllocated} liters</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No fuel allocation data available</p>
                      </div>
                    )}
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
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction, index) => (
                        <div key={transaction.id || index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                            <Fuel className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{transaction.amount} liters</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.transactionDate
                                  ? safeFormatDateWithTime(transaction.transactionDate)
                                  : transaction.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{transaction.vehicleRegistrationNumber || transaction.vehicleOwner}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>{transaction.stationName || transaction.station}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No recent transactions</p>
                      </div>
                    )}
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
                    {pendingApprovals.length > 0 ? (
                      pendingApprovals.map((approval, index) => (
                        <div key={approval.id || index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
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
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No pending approvals</p>
                      </div>
                    )}
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
                    {systemNotifications.length > 0 ? (
                      systemNotifications.map((notification) => (
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
                              <span>
                                {notification.createdAt
                                  ? safeFormatDateWithTime(notification.createdAt)
                                  : notification.timestamp
                                  ? safeFormatDateWithTime(notification.timestamp)
                                  : notification.date
                                  ? notification.date
                                  : 'No date available'}
                              </span>
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

              {/* Fuel Consumption Statistics Card */}
              <FuelConsumptionCard />

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
                      <Link href="/dashboard/fuel-allocation">
                        <Fuel className="h-5 w-5" />
                        <span>Fuel Allocation</span>
                      </Link>
                    </Button>
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