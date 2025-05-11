"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import Link from "next/link";

// Define the form schema with Zod
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  // State for form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // In a Todo, would call an API endpoint here
      // For now, we'll simulate a successful response after a short delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log("Password reset requested for:", data.email);
      setIsSuccess(true);
    } catch (err) {
      setError("An error occurred while processing your request. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Email sent!</AlertTitle>
              <AlertDescription>
                If an account exists with the email you entered, we've sent instructions to reset your password. Please check your inbox.
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormDescription>
                        Enter the email address associated with your account
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset instructions"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <div className="text-sm text-center">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
