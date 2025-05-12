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

// Define the form schema with Zod
const formSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  nicNumber: z
    .string()
    .min(1, { message: "NIC number is required" })
    .refine(
      (value) => {
        // Validate old NIC format (9 digits + V/X) or new NIC format (12 digits)
        return /^[0-9]{9}[vVxX]$/.test(value) || /^[0-9]{12}$/.test(value);
      },
      { message: "Invalid NIC number format" }
    ),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" }),
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
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface OwnerInformationSignupProps {
  className?: string;
  onNext: (data: FormValues) => void;
  onBack: () => void;
}

export function OwnerInformationSignup({
  className,
  onNext,
  onBack,
  ...props
}: OwnerInformationSignupProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      nicNumber: "",
      address: "",
      contactNumber: "",
    },
  });

  // Handle form submission
  function onSubmit(data: FormValues) {
    onNext(data);
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
          <CardDescription>
            Please provide your personal details as per your NIC
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
                    <FormLabel>Full Name (as per NIC)</FormLabel>
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
                name="nicNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC Number</FormLabel>
                    <FormDescription>
                      Enter your old (9 digits + V/X) or new (12 digits) NIC
                      number
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="123456789V or 123456789012"
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
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Continue
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
