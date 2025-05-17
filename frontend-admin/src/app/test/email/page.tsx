"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

export default function EmailTestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      console.log("Testing email sending to:", email);
      
      const response = await fetch("http://localhost:8888/api/test/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      console.log("Test email response status:", response.status);
      
      const rawText = await response.text();
      console.log("Raw test email response:", rawText);
      
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          setResult(data);
          
          if (response.ok && data.success) {
            toast.success("Test email sent successfully");
          } else {
            toast.error(data.error || "Failed to send test email");
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          setResult({ error: "Invalid JSON response", rawText });
          toast.error("Error parsing response");
        }
      } else {
        console.warn("Empty response received");
        setResult({ error: "Empty response" });
        toast.error("Empty response from server");
      }
    } catch (error) {
      console.error("Error testing email:", error);
      setResult({ error: String(error) });
      toast.error(`Error testing email: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerificationCode = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      console.log("Testing verification code sending to:", email);
      
      const response = await fetch("http://localhost:8888/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      
      console.log("Verification code response status:", response.status);
      
      const rawText = await response.text();
      console.log("Raw verification code response:", rawText);
      
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          setResult(data);
          
          if (response.ok && data.data && data.data.sent) {
            toast.success("Verification code sent successfully");
          } else {
            toast.error(data.error || "Failed to send verification code");
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          setResult({ error: "Invalid JSON response", rawText });
          toast.error("Error parsing response");
        }
      } else {
        console.warn("Empty response received");
        setResult({ error: "Empty response" });
        toast.error("Empty response from server");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setResult({ error: String(error) });
      toast.error(`Error sending verification code: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Email Test Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Email Functionality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={testEmail} 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Test Email"}
              </Button>
              
              <Button 
                onClick={testVerificationCode} 
                disabled={loading}
                variant="outline"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
            
            {result && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Result:</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
}
