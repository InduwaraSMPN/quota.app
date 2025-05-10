"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 200, height = 40 }: LogoProps) {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      <Link href="/">
        <Image
          src="/quota.app.logo.svg"
          alt="Quota.app Logo"
          width={width}
          height={height}
          className="h-auto"
          priority
        />
      </Link>
    </div>
  )
}
