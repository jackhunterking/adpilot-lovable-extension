/**
 * Feature: Ad Mockup Format Toggle
 * Purpose: Toggle between square (1080x1080) and vertical (1080x1920) formats
 * References:
 *  - Lovable Extension: Dual format support
 *  - UI Pattern: Tab-based format switcher
 */

"use client"

import { cn } from "@/lib/utils"

interface AdMockupFormatToggleProps {
  /** Currently selected format */
  selectedFormat: 'square' | 'vertical'
  
  /** Callback when format changes */
  onFormatChange: (format: 'square' | 'vertical') => void
  
  /** Optional className for custom styling */
  className?: string
}

export function AdMockupFormatToggle({
  selectedFormat,
  onFormatChange,
  className
}: AdMockupFormatToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-muted p-1", className)}>
      <button
        onClick={() => onFormatChange('square')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selectedFormat === 'square'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
        aria-pressed={selectedFormat === 'square'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
        </svg>
        <span>Square</span>
        <span className="text-xs opacity-70">(1:1)</span>
      </button>
      
      <button
        onClick={() => onFormatChange('vertical')}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selectedFormat === 'vertical'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
        aria-pressed={selectedFormat === 'vertical'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect width="12" height="20" x="6" y="2" rx="2" />
        </svg>
        <span>Vertical</span>
        <span className="text-xs opacity-70">(9:16)</span>
      </button>
    </div>
  )
}

