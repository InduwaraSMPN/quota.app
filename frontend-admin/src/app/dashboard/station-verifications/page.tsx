"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";

// Define types
type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface StationVerification {
  id: string;
  stationId: string;
  stationName: string;
  businessName: string;
  ownerName: string;
  email: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export default function StationVerificationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [verifications, setVerifications] = useState<StationVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<StationVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch verifications on component mount
  useEffect(() => {
    fetchVerifications();
  }, []);

  // Filter verifications based on active tab
  const filteredVerifications = verifications.filter((verification) => {
    if (activeTab === "pending") return verification.status === "PENDING";
    if (activeTab === "verified") return verification.status === "VERIFIED";
    if (activeTab === "rejected") return verification.status === "REJECTED";
    return true;
  });

  // Fetch verifications from API
  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getStationVerifications();
      if (response.data) {
        setVerifications(response.data);
      } else {
        toast.error("Failed to fetch station verifications");
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("An error occurred while fetching verifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification status update
  const handleUpdateStatus = async (status: VerificationStatus) => {
    if (!selectedVerification) return;

    setIsSubmitting(true);
    try {
      const response = await apiService.updateStationVerificationStatus({
        verificationId: selectedVerification.id,
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
      });

      if (response.data && response.data.success) {
        toast.success(`Station ${status === "VERIFIED" ? "approved" : "rejected"} successfully`);
        
        // Update local state
        setVerifications((prev) =>
          prev.map((v) =>
            v.id === selectedVerification.id
              ? { ...v, status, rejectionReason: status === "REJECTED" ? rejectionReason : undefined }
              : v
          )
        );
        
        setIsDialogOpen(false);
      } else {
        toast.error(response.error || "Failed to update verification status");
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("An error occurred while updating verification status");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view details
  const handleViewDetails = (verification: StationVerification) => {
    setSelectedVerification(verification);
    setRejectionReason(verification.rejectionReason || "");
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-svh w-full relative">
      {/* Logo at the top */}
      <div className="absolute top-4 left-4 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col p-6 md:p-10 pt-20">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Station Verifications</h1>

          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="verified">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "pending" && "Pending Verifications"}
                  {activeTab === "verified" && "Approved Stations"}
                  {activeTab === "rejected" && "Rejected Stations"}
                  {activeTab === "all" && "All Station Verifications"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "pending" && "Review and approve or reject station registrations"}
                  {activeTab === "verified" && "List of approved station registrations"}
                  {activeTab === "rejected" && "List of rejected station registrations"}
                  {activeTab === "all" && "Complete list of all station verifications"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : filteredVerifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {activeTab !== "all" ? activeTab : ""} verifications found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Station Name</TableHead>
                          <TableHead>Business Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVerifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">{verification.stationName}</TableCell>
                            <TableCell>{verification.businessName}</TableCell>
                            <TableCell>{verification.ownerName}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  verification.status === "PENDING"
                                    ? "outline"
                                    : verification.status === "VERIFIED"
                                    ? "success"
                                    : "destructive"
                                }
                              >
                                {verification.status === "PENDING" && (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {verification.status === "VERIFIED" && (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                )}
                                {verification.status === "REJECTED" && (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {verification.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(verification.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(verification)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>

      {/* Verification Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Station Verification Details</DialogTitle>
            <DialogDescription>
              Review the station details and approve or reject the registration
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Station Name</p>
                  <p className="text-sm text-muted-foreground">{selectedVerification.stationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-sm text-muted-foreground">{selectedVerification.businessName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Owner Name</p>
                  <p className="text-sm text-muted-foreground">{selectedVerification.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedVerification.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    variant={
                      selectedVerification.status === "PENDING"
                        ? "outline"
                        : selectedVerification.status === "VERIFIED"
                        ? "success"
                        : "destructive"
                    }
                    className="mt-1"
                  >
                    {selectedVerification.status === "PENDING" && (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {selectedVerification.status === "VERIFIED" && (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {selectedVerification.status === "REJECTED" && (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {selectedVerification.status}
                  </Badge>
                </div>
              </div>

              {selectedVerification.status === "PENDING" && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rejection Reason (if rejecting)</p>
                    <Textarea
                      placeholder="Enter reason for rejection"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedVerification.status === "REJECTED" && selectedVerification.rejectionReason && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-sm text-destructive">{selectedVerification.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedVerification && selectedVerification.status === "PENDING" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="w-full sm:w-auto"
                >
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleUpdateStatus("VERIFIED")}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Approve
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
