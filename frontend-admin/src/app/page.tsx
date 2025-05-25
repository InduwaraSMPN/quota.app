import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

/**
 * Landing page for the Admin Portal
 * Provides login/signup options with responsive layout
 */
export default function Home() {
  return (
    // Root container with full viewport height
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Theme toggle - persistent across all viewport sizes */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Responsive layout - stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row flex-1">

        {/* Content panel - full width on mobile, half width on desktop */}
        <div className="w-full md:w-1/2 bg-background flex flex-col p-6 md:p-12 lg:p-16">

          {/* Brand identity */}
          <div>
             <Logo />
          </div>

          {/* Main content container - vertically centered with controlled width */}
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">

            {/* Value proposition - centered on mobile, left-aligned on desktop */}
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Admin Portal
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage fuel quotas, monitor consumption data, and oversee
                the entire fuel distribution system from a central dashboard.
              </p>
            </div>

            {/* Authentication options */}
            <div className="space-y-6">
              <Button
                asChild
                variant="default"
                className="h-14 text-2xl font-medium w-full"
              >
                <Link href="/auth/login" className="flex items-center justify-center">
                  Login
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 text-2xl font-medium w-full"
              >
                <Link href="/auth/signup" className="flex items-center justify-center">
                  Signup
                </Link>
              </Button>
            </div>

          </div>
        </div>

        {/* Desktop hero image - hidden on mobile */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src="/home.jpg"
            alt="Car interior dashboard"
            fill
            priority
            className="object-cover"
            sizes="50vw"
            quality={90}
          />
        </div>

        {/* Mobile background image with overlay for text legibility */}
        <div className="absolute inset-0 -z-10 md:hidden">
           <div className="absolute inset-0 bg-background opacity-70"></div>
           <Image
             src="/home.jpg"
             alt="Car interior dashboard"
             fill
             priority
             className="object-cover"
             sizes="100vw"
             quality={80}
           />
        </div>
      </div>
    </div>
  );
}
