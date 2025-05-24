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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Search,
  Building,
  Edit,
  Eye,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define station type
interface StationDetails {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerContactNumber: string;
  businessRegistrationNumber: string;
  businessName: string;
  businessAddress: string;
  verificationStatus: string;
  rejectionReason?: string;
  fuelTypes: Array<{
    fuelType: string;
    isAvailable: boolean;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Define form schema for station edit
const stationEditSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  businessAddress: z.string().min(5, "Business address must be at least 5 characters"),
});

// Define form schema for rejection reason
const rejectionSchema = z.object({
  rejectionReason: z.string().min(5, "Rejection reason must be at least 5 characters"),
});

// Define form schema for search
const searchSchema = z.object({
  search: z.string().optional(),
});

export default function StationsManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stations, setStations] = useState<StationDetails[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stations on component mount and when dependencies change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStations();
  }, [isAuthenticated, currentPage, pageSize, sortField, sortDirection, statusFilter]);

  // Function to fetch stations from API
  const fetchStations = async (search?: string) => {
    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("size", pageSize.toString());
      params.append("sort", sortField);
      params.append("direction", sortDirection);

      if (search) {
        params.append("search", search);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const response = await apiService.getFuelStations(params.toString());

      if (response.error) {
        setError(response.error);
        toast.error("Failed to load stations");
        setStations([]);
      } else if (response.data) {
        setStations(response.data.stations);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
        setCurrentPage(response.data.currentPage);
      } else {
        setStations([]);
        setError("No station data available");
        toast.error("No station data available");
      }
    } catch (err) {
      console.error("Error fetching stations:", err);
      setError("Failed to load stations. Please try again.");
      toast.error("Failed to load stations");
      setStations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to handle search submission
  const handleSearch = () => {
    fetchStations(searchTerm);
  };

  // Function to handle station edit submission
  const handleEditSubmit = async (data: { businessName: string; businessAddress: string }) => {
    if (!selectedStation) return;

    try {
      const response = await apiService.updateFuelStation(selectedStation.id, data);

      if (response.error) {
        toast.error("Failed to update station");
      } else {
        toast.success("Station updated successfully");
        setIsEditDialogOpen(false);
        fetchStations(); // Refresh the station list
      }
    } catch (err) {
      console.error("Error updating station:", err);
      toast.error("Failed to update station");
    }
  };

  // Function to handle verification status change
  const handleVerificationChange = async () => {
    if (!selectedStation) return;

    try {
      const data = {
        status: verificationAction === "approve" ? "VERIFIED" : "REJECTED",
        rejectionReason: verificationAction === "reject" ? rejectionReason : undefined
      };

      const response = await apiService.updateFuelStationVerificationStatus(selectedStation.id, data);

      if (response.error) {
        toast.error(`Failed to ${verificationAction} station`);
      } else {
        toast.success(`Station ${verificationAction === "approve" ? "approved" : "rejected"} successfully`);
        setIsVerificationDialogOpen(false);
        setRejectionReason("");
        fetchStations(); // Refresh the station list
      }
    } catch (err) {
      console.error(`Error ${verificationAction}ing station:`, err);
      toast.error(`Failed to ${verificationAction} station`);
    }
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Function to handle view station details
  const handleViewStation = (station: StationDetails) => {
    setSelectedStation(station);
    setIsViewDialogOpen(true);
  };

  // Function to handle edit station
  const handleEditStation = (station: StationDetails) => {
    setSelectedStation(station);
    setIsEditDialogOpen(true);
  };

  // Function to handle verification dialog
  const handleVerificationDialog = (station: StationDetails, action: "approve" | "reject") => {
    setSelectedStation(station);
    setVerificationAction(action);
    setIsVerificationDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                <h1 className="text-2xl md:text-3xl font-bold">Stations Management</h1>
                <p className="text-muted-foreground">Manage fuel stations in the system</p>
              </div>
            </div>
            <Button
              onClick={() => fetchStations()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Find and filter fuel stations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex w-full items-center space-x-2">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by name or address..."
                        className="w-full pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <Button type="button" onClick={handleSearch} disabled={isRefreshing}>Search</Button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-[200px]">
                    <Select
                      value={statusFilter || "all"}
                      onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stations</SelectItem>
                        <SelectItem value="PENDING">Pending Verification</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stations Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Fuel Stations</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Total: {totalItems} stations
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("id")}
                      >
                        ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("businessName")}
                      >
                        Station Name {sortField === "businessName" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("verificationStatus")}
                      >
                        Status {sortField === "verificationStatus" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isRefreshing ? (
                      // Skeleton loading state
                      Array.from({ length: pageSize }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : stations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No stations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      stations.map((station) => (
                        <TableRow key={station.id}>
                          <TableCell>{station.id}</TableCell>
                          <TableCell>{station.businessName}</TableCell>
                          <TableCell>{station.ownerName}</TableCell>
                          <TableCell>{station.businessAddress}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                station.verificationStatus === "VERIFIED"
                                  ? "success"
                                  : station.verificationStatus === "REJECTED"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {station.verificationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewStation(station)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditStation(station)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Station
                                </DropdownMenuItem>
                                {station.verificationStatus === "PENDING" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleVerificationDialog(station, "approve")}>
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve Station
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleVerificationDialog(station, "reject")}>
                                      <X className="mr-2 h-4 w-4" />
                                      Reject Station
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} stations
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                          setPageSize(parseInt(value));
                          setCurrentPage(0); // Reset to first page when changing page size
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
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {currentPage + 1} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* View Station Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Station Details</DialogTitle>
            <DialogDescription>
              Detailed information about the fuel station.
            </DialogDescription>
          </DialogHeader>
          {selectedStation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
                  <p>{selectedStation.id}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Business Name</h4>
                  <p>{selectedStation.businessName}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Business Registration Number</h4>
                  <p>{selectedStation.businessRegistrationNumber}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Business Address</h4>
                  <p>{selectedStation.businessAddress}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Owner Name</h4>
                  <p>{selectedStation.ownerName}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Owner Email</h4>
                  <p>{selectedStation.ownerEmail}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Owner Contact Number</h4>
                  <p>{selectedStation.ownerContactNumber}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Verification Status</h4>
                  <Badge
                    variant={
                      selectedStation.verificationStatus === "VERIFIED"
                        ? "success"
                        : selectedStation.verificationStatus === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedStation.verificationStatus}
                  </Badge>
                </div>
                {selectedStation.verificationStatus === "REJECTED" && selectedStation.rejectionReason && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Rejection Reason</h4>
                    <p>{selectedStation.rejectionReason}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Fuel Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStation.fuelTypes.map((fuelType, index) => (
                      <Badge
                        key={index}
                        variant={fuelType.isAvailable ? "success" : "secondary"}
                      >
                        {fuelType.fuelType} - {fuelType.unitPrice.toFixed(2)} LKR
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                  <p>{formatDate(selectedStation.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Updated At</h4>
                  <p>{formatDate(selectedStation.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedStation && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditStation(selectedStation);
              }}>
                Edit Station
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Station Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Station</DialogTitle>
            <DialogDescription>
              Update fuel station information.
            </DialogDescription>
          </DialogHeader>
          {selectedStation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Business Name</FormLabel>
                <Input
                  defaultValue={selectedStation.businessName}
                  onChange={(e) => {
                    if (selectedStation) {
                      setSelectedStation({
                        ...selectedStation,
                        businessName: e.target.value
                      });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Business Address</FormLabel>
                <Input
                  defaultValue={selectedStation.businessAddress}
                  onChange={(e) => {
                    if (selectedStation) {
                      setSelectedStation({
                        ...selectedStation,
                        businessAddress: e.target.value
                      });
                    }
                  }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleEditSubmit({
                  businessName: selectedStation.businessName,
                  businessAddress: selectedStation.businessAddress
                })}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <AlertDialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verificationAction === "approve" ? "Approve Station" : "Reject Station"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verificationAction === "approve"
                ? "This will approve the station, allowing it to operate in the system."
                : "This will reject the station registration. Please provide a reason for rejection."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {verificationAction === "reject" && (
            <div className="py-4">
              <FormLabel>Rejection Reason</FormLabel>
              <Input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                className="mt-2"
              />
              {rejectionReason.length < 5 && (
                <p className="text-sm text-destructive mt-1">
                  Rejection reason must be at least 5 characters
                </p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerificationChange}
              disabled={verificationAction === "reject" && rejectionReason.length < 5}
            >
              {verificationAction === "approve" ? "Approve Station" : "Reject Station"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
