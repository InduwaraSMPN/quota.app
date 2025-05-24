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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/hooks/useAuth";
import {
  Eye,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Car,
  Building2,
  Fuel,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

// Define transaction type
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

// Define pagination info type
interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Define filters type
interface Filters {
  vehicleId?: number;
  stationId?: number;
  startDate?: string;
  endDate?: string;
  fuelType?: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 0,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("transactionDate");
  const [sortDirection, setSortDirection] = useState("desc");
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({});
  const [tempFilters, setTempFilters] = useState<Filters>({});

  // Fetch transactions on component mount and when pagination/filters change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTransactions();
  }, [isAuthenticated, currentPage, pageSize, sortField, sortDirection, filters]);

  // Function to fetch transactions from API
  const fetchTransactions = async () => {
    if (currentPage === 0) {
      setIsLoading(true);
    }
    setError(null);
    setIsRefreshing(true);

    try {
      const response = await apiService.getAllTransactions(
        currentPage,
        pageSize,
        sortField,
        sortDirection,
        filters
      );
      
      if (response.error) {
        setError(response.error);
        toast.error("Failed to load transactions");
        setTransactions([]);
        setPagination({ currentPage: 0, totalItems: 0, totalPages: 0 });
      } else if (response.data) {
        setTransactions(response.data.transactions || []);
        setPagination({
          currentPage: response.data.currentPage || 0,
          totalItems: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 0,
        });
      } else {
        setTransactions([]);
        setPagination({ currentPage: 0, totalItems: 0, totalPages: 0 });
        setError("No transaction data available");
        toast.error("No transaction data available");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions. Please try again.");
      toast.error("Failed to load transactions");
      setTransactions([]);
      setPagination({ currentPage: 0, totalItems: 0, totalPages: 0 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to handle view transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to handle page size change
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(0); // Reset to first page
  };

  // Function to handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(0); // Reset to first page
  };

  // Function to apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(0); // Reset to first page
    setIsFilterDialogOpen(false);
  };

  // Function to clear filters
  const clearFilters = () => {
    setFilters({});
    setTempFilters({});
    setCurrentPage(0); // Reset to first page
    setIsFilterDialogOpen(false);
  };

  // Function to format fuel type for display
  const formatFuelType = (fuelType: string) => {
    switch (fuelType) {
      case "OCTANE_92":
        return "92 Octane Petrol";
      case "OCTANE_95":
        return "95 Octane Petrol";
      case "AUTO_DIESEL":
        return "Auto Diesel";
      case "SUPER_DIESEL":
        return "Super Diesel";
      case "KEROSENE":
        return "Kerosene";
      default:
        return fuelType;
    }
  };

  // Function to get fuel type badge color
  const getFuelTypeBadgeColor = (fuelType: string) => {
    switch (fuelType) {
      case "OCTANE_92":
        return "bg-blue-100 text-blue-800";
      case "OCTANE_95":
        return "bg-green-100 text-green-800";
      case "AUTO_DIESEL":
        return "bg-yellow-100 text-yellow-800";
      case "SUPER_DIESEL":
        return "bg-orange-100 text-orange-800";
      case "KEROSENE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                  <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
                  <p className="text-muted-foreground">View and manage fuel transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsFilterDialogOpen(true)} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button 
                  onClick={fetchTransactions} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  {pagination.totalItems > 0 
                    ? `Showing ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, pagination.totalItems)} of ${pagination.totalItems} transactions`
                    : "No transactions found"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange("id")}
                        >
                          ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange("vehicleRegistrationNumber")}
                        >
                          Vehicle {sortField === "vehicleRegistrationNumber" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange("stationName")}
                        >
                          Station {sortField === "stationName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead>Fuel Type</TableHead>
                        <TableHead className="text-right">Amount (L)</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSortChange("transactionDate")}
                        >
                          Date {sortField === "transactionDate" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRefreshing ? (
                        // Skeleton loading state
                        Array.from({ length: pageSize }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-[60px]" /></TableCell>
                          </TableRow>
                        ))
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.vehicleRegistrationNumber}</TableCell>
                            <TableCell>{transaction.stationName}</TableCell>
                            <TableCell>
                              <Badge className={getFuelTypeBadgeColor(transaction.fuelType)}>
                                {formatFuelType(transaction.fuelType)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{transaction.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Rs. {transaction.unitPrice.toLocaleString()}</TableCell>
                            <TableCell className="text-right">Rs. {transaction.totalPrice.toLocaleString()}</TableCell>
                            <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize">Rows per page:</Label>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm">
                      Page {currentPage + 1} of {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Car className="h-4 w-4" /> Vehicle Information
                </h4>
                <p className="text-sm">Registration: {selectedTransaction.vehicleRegistrationNumber}</p>
                <p className="text-sm">Vehicle ID: {selectedTransaction.vehicleId}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Station Information
                </h4>
                <p className="text-sm">Name: {selectedTransaction.stationName}</p>
                <p className="text-sm">Station ID: {selectedTransaction.stationId}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Fuel className="h-4 w-4" /> Fuel Information
                </h4>
                <p className="text-sm">Type: {formatFuelType(selectedTransaction.fuelType)}</p>
                <p className="text-sm">Amount: {selectedTransaction.amount.toLocaleString()} liters</p>
                <p className="text-sm">Unit Price: Rs. {selectedTransaction.unitPrice.toLocaleString()}</p>
                <p className="text-sm font-medium">Total Price: Rs. {selectedTransaction.totalPrice.toLocaleString()}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Transaction Date
                </h4>
                <p className="text-sm">{formatDateTime(selectedTransaction.transactionDate)}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down the transaction list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleId">Vehicle ID</Label>
              <Input
                id="vehicleId"
                type="number"
                placeholder="Enter vehicle ID"
                value={tempFilters.vehicleId || ""}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  vehicleId: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="stationId">Station ID</Label>
              <Input
                id="stationId"
                type="number"
                placeholder="Enter station ID"
                value={tempFilters.stationId || ""}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  stationId: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={tempFilters.startDate || ""}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  startDate: e.target.value || undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={tempFilters.endDate || ""}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  endDate: e.target.value || undefined
                })}
              />
            </div>

            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select 
                value={tempFilters.fuelType || ""} 
                onValueChange={(value) => setTempFilters({
                  ...tempFilters,
                  fuelType: value || undefined
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="OCTANE_92">92 Octane Petrol</SelectItem>
                  <SelectItem value="OCTANE_95">95 Octane Petrol</SelectItem>
                  <SelectItem value="AUTO_DIESEL">Auto Diesel</SelectItem>
                  <SelectItem value="SUPER_DIESEL">Super Diesel</SelectItem>
                  <SelectItem value="KEROSENE">Kerosene</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
