"use client";

import { ModeToggle } from "@/components/mode-toggle";
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
import { Car } from "lucide-react";

export default function AddVehiclePage() {
  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
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

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Please provide your vehicle details as per the registration certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    The vehicle registration form is under development. Please check back later.
                  </p>
                  <Button asChild>
                    <a href="/dashboard/vehicles">
                      Return to Vehicles
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
