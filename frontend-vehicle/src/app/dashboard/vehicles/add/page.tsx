"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { Logo } from "@/components/logo";
import { VehicleAddForm } from "@/components/vehicle/VehicleAddForm";
import { Toaster } from "@/components/ui/sonner";

export default function AddVehiclePage() {
  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <MagicBackButton backLink="/dashboard/vehicles" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Add New Vehicle</h1>
              <p className="text-muted-foreground">Enter your vehicle details to register it in the system</p>
            </div>
          </div>

          {/* Vehicle Add Form */}
          <VehicleAddForm />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
