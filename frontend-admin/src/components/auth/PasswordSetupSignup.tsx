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

// Define the form schema with Zod
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Define the form values type
export type PasswordSetupData = z.infer<typeof formSchema>;

interface PasswordSetupSignupProps {
  className?: string;
  onNext: (data: PasswordSetupData) => void;
  onBack: () => void;
  initialData?: PasswordSetupData;
}

export function PasswordSetupSignup({
  className,
  onNext,
  onBack,
  initialData,
  ...props
}: PasswordSetupSignupProps) {
  // Initialize the form with empty defaults first
  const form = useForm<PasswordSetupData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      // Reset the form with initialData
      Object.keys(initialData).forEach((key) => {
        const fieldKey = key as keyof PasswordSetupData;
        if (initialData[fieldKey]) {
          form.setValue(fieldKey, initialData[fieldKey]);
        }
      });
    }
  }, [form, initialData]);

  // Handle form submission
  function onSubmit(data: PasswordSetupData) {
    onNext(data);
  }

  return (
    <div className={cn("relative flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your password</CardTitle>
          <CardDescription>
            Your email has been verified. Now create a secure password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormDescription>
                      Password must be at least 8 characters and include
                      uppercase, lowercase, and numbers.
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4">
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
