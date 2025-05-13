"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { EmailVerificationData } from "@/app/actions/session";

// Define the form schema with Zod
const formSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: "Verification code is required" })
    .length(6, { message: "Verification code must be 6 digits" })
    .regex(/^\d+$/, { message: "Verification code must contain only numbers" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface EmailVerificationSignupProps {
  className?: string;
  onNext: (data: EmailVerificationData) => void;
  onBack: () => void;
  initialData?: EmailVerificationData;
  email: string;
}

export function EmailVerificationSignup({
  className,
  onNext,
  onBack,
  initialData,
  email,
  ...props
}: EmailVerificationSignupProps) {
  // State for form submission and resend functionality
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Initialize the form with empty defaults first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationCode: "",
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

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  // Handle form submission
  function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);

    apiService.verifyEmailCode({
      email: email,
      code: data.verificationCode
    })
    .then(response => {
      if (response.data && response.data.verified) {
        onNext({
          verificationCode: data.verificationCode,
          verified: true
        });
      } else {
        setError(response.error || "Invalid verification code. Please try again.");
      }
    })
    .catch(err => {
      setError("An error occurred during verification. Please try again.");
      console.error("Verification error:", err);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  }

  // Handle resend verification code
  const handleResendCode = () => {
    setIsResending(true);
    setError(null);

    apiService.sendVerificationCode({ email: email })
      .then(response => {
        if (response.data && response.data.sent) {
          toast.success("Verification code resent to your email");
          setResendDisabled(true);
          setResendCountdown(60); // Disable resend for 60 seconds
        } else {
          // Display the specific error message from the backend if available
          const errorMessage = response.error || "Failed to resend verification code";
          toast.error(errorMessage);
          console.error("Resend verification code error:", errorMessage);
        }
      })
      .catch(err => {
        console.error("Resend verification code error:", err);
        toast.error("An unexpected error occurred. Please try again later.");
      })
      .finally(() => {
        setIsResending(false);
      });
  };

  return (
    <div className={cn("relative flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to {email}. Please enter it below to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormDescription>
                      Enter the 6-digit code sent to your email
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
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

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
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
        <CardFooter className="flex justify-center border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendCode}
            disabled={isResending || resendDisabled}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {resendDisabled
              ? `Resend code (${resendCountdown}s)`
              : isResending
              ? "Sending..."
              : "Didn't receive a code? Resend"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
