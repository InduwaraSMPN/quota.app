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

// Department options
const departments = [
  { id: "operations", label: "Operations" },
  { id: "monitoring", label: "Monitoring & Surveillance" },
  { id: "distribution", label: "Distribution Management" },
  { id: "support", label: "Technical Support" },
  { id: "admin", label: "Administration" },
];

// Role options by department
const rolesByDepartment: Record<string, { id: string; label: string }[]> = {
  operations: [
    { id: "manager", label: "Operations Manager" },
    { id: "supervisor", label: "Operations Supervisor" },
    { id: "analyst", label: "Operations Analyst" },
  ],
  monitoring: [
    { id: "manager", label: "Monitoring Manager" },
    { id: "analyst", label: "Data Analyst" },
    { id: "specialist", label: "Surveillance Specialist" },
  ],
  distribution: [
    { id: "manager", label: "Distribution Manager" },
    { id: "coordinator", label: "Logistics Coordinator" },
    { id: "planner", label: "Supply Chain Planner" },
  ],
  support: [
    { id: "manager", label: "Support Manager" },
    { id: "specialist", label: "Technical Specialist" },
    { id: "engineer", label: "Systems Engineer" },
  ],
  admin: [
    { id: "manager", label: "Administrative Manager" },
    { id: "officer", label: "Administrative Officer" },
    { id: "assistant", label: "Administrative Assistant" },
  ],
};

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
  role: z
    .string()
    .min(1, { message: "Role is required" }),
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
  securityClearanceLevel: z
    .string()
    .min(1, { message: "Security clearance level is required" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

// Security clearance levels
const securityClearanceLevels = [
  { id: "level1", label: "Level 1 - Basic" },
  { id: "level2", label: "Level 2 - Intermediate" },
  { id: "level3", label: "Level 3 - Advanced" },
  { id: "level4", label: "Level 4 - Restricted" },
  { id: "level5", label: "Level 5 - Confidential" },
];

interface PersonalInformationSignupProps {
  className?: string;
  onNext: (data: FormValues) => void;
  onBack: () => void;
}

export function PersonalInformationSignup({
  className,
  onNext,
  onBack,
  ...props
}: PersonalInformationSignupProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      department: "",
      role: "",
      contactNumber: "",
      emergencyContactNumber: "",
      address: "",
      securityClearanceLevel: "",
    },
  });

  // Get the selected department to filter roles
  const selectedDepartment = form.watch("department");
  const availableRoles = rolesByDepartment[selectedDepartment] || [];

  // Handle form submission
  function onSubmit(data: FormValues) {
    onNext(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset role when department changes
                          form.setValue("role", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedDepartment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
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
              <FormField
                control={form.control}
                name="securityClearanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Clearance Level</FormLabel>
                    <FormDescription>
                      Select your assigned security clearance level
                    </FormDescription>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select security clearance level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {securityClearanceLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
