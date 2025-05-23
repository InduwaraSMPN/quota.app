"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ModeToggle } from "@/components/mode-toggle";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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
import { Button } from "@/components/ui/button";
import { Loader2, Building, User } from "lucide-react";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  // Owner information
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
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
  // Station information
  stationName: z
    .string()
    .min(3, { message: "Station name must be at least 3 characters" })
    .max(100, { message: "Station name must be less than 100 characters" }),
  businessAddress: z
    .string()
    .min(5, { message: "Business address must be at least 5 characters" })
    .max(200, { message: "Business address must be less than 200 characters" }),
  operatingHours: z
    .string()
    .min(1, { message: "Operating hours are required" })
    .max(100, { message: "Operating hours must be less than 100 characters" }),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { isLoading: authLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      contactNumber: "",
      stationName: "",
      businessAddress: "",
      operatingHours: "",
    },
  });

  // Fetch station owner profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await apiService.getStationOwnerProfile();
        if (response.error || !response.data) {
          setError(response.error || "Failed to load profile data");
        } else {
          setProfileData(response.data);

          // Update form values with the fetched data
          form.setValue("fullName", response.data.fullName || "");
          form.setValue("contactNumber", response.data.contactNumber || "");
          form.setValue("stationName", response.data.stationName || "");
          form.setValue("businessAddress", response.data.businessAddress || "");
          form.setValue("operatingHours", response.data.operatingHours || "");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (!authLoading) {
      fetchProfileData();
    }
  }, [form, authLoading]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiService.updateUserProfile(data);

      if (response.error) {
        setError(response.error);
        toast.error("Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
        // Navigate back to dashboard after a short delay
        // to allow the user to see the success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine loading states
  const isPageLoading = authLoading || isLoadingProfile;
  // Combine error states
  const pageError = authError || error;

  return (
    <div className="flex flex-col min-h-svh w-full relative bg-background">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Loading state */}
      {isPageLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading profile..." />
        </div>
      )}

      {/* Error state */}
      {!isPageLoading && pageError && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage
            message={pageError}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Main content - only show when not loading and no errors */}
      {!isPageLoading && !pageError && (
        <div className="flex flex-1 pt-16 px-4 md:px-8 pb-8">
          <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
              <MagicBackButton backLink="/dashboard" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Edit Profile</h1>
                <p className="text-muted-foreground">Update your station and personal information</p>
              </div>
            </div>

            {/* Owner Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Owner Information</CardTitle>
                </div>
                <CardDescription>
                  Update your personal details below. Your NIC number cannot be changed.
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
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Read-only NIC field */}
                    <div className="space-y-2">
                      <FormLabel>NIC Number</FormLabel>
                      <Input
                        value={profileData?.nicNumber || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        NIC number cannot be changed
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+94XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Read-only Email field */}
                    <div className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={profileData?.email || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Station Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle>Station Information</CardTitle>
                </div>
                <CardDescription>
                  Update your fuel station details below. Registration number cannot be changed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="stationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Station Name</FormLabel>
                          <FormControl>
                            <Input placeholder="City Fuel Station" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Read-only Registration Number field */}
                    <div className="space-y-2">
                      <FormLabel>Business Registration Number</FormLabel>
                      <Input
                        value={profileData?.businessRegistrationNumber || ""}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Registration number cannot be changed
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street, Colombo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operatingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operating Hours</FormLabel>
                          <FormControl>
                            <Input placeholder="6:00 AM - 10:00 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-2 pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
