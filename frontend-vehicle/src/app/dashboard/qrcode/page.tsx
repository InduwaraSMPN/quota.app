import { QRCodeGenerator } from "@/components/qr-code"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"

export default function Page() {
  return (
    <div className="flex flex-col min-h-svh w-full relative">

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div>
            <QRCodeGenerator/>
        </div>
      </div>
    </div>
  )
}