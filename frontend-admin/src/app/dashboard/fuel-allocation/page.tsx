"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { QuotaManagement } from "@/components/quota-management";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Main page for managing fuel quotas and allocations
export default function FuelAllocationPage() {
  const { isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aggregate loading states for unified UI control
  const isPageLoading = authLoading || isLoading;

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Navigation - positioned top-left */}
      <div className="absolute top-4 left-4 z-10">
        <MagicBackButton />
      </div>

      {/* Theme toggle - persistent bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content container with responsive layout */}
      <div className="flex-1 container max-w-screen-lg mx-auto py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-8">Fuel Quota Management</h1>

          {/* Conditional rendering based on auth and loading states */}
          {isPageLoading ? (
            <Loading />
          ) : authError ? (
            <ErrorMessage message={authError} />
          ) : !isAuthenticated ? (
            <ErrorMessage message="You must be logged in to access this page" />
          ) : (
            // Main quota management interface
            <div className="w-full max-w-3xl mx-auto">
              <QuotaManagement />
            </div>
          )}
        </div>
      </div>

      {/* Global toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
