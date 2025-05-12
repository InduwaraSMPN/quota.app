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

// Department options
const departments = [
  { id: "operations", label: "Operations" },
  { id: "monitoring", label: "Monitoring & Surveillance" },
  { id: "distribution", label: "Distribution Management" },
  { id: "support", label: "Technical Support" },
  { id: "admin", label: "Administration" },
];

// Define the form schema with Zod
const formSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  employeeId: z
    .string()
    .min(1, { message: "Employee ID is required" })
    .max(50, { message: "Employee ID must be less than 50 characters" }),
  department: z
    .string()
    .min(1, { message: "Department is required" }),
  contactNumber: z
    .string()
    .min(1, { message: "Contact number is required" })
    .refine(
      (value) => {
        // Validate Sri Lankan phone numbers (e.g., +94XXXXXXXXX or 0XXXXXXXXX)
        return /^(?:\+94|0)[0-9]{9}$/.test(value);
      },
      { message: "Invalid Sri Lankan phone number" }
    ),
  emergencyContactNumber: z
    .string()
    .min(1, { message: "Emergency contact number is required" })
    .refine(
      (value) => {
        // Validate Sri Lankan phone numbers (e.g., +94XXXXXXXXX or 0XXXXXXXXX)
        return /^(?:\+94|0)[0-9]{9}$/.test(value);
      },
      { message: "Invalid Sri Lankan phone number" }
    ),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;



interface PersonalInformationSignupProps {
  className?: string;
  onNext: (data: FormValues) => void;
  onBack: () => void;
  initialData?: FormValues;
  isSubmitting?: boolean;
}

export function PersonalInformationSignup({
  className,
  onNext,
  onBack,
  initialData,
  isSubmitting = false,
  ...props
}: PersonalInformationSignupProps) {
  // Initialize the form with empty defaults first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      department: "",
      contactNumber: "",
      emergencyContactNumber: "",
      address: "",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      // Reset the form with initialData
      Object.keys(initialData).forEach((key) => {
        const fieldKey = key as keyof FormValues;
        if (initialData[fieldKey]) {
          form.setValue(fieldKey, initialData[fieldKey]);
        }
      });
    }
  }, [form, initialData]);

  // Handle form submission
  function onSubmit(data: FormValues) {
    onNext(data);
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Please provide your personal details for administrative purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormDescription>
                      Enter your official employee identification number
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="EMP-12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.label}
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
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormDescription>
                      Enter your phone number in the format +94XXXXXXXXX or
                      0XXXXXXXXX
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="+94XXXXXXXXX or 0XXXXXXXXX"
                        type="tel"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Number</FormLabel>
                    <FormDescription>
                      Provide a number we can call in case of emergency
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="+94XXXXXXXXX or 0XXXXXXXXX"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, Colombo"
                        autoComplete="street-address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
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
