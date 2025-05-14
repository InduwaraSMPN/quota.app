import { LoginForm } from "@/components/auth/LoginForm"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/logo"
import { Toaster } from "@/components/ui/sonner"

export default function Page() {
  return (
    <div className="flex flex-col min-h-svh w-full relative">
      {/* Logo at the top */}
      <div className="absolute top-0 left-0 z-10">
        <Logo />
      </div>

      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
