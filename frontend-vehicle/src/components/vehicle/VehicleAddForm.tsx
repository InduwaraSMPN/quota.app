"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleInformationSignup } from "@/components/auth/VehicleInformationSignup";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { type VehicleInfoData } from "@/app/actions/session";

interface VehicleAddFormProps {
  className?: string;
}

export function VehicleAddForm({ className }: VehicleAddFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dmtValidationErrors, setDmtValidationErrors] = useState<string[]>([]);
  const [dmtValidationFailed, setDmtValidationFailed] = useState(false);

  // Handle form submission
  const handleVehicleSubmit = async (data: VehicleInfoData) => {
    setIsSubmitting(true);
    setDmtValidationErrors([]);
    setDmtValidationFailed(false);

    try {
      // Prepare the vehicle data for the backend
      const vehicleData = {
        registrationNumber: data.registrationNumber,
        engineNumber: data.engineNumber,
        chassisNumber: data.chassisNumber,
        make: data.make,
        model: data.model,
        yearOfManufacture: parseInt(data.yearOfManufacture),
        vehicleClass: data.vehicleClass,
        typeOfBody: data.typeOfBody,
        fuelType: data.fuelType,
        engineCapacity: parseInt(data.engineCapacity),
        color: data.color,
        grossVehicleWeight: parseInt(data.grossVehicleWeight),
        dateOfFirstRegistration: data.dateOfFirstRegistration,
        countryOfOrigin: data.countryOfOrigin
      };

      console.log("Sending vehicle data to backend:", vehicleData);

      // Make API call to add the vehicle
      const response = await apiService.addVehicle(vehicleData);

      if (response.data && response.status === 200) {
        toast.success("Vehicle added successfully!");
        
        // Redirect to vehicles list after successful addition
        setTimeout(() => {
          router.push('/dashboard/vehicles');
        }, 2000);
      } else {
        // Handle validation errors or other errors
        const errorMessage = response.error || "Failed to add vehicle";
        
        // Check if it's a DMT validation error
        if (errorMessage.includes("validation failed")) {
          setDmtValidationFailed(true);
          setDmtValidationErrors([errorMessage]);
          toast.error("Vehicle validation failed. Please check your details and try again.");
        } else {
          toast.error(errorMessage);
        }
        
        console.error("Add vehicle error:", response);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/dashboard/vehicles');
  };

  return (
    <div className={className}>
      <VehicleInformationSignup
        onSubmit={handleVehicleSubmit}
        onBack={handleBack}
        isSubmitting={isSubmitting}
        dmtValidationFailed={dmtValidationFailed}
        dmtValidationErrors={dmtValidationErrors}
      />
    </div>
  );
}
