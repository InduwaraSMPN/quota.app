"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Fuel,
  TrendingUp,
  BarChart3,
  Download,
  Filter,
  Calendar,
  Building
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";

// Analytics data structure from API
interface FuelConsumptionAnalytics {
  totalConsumption: number;
  consumptionByFuelType: Record<string, number>;
  consumptionByStation: Record<string, number>;
  monthlyConsumption: Record<string, number>;
  weeklyConsumption: Record<string, number>;
  transactionCount: number;
  averageTransactionAmount: number;
}

export default function FuelConsumptionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<FuelConsumptionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedFuelType, setSelectedFuelType] = useState("all");
  const [selectedStationId, setSelectedStationId] = useState("");

  // Fetch analytics data with optional filters
  const fetchAnalytics = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build filter object from current state
      const filters: any = {};
      if (startDate) filters.startDate = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      if (endDate) filters.endDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      if (selectedFuelType && selectedFuelType !== "all") filters.fuelType = selectedFuelType;
      if (selectedStationId) filters.stationId = parseInt(selectedStationId);

      const response = await apiService.getFuelConsumptionAnalytics(filters);

      if (response.error) {
        setError(response.error);
        toast.error("Failed to load fuel consumption analytics");
      } else if (response.data) {
        setAnalytics(response.data);
      } else {
        setError("No analytics data available");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on auth state change
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAnalytics();
    }
  }, [isAuthenticated, authLoading]);

  // Apply current filter settings
  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  // Reset all filters and reload data
  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedFuelType("all");
    setSelectedStationId("");
    // Fetch analytics without filters
    setTimeout(() => fetchAnalytics(), 100);
  };

  // Transform API data for chart components
  const fuelTypeChartData = analytics?.consumptionByFuelType
    ? Object.entries(analytics.consumptionByFuelType).map(([type, amount]) => ({
        fuelType: type.replace(/_/g, ' '),
        amount: Number(amount),
      }))
    : [];

  // Sort monthly data chronologically
  const monthlyChartData = analytics?.monthlyConsumption
    ? Object.entries(analytics.monthlyConsumption)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({
          month,
          amount: Number(amount),
        }))
    : [];

  // Top 10 stations by consumption
  const stationChartData = analytics?.consumptionByStation
    ? Object.entries(analytics.consumptionByStation)
        .sort(([, a], [, b]) => Number(b) - Number(a))
        .slice(0, 10) // Top 10 stations
        .map(([station, amount]) => ({
          station: station.length > 15 ? station.substring(0, 15) + '...' : station,
          amount: Number(amount),
        }))
    : [];

  // Chart styling configuration
  const chartConfig = {
    amount: {
      label: "Consumption (L)",
      color: "var(--color-chart-1)",
    },
    fuelType: {
      label: "Fuel Type",
      color: "var(--color-chart-2)",
    },
    station: {
      label: "Station",
      color: "var(--color-chart-3)",
    },
  };

  // Color palette for pie chart segments
  const COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)"
  ];

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ErrorMessage message="Please log in to access this page" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading fuel consumption analytics..." />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage
            message={error}
            onRetry={() => fetchAnalytics()}
          />
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && analytics && (
        <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <MagicBackButton backLink="/dashboard" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Fuel Consumption Analytics</h1>
                  <p className="text-muted-foreground">Comprehensive fuel consumption statistics and trends</p>
                </div>
              </div>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle>Filters</CardTitle>
                </div>
                <CardDescription>Filter the analytics data by date range, fuel type, and station</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="mb-2">Start Date</Label>
                    <DatePicker
                      date={startDate}
                      setDate={setStartDate}
                      placeholder="Select start date"
                      disableFuture={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="mb-2">End Date</Label>
                    <DatePicker
                      date={endDate}
                      setDate={setEndDate}
                      placeholder="Select end date"
                      disableFuture={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelType" className="mb-2">Fuel Type</Label>
                    <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All fuel types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All fuel types</SelectItem>
                        <SelectItem value="OCTANE_92">92 Octane Petrol</SelectItem>
                        <SelectItem value="OCTANE_95">95 Octane Petrol</SelectItem>
                        <SelectItem value="AUTO_DIESEL">Auto Diesel</SelectItem>
                        <SelectItem value="SUPER_DIESEL">Super Diesel</SelectItem>
                        <SelectItem value="KEROSENE">Kerosene</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1">
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Consumption</p>
                      <p className="text-2xl font-bold">{analytics.totalConsumption.toFixed(1)} L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">{analytics.transactionCount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg per Transaction</p>
                      <p className="text-2xl font-bold">{analytics.averageTransactionAmount.toFixed(1)} L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Stations</p>
                      <p className="text-2xl font-bold">{Object.keys(analytics.consumptionByStation).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fuel Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Consumption by Fuel Type</CardTitle>
                  <CardDescription>Breakdown of fuel consumption by different fuel types</CardDescription>
                </CardHeader>
                <CardContent>
                  {fuelTypeChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={fuelTypeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="fuelType"
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="amount"
                          fill="var(--color-chart-1)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No fuel type data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Consumption Trends</CardTitle>
                  <CardDescription>Fuel consumption trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlyChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-chart-2)"
                          strokeWidth={3}
                          dot={{ fill: "var(--color-chart-2)", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No monthly trend data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Stations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Consuming Stations</CardTitle>
                  <CardDescription>Stations with highest fuel consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  {stationChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={stationChartData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="station"
                          tick={{ fontSize: 10 }}
                          width={120}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="amount"
                          fill="var(--color-chart-3)"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No station data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fuel Type Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Fuel Type Distribution</CardTitle>
                  <CardDescription>Percentage distribution of fuel types</CardDescription>
                </CardHeader>
                <CardContent>
                  {fuelTypeChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <PieChart>
                        <Pie
                          data={fuelTypeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ fuelType, percent }) => `${fuelType}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {fuelTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No distribution data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
