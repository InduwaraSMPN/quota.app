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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { useAuth } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Search,
  User,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatDate } from "@/lib/utils";

// Define comprehensive user type
interface UserDetails {
  id: number;
  email: string;
  userType: 'VEHICLE_OWNER' | 'STATION_OWNER' | 'ADMIN';
  fullName: string;
  nicNumber: string;
  address?: string;
  contactNumber: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string;
  // Additional fields for specific user types
  employeeId?: string; // For admin users
  departmentName?: string; // For admin users
  businessName?: string; // For station owners
  businessRegistrationNumber?: string; // For station owners
}

// Define form schema for user edit
const userEditSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid contact number format"),
});

// Define form schema for search
const searchSchema = z.object({
  search: z.string().optional(),
});

export default function UsersManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"enable" | "disable">("enable");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [userTypeFilter, setUserTypeFilter] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create form for search
  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  // Create form for user edit
  const editForm = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: "",
      address: "",
      contactNumber: "",
    },
  });

  // Fetch users on component mount and when dependencies change
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUsers();
  }, [isAuthenticated, currentPage, pageSize, sortField, sortDirection, statusFilter, userTypeFilter]);

  // Function to fetch users from API
  const fetchUsers = async (searchTerm?: string) => {
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

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (statusFilter !== null) {
        params.append("status", statusFilter === "active" ? "true" : "false");
      }

      if (userTypeFilter !== null) {
        params.append("userType", userTypeFilter);
      }

      const response = await apiService.getAllUsers(params.toString());

      if (response.error) {
        setError(response.error);
        toast.error("Failed to load users");
        setUsers([]);
      } else if (response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
        setCurrentPage(response.data.currentPage);
      } else {
        setUsers([]);
        setError("No user data available");
        toast.error("No user data available");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Function to handle search submission
  const onSearchSubmit = (data: z.infer<typeof searchSchema>) => {
    fetchUsers(data.search || "");
  };

  // Function to handle user edit submission
  const onEditSubmit = async (data: z.infer<typeof userEditSchema>) => {
    if (!selectedUser) return;

    try {
      const response = await apiService.updateUser(selectedUser.id, data);

      if (response.error) {
        toast.error("Failed to update user");
      } else {
        toast.success("User updated successfully");
        setIsEditDialogOpen(false);
        fetchUsers(); // Refresh the user list
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Failed to update user");
    }
  };

  // Function to handle user status change
  const handleStatusChange = async () => {
    if (!selectedUser) return;

    try {
      const response = await apiService.updateUserStatus(
        selectedUser.id,
        { isActive: statusAction === "enable" }
      );

      if (response.error) {
        toast.error(`Failed to ${statusAction} user`);
      } else {
        toast.success(`User ${statusAction}d successfully`);
        setIsStatusDialogOpen(false);
        fetchUsers(); // Refresh the user list
      }
    } catch (err) {
      console.error(`Error ${statusAction}ing user:`, err);
      toast.error(`Failed to ${statusAction} user`);
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

  // Function to handle view user details
  const handleViewUser = async (user: UserDetails) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  // Function to handle edit user
  const handleEditUser = (user: UserDetails) => {
    setSelectedUser(user);
    // Set form default values
    editForm.reset({
      fullName: user.fullName,
      address: user.address,
      contactNumber: user.contactNumber,
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle status change dialog
  const handleStatusDialog = (user: UserDetails, action: "enable" | "disable") => {
    setSelectedUser(user);
    setStatusAction(action);
    setIsStatusDialogOpen(true);
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
                <h1 className="text-2xl md:text-3xl font-bold">Users Management</h1>
                <p className="text-muted-foreground">Manage all users in the quota.app system</p>
              </div>
            </div>
            <Button
              onClick={() => fetchUsers()}
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
              <CardDescription>Find and filter users across all types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Form {...searchForm}>
                    <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="flex w-full items-center space-x-2">
                      <FormField
                        control={searchForm.control}
                        name="search"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Search by email..."
                                  className="w-full pl-9"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isRefreshing}>Search</Button>
                    </form>
                  </Form>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-[200px]">
                    <Select
                      value={userTypeFilter === null ? "all" : userTypeFilter}
                      onValueChange={(value) => setUserTypeFilter(value === "all" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All User Types</SelectItem>
                        <SelectItem value="VEHICLE_OWNER">Vehicle Owners</SelectItem>
                        <SelectItem value="STATION_OWNER">Station Owners</SelectItem>
                        <SelectItem value="ADMIN">Admin Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-[200px]">
                    <Select
                      value={statusFilter === null ? "all" : statusFilter}
                      onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Users</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Total: {totalItems} users
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
                        onClick={() => handleSortChange("email")}
                      >
                        Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>NIC</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSortChange("isActive")}
                      >
                        Status {sortField === "isActive" && (sortDirection === "asc" ? "↑" : "↓")}
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
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                        </TableRow>
                      ))
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.userType === 'VEHICLE_OWNER' ? 'Vehicle Owner' :
                               user.userType === 'STATION_OWNER' ? 'Station Owner' :
                               user.userType === 'ADMIN' ? 'Admin' : user.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>{user.nicNumber}</TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "success" : "destructive"}>
                              {user.isActive ? "Active" : "Inactive"}
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
                                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.isActive ? (
                                  <DropdownMenuItem onClick={() => handleStatusDialog(user, "disable")}>
                                    <X className="mr-2 h-4 w-4" />
                                    Disable Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleStatusDialog(user, "enable")}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Enable Account
                                  </DropdownMenuItem>
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
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} users
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

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
                  <p>{selectedUser.id}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">User Type</h4>
                  <Badge variant="outline">
                    {selectedUser.userType === 'VEHICLE_OWNER' ? 'Vehicle Owner' :
                     selectedUser.userType === 'STATION_OWNER' ? 'Station Owner' :
                     selectedUser.userType === 'ADMIN' ? 'Admin' : selectedUser.userType}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                  <p>{selectedUser.fullName}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">NIC Number</h4>
                  <p>{selectedUser.nicNumber}</p>
                </div>
                {selectedUser.address && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                    <p>{selectedUser.address}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Number</h4>
                  <p>{selectedUser.contactNumber}</p>
                </div>
                {/* Admin-specific fields */}
                {selectedUser.userType === 'ADMIN' && selectedUser.employeeId && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Employee ID</h4>
                    <p>{selectedUser.employeeId}</p>
                  </div>
                )}
                {selectedUser.userType === 'ADMIN' && selectedUser.departmentName && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                    <p>{selectedUser.departmentName}</p>
                  </div>
                )}
                {/* Station Owner-specific fields */}
                {selectedUser.userType === 'STATION_OWNER' && selectedUser.businessName && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Business Name</h4>
                    <p>{selectedUser.businessName}</p>
                  </div>
                )}
                {selectedUser.userType === 'STATION_OWNER' && selectedUser.businessRegistrationNumber && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Business Registration Number</h4>
                    <p>{selectedUser.businessRegistrationNumber}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={selectedUser.isActive ? "success" : "destructive"}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Email Verified</h4>
                  <Badge variant={selectedUser.emailVerified ? "success" : "destructive"}>
                    {selectedUser.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Last Login</h4>
                  <p>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "Never"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedUser && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditUser(selectedUser);
              }}>
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction === "enable" ? "Enable User Account" : "Disable User Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === "enable"
                ? "This will enable the user account, allowing them to log in and use the system."
                : "This will disable the user account, preventing them from logging in to the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              {statusAction === "enable" ? "Enable Account" : "Disable Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
