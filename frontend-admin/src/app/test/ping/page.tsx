"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";

export default function PingTestPage() {
  const [pingResult, setPingResult] = useState<any>(null);
  const [publicResult, setPublicResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPing = async () => {
    setLoading(true);
    try {
      console.log("Testing ping endpoint...");
      const response = await fetch("http://localhost:8888/api/test/ping", {
        credentials: "include",
      });
      
      console.log("Ping response status:", response.status);
      console.log("Ping response headers:", Object.fromEntries(response.headers.entries()));
      
      const rawText = await response.text();
      console.log("Raw ping response:", rawText);
      
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          setPingResult(data);
          toast.success("Ping successful");
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setPingResult({ error: "Invalid JSON response", rawText });
          toast.error("Error parsing ping response");
        }
      } else {
        console.warn("Empty ping response");
        setPingResult({ error: "Empty response" });
        toast.error("Empty ping response");
      }
    } catch (error) {
      console.error("Error testing ping:", error);
      setPingResult({ error: String(error) });
      toast.error(`Error testing ping: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testPublic = async () => {
    setLoading(true);
    try {
      console.log("Testing public endpoint...");
      const response = await fetch("http://localhost:8888/api/test/public", {
        credentials: "include",
      });
      
      console.log("Public response status:", response.status);
      console.log("Public response headers:", Object.fromEntries(response.headers.entries()));
      
      const rawText = await response.text();
      console.log("Raw public response:", rawText);
      
      if (rawText.trim()) {
        try {
          const data = JSON.parse(rawText);
          setPublicResult(data);
          toast.success("Public endpoint test successful");
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setPublicResult({ error: "Invalid JSON response", rawText });
          toast.error("Error parsing public endpoint response");
        }
      } else {
        console.warn("Empty public endpoint response");
        setPublicResult({ error: "Empty response" });
        toast.error("Empty public endpoint response");
      }
    } catch (error) {
      console.error("Error testing public endpoint:", error);
      setPublicResult({ error: String(error) });
      toast.error(`Error testing public endpoint: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testPing();
    testPublic();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ping Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testPing} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testing..." : "Test Ping"}
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
            <CardTitle>Public Endpoint Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testPublic} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testing..." : "Test Public Endpoint"}
            </Button>
            
            {publicResult && (
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
                {JSON.stringify(publicResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Toaster />
    </div>
  );
}
