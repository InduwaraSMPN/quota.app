"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, Calendar, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

/**
 * Quota Card Component
 *
 * Displays fuel quota information for a vehicle including:
 * - Remaining fuel amount with progress bar
 * - Allocation and expiry dates
 * - Quota status (active/inactive/expired)
 */
interface QuotaCardProps {
  vehicleId: number;
  registrationNumber: string;
  allocatedAmount: number;
  remainingAmount: number;
  allocationDate: string | null;
  expiryDate: string | null;
  quotaStatus: string;
  nextAllocationDate: string | null;
  className?: string;
}

export function QuotaCard({
  vehicleId,
  registrationNumber,
  allocatedAmount,
  remainingAmount,
  allocationDate,
  expiryDate,
  quotaStatus,
  nextAllocationDate,
  className,
}: QuotaCardProps) {
  // Calculate percentage of remaining quota
  const percentRemaining = allocatedAmount > 0
    ? Math.round((remainingAmount / allocatedAmount) * 100)
    : 0;

  // Determine progress color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent <= 20) return "bg-destructive";
    if (percent <= 50) return "bg-warning";
    return "bg-primary";
  };

  // Format dates
  const formattedAllocationDate = allocationDate ? formatDate(allocationDate) : "N/A";
  const formattedExpiryDate = expiryDate ? formatDate(expiryDate) : "N/A";
  const formattedNextAllocationDate = nextAllocationDate ? formatDate(nextAllocationDate) : "N/A";

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Fuel Quota</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotaStatus === "ACTIVE" ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">{remainingAmount.toFixed(2)} L</span>
                </div>
                <Progress
                  value={percentRemaining}
                  className="h-2"
                  indicatorClassName={getProgressColor(percentRemaining)}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">0 L</span>
                  <span className="text-muted-foreground">{allocatedAmount.toFixed(2)} L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Allocation Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedAllocationDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedExpiryDate}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="font-medium">No Active Quota</p>
                <p className="text-sm text-muted-foreground">
                  {quotaStatus === "INACTIVE"
                    ? "You don't have an active fuel quota at the moment."
                    : "Your fuel quota has expired."}
                </p>
              </div>
              {nextAllocationDate && (
                <div className="text-sm mt-2">
                  <p className="text-muted-foreground">Next Allocation Date</p>
                  <p className="font-medium flex items-center justify-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedNextAllocationDate}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
