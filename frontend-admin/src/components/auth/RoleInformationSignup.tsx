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
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema with Zod
const formSchema = z.object({
  department: z
    .string()
    .min(1, { message: "Department is required" }),
  role: z
    .string()
    .min(1, { message: "Role is required" }),
  securityClearanceLevel: z
    .string()
    .min(1, { message: "Security clearance level is required" }),
  accessPermissions: z
    .array(z.string())
    .min(1, { message: "At least one access permission must be selected" }),
  supervisorName: z
    .string()
    .min(1, { message: "Supervisor name is required" }),
  supervisorId: z
    .string()
    .min(1, { message: "Supervisor ID is required" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface RoleInformationSignupProps {
  className?: string;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
}

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

// Security clearance levels
const securityClearanceLevels = [
  { id: "level1", label: "Level 1 - Basic" },
  { id: "level2", label: "Level 2 - Intermediate" },
  { id: "level3", label: "Level 3 - Advanced" },
  { id: "level4", label: "Level 4 - Restricted" },
  { id: "level5", label: "Level 5 - Confidential" },
];

// Access permissions
const accessPermissions = [
  { id: "view_reports", label: "View Reports" },
  { id: "edit_reports", label: "Edit Reports" },
  { id: "view_stations", label: "View Fuel Stations" },
  { id: "manage_stations", label: "Manage Fuel Stations" },
  { id: "view_vehicles", label: "View Vehicles" },
  { id: "manage_vehicles", label: "Manage Vehicles" },
  { id: "view_quotas", label: "View Quotas" },
  { id: "manage_quotas", label: "Manage Quotas" },
  { id: "system_config", label: "System Configuration" },
  { id: "user_management", label: "User Management" },
];

export function RoleInformationSignup({
  className,
  onSubmit: onSubmitProp,
  onBack,
  ...props
}: RoleInformationSignupProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      role: "",
      securityClearanceLevel: "",
      accessPermissions: [],
      supervisorName: "",
      supervisorId: "",
    },
  });

  // Get the selected department to filter roles
  const selectedDepartment = form.watch("department");
  const availableRoles = rolesByDepartment[selectedDepartment] || [];

  // Handle form submission
  function onSubmit(data: FormValues) {
    onSubmitProp(data);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>
            Please provide your role and department details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="securityClearanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Clearance Level</FormLabel>
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
              <FormField
                control={form.control}
                name="accessPermissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Access Permissions</FormLabel>
                      <FormDescription>
                        Select the access permissions required for your role
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {accessPermissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="accessPermissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...field.value, permission.id]
                                        : field.value?.filter(
                                            (value) => value !== permission.id
                                          );
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {permission.label}
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
              <FormField
                control={form.control}
                name="supervisorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your supervisor's name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your supervisor's ID"
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
