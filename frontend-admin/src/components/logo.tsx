"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string // This className is for the wrapping div
  width?: number
  height?: number
}

export function Logo({ className, width = 200, height = 40 }: LogoProps) {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      {/* Make the Link a block-level element so 'w-full' on Image works as expected */}
      {/* You can also give the Link a specific width if desired, e.g., style={{ width: `${width}px` }}
          or Tailwind: w-[200px] (if using default values) */}
      <Link href="/" className="block">
        <Image
          src="/quota.app.logo.svg"
          alt="Quota.app Logo"
          width={width} // Defines aspect ratio (200/40 = 5:1) and helps Next.js optimize
          height={height} // Defines aspect ratio
          className="h-auto w-4xs" // Image takes full width of parent (Link), height adjusts for aspect ratio
          priority
        />
      </Link>
    </div>
  )
}