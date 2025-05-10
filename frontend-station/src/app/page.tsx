import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Theme toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content with split design */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Graphic elements */}
        <div className="w-full md:w-1/2 bg-background flex flex-col">
          {/* Logo */}
          <Logo />

          {/* Buttons container - centered vertically and horizontally */}
          <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16">
            <div className="max-w-md mx-auto w-full space-y-6">
              <Button
                asChild
                variant="default"
                className="h-16 text-3xl font-normal w-full bg-primary text-primary-foreground"
              >
                <Link href="/auth/login" className="flex items-center justify-center">
                  Login
                </Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="h-16 text-3xl font-normal w-full bg-primary text-primary-foreground"
              >
                <Link href="/auth/signup" className="flex items-center justify-center">
                  Signup
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Photo */}
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

        {/* Mobile background image (only visible on small screens) */}
        <div className="absolute inset-0 -z-10 md:hidden">
          <Image
            src="/home.jpg"
            alt="Car interior dashboard"
            fill
            priority
            className="object-cover opacity-20"
            sizes="100vw"
            quality={80}
          />
        </div>
      </div>
    </div>
  );
}