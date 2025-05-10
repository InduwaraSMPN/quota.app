"use client"

import { Logo } from "@/components/logo"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={className}>
      <Logo />
    </header>
  )
}
