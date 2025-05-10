import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    // Main container with min height and flex column layout
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Theme toggle button - fixed for easy access */}
      <div className="fixed bottom-6 right-6 z-50">
        <ModeToggle />
      </div>

      {/* Main content area with split layout on medium screens and up */}
      <div className="flex flex-col md:flex-row flex-1"> {/* Use flex-1 to ensure content pushes footer (if any) down, though min-h-screen on parent achieves full height */}

        {/* Left side - Content area */}
        <div className="w-full md:w-1/2 bg-background flex flex-col p-6 md:p-12 lg:p-16"> {/* Added padding */}

          {/* Logo - Positioned at the top-left */}
          {/* Assuming Logo component has its own padding/margins or we add them here */}
          <div> {/* Added margin below logo */}
             <Logo />
          </div>


          {/* Content block (Title, Subtitle, Buttons) - Centered vertically and horizontally */}
          {/* Added max-width and auto margins for better readability on large screens */}
          {/* Added generous vertical space using space-y */}
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8"> {/* Increased space-y */}

            {/* Text Content - Enhancing Visual Hierarchy */}
            {/* Added main heading and subtitle */}
            <div className="space-y-4 text-center md:text-left"> {/* Added space between text elements, centered text on mobile */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground"> {/* Prominent Heading */}
                Station Portal
              </h1>
              <p className="text-lg text-muted-foreground"> {/* Descriptive Subtitle */}
                Efficiently manage fuel dispensing, scan customer QR codes,
                and track station-level quota allocations and usage.
              </p>
            </div>

            {/* Buttons Container - Clear Call to Actions */}
            {/* Using consistent spacing for buttons */}
            <div className="space-y-6"> {/* Space between buttons */}
              <Button
                asChild
                variant="default" // Assuming 'default' uses primary colors
                className="h-14 text-2xl font-medium w-full" // Slightly smaller size, medium font, added hover effect
              >
                <Link href="/auth/login" className="flex items-center justify-center">
                  Login
                </Link>
              </Button>
              <Button
                asChild
                variant="outline" // Using outline variant for secondary action
                className="h-14 text-2xl font-medium w-full" // Slightly smaller size, medium font, added hover effect
              >
                <Link href="/auth/signup" className="flex items-center justify-center">
                  Signup
                </Link>
              </Button>
            </div>

          </div>
        </div>

        {/* Right side - Desktop Background Image */}
        {/* Hidden on small screens, takes up half width on medium+ */}
        <div className="hidden md:block w-1/2 relative">
          <Image
            src="/home.jpg"
            alt="Car interior dashboard" // Keep alt text
            fill
            priority
            className="object-cover" // Ensure image covers the area
            sizes="50vw" // Optimize image loading
            quality={90} // Maintain quality
          />
        </div>

        {/* Mobile Background Image - Only visible on small screens */}
        {/* Added a slight overlay for better text readability */}
        <div className="absolute inset-0 -z-10 md:hidden">
           {/* Semi-transparent overlay */}
           <div className="absolute inset-0 bg-background opacity-70"></div>
           <Image
             src="/home.jpg"
             alt="Car interior dashboard" // Keep alt text
             fill
             priority
             className="object-cover" // Ensure image covers the area
             sizes="100vw" // Optimize image loading
             quality={80} // Maintain quality
           />
        </div>
      </div>
    </div>
  );
}