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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import Link from "next/link";
import {
  History,
  RefreshCw,
  Calendar,
  ChevronRight,
  ArrowUpDown,
  Search,
  Info,
  FileText,
  Car,
  User,
  Fuel,
  Clock,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

// Define the transaction item type
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

export default function TransactionHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedFuelType, setSelectedFuelType] = useState<string | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const startDateStr = startDate ? startDate.toISOString() : undefined;
        const endDateStr = endDate ? endDate.toISOString() : undefined;

        const response = await apiService.getTransactionHistory(
          currentPage,
          pageSize,
          startDateStr,
          endDateStr,
          selectedFuelType || undefined
        );

        if (response.error) {
          console.error("Error fetching transactions:", response.error);
          setError(response.error);
          toast.error("Failed to load transaction data");
          setTransactions([]);
        } else if (response.data) {
          setTransactions(response.data.content || []);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else {
          setTransactions([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (err) {
        console.error("Error fetching transaction data:", err);
        setError("Failed to load transaction data. Please try again.");
        toast.error("Failed to load transaction data");
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, currentPage, pageSize, startDate, endDate, selectedFuelType]);

  // Handle opening the details dialog
  const handleOpenDetailsDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedFuelType(null);
    toast.info("Filters cleared");
  };

  // Format fuel type for display
  const formatFuelType = (fuelType: string) => {
    switch (fuelType) {
      case "OCTANE_92":
        return "92 OCTANE PETROL";
      case "OCTANE_95":
        return "95 OCTANE PETROL";
      case "AUTO_DIESEL":
        return "AUTO DIESEL";
      case "SUPER_DIESEL":
        return "SUPER DIESEL";
      case "KEROSENE":
        return "KEROSENE";
      default:
        return fuelType;
    }
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
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 fixed top-0 left-0 right-0">
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
                <h1 className="text-2xl md:text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">View and filter your fuel transaction records</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter transactions by date range and fuel type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">End Date</label>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-[200px]">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <Select
                    value={selectedFuelType || "all"}
                    onValueChange={(value) => setSelectedFuelType(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
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
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setCurrentPage(0);
                      toast.info("Refreshing transaction data");
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <ErrorMessage message={error} />
          )}

          {/* Empty state */}
          {!isLoading && !error && transactions.length === 0 && (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Transactions Found</h3>
                <p className="text-muted-foreground text-center mt-2 mb-6">
                  There are no transactions matching your filter criteria.
                </p>
                <Button onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transactions table */}
          {!isLoading && !error && transactions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Transactions</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Showing {transactions.length} of {totalElements} transactions
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Fuel Type</TableHead>
                        <TableHead className="text-right">Amount (L)</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>{transaction.vehicleRegistrationNumber}</TableCell>
                          <TableCell>{formatFuelType(transaction.fuelType)}</TableCell>
                          <TableCell className="text-right">{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{transaction.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{transaction.totalPrice.toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(transaction.transactionDate), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDetailsDialog(transaction)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setCurrentPage(0);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="10 per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current page
                        let pageToShow;
                        if (totalPages <= 5) {
                          pageToShow = i;
                        } else if (currentPage < 3) {
                          pageToShow = i;
                        } else if (currentPage > totalPages - 4) {
                          pageToShow = totalPages - 5 + i;
                        } else {
                          pageToShow = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageToShow}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageToShow)}
                              isActive={currentPage === pageToShow}
                            >
                              {pageToShow + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage === totalPages - 1}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Car className="h-4 w-4" /> Vehicle
                  </h4>
                  <p className="text-sm">{selectedTransaction.vehicleRegistrationNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Fuel className="h-4 w-4" /> Fuel Type
                  </h4>
                  <p className="text-sm">{formatFuelType(selectedTransaction.fuelType)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Droplet className="h-4 w-4" /> Amount
                  </h4>
                  <p className="text-sm">{selectedTransaction.amount.toLocaleString()} liters</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Unit Price
                  </h4>
                  <p className="text-sm">Rs. {selectedTransaction.unitPrice.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Total Price
                </h4>
                <p className="text-lg font-bold">Rs. {selectedTransaction.totalPrice.toLocaleString()}</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Transaction Date
                </h4>
                <p className="text-sm">{format(new Date(selectedTransaction.transactionDate), "PPpp")}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
