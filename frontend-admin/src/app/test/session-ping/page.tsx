"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { sessionService } from "@/services/sessionService";

export default function SessionPingPage() {
  const [pingResult, setPingResult] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPing = async () => {
    setLoading(true);
    try {
      console.log("Testing session ping...");
      const result = await sessionService.pingSession();
      console.log("Ping result:", result);
      
      setPingResult({
        success: result,
        timestamp: new Date().toISOString()
      });
      
      if (result) {
        toast.success("Session ping successful");
      } else {
        toast.error("Session ping failed");
      }
    } catch (error) {
      console.error("Error testing session ping:", error);
      setPingResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      toast.error(`Error testing session ping: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetRegistrationData = async () => {
    setLoading(true);
    try {
      console.log("Testing getRegistrationData...");
      const data = await sessionService.getRegistrationData();
      console.log("Registration data:", data);
      
      setRegistrationData({
        data,
        timestamp: new Date().toISOString()
      });
      
      if (data) {
        toast.success("Got registration data successfully");
      } else {
        toast.warning("No registration data found");
      }
    } catch (error) {
      console.error("Error getting registration data:", error);
      setRegistrationData({ 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      toast.error(`Error getting registration data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testPing();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Session Ping Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Ping</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testPing} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testing..." : "Test Session Ping"}
            </Button>
            
            {pingResult && (
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(pingResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Registration Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testGetRegistrationData} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testing..." : "Test Get Registration Data"}
            </Button>
            
            {registrationData && (
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(registrationData, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Toaster />
    </div>
  );
}
