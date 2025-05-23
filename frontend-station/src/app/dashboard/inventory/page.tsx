"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import {
  Fuel,
  Droplet,
  Edit,
  History,
  Plus,
  RefreshCw,
  Calendar,
  ChevronRight,
  ArrowUpDown,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

// Define the inventory item type
interface InventoryItem {
  id: number;
  fuelType: string;
  displayName: string;
  currentStock: number;
  capacity: number;
  percentage: number;
  lastRefillDate?: string;
  nextRefillDate?: string;
  updatedAt: string;
}

// Define the inventory history item type
interface InventoryHistoryItem {
  id: number;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: string;
  notes?: string;
  changedBy: string;
  createdAt: string;
}

// Define the form schema for updating inventory
const inventoryUpdateSchema = z.object({
  currentStock: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    { message: "Current stock must be a positive number" }
  ),
  capacity: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Capacity must be a positive number" }
  ),
  lastRefillDate: z.date().optional(),
  nextRefillDate: z.date().optional(),
  changeType: z.string(),
  notes: z.string().optional()
});

export default function InventoryManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedFuelType, setSelectedFuelType] = useState<string | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Initialize the form
  const form = useForm<z.infer<typeof inventoryUpdateSchema>>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      currentStock: "",
      capacity: "",
      changeType: "ADJUSTMENT"
    }
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.getInventory(selectedFuelType || undefined);

        if (response.error) {
          console.error("Error fetching inventory:", response.error);
          setError(response.error);
          toast.error("Failed to load inventory data");
          setInventory([]);
        } else if (response.data) {
          setInventory(response.data);
        } else {
          setInventory([]);
          toast.error("No inventory data available");
        }
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to load inventory data. Please try again.");
        toast.error("Failed to load inventory data");
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated, selectedFuelType]);

  // Fetch inventory history
  const fetchInventoryHistory = async (inventoryId: number) => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await apiService.getInventoryHistory(inventoryId);

      if (response.error) {
        console.error("Error fetching inventory history:", response.error);
        setHistoryError(response.error);
        toast.error("Failed to load inventory history");
        setInventoryHistory([]);
      } else if (response.data && response.data.content) {
        setInventoryHistory(response.data.content);
      } else {
        setInventoryHistory([]);
      }
    } catch (err) {
      console.error("Error fetching inventory history:", err);
      setHistoryError("Failed to load inventory history. Please try again.");
      toast.error("Failed to load inventory history");
      setInventoryHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Handle inventory update
  const onSubmit = async (values: z.infer<typeof inventoryUpdateSchema>) => {
    if (!selectedInventoryItem) return;

    try {
      const updateData = {
        currentStock: parseFloat(values.currentStock),
        capacity: parseFloat(values.capacity),
        lastRefillDate: values.lastRefillDate ? values.lastRefillDate.toISOString() : undefined,
        nextRefillDate: values.nextRefillDate ? values.nextRefillDate.toISOString() : undefined,
        changeType: values.changeType,
        notes: values.notes
      };

      const response = await apiService.updateInventory(selectedInventoryItem.id, updateData);

      if (response.error) {
        console.error("Error updating inventory:", response.error);
        toast.error("Failed to update inventory");
      } else {
        toast.success("Inventory updated successfully");
        setIsUpdateDialogOpen(false);

        // Refresh inventory data
        const inventoryResponse = await apiService.getInventory(selectedFuelType || undefined);
        if (inventoryResponse.data) {
          setInventory(inventoryResponse.data);
        }
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      toast.error("Failed to update inventory");
    }
  };

  // Handle opening the update dialog
  const handleOpenUpdateDialog = (item: InventoryItem) => {
    setSelectedInventoryItem(item);

    // Reset form with current values
    form.reset({
      currentStock: item.currentStock.toString(),
      capacity: item.capacity.toString(),
      lastRefillDate: item.lastRefillDate ? new Date(item.lastRefillDate) : undefined,
      nextRefillDate: item.nextRefillDate ? new Date(item.nextRefillDate) : undefined,
      changeType: "ADJUSTMENT",
      notes: ""
    });

    setIsUpdateDialogOpen(true);
  };

  // Handle opening the history dialog
  const handleOpenHistoryDialog = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setIsHistoryDialogOpen(true);
    fetchInventoryHistory(item.id);
  };

  // Calculate color based on percentage
  const getPercentageColor = (percentage: number) => {
    if (percentage <= 20) return "bg-red-500";
    if (percentage <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // If still loading auth, show loading spinner
  if (isAuthLoading) {
    return <Loading />;
  }

  // If not authenticated, show error message
  if (!isAuthLoading && !isAuthenticated) {
    return <ErrorMessage message="You must be logged in to access this page" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 fixed top-0 left-0 right-0">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      <Toaster />

      {/* Main content */}
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <MagicBackButton backLink="/dashboard" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Fuel Inventory Management</h1>
                <p className="text-muted-foreground">Manage and track your fuel inventory levels</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedFuelType || "all"}
                onValueChange={(value) => setSelectedFuelType(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Fuel Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  <SelectItem value="OCTANE_92">92 OCTANE PETROL</SelectItem>
                  <SelectItem value="OCTANE_95">95 OCTANE PETROL</SelectItem>
                  <SelectItem value="AUTO_DIESEL">AUTO DIESEL</SelectItem>
                  <SelectItem value="SUPER_DIESEL">SUPER DIESEL</SelectItem>
                  <SelectItem value="KEROSENE">KEROSENE</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedFuelType(null);
                  toast.info("Refreshing inventory data");
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <ErrorMessage message={error} />
          )}

          {/* Empty state */}
          {!isLoading && !error && inventory.length === 0 && (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Droplet className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Inventory Data Available</h3>
                <p className="text-muted-foreground text-center mt-2 mb-6">
                  There is no fuel inventory data available for your station.
                </p>
                <Button onClick={() => toast.info("Please contact support to set up your inventory")}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Inventory grid */}
          {!isLoading && !error && inventory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{item.displayName}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenHistoryDialog(item)}>
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenUpdateDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Current Stock</span>
                          <span className="text-sm font-medium">
                            {item.currentStock.toLocaleString()} / {item.capacity.toLocaleString()} liters
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${getPercentageColor(item.percentage)} h-full transition-all duration-500 ease-in-out`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}% full
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Last Refill</p>
                          <p className="font-medium">
                            {item.lastRefillDate
                              ? format(new Date(item.lastRefillDate), "MMM d, yyyy")
                              : "Not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Refill</p>
                          <p className="font-medium">
                            {item.nextRefillDate
                              ? format(new Date(item.nextRefillDate), "MMM d, yyyy")
                              : "Not scheduled"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 py-2 px-6">
                    <p className="text-xs text-muted-foreground w-full text-right">
                      Last updated: {format(new Date(item.updatedAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Inventory Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
            <DialogDescription>
              Update the inventory levels for {selectedInventoryItem?.displayName}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock (liters)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Capacity (liters)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lastRefillDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Refill Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextRefillDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Refill Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="changeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select change type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="REFILL">Refill</SelectItem>
                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                        <SelectItem value="CORRECTION">Correction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this inventory update"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Inventory</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Inventory History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Inventory History</DialogTitle>
            <DialogDescription>
              View the history of inventory changes for {selectedInventoryItem?.displayName}
            </DialogDescription>
          </DialogHeader>

          {isHistoryLoading && (
            <div className="py-8">
              <Loading />
            </div>
          )}

          {!isHistoryLoading && historyError && (
            <ErrorMessage message={historyError} />
          )}

          {!isHistoryLoading && !historyError && inventoryHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No History Available</h3>
              <p className="text-muted-foreground text-center mt-2">
                There is no history data available for this inventory item.
              </p>
            </div>
          )}

          {!isHistoryLoading && !historyError && inventoryHistory.length > 0 && (
            <div className="overflow-y-auto max-h-[400px]">
              <div className="space-y-4">
                {inventoryHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {item.changeType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Previous</p>
                        <p className="font-medium">{item.previousStock.toLocaleString()} L</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">New</p>
                        <p className="font-medium">{item.newStock.toLocaleString()} L</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Change</p>
                        <p className={`font-medium ${item.changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.changeAmount >= 0 ? '+' : ''}{item.changeAmount.toLocaleString()} L
                        </p>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 text-sm">
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p>{item.notes}</p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Changed by: {item.changedBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
