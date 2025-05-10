import { ModeToggle } from "@/components/mode-toggle"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
          <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      this is forgot password page
    </div>
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>
    </div>
  )
}