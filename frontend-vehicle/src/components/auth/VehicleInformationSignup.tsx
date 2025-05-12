"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema with Zod (same as before)
const formSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, { message: "Registration number is required" })
    .refine((value) => /^[A-Z]{1,3}-\d{4}$/.test(value), {
      message: "Invalid registration number format (e.g., ABC-1234)",
    }),
  engineNumber: z.string().min(1, { message: "Engine number is required" }),
  chassisNumber: z.string().min(1, { message: "Chassis number is required" }),
  make: z.string().min(1, { message: "Make is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  yearOfManufacture: z
    .string()
    .min(1, { message: "Year of manufacture is required" })
    .refine(
      (value) => {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year >= 1900 && year <= currentYear;
      },
      { message: "Invalid year of manufacture" }
    ),
  vehicleClass: z.string().min(1, { message: "Vehicle class is required" }),
  typeOfBody: z.string().min(1, { message: "Type of body is required" }),
  fuelType: z.string().min(1, { message: "Fuel type is required" }),
  engineCapacity: z
    .string()
    .min(1, { message: "Engine capacity is required" })
    .refine(
      (value) => {
        const cc = parseInt(value);
        return !isNaN(cc) && cc > 0;
      },
      { message: "Invalid engine capacity" }
    ),
  color: z.string().min(1, { message: "Color is required" }),
  grossVehicleWeight: z
    .string()
    .min(1, { message: "Gross vehicle weight is required" })
    .refine(
      (value) => {
        const weight = parseInt(value);
        return !isNaN(weight) && weight > 0;
      },
      { message: "Invalid gross vehicle weight" }
    ),
  dateOfFirstRegistration: z
    .string()
    .min(1, { message: "Date of first registration is required" })
    .refine(
      (value) => {
        // Allow empty string initially, or valid date format
        if (!value) return true; // Allow empty, Zod min(1) handles requirement
        const date = new Date(value);
        const currentDate = new Date();
        // Check if it's a valid date and not in the future
        return !isNaN(date.getTime()) && date <= currentDate;
      },
      { message: "Invalid or future date" }
    ),
  countryOfOrigin: z
    .string()
    .min(1, { message: "Country of origin is required" }),
});


// Define the form values type (same as before)
type FormValues = z.infer<typeof formSchema>;

interface VehicleInformationSignupProps {
  className?: string;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
  initialData?: Partial<FormValues>; // Use Partial for flexibility
  isSubmitting?: boolean;
}

export function VehicleInformationSignup({
  className,
  onSubmit: onSubmitProp,
  onBack,
  initialData,
  isSubmitting = false,
  ...props
}: VehicleInformationSignupProps) {
  // Initialize the form with correct defaults matching schema types
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationNumber: initialData?.registrationNumber ?? "",
      engineNumber: initialData?.engineNumber ?? "",
      chassisNumber: initialData?.chassisNumber ?? "",
      make: initialData?.make ?? "",
      model: initialData?.model ?? "",
      yearOfManufacture: initialData?.yearOfManufacture ?? "",
      vehicleClass: initialData?.vehicleClass ?? "",
      typeOfBody: initialData?.typeOfBody ?? "",
      fuelType: initialData?.fuelType ?? "",
      engineCapacity: initialData?.engineCapacity ?? "",
      color: initialData?.color ?? "",
      grossVehicleWeight: initialData?.grossVehicleWeight ?? "",
      dateOfFirstRegistration: initialData?.dateOfFirstRegistration ?? "",
      countryOfOrigin: initialData?.countryOfOrigin ?? "",
    },
  });

  // Update form values when initialData changes (more robust way)
  useEffect(() => {
      if (initialData) {
          // Reset form efficiently if initialData is provided
          form.reset({
              registrationNumber: initialData.registrationNumber ?? "",
              engineNumber: initialData.engineNumber ?? "",
              chassisNumber: initialData.chassisNumber ?? "",
              make: initialData.make ?? "",
              model: initialData.model ?? "",
              yearOfManufacture: initialData.yearOfManufacture ?? "",
              vehicleClass: initialData.vehicleClass ?? "",
              typeOfBody: initialData.typeOfBody ?? "",
              fuelType: initialData.fuelType ?? "",
              engineCapacity: initialData.engineCapacity ?? "",
              color: initialData.color ?? "",
              grossVehicleWeight: initialData.grossVehicleWeight ?? "",
              dateOfFirstRegistration: initialData.dateOfFirstRegistration ?? "",
              countryOfOrigin: initialData.countryOfOrigin ?? "",
          });
      }
  }, [form, initialData]);


  // Handle form submission (same as before)
  function onSubmit(data: FormValues) {
    onSubmitProp(data);
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {/* Increased max-w for better two-column layout */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>
            Please provide your vehicle details as per the registration
            certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Adjusted gap and added items-stretch for consistent cell height */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-stretch">
                {/* --- Field: registrationNumber --- */}
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    // Use flex flex-col h-full for vertical alignment control
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Vehicle Registration Number</FormLabel>
                      {/* Wrap Control and Message, push down with mt-auto */}
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: engineNumber --- */}
                <FormField
                  control={form.control}
                  name="engineNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Engine Number</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="Engine Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: chassisNumber --- */}
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Chassis Number</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="Chassis Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: make --- */}
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Make</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="Toyota, Honda, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: model --- */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Model</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="Corolla, Civic, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: yearOfManufacture --- */}
                <FormField
                  control={form.control}
                  name="yearOfManufacture"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Year of Manufacture</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input
                            placeholder="2020"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear().toString()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: vehicleClass (spans 2 columns) --- */}
                <FormField
                  control={form.control}
                  name="vehicleClass"
                  render={({ field }) => (
                    // No need for h-full here as it spans columns, alignment is less critical
                    <FormItem className="md:col-span-2">
                      <div className="flex justify-between items-center">
                        <FormLabel>Vehicle Class</FormLabel>
                        <a
                          href="https://dmt.gov.lk/index.php?option=com_content&view=article&id=46&Itemid=163&lang=en#"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Reference
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1"> {/* Reduced mb */}
                        As per Section 122 of Motor Traffic Act amended by Act no.08 of 2009
                      </p>
                      {/* Wrap Control and Message */}
                      <div className="space-y-1">
                         <Select
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           value={field.value} // Ensure value is controlled
                         >
                           <FormControl>
                             <SelectTrigger className="w-full">
                               <SelectValue placeholder="Select vehicle class" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             {/* Add a default disabled option if needed */}
                             {/* <SelectItem value="" disabled>Select vehicle class</SelectItem> */}
                             <SelectItem value="A1: Light motor cycles">A1: Light motor cycles</SelectItem>
                             <SelectItem value="A: Motorcycles">A: Motorcycles</SelectItem>
                             <SelectItem value="B1: Motor Tricycle or van">B1: Motor Tricycle or van</SelectItem>
                             <SelectItem value="B: Dual purpose Motor vehicle">B: Dual purpose Motor vehicle</SelectItem>
                             <SelectItem value="C1: Light Motor Lorry">C1: Light Motor Lorry</SelectItem>
                             <SelectItem value="C: Motor Lorry">C: Motor Lorry</SelectItem>
                             <SelectItem value="CE: Heavy Motor Lorry combination">CE: Heavy Motor Lorry combination</SelectItem>
                             <SelectItem value="D1: Light Motor Coach">D1: Light Motor Coach</SelectItem>
                             <SelectItem value="D: Motor Coach">D: Motor Coach</SelectItem>
                             <SelectItem value="DE: Heavy Motor Coach combination">DE: Heavy Motor Coach combination</SelectItem>
                             <SelectItem value="G1: Hand Tractors">G1: Hand Tractors</SelectItem>
                             <SelectItem value="G: Land Vehicle">G: Land Vehicle</SelectItem>
                             <SelectItem value="J: Special purpose Vehicle">J: Special purpose Vehicle</SelectItem>
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: typeOfBody --- */}
                <FormField
                  control={form.control}
                  name="typeOfBody"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Type of Body</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input
                            placeholder="Sedan, Hatchback, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: countryOfOrigin --- */}
                <FormField
                  control={form.control}
                  name="countryOfOrigin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Country of Origin</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="Japan, Germany, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: fuelType (spans 2 columns) --- */}
                 <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    // No need for h-full here
                    <FormItem className="md:col-span-2">
                      <FormLabel>Fuel Type</FormLabel>
                      {/* Wrap Control and Message */}
                      <div className="space-y-1">
                         <Select
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                            value={field.value} // Ensure value is controlled
                         >
                           <FormControl>
                             <SelectTrigger className="w-full">
                               <SelectValue placeholder="Select fuel type" />
                             </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {/* <SelectItem value="" disabled>Select fuel type</SelectItem> */}
                             <SelectItem value="92 OCTANE PETROL">92 OCTANE PETROL</SelectItem>
                             <SelectItem value="95 OCTANE PETROL">95 OCTANE PETROL</SelectItem>
                             <SelectItem value="AUTO DIESEL">AUTO DIESEL</SelectItem>
                             <SelectItem value="SUPER DIESEL">SUPER DIESEL</SelectItem>
                             <SelectItem value="KEROSENE">KEROSENE</SelectItem>
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: engineCapacity --- */}
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Engine Capacity (cc)</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input
                            placeholder="1500"
                            type="number"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: color --- */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Color</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input placeholder="White, Black, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: grossVehicleWeight --- */}
                <FormField
                  control={form.control}
                  name="grossVehicleWeight"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Gross Vehicle Weight (kg)</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <Input
                            placeholder="1500"
                            type="number"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                {/* --- Field: dateOfFirstRegistration --- */}
                <FormField
                  control={form.control}
                  name="dateOfFirstRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Date of First Registration</FormLabel>
                      <div className="mt-auto space-y-1">
                        <FormControl>
                          <DatePicker
                            // Parse the string value to Date for the component
                            date={field.value ? new Date(field.value) : undefined}
                            // Set the value back as an ISO string (YYYY-MM-DD)
                            setDate={(date) => {
                              field.onChange(date ? date.toISOString().split("T")[0] : "");
                            }}
                            placeholder="Pick a date"
                            toDate={new Date()} // Prevent future dates
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              {/* --- Buttons --- */}
              <div className="flex flex-col gap-3 pt-4"> {/* Increased pt */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}