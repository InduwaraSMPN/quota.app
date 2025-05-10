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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema with Zod
const formSchema = z.object({
  businessRegistrationNumber: z
    .string()
    .min(1, { message: "Business registration number is required" })
    .max(50, { message: "Business registration number is too long" }),
  businessName: z
    .string()
    .min(3, { message: "Business name must be at least 3 characters" })
    .max(100, { message: "Business name must be less than 100 characters" }),
  businessAddress: z
    .string()
    .min(5, { message: "Business address must be at least 5 characters" })
    .max(200, { message: "Business address must be less than 200 characters" }),
  province: z
    .string()
    .min(1, { message: "Province is required" }),
  district: z
    .string()
    .min(1, { message: "District is required" }),
  stationName: z
    .string()
    .min(3, { message: "Station name must be at least 3 characters" })
    .max(100, { message: "Station name must be less than 100 characters" }),
  fuelTypes: z
    .array(z.string())
    .min(1, { message: "At least one fuel type must be selected" }),
  openingTime: z
    .string()
    .min(1, { message: "Opening time is required" }),
  closingTime: z
    .string()
    .min(1, { message: "Closing time is required" }),
  fuelRetailLicenseNumber: z
    .string()
    .min(1, { message: "Fuel retail license number is required" })
    .max(50, { message: "Fuel retail license number is too long" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface BusinessInformationSignupProps {
  className?: string;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
}

// Sri Lanka provinces and districts
const provinces = [
  { name: "Central", districts: ["Kandy", "Matale", "Nuwara Eliya"] },
  { name: "Eastern", districts: ["Ampara", "Batticaloa", "Trincomalee"] },
  { name: "North Central", districts: ["Anuradhapura", "Polonnaruwa"] },
  { name: "Northern", districts: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"] },
  { name: "North Western", districts: ["Kurunegala", "Puttalam"] },
  { name: "Sabaragamuwa", districts: ["Kegalle", "Ratnapura"] },
  { name: "Southern", districts: ["Galle", "Hambantota", "Matara"] },
  { name: "Uva", districts: ["Badulla", "Monaragala"] },
  { name: "Western", districts: ["Colombo", "Gampaha", "Kalutara"] },
];

// Fuel types available
const fuelTypes = [
  { id: "petrol92", label: "Petrol 92 Octane" },
  { id: "petrol95", label: "Petrol 95 Octane" },
  { id: "diesel", label: "Diesel" },
  { id: "superDiesel", label: "Super Diesel" },
  { id: "kerosene", label: "Kerosene" },
];

export function BusinessInformationSignup({
  className,
  onSubmit: onSubmitProp,
  onBack,
  ...props
}: BusinessInformationSignupProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessRegistrationNumber: "",
      businessName: "",
      businessAddress: "",
      province: "",
      district: "",
      stationName: "",
      fuelTypes: [],
      openingTime: "",
      closingTime: "",
      fuelRetailLicenseNumber: "",
    },
  });

  // Get the selected province to filter districts
  const selectedProvince = form.watch("province");
  const availableDistricts = provinces.find(p => p.name === selectedProvince)?.districts || [];

  // Handle form submission
  function onSubmit(data: FormValues) {
    onSubmitProp(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Please provide your fuel station business details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Registration Number (BRN)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your BRN"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered Business Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your registered business name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the full physical address of your fuel station"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset district when province changes
                          form.setValue("district", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.name} value={province.name}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedProvince}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="stationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Station Name</FormLabel>
                    <FormDescription>
                      Enter the brand or trade name of your fuel station
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="Enter station name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Types of Fuel Offered</FormLabel>
                      <FormDescription>
                        Select all fuel types available at your station
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fuelTypes.map((type) => (
                        <FormField
                          key={type.id}
                          control={form.control}
                          name="fuelTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>

                                  <Checkbox
                                    checked={field.value?.includes(type.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, type.id]
                                        : field.value?.filter(
                                            (value) => value !== type.id
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="fuelRetailLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Retail License Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your fuel retail license number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
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
