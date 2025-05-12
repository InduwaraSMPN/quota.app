"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";
import { VerificationPendingScreen, VerificationStatus } from "@/components/auth/VerificationPendingScreen";
import { apiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";

export default function VerificationStatusPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<VerificationStatus>("PENDING");
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!email) {
        setIsLoading(false);
        return;
      }

      try {
        // Call API to check verification status
        const response = await apiService.checkStationVerificationStatus({ email });
        
        if (response.data) {
          setStatus(response.data.status);
          setRejectionReason(response.data.rejectionReason);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [email]);

  return (
    <div className="flex flex-col min-h-svh w-full relative">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        {isLoading ? (
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <VerificationPendingScreen 
            status={status} 
            rejectionReason={rejectionReason}
            email={email || undefined}
          />
        )}
      </div>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
