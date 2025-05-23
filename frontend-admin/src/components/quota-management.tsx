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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, AlertTriangle, CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

// Define the form schema for vehicle class quota update
const vehicleClassFormSchema = z.object({
  vehicleClassId: z.string({
    required_error: "Please select a vehicle class",
  }),
  fuelQuotaAmount: z
    .string()
    .min(1, { message: "Quota amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Quota amount must be a number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Quota amount must be greater than 0",
    }),
});

// Define the form schema for individual quota allocation
const individualQuotaFormSchema = z.object({
  vehicleId: z.string({
    required_error: "Please enter a vehicle ID",
  }),
  allocatedAmount: z
    .string()
    .min(1, { message: "Allocated amount is required" })
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Allocated amount must be a number",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Allocated amount must be greater than 0",
    }),
  allocationDate: z.date({
    required_error: "Allocation date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
}).refine((data) => data.expiryDate > data.allocationDate, {
  message: "Expiry date must be after allocation date",
  path: ["expiryDate"],
});

// Define the form schema for bulk quota allocation
const bulkQuotaFormSchema = z.object({
  vehicleClassId: z.string({
    required_error: "Please select a vehicle class",
  }),
  allocationDate: z.date({
    required_error: "Allocation date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
}).refine((data) => data.expiryDate > data.allocationDate, {
  message: "Expiry date must be after allocation date",
  path: ["expiryDate"],
});

// Define the form values types
type VehicleClassFormValues = z.infer<typeof vehicleClassFormSchema>;
type IndividualQuotaFormValues = z.infer<typeof individualQuotaFormSchema>;
type BulkQuotaFormValues = z.infer<typeof bulkQuotaFormSchema>;

interface VehicleClass {
  id: number;
  code: string;
  name: string;
  description: string;
  fuelQuotaAmount: number;
}

interface QuotaManagementProps {
  className?: string;
}

export function QuotaManagement({ className }: QuotaManagementProps) {
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVehicleClassLoading, setIsVehicleClassLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("vehicle-class");

  // Initialize the forms
  const vehicleClassForm = useForm<VehicleClassFormValues>({
    resolver: zodResolver(vehicleClassFormSchema),
    defaultValues: {
      vehicleClassId: "",
      fuelQuotaAmount: "",
    },
  });

  const individualQuotaForm = useForm<IndividualQuotaFormValues>({
    resolver: zodResolver(individualQuotaFormSchema),
    defaultValues: {
      vehicleId: "",
      allocatedAmount: "",
      allocationDate: new Date(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    },
  });

  const bulkQuotaForm = useForm<BulkQuotaFormValues>({
    resolver: zodResolver(bulkQuotaFormSchema),
    defaultValues: {
      vehicleClassId: "",
      allocationDate: new Date(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    },
  });

  // Fetch vehicle classes on component mount
  useState(() => {
    const fetchVehicleClasses = async () => {
      setIsVehicleClassLoading(true);
      try {
        const response = await apiService.getVehicleClasses();
        if (response.error) {
          setError(response.error);
          toast.error("Failed to load vehicle classes");
        } else if (response.data) {
          setVehicleClasses(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching vehicle classes:", err);
        setError("Failed to load vehicle classes. Please try again.");
        toast.error("Failed to load vehicle classes");
      } finally {
        setIsVehicleClassLoading(false);
      }
    };

    fetchVehicleClasses();
  });

  // Handle vehicle class form submission
  const onVehicleClassSubmit = async (data: VehicleClassFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.updateVehicleClassQuota({
        vehicleClassId: parseInt(data.vehicleClassId),
        fuelQuotaAmount: parseFloat(data.fuelQuotaAmount),
      });

      if (response.error) {
        setError(response.error);
        toast.error("Failed to update vehicle class quota");
      } else {
        toast.success("Vehicle class quota updated successfully");
        vehicleClassForm.reset();
        
        // Update the vehicle classes list
        const updatedVehicleClasses = vehicleClasses.map(vc => 
          vc.id === parseInt(data.vehicleClassId) 
            ? { ...vc, fuelQuotaAmount: parseFloat(data.fuelQuotaAmount) } 
            : vc
        );
        setVehicleClasses(updatedVehicleClasses);
      }
    } catch (err) {
      console.error("Error updating vehicle class quota:", err);
      setError("Failed to update vehicle class quota. Please try again.");
      toast.error("Failed to update vehicle class quota");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual quota form submission
  const onIndividualQuotaSubmit = async (data: IndividualQuotaFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.allocateQuota({
        vehicleId: parseInt(data.vehicleId),
        allocatedAmount: parseFloat(data.allocatedAmount),
        allocationDate: data.allocationDate.toISOString().split('T')[0],
        expiryDate: data.expiryDate.toISOString().split('T')[0],
      });

      if (response.error) {
        setError(response.error);
        toast.error("Failed to allocate quota");
      } else {
        toast.success("Quota allocated successfully");
        individualQuotaForm.reset({
          ...individualQuotaForm.getValues(),
          vehicleId: "",
          allocatedAmount: "",
        });
      }
    } catch (err) {
      console.error("Error allocating quota:", err);
      setError("Failed to allocate quota. Please try again.");
      toast.error("Failed to allocate quota");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk quota form submission
  const onBulkQuotaSubmit = async (data: BulkQuotaFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.allocateQuotasByVehicleClass({
        vehicleClassId: parseInt(data.vehicleClassId),
        allocationDate: data.allocationDate.toISOString().split('T')[0],
        expiryDate: data.expiryDate.toISOString().split('T')[0],
      });

      if (response.error) {
        setError(response.error);
        toast.error("Failed to allocate quotas");
      } else {
        toast.success(`Quotas allocated successfully for ${response.data.quotasAllocated} vehicles`);
        bulkQuotaForm.reset({
          ...bulkQuotaForm.getValues(),
          vehicleClassId: "",
        });
      }
    } catch (err) {
      console.error("Error allocating quotas:", err);
      setError("Failed to allocate quotas. Please try again.");
      toast.error("Failed to allocate quotas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Quota Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vehicle-class" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicle-class">Vehicle Class Quotas</TabsTrigger>
            <TabsTrigger value="individual">Individual Allocation</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Allocation</TabsTrigger>
          </TabsList>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-destructive/10 p-3 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Vehicle Class Quotas Tab */}
          <TabsContent value="vehicle-class" className="mt-4">
            <Form {...vehicleClassForm}>
              <form onSubmit={vehicleClassForm.handleSubmit(onVehicleClassSubmit)} className="space-y-4">
                <FormField
                  control={vehicleClassForm.control}
                  name="vehicleClassId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || isVehicleClassLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleClasses.map((vc) => (
                            <SelectItem key={vc.id} value={vc.id.toString()}>
                              {vc.code} - {vc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleClassForm.control}
                  name="fuelQuotaAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Quota Amount (liters)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter quota amount"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading || isVehicleClassLoading} className="w-full">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <span>Update Quota Amount</span>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Individual Allocation Tab */}
          <TabsContent value="individual" className="mt-4">
            <Form {...individualQuotaForm}>
              <form onSubmit={individualQuotaForm.handleSubmit(onIndividualQuotaSubmit)} className="space-y-4">
                <FormField
                  control={individualQuotaForm.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter vehicle ID"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={individualQuotaForm.control}
                  name="allocatedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocated Amount (liters)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter allocated amount"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={individualQuotaForm.control}
                    name="allocationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allocation Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={individualQuotaForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Allocating...</span>
                    </div>
                  ) : (
                    <span>Allocate Quota</span>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Bulk Allocation Tab */}
          <TabsContent value="bulk" className="mt-4">
            <Form {...bulkQuotaForm}>
              <form onSubmit={bulkQuotaForm.handleSubmit(onBulkQuotaSubmit)} className="space-y-4">
                <FormField
                  control={bulkQuotaForm.control}
                  name="vehicleClassId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || isVehicleClassLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleClasses.map((vc) => (
                            <SelectItem key={vc.id} value={vc.id.toString()}>
                              {vc.code} - {vc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={bulkQuotaForm.control}
                    name="allocationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allocation Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bulkQuotaForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    This will allocate quotas to all vehicles of the selected class. Each vehicle will receive the quota amount configured for its class.
                  </p>
                </div>

                <Button type="submit" disabled={isLoading || isVehicleClassLoading} className="w-full">
                  {isLoading ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Allocating...</span>
                    </div>
                  ) : (
                    <span>Allocate Quotas</span>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
