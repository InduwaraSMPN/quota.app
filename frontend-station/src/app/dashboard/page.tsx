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
  Building,
  History,
  Bell,
  Settings,
  AlertTriangle,
  ChevronRight,
  Clock,
  BarChart3,
  Edit,
  Fuel,
  Droplet,
  QrCode,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { safeFormatDateWithTime } from "@/lib/utils";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationData, setStationData] = useState<any>(null);
  const [fuelInventory, setFuelInventory] = useState<any>(null);
  const [transactionStats, setTransactionStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const { isAuthenticated } = useAuth();

  // Fetch station profile and stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch station profile
        const profileResponse = await apiService.getStationDetails();
        if (profileResponse.error) {
          console.error("Error fetching station profile:", profileResponse.error);
          toast.error("Failed to load station profile");
          setStationData(null);
        } else if (profileResponse.data) {
          setStationData(profileResponse.data);
        } else {
          setStationData(null);
          toast.error("No station profile data available");
        }

        // Fetch station statistics
        // Note: We'll use the station details endpoint for now since getStationStats is not implemented yet
        const statsResponse = await apiService.getStationDetails();
        if (statsResponse.error) {
          console.error("Error fetching station stats:", statsResponse.error);
          toast.error("Failed to load station statistics");
          setFuelInventory(null);
          setTransactionStats(null);
        } else if (statsResponse.data) {
          if (statsResponse.data.fuelInventory) {
            setFuelInventory(statsResponse.data.fuelInventory);
          } else {
            setFuelInventory(null);
          }

          if (statsResponse.data.transactionStats) {
            setTransactionStats(statsResponse.data.transactionStats);
          } else {
            setTransactionStats(null);
          }
        } else {
          setFuelInventory(null);
          setTransactionStats(null);
          toast.error("No station statistics available");
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

        // Fetch station notifications
        const notificationsResponse = await apiService.getStationNotifications();
        if (notificationsResponse.error) {
          console.error("Error fetching station notifications:", notificationsResponse.error);
          toast.error("Failed to load station notifications");
          setSystemNotifications([]);
        } else if (notificationsResponse.data && Array.isArray(notificationsResponse.data)) {
          setSystemNotifications(notificationsResponse.data);
        } else {
          setSystemNotifications([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        toast.error("Failed to load dashboard data");

        // Reset all state to empty values
        setStationData(null);
        setFuelInventory(null);
        setTransactionStats(null);
        setRecentTransactions([]);
        setSystemNotifications([]);
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

      <Toaster />

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
                <h1 className="text-2xl md:text-3xl font-bold">Station Dashboard</h1>
                <p className="text-muted-foreground">Manage your fuel station operations</p>
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
            {transactionStats ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Today's Transactions</p>
                      <p className="text-2xl font-bold">{transactionStats.today || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">{transactionStats.thisWeek || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">{transactionStats.thisMonth || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm text-muted-foreground">Average Per Day</p>
                      <p className="text-2xl font-bold">{transactionStats.averagePerDay || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-4 text-center py-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-muted-foreground">No transaction statistics available</p>
                  </CardContent>
                </Card>
              </div>
            )}
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
                    {stationData ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Station Name</p>
                          <p>{stationData.stationName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                          <p>{stationData.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Owner Name</p>
                          <p>{stationData.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                          <p>{stationData.contactNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p>{stationData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Operating Hours</p>
                          <p className="text-sm">{stationData.operatingHours}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No station profile data available</p>
                      </div>
                    )}
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
                    {fuelInventory ? (
                      <>
                        {/* Petrol 92 */}
                        {fuelInventory.petrol92 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Petrol 92</span>
                              <span className="text-sm font-medium">
                                {fuelInventory.petrol92.remaining} / {fuelInventory.petrol92.total} {fuelInventory.petrol92.unit || "liters"}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (fuelInventory.petrol92.remaining / fuelInventory.petrol92.total) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Petrol 95 */}
                        {fuelInventory.petrol95 && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Petrol 95</span>
                              <span className="text-sm font-medium">
                                {fuelInventory.petrol95.remaining} / {fuelInventory.petrol95.total} {fuelInventory.petrol95.unit || "liters"}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-yellow-500 h-full transition-all duration-500 ease-in-out"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (fuelInventory.petrol95.remaining / fuelInventory.petrol95.total) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Diesel */}
                        {fuelInventory.diesel && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Diesel</span>
                              <span className="text-sm font-medium">
                                {fuelInventory.diesel.remaining} / {fuelInventory.diesel.total} {fuelInventory.diesel.unit || "liters"}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (fuelInventory.diesel.remaining / fuelInventory.diesel.total) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Super Diesel */}
                        {fuelInventory.superDiesel && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Super Diesel</span>
                              <span className="text-sm font-medium">
                                {fuelInventory.superDiesel.remaining} / {fuelInventory.superDiesel.total} {fuelInventory.superDiesel.unit || "liters"}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-green-500 h-full transition-all duration-500 ease-in-out"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (fuelInventory.superDiesel.remaining / fuelInventory.superDiesel.total) * 100))}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No fuel inventory data available</p>
                      </div>
                    )}
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
                                  : `${transaction.date} ${transaction.time || ''}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{transaction.vehicleOwner || 'Vehicle Owner'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Droplet className="h-3 w-3" />
                              <span>
                                {transaction.fuelType
                                  ? (typeof transaction.fuelType === 'string'
                                    ? transaction.fuelType
                                    : transaction.fuelType.name || 'Unknown')
                                  : 'Unknown'} - {transaction.vehicleRegistrationNumber || transaction.vehicleId || 'Unknown'}
                              </span>
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
                              <span>{notification.timestamp
                                ? safeFormatDateWithTime(notification.timestamp)
                                : notification.date}</span>
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
                      <Link href="/dashboard/dispense">
                        <Fuel className="h-5 w-5" />
                        <span>Dispense Fuel</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/scanner">
                        <QrCode className="h-5 w-5" />
                        <span>QR Scanner</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/inventory">
                        <Droplet className="h-5 w-5" />
                        <span>Inventory</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-2" asChild>
                      <Link href="/dashboard/transactions">
                        <History className="h-5 w-5" />
                        <span>Transactions</span>
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