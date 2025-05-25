import { QRCodeGenerator } from "@/components/qr-code"
import { ModeToggle } from "@/components/mode-toggle"

/**
 * QR Code Download Page
 * 
 * This page allows vehicle owners to generate and download their vehicle QR code
 * that can be scanned at fuel stations for quick identification.
 */


export default function Page() {
  return (
    <div className="flex flex-col min-h-svh w-full relative">
      {/* Theme toggle button - fixed position at bottom right*/}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content - centered QR code generator */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div>
            <QRCodeGenerator/>
        </div>
      </div>
    </div>
  )
}