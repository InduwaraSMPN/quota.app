"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TestBackendConnection() {
  const [publicResponse, setPublicResponse] = useState<string>("");
  const [protectedResponse, setProtectedResponse] = useState<string>("");
  const [loginResponse, setLoginResponse] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState<string>("vehicle");
  const [password, setPassword] = useState<string>("vehicle123");
  const [loading, setLoading] = useState<boolean>(false);

  const backendUrl = "http://localhost:8888";

  const testPublicEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/test/public`);
      const data = await response.json();
      setPublicResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setPublicResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setToken(data.token);
      setLoginResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setLoginResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testProtectedEndpoint = async () => {
    if (!token) {
      setProtectedResponse("Please login first to get a token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/test/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setProtectedResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setProtectedResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Test Spring Boot Backend Connection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Login to get a JWT token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={login} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </CardFooter>
          {loginResponse && (
            <CardContent>
              <div className="mt-4">
                <h3 className="text-sm font-medium">Response:</h3>
                <pre className="mt-2 bg-slate-100 p-4 rounded-md overflow-auto text-xs">
                  {loginResponse}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Public Endpoint Card */}
        <Card>
          <CardHeader>
            <CardTitle>Public Endpoint</CardTitle>
            <CardDescription>
              Test the public endpoint (no authentication required)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testPublicEndpoint} disabled={loading}>
              {loading ? "Loading..." : "Test Public Endpoint"}
            </Button>
          </CardContent>
          {publicResponse && (
            <CardContent>
              <div className="mt-4">
                <h3 className="text-sm font-medium">Response:</h3>
                <pre className="mt-2 bg-slate-100 p-4 rounded-md overflow-auto text-xs">
                  {publicResponse}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Protected Endpoint Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Protected Endpoint</CardTitle>
            <CardDescription>
              Test the protected endpoint (authentication required)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testProtectedEndpoint} disabled={loading || !token}>
              {loading ? "Loading..." : "Test Protected Endpoint"}
            </Button>
            {!token && (
              <p className="text-sm text-red-500 mt-2">
                Please login first to get a token
              </p>
            )}
          </CardContent>
          {protectedResponse && (
            <CardContent>
              <div className="mt-4">
                <h3 className="text-sm font-medium">Response:</h3>
                <pre className="mt-2 bg-slate-100 p-4 rounded-md overflow-auto text-xs">
                  {protectedResponse}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}