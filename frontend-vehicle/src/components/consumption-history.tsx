"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ChevronRight, ChevronLeft, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  vehicleId: number;
  vehicleRegistrationNumber: string;
  stationId: number;
  stationName: string;
  fuelType: string;
  amount: number;
  unitPrice: number;
  totalPrice: number;
  transactionDate: string;
}

interface ConsumptionHistoryProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  className?: string;
}

export function ConsumptionHistory({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  className,
}: ConsumptionHistoryProps) {
  // Get fuel type display name
  const getFuelTypeDisplay = (fuelType: string) => {
    return fuelType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };
  
  // Get fuel type color
  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case "92_OCTANE_PETROL":
        return "text-green-500";
      case "95_OCTANE_PETROL":
        return "text-blue-500";
      case "AUTO_DIESEL":
        return "text-amber-500";
      case "SUPER_DIESEL":
        return "text-purple-500";
      case "KEROSENE":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Consumption History</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No consumption history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{transaction.stationName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(transaction.transactionDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaction.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.amount.toFixed(2)} L @ {formatCurrency(transaction.unitPrice)}/L
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Droplet className={cn("h-3 w-3", getFuelTypeColor(transaction.fuelType))} />
                    <span>{getFuelTypeDisplay(transaction.fuelType)}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
