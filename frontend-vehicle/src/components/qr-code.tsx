"use client"

import * as React from "react"
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "@/components/ui/color-input";
import { MagicBackButton } from "@/components/ui/magic-back-button";
import {
  Download,
  Palette,
  QrCode,
  Settings,
  Loader2
} from "lucide-react";

interface Vehicle {
  id: string;
  ownerId: string;  // Added owner ID
  registrationNumber: string;
  make: string;
  model: string;
  [key: string]: any; // For other properties
}

interface QRCodeGeneratorProps {
  vehicleId?: string;
  vehicleData?: Vehicle;
  backLink?: string;
}

export function QRCodeGenerator({ vehicleId, vehicleData, backLink = "/dashboard" }: QRCodeGeneratorProps) {
  // Generate QR code value based on vehicle data if available
  const qrValue = vehicleData
    ? `VEHICLE:${vehicleData.registrationNumber}:OWNER:${vehicleData.ownerId}`
    : "quota.app";

  const [qrCode] = useState(qrValue);
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [isDownloadingPNG, setIsDownloadingPNG] = useState(false);
  const [isDownloadingSVG, setIsDownloadingSVG] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadSVG = () => {
    // ... (downloadSVG logic remains the same)
    if (!qrRef.current) return;
    setIsDownloadingSVG(true);
    const svgElement = qrRef.current.querySelector("svg");

    if (svgElement) {
      try {
        const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute("width", size.toString());
        svgClone.setAttribute("height", size.toString());
        if (!svgClone.getAttribute('xmlns')) {
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const blobUrl = URL.createObjectURL(svgBlob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = vehicleData ? `${vehicleData.registrationNumber}_qrcode.svg` : "qrcode.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading SVG:", error);
      } finally {
        setTimeout(() => setIsDownloadingSVG(false), 300);
      }
    } else {
      console.error("SVG element not found for download.");
      setIsDownloadingSVG(false);
    }
  };

  const downloadPNG = () => {
    // ... (downloadPNG logic remains the same)
    if (!qrRef.current) return;
    setIsDownloadingPNG(true);
    const svgElement = qrRef.current.querySelector("svg");

    if (!svgElement) {
      console.error("SVG element not found for PNG conversion.");
      setIsDownloadingPNG(false);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get canvas context.");
        setIsDownloadingPNG(false);
        return;
      }

      const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute("width", size.toString());
      svgClone.setAttribute("height", size.toString());
      if (!svgClone.getAttribute('xmlns')) {
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = vehicleData ? `${vehicleData.registrationNumber}_qrcode.png` : "qrcode.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(svgUrl);
        setTimeout(() => setIsDownloadingPNG(false), 300);
      };

      img.onerror = (error) => {
        console.error("Error loading SVG image for PNG conversion:", error);
        setIsDownloadingPNG(false);
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;

    } catch (error) {
      console.error("Error generating PNG:", error);
      setIsDownloadingPNG(false);
    }
  };

  return (
    // Outermost Page Container: Responsible for centering the 'GroupWrapper'.
    // 'relative' class is removed from here as the button is no longer directly positioned by it.
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 md:p-8">

      {/* Group Wrapper: This div is 'relative' for the MagicBackButton and will be centered by the parent.
          Its width will be determined by the Card inside it. */}
      <div className="relative"> {/* Step 1: Added Group Wrapper */}

        {/* MagicBackButton: Positioned relative to the 'GroupWrapper'.
            'top-0': Aligns button's top with the Card's top.
            '-left-12': Provides a 0.5rem gap to the left of the Card (assuming button is 2.5rem wide).
            'z-10': Ensures button is above the card.
        */}
        <div className="absolute top-0 -left-12 z-10"> {/* Step 3: Adjusted top to top-0 */}
          <MagicBackButton backLink={backLink} />
        </div>

        {/* Main card: Increased max-width for better layout, enhanced shadow for depth */}
        <Card className="w-full max-w-5xl shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <QrCode className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {vehicleData
                  ? `${vehicleData.make} ${vehicleData.model} QR Code`
                  : "Your QR just as you like it..."}
              </CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base pt-1">
              {vehicleData
                ? `Registration Number: ${vehicleData.registrationNumber}`
                : "Customize, and download your QR code effortlessly."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
              {/* Left Column: Controls */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                      <ColorInput
                        label="QR Code Color"
                        defaultValue={color}
                        onChange={(newColor) => setColor(newColor)}
                        showOpacity={true}
                        swatches={[ "#000000", "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899" ]}
                      />
                      <ColorInput
                        label="Background Color"
                        defaultValue={backgroundColor}
                        onChange={(newColor) => setBackgroundColor(newColor)}
                        showOpacity={true}
                        swatches={[ "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#f0f9ff", "#ecfeff", "#f0fdf4", "#fefce8", "#fff7ed", "#fef2f2", "#fdf4ff", "#f5f3ff" ]}
                      />
                    </div>
                    <div className="space-y-2 pt-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="size" className="text-sm font-medium">Pixel Size</Label>
                        <span
                          className="text-sm font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground transition-colors duration-200 ease-in-out"
                        >
                          {size} × {size}
                        </span>
                      </div>
                      <Slider
                        id="size"
                        min={64}
                        max={1024}
                        step={8}
                        value={[size]}
                        onValueChange={(value) => value[0] !== undefined && setSize(value[0])}
                        className="w-full [&>span:first-child]:h-2 [&>span:first-child>span]:h-2 [&>span:first-child>span]:bg-primary"
                        aria-label={`QR code size: ${size} by ${size} pixels`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-0.5">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">Advanced</h3>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="errorCorrection" className="text-sm font-medium">
                        Error Correction Level
                      </Label>
                      <Select
                        value={errorCorrection}
                        onValueChange={(value) => setErrorCorrection(value as "L" | "M" | "Q" | "H")}
                      >
                        <SelectTrigger id="errorCorrection" className="w-full text-sm py-2 h-10">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Low (L ~7%)</SelectItem>
                          <SelectItem value="M">Medium (M ~15%)</SelectItem>
                          <SelectItem value="Q">Quartile (Q ~25%)</SelectItem>
                          <SelectItem value="H">High (H ~30%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground pt-1 leading-normal">
                        Higher resilience against damage, but more dense. 'M' is typical.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column: Preview and Download */}
              <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-5 lg:pl-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-center text-foreground lg:mt-0">Live Preview</h2>
                <div
                  className="w-full rounded-lg border-2 border-dashed border-primary/30 bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 flex items-center justify-center p-3 sm:p-4"
                  style={{
                    aspectRatio: '1 / 1',
                    maxWidth: '480px',
                  }}
                >
                    {qrCode ? (
                      <div
                        className="transition-opacity duration-300 ease-in-out flex items-center justify-center w-full h-full"
                        ref={qrRef}
                        style={{ backgroundColor: backgroundColor }}
                        key={`${qrCode}-${size}-${color}-${backgroundColor}-${errorCorrection}`}
                      >
                        <QRCodeSVG
                          value={qrCode}
                          size={512}
                          fgColor={color}
                          bgColor="transparent"
                          level={errorCorrection}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground p-6 sm:p-8 flex flex-col items-center justify-center h-full">
                        <QrCode className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-3 sm:mb-4 opacity-30" />
                        <p className="font-medium text-sm sm:text-base">QR code loading...</p>
                      </div>
                    )}
                </div>
                {qrCode && (
                  <div className="w-full max-w-xs sm:max-w-sm space-y-3 pt-4">
                    <h3 className="text-base font-semibold text-center text-foreground">Download QR Code</h3>
                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                      {(['PNG', 'SVG'] as const).map((format) => (
                           <Button
                           key={format}
                           onClick={format === 'PNG' ? downloadPNG : downloadSVG}
                           variant={format === 'SVG' ? "outline" : "default"}
                           className="flex-1 transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] py-2.5 h-10 text-sm font-medium"
                           disabled={(format === 'PNG' && isDownloadingPNG) || (format === 'SVG' && isDownloadingSVG)}
                           aria-label={`Download QR code as ${format}`}
                         >
                           {(format === 'PNG' && isDownloadingPNG) || (format === 'SVG' && isDownloadingSVG) ? (
                             <>
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                               Downloading...
                             </>
                           ) : (
                             <>
                               <Download className="mr-2 h-4 w-4" />
                               {`Download ${format}`}
                             </>
                           )}
                         </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div> {/* End of GroupWrapper */}
    </div> // End of PageContainer
  );
}