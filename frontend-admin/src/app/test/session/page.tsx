"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";

export default function SessionTestPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [adminInfo, setAdminInfo] = useState({
    fullName: "",
    employeeId: "",
    department: "operations",
    contactNumber: "+94771234567",
    emergencyContactNumber: "+94771234567",
    address: "123 Test Street, Colombo",
  });
  const [emailVerified, setEmailVerified] = useState(true);
  const [currentStep, setCurrentStep] = useState(3);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      console.log("Fetching session data...");

      // First, check if the server is accessible with a simple ping
      try {
        const pingResponse = await fetch("http://localhost:8888/api/test/ping", {
          credentials: "include",
          mode: "cors",
          cache: "no-cache",
        });

        console.log("Ping response status:", pingResponse.status);
        if (pingResponse.ok) {
          console.log("Server is accessible");
        } else {
          console.warn("Server returned non-OK status:", pingResponse.status);
        }
      } catch (pingError) {
        console.error("Error pinging server:", pingError);
      }

      // Now try to fetch the session data
      const response = await fetch("http://localhost:8888/api/test/session", {
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Accept": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 403) {
        console.error("Forbidden (403) response received. This suggests an authentication or authorization issue.");
        console.log("CORS Headers:", {
          "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
          "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
          "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        });

        setSessionData({
          error: "Forbidden (403)",
          message: "The server denied access to the session endpoint. This may be due to CORS or authentication issues.",
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });

        toast.error("Access forbidden (403)");
        setLoading(false);
        return;
      }

      // Get the raw text first to debug
      const rawText = await response.text();
      console.log("Raw response text:", rawText);

      // Only try to parse if we have content
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          setSessionData(data);
          console.log("Session data:", data);
          toast.success("Session data fetched successfully");
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setSessionData({
            error: "Invalid JSON response",
            rawText,
            parseError: parseError instanceof Error ? parseError.message : String(parseError)
          });
          toast.error("Error parsing JSON response");
        }
      } else {
        console.warn("Empty response received");
        setSessionData({
          error: "Empty response",
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
        toast.error("Empty response from server");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      setSessionData({
        error: "Fetch error",
        message: error instanceof Error ? error.message : String(error)
      });
      toast.error(`Error fetching session data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const storeSessionData = async () => {
    setLoading(true);
    try {
      const data = {
        loginInfo: email,
        adminInfo,
        emailVerified,
        currentStep,
      };

      console.log("Storing session data:", data);

      const response = await fetch("http://localhost:8888/api/test/session/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
      });

      console.log("Store response status:", response.status);
      console.log("Store response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 403) {
        console.error("Forbidden (403) response received when storing session data.");
        console.log("CORS Headers:", {
          "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
          "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
          "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        });

        toast.error("Access forbidden (403) when storing session data");
        setLoading(false);
        return;
      }

      // Get the raw text first to debug
      const rawText = await response.text();
      console.log("Raw store response text:", rawText);

      // Only try to parse if we have content
      if (rawText.trim()) {
        try {
          const result = JSON.parse(rawText);
          console.log("Store result:", result);

          if (response.ok) {
            toast.success("Session data stored successfully");
            // Fetch the updated session data
            fetchSessionData();
          } else {
            toast.error(result.error || "Error storing session data");
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          toast.error("Error parsing JSON response from store endpoint");
        }
      } else {
        console.warn("Empty response received from store endpoint");
        toast.error("Empty response from server");
      }
    } catch (error) {
      console.error("Error storing session data:", error);
      toast.error(`Error storing session data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testAdminRegistration = async () => {
    setLoading(true);
    try {
      // First store the session data
      await storeSessionData();

      console.log("Testing admin registration with data:", adminInfo);

      // Then submit the admin info to the registration endpoint
      const response = await fetch("http://localhost:8888/api/auth/register/admin/step3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(adminInfo),
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
      });

      console.log("Registration response status:", response.status);
      console.log("Registration response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 403) {
        console.error("Forbidden (403) response received when testing admin registration.");
        console.log("CORS Headers:", {
          "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
          "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
          "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        });

        toast.error("Access forbidden (403) when testing admin registration");
        setLoading(false);
        return;
      }

      // Get the raw text first to debug
      const rawText = await response.text();
      console.log("Raw registration response text:", rawText);

      // Only try to parse if we have content
      if (rawText.trim()) {
        try {
          const result = JSON.parse(rawText);
          console.log("Registration result:", result);

          if (response.ok) {
            toast.success("Admin registration successful");
          } else {
            toast.error(result.message || result.error || "Admin registration failed");
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          toast.error("Error parsing JSON response from registration endpoint");
        }
      } else {
        console.warn("Empty response received from registration endpoint");
        toast.error("Empty response from registration server");
      }
    } catch (error) {
      console.error("Error testing admin registration:", error);
      toast.error(`Error testing admin registration: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Session Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchSessionData}
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Loading..." : "Refresh Session Data"}
            </Button>

            {sessionData && (
              <Textarea
                value={JSON.stringify(sessionData, null, 2)}
                readOnly
                className="h-80"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={adminInfo.fullName}
                  onChange={(e) => setAdminInfo({...adminInfo, fullName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={adminInfo.employeeId}
                  onChange={(e) => setAdminInfo({...adminInfo, employeeId: e.target.value})}
                  placeholder="EMP-12345"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailVerified"
                  checked={emailVerified}
                  onChange={(e) => setEmailVerified(e.target.checked)}
                />
                <Label htmlFor="emailVerified">Email Verified</Label>
              </div>

              <div>
                <Label htmlFor="currentStep">Current Step</Label>
                <Input
                  id="currentStep"
                  type="number"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                />
              </div>

              <Button
                onClick={storeSessionData}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Storing..." : "Store Session Data"}
              </Button>

              <Button
                onClick={testAdminRegistration}
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? "Testing..." : "Test Admin Registration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}
