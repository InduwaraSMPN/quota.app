"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scan, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { cn } from "@/lib/utils";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess: (vehicleId: number) => void;
  className?: string;
}

export function QRScanner({ onScanSuccess, className }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start scanning
  const startScanning = async () => {
    setCameraError(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start scanning interval
        scanIntervalRef.current = setInterval(() => {
          captureAndDecode();
        }, 500);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Could not access camera. Please check permissions or try manual input.");
      setScanning(false);
    }
  };

  // Stop scanning
  const stopScanning = () => {
    setScanning(false);

    // Clear scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture frame and decode QR code
  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get image data from canvas for QR code detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR to decode QR code from image data
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      // If QR code is detected, process the data
      if (qrCode && qrCode.data) {
        console.log("QR Code detected:", qrCode.data);
        handleQRCodeData(qrCode.data);
      }
      // If no QR code is detected, continue scanning (no action needed)
    } catch (error) {
      console.error("Error decoding QR code:", error);
    }
  };

  // Handle QR code data
  const handleQRCodeData = (data: string) => {
    // Stop scanning
    stopScanning();

    // Parse QR code data
    // Expected format: VEHICLE:{registrationNumber}:OWNER:{ownerId}
    const parts = data.split(":");
    if (parts.length === 4 && parts[0] === "VEHICLE" && parts[2] === "OWNER") {
      const registrationNumber = parts[1];
      const ownerId = parts[3];

      // Show success message for QR code detection
      toast.success(`QR code scanned: ${registrationNumber}`);

      // Call the API to get vehicle ID by registration number
      fetchVehicleIdByRegistrationNumber(registrationNumber);
    } else {
      toast.error("Invalid QR code format");
    }
  };

  // Handle manual input
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      toast.error("Please enter a vehicle registration number");
      return;
    }

    // Format registration number (remove hyphens)
    const formattedRegistrationNumber = manualInput.replace(/-/g, "").toUpperCase();

    // Call the API to get vehicle ID by registration number
    fetchVehicleIdByRegistrationNumber(formattedRegistrationNumber);
  };

  // Fetch vehicle ID by registration number
  const fetchVehicleIdByRegistrationNumber = async (registrationNumber: string) => {
    try {
      // Call the API to get vehicle by registration number
      const response = await apiService.getVehicleByRegistrationNumber(registrationNumber);

      if (response.error) {
        console.error("Error fetching vehicle:", response.error);
        toast.error("Vehicle not found. Please check the registration number.");
      } else if (response.data && response.data.vehicleId) {
        // Successfully found the vehicle
        toast.success(`Vehicle found: ${response.data.make} ${response.data.model}`);
        onScanSuccess(response.data.vehicleId);
      } else {
        toast.error("Vehicle not found. Please check the registration number.");
      }
    } catch (error) {
      console.error("Error fetching vehicle ID:", error);
      toast.error("Failed to validate vehicle. Please try again.");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Scan Vehicle QR Code</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-md bg-black"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute inset-0 border-2 border-primary/50 rounded-md pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-primary rounded-md"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-md">
            {cameraError ? (
              <div className="text-center p-4">
                <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{cameraError}</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Scan className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click "Start Scanning" to scan a QR code</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Label htmlFor="registration-number">Or enter registration number manually</Label>
          <div className="flex space-x-2">
            <Input
              id="registration-number"
              placeholder="ABC-1234"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
            />
            <Button onClick={handleManualInput}>Submit</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {scanning ? (
          <Button variant="destructive" onClick={stopScanning} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Stop Scanning
          </Button>
        ) : (
          <Button onClick={startScanning} className="w-full">
            <Scan className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
