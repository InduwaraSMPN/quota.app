"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fuel, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Define the form schema with Zod
const formSchema = z.object({
  fuelType: z.string({
    required_error: "Please select a fuel type",
  }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  unitPrice: z
    .string()
    .min(1, { message: "Unit price is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Unit price must be a number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Unit price must be greater than 0",
    }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface FuelDispensingFormProps {
  vehicleId: number;
  vehicleDetails: {
    registrationNumber: string;
    make: string;
    model: string;
    fuelType: string;
    quotaDetails: {
      allocatedAmount: number;
      remainingAmount: number;
      quotaStatus: string;
    };
  };
  onSuccess: () => void;
  onCancel: () => void;
  className?: string;
}

export function FuelDispensingForm({
  vehicleId,
  vehicleDetails,
  onSuccess,
  onCancel,
  className,
}: FuelDispensingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate percentage of remaining quota
  const percentRemaining = vehicleDetails.quotaDetails.allocatedAmount > 0
    ? Math.round((vehicleDetails.quotaDetails.remainingAmount / vehicleDetails.quotaDetails.allocatedAmount) * 100)
    : 0;

  // Determine progress color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent <= 20) return "bg-destructive";
    if (percent <= 50) return "bg-warning";
    return "bg-primary";
  };

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fuelType: vehicleDetails.fuelType,
      amount: "",
      unitPrice: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    // Convert string values to numbers
    const amount = parseFloat(data.amount);
    const unitPrice = parseFloat(data.unitPrice);

    // Check if amount exceeds remaining quota
    if (amount > vehicleDetails.quotaDetails.remainingAmount) {
      setError(`Amount exceeds remaining quota (${vehicleDetails.quotaDetails.remainingAmount} liters)`);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare transaction data
      const transactionData = {
        vehicleId,
        stationId: 1, // This would come from the authenticated station owner
        fuelType: data.fuelType,
        amount,
        unitPrice,
      };

      // Call the API to record the transaction
      const response = await apiService.dispenseFuel(transactionData);

      if (response.error) {
        setError(response.error);
        toast.error("Failed to record transaction");
      } else {
        toast.success("Fuel dispensed successfully");
        onSuccess();
      }
    } catch (err) {
      console.error("Error recording transaction:", err);
      setError("Failed to record transaction. Please try again.");
      toast.error("Failed to record transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Dispense Fuel</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Information */}
        <div className="bg-muted/30 p-3 rounded-md">
          <h3 className="font-medium mb-2">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Registration Number</p>
              <p className="font-medium">{vehicleDetails.registrationNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vehicle</p>
              <p className="font-medium">{vehicleDetails.make} {vehicleDetails.model}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fuel Type</p>
              <p className="font-medium">{vehicleDetails.fuelType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quota Status</p>
              <p className="font-medium">{vehicleDetails.quotaDetails.quotaStatus}</p>
            </div>
          </div>
        </div>

        {/* Quota Information */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining Quota</span>
            <span className="font-medium">{vehicleDetails.quotaDetails.remainingAmount.toFixed(2)} L</span>
          </div>
          <Progress
            value={percentRemaining}
            className="h-2"
            indicatorClassName={getProgressColor(percentRemaining)}
          />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">0 L</span>
            <span className="text-muted-foreground">{vehicleDetails.quotaDetails.allocatedAmount.toFixed(2)} L</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Dispensing Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="92_OCTANE_PETROL">92 Octane Petrol</SelectItem>
                      <SelectItem value="95_OCTANE_PETROL">95 Octane Petrol</SelectItem>
                      <SelectItem value="AUTO_DIESEL">Auto Diesel</SelectItem>
                      <SelectItem value="SUPER_DIESEL">Super Diesel</SelectItem>
                      <SelectItem value="KEROSENE">Kerosene</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (liters)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (LKR)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter unit price"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Price Calculation */}
            {form.watch("amount") && form.watch("unitPrice") && !isNaN(parseFloat(form.watch("amount"))) && !isNaN(parseFloat(form.watch("unitPrice"))) && (
              <div className="bg-primary/10 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">Total Price:</span>
                  <span className="font-medium">
                    LKR {(parseFloat(form.watch("amount")) * parseFloat(form.watch("unitPrice"))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !vehicleDetails.quotaDetails.quotaStatus.includes("ACTIVE")}
          className="flex-1"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-1">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span>Dispense Fuel</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
