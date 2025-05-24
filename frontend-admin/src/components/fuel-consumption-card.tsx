"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, TrendingUp, ChevronRight, BarChart3 } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface FuelConsumptionStats {
  totalFuelConsumed: number;
  consumptionByFuelType: Record<string, number>;
  dailyConsumption: Record<string, number>;
  consumptionByStation: Record<string, number>;
  totalTransactions: number;
  averageConsumptionPerTransaction: number;
}

export function FuelConsumptionCard() {
  const [stats, setStats] = useState<FuelConsumptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getFuelConsumptionStats();
        
        if (response.error) {
          setError(response.error);
          toast.error("Failed to load fuel consumption statistics");
        } else if (response.data) {
          setStats(response.data);
        } else {
          setError("No fuel consumption data available");
        }
      } catch (err) {
        console.error("Error fetching fuel consumption stats:", err);
        setError("Failed to load fuel consumption statistics");
        toast.error("Failed to load fuel consumption statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Prepare chart data for fuel type breakdown
  const chartData = stats?.consumptionByFuelType 
    ? Object.entries(stats.consumptionByFuelType).map(([type, amount]) => ({
        fuelType: type.replace(/_/g, ' '),
        amount: Number(amount),
      }))
    : [];

  const chartConfig = {
    amount: {
      label: "Consumption (L)",
      color: "var(--color-chart-1)",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Fuel Consumption Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Fuel Consumption Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">{error || "No data available"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Fuel Consumption Statistics</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/dashboard/fuel-consumption">
              <span>View Details</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Consumed</p>
              <p className="text-2xl font-bold">{stats.totalFuelConsumed.toFixed(1)} L</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg per Transaction</p>
              <p className="text-2xl font-bold">{stats.averageConsumptionPerTransaction.toFixed(1)} L</p>
            </div>
          </div>

          {/* Fuel Type Breakdown Chart */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Consumption by Fuel Type</p>
              </div>
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="fuelType" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--color-chart-1)" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          )}

          {/* Quick Stats */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Transactions</span>
              <span className="font-medium">{stats.totalTransactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Fuel Types</span>
              <span className="font-medium">{Object.keys(stats.consumptionByFuelType).length}</span>
            </div>
          </div>

          {/* View Details Button */}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/dashboard/fuel-consumption">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
