"use client"

import { useState } from "react"

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean>

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)

  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported")
      return false
    }

    // Try to save to clipboard then save it in the state if successful
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000) // Reset after 2 seconds
      return true
    } catch (error) {
      console.warn("Copy failed", error)
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}