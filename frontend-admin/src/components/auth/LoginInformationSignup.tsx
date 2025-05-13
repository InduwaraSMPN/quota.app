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
import { MagicBackButton } from "@/components/ui/magic-back-button";

// Define the form schema with Zod
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

interface LoginInformationSignupProps {
  className?: string;
  onNext: (data: FormValues) => void;
  initialData?: FormValues;
}

export function LoginInformationSignup({
  className,
  onNext,
  initialData,
  ...props
}: LoginInformationSignupProps) {
  // Initialize the form with empty defaults first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
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
    <div className={cn("relative flex flex-col", className)} {...props}>
      <div className="absolute top-1 -left-12 z-10">
        <MagicBackButton backLink="/auth/login" />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your email to get started. You'll create a password after verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormDescription>
                      We'll never share your email with anyone else.
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
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
