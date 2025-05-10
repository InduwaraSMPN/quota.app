"use client"

import { useState, useId } from "react" // Added useId for unique IDs
import { cn } from "@/lib/utils"
import { useCopyToClipboard } from "@/components/hooks/use-copy-to-clipboard"
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons"

interface ColorInputProps {
  onChange?: (color: string) => void
  defaultValue?: string
  swatches?: string[]
  showOpacity?: boolean
  label?: string
  id?: string // Allow passing an ID for accessibility
}

const defaultSwatches = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#737373", // Replaced #f43f5e with a gray
]

const generateFinalColor = (color: string, opacity: number): string => {
  if (opacity === 100 || !color.startsWith("#") || color.length !== 7) return color
  const alpha = Math.round(opacity * 2.55).toString(16).padStart(2, "0")
  return `${color}${alpha}`
}

function ColorInput({
  onChange,
  defaultValue = "#3b82f6",
  swatches = defaultSwatches,
  showOpacity = true,
  label = "Color",
  id: providedId,
}: ColorInputProps) {
  const [color, setColor] = useState(defaultValue.slice(0, 7)) // Store base color (#RRGGBB)
  const [opacity, setOpacity] = useState(
    defaultValue.length === 9 ? Math.round(parseInt(defaultValue.slice(7, 9), 16) / 2.55) : 100
  )
  const [copiedText, copy] = useCopyToClipboard()
  const generatedId = useId() // Generate a unique ID
  const inputId = providedId || generatedId // Use provided ID or generated one

  const finalColor = generateFinalColor(color, opacity)

  const updateBaseColor = (newBaseColor: string) => {
    if (/^#[0-9A-F]{6}$/i.test(newBaseColor)) {
      setColor(newBaseColor)
      onChange?.(generateFinalColor(newBaseColor, opacity))
    }
  }

  const handleInputChange = (inputValue: string) => {
    const upperValue = inputValue.toUpperCase();
    // Allow partial input like #, #F, #FF, etc.
    if (upperValue.startsWith("#") && upperValue.length <= 7 && /^[0-9A-F#]*$/i.test(upperValue)) {
       // For direct input, we temporarily update the visual input but only commit valid hex for color state
       // This is a complex UX, for now, we'll stick to updating `color` only on valid full hex.
       // The input will show `upperValue`, but `finalColor` uses `color` state.
       // A better approach might involve a temporary input state.
    }
    if (/^#[0-9A-F]{6}$/i.test(upperValue)) {
        updateBaseColor(upperValue);
    }
  }


  const updateOpacityHandler = (newOpacity: number) => {
    setOpacity(newOpacity)
    onChange?.(generateFinalColor(color, newOpacity))
  }

  const handleCopy = async () => {
    await copy(finalColor)
  }

  return (
    // MODIFIED: Removed max-w-xs, min-h-[200px], z-10.
    // `position: relative` is kept as it's often useful for internal absolutely positioned elements
    // and generally doesn't cause harm unless a specific stacking context issue arises.
    <div className="w-full space-y-2 relative">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" // Added 'block'
        >
          {label}
        </label>
      )}

      <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
        <div className="flex gap-2 items-center">
          <div
            className="w-8 h-8 rounded-md border border-zinc-300 dark:border-zinc-700 shrink-0" // Added shrink-0
            style={{ backgroundColor: finalColor }}
          />
          <input
            id={inputId} // Use unique ID
            type="text"
            value={finalColor.toUpperCase()} // Display final color (could be #RRGGBBAA or #RRGGBB)
            onChange={(e) => handleInputChange(e.target.value)}
            className={cn(
              "flex-1 px-2.5 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700",
              "bg-white dark:bg-zinc-800 text-sm font-mono min-w-0", // Added min-w-0
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900", // Improved focus
            )}
            aria-label={label ? `${label} hex value` : "Color hex value"}
          />
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shrink-0" // Adjusted padding
            aria-label="Copy color code"
          >
            {copiedText === finalColor ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <CopyIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            )}
          </button>
        </div>

        {showOpacity && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span>Opacity</span>
              <span>{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => updateOpacityHandler(Number(e.target.value))}
              className={cn(
                "w-full h-2 rounded-full appearance-none cursor-pointer",
                // Base track color
                "bg-zinc-200 dark:bg-zinc-700",
                // Webkit thumb styles
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-zinc-900",
                "[&::-webkit-slider-thumb]:shadow-sm",
                "[&::-webkit-slider-thumb]:bg-current", // Thumb color from `style`
                "[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform",
                // Moz thumb styles
                "[&::-moz-range-thumb]:appearance-none",
                "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white dark:[&::-moz-range-thumb]:border-zinc-900",
                "[&::-moz-range-thumb]:shadow-sm",
                "[&::-moz-range-thumb]:bg-current", // Thumb color from `style`
                "[&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
              )}
              style={{
                color: color, // Sets the 'current' color for thumb
                // Dynamic gradient for the track fill (optional, can be complex to get perfect cross-browser)
                // For simplicity, a solid track with colored thumb is often clearer.
                // The `bg-gradient-to-r from-transparent to-current` was removed for a simpler base track.
              }}
              aria-label="Color opacity"
            />
          </div>
        )}

        <div className="mt-4 space-y-1.5">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Swatches
          </div>
          <div className="grid grid-cols-6 gap-1.5"> {/* Adjusted gap for swatches */}
            {swatches.map((swatch) => (
              <button
                type="button"
                key={swatch}
                onClick={() => updateBaseColor(swatch)} // Use updateBaseColor
                className={cn(
                  "w-full pt-[100%] h-0 rounded-md border border-zinc-300 dark:border-zinc-600", // Aspect ratio trick for square swatches
                  "transition-all duration-150 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900",
                  "relative flex items-center justify-center group"
                )}
                style={{ backgroundColor: swatch }}
                aria-label={`Select color ${swatch}`}
              >
                {color === swatch && ( // Compare with base color
                  <CheckIcon
                    className={cn(
                      "w-4 h-4 text-white absolute inset-0 m-auto",
                      "drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ColorInput }