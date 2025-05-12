"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

// Define the form schema with Zod
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
        const date = new Date(value);
        const currentDate = new Date();
        return !isNaN(date.getTime()) && date <= currentDate;
      },
      { message: "Invalid date of first registration" }
    ),
  countryOfOrigin: z
    .string()
    .min(1, { message: "Country of origin is required" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface VehicleInformationSignupProps {
  className?: string;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
}

export function VehicleInformationSignup({
  className,
  onSubmit: onSubmitProp,
  onBack,
  ...props
}: VehicleInformationSignupProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationNumber: "",
      engineNumber: "",
      chassisNumber: "",
      make: "",
      model: "",
      yearOfManufacture: "",
      vehicleClass: "",
      typeOfBody: "",
      fuelType: "",
      engineCapacity: "",
      color: "",
      grossVehicleWeight: "",
      dateOfFirstRegistration: "",
      countryOfOrigin: "",
    },
  });

  // Handle form submission
  function onSubmit(data: FormValues) {
    onSubmitProp(data);
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Vehicle Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Engine Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Engine Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Chassis Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Chassis Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota, Honda, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Corolla, Civic, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearOfManufacture"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Year of Manufacture</FormLabel>
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleClass"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end md:col-span-2">
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
                      <p className="text-xs text-muted-foreground mb-2">
                        As per Section 122 of Motor Traffic Act amended by Act no.08 of 2009
                      </p>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select vehicle class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="typeOfBody"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Type of Body</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sedan, Hatchback, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="countryOfOrigin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Country of Origin</FormLabel>
                      <FormControl>
                        <Input placeholder="Japan, Germany, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end md:col-span-2">
                      <FormLabel>Fuel Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="92 OCTANE PETROL">92 OCTANE PETROL</SelectItem>
                          <SelectItem value="95 OCTANE PETROL">95 OCTANE PETROL</SelectItem>
                          <SelectItem value="AUTO DIESEL">AUTO DIESEL</SelectItem>
                          <SelectItem value="SUPER DIESEL">SUPER DIESEL</SelectItem>
                          <SelectItem value="KEROSENE">KEROSENE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Engine Capacity (cc)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1500"
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="White, Black, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grossVehicleWeight"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Gross Vehicle Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1500"
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfFirstRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full justify-end">
                      <FormLabel>Date of First Registration</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value ? new Date(field.value) : undefined}
                          setDate={(date) => {
                            field.onChange(date ? date.toISOString().split("T")[0] : "");
                          }}
                          placeholder="Pick a date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full">
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onBack}
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
