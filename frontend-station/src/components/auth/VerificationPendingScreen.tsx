"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface VerificationPendingScreenProps {
  className?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  email?: string;
}

export function VerificationPendingScreen({
  className,
  status = "PENDING",
  rejectionReason,
  email,
  ...props
}: VerificationPendingScreenProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            {status === "PENDING" && (
              <Clock className="h-12 w-12 text-amber-500 mb-4" />
            )}
            {status === "VERIFIED" && (
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            )}
            {status === "REJECTED" && (
              <XCircle className="h-12 w-12 text-destructive mb-4" />
            )}
            
            <CardTitle className="text-xl">
              {status === "PENDING" && "Verification Pending"}
              {status === "VERIFIED" && "Verification Approved"}
              {status === "REJECTED" && "Verification Rejected"}
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            {status === "PENDING" && 
              "Your station registration is currently under review by our administrators."
            }
            {status === "VERIFIED" && 
              "Your station registration has been approved. You can now log in to your account."
            }
            {status === "REJECTED" && 
              "Your station registration has been rejected. Please see the reason below."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "PENDING" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>Our administrators will review your application</li>
                  <li>This process typically takes 1-2 business days</li>
                  <li>You'll receive an email notification at {email} once the review is complete</li>
                  <li>You can check back here anytime to see your current status</li>
                </ul>
              </div>
            </div>
          )}
          
          {status === "REJECTED" && rejectionReason && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <h3 className="font-medium mb-2 text-destructive">Reason for rejection:</h3>
              <p className="text-sm text-destructive">{rejectionReason}</p>
            </div>
          )}
          
          {status === "VERIFIED" && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <h3 className="font-medium mb-2 text-green-700 dark:text-green-400">Your account is ready!</h3>
              <p className="text-sm text-muted-foreground">
                You can now log in to your station dashboard and start managing your fuel station.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {status === "PENDING" && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          )}
          
          {status === "REJECTED" && (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signup">Register Again</Link>
            </Button>
          )}
          
          {status === "VERIFIED" && (
            <Button className="w-full" asChild>
              <Link href="/auth/login">Log In Now</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
