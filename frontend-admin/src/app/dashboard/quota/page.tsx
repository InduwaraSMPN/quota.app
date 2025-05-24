"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { Logo } from "@/components/logo";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Edit,
  History,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define vehicle class type
interface VehicleClass {
  id: number;
  code: string;
  name: string;
  description: string;
  fuelQuotaAmount: number;
}

// Define quota history type
interface QuotaHistory {
  id: number;
  vehicleClassId: number;
  vehicleClassCode: string;
  vehicleClassName: string;
  oldQuotaAmount: number;
  newQuotaAmount: number;
  changedBy: string;
  changedAt: string;
  reason: string;
}

// Define form schema for quota update
const quotaUpdateSchema = z.object({
  fuelQuotaAmount: z.string()
    .min(1, "Quota amount is required")
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Quota amount must be a number",
    })
    .refine(val => parseFloat(val) >= 0, {
      message: "Quota amount must be greater than or equal to 0",
    }),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export default function QuotaManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([]);
  const [quotaHistory, setQuotaHistory] = useState<QuotaHistory[]>([]);
  const [selectedVehicleClass, setSelectedVehicleClass] = useState<VehicleClass | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vehicle-classes");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create form for quota update
  const quotaUpdateForm = useForm<z.infer<typeof quotaUpdateSchema>>({
    resolver: zodResolver(quotaUpdateSchema),
    defaultValues: {
      fuelQuotaAmount: "",
      reason: "",
    },
  });

  // Fetch vehicle classes and quota history on component mount
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchVehicleClasses();
    fetchQuotaHistory();
  }, [isAuthenticated]);

  // Function to fetch vehicle classes from API
  const fetchVehicleClasses = async () => {
    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);

    try {
      const response = await apiService.getVehicleClasses();
      
      if (response.error) {
        setError(response.error);
        toast.error("Failed to load vehicle classes");
        setVehicleClasses([]);
      } else if (response.data) {
        setVehicleClasses(response.data);
      } else {
        setVehicleClasses([]);
        setError("No vehicle class data available");
        toast.error("No vehicle class data available");
      }
    } catch (err) {
      console.error("Error fetching vehicle classes:", err);
      setError("Failed to load vehicle classes. Please try again.");
      toast.error("Failed to load vehicle classes");
      setVehicleClasses([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to fetch quota history from API
  const fetchQuotaHistory = async () => {
    setIsRefreshing(true);

    try {
      const response = await apiService.getQuotaHistory();
      
      if (response.error) {
        toast.error("Failed to load quota history");
        setQuotaHistory([]);
      } else if (response.data) {
        setQuotaHistory(response.data);
      } else {
        setQuotaHistory([]);
        toast.error("No quota history data available");
      }
    } catch (err) {
      console.error("Error fetching quota history:", err);
      toast.error("Failed to load quota history");
      setQuotaHistory([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Function to handle quota update form submission
  const onQuotaUpdateSubmit = async (data: z.infer<typeof quotaUpdateSchema>) => {
    if (!selectedVehicleClass) return;
    
    try {
      const response = await apiService.updateVehicleClassQuota({
        vehicleClassId: selectedVehicleClass.id,
        fuelQuotaAmount: parseFloat(data.fuelQuotaAmount),
        reason: data.reason,
      });
      
      if (response.error) {
        toast.error("Failed to update quota");
      } else {
        toast.success("Quota updated successfully");
        setIsEditDialogOpen(false);
        setIsConfirmDialogOpen(false);
        fetchVehicleClasses(); // Refresh the vehicle classes
        fetchQuotaHistory(); // Refresh the quota history
      }
    } catch (err) {
      console.error("Error updating quota:", err);
      toast.error("Failed to update quota");
    }
  };

  // Function to handle edit vehicle class quota
  const handleEditVehicleClass = (vehicleClass: VehicleClass) => {
    setSelectedVehicleClass(vehicleClass);
    quotaUpdateForm.reset({
      fuelQuotaAmount: vehicleClass.fuelQuotaAmount.toString(),
      reason: "",
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle view quota history for a specific vehicle class
  const handleViewQuotaHistory = (vehicleClass: VehicleClass) => {
    setSelectedVehicleClass(vehicleClass);
    setIsHistoryDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with logo and theme toggle */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Logo />
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Loading state */}
      {isLoading && !isRefreshing && (
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Main content - only show when not loading initially and no errors */}
      {(!isLoading || isRefreshing) && !error && (
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <MagicBackButton backLink="/dashboard" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Quota Management</h1>
                <p className="text-muted-foreground">Manage fuel quotas for different vehicle classes</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                fetchVehicleClasses();
                fetchQuotaHistory();
              }} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="vehicle-classes" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="vehicle-classes">Vehicle Classes</TabsTrigger>
              <TabsTrigger value="quota-history">Quota History</TabsTrigger>
            </TabsList>
            
            {/* Vehicle Classes Tab */}
            <TabsContent value="vehicle-classes">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Classes</CardTitle>
                  <CardDescription>Manage fuel quota amounts for different vehicle classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Quota Amount (L)</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isRefreshing ? (
                          // Skeleton loading state
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                            </TableRow>
                          ))
                        ) : vehicleClasses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No vehicle classes found
                            </TableCell>
                          </TableRow>
                        ) : (
                          vehicleClasses.map((vehicleClass) => (
                            <TableRow key={vehicleClass.id}>
                              <TableCell>{vehicleClass.code}</TableCell>
                              <TableCell>{vehicleClass.name}</TableCell>
                              <TableCell>{vehicleClass.description}</TableCell>
                              <TableCell>{vehicleClass.fuelQuotaAmount}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleEditVehicleClass(vehicleClass)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleViewQuotaHistory(vehicleClass)}
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Quota History Tab */}
            <TabsContent value="quota-history">
              <Card>
                <CardHeader>
                  <CardTitle>Quota History</CardTitle>
                  <CardDescription>View history of quota changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle Class</TableHead>
                          <TableHead>Old Amount (L)</TableHead>
                          <TableHead>New Amount (L)</TableHead>
                          <TableHead>Changed By</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isRefreshing ? (
                          // Skeleton loading state
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                            </TableRow>
                          ))
                        ) : quotaHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No quota history found
                            </TableCell>
                          </TableRow>
                        ) : (
                          quotaHistory.map((history) => (
                            <TableRow key={history.id}>
                              <TableCell>{formatDate(history.changedAt)}</TableCell>
                              <TableCell>{history.vehicleClassCode}</TableCell>
                              <TableCell>{history.oldQuotaAmount}</TableCell>
                              <TableCell>{history.newQuotaAmount}</TableCell>
                              <TableCell>{history.changedBy}</TableCell>
                              <TableCell>{history.reason || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      )}

      {/* Edit Quota Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Quota Amount</DialogTitle>
            <DialogDescription>
              Update the fuel quota amount for {selectedVehicleClass?.code} - {selectedVehicleClass?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...quotaUpdateForm}>
            <form onSubmit={quotaUpdateForm.handleSubmit((data) => setIsConfirmDialogOpen(true))} className="space-y-4">
              <FormField
                control={quotaUpdateForm.control}
                name="fuelQuotaAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quota Amount (Liters)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.1" />
                    </FormControl>
                    <FormDescription>
                      Current amount: {selectedVehicleClass?.fuelQuotaAmount} liters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={quotaUpdateForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Explain why you're changing the quota amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Quota</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Quota Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the quota amount for {selectedVehicleClass?.code} - {selectedVehicleClass?.name} from {selectedVehicleClass?.fuelQuotaAmount} liters to {quotaUpdateForm.getValues().fuelQuotaAmount} liters?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={quotaUpdateForm.handleSubmit(onQuotaUpdateSubmit)}>
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quota History</DialogTitle>
            <DialogDescription>
              History of quota changes for {selectedVehicleClass?.code} - {selectedVehicleClass?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {quotaHistory
              .filter(history => history.vehicleClassId === selectedVehicleClass?.id)
              .length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No history found for this vehicle class</p>
            ) : (
              <div className="space-y-4">
                {quotaHistory
                  .filter(history => history.vehicleClassId === selectedVehicleClass?.id)
                  .map(history => (
                    <div key={history.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{formatDate(history.changedAt)}</p>
                          <p className="text-sm text-muted-foreground">By: {history.changedBy}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{history.oldQuotaAmount} L</Badge>
                          <span>→</span>
                          <Badge variant="primary">{history.newQuotaAmount} L</Badge>
                        </div>
                      </div>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Reason:</span> {history.reason || "No reason provided"}
                      </p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
