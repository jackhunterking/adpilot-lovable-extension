"use client"

/**
 * Step 1: Get Started
 * Purpose: Capture product context to help AI generate better ad content
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import type { AdBuilderStepProps } from "@/lib/types/ad-builder"

type GetStartedProps = AdBuilderStepProps

export function GetStarted({ draft, onUpdate }: GetStartedProps) {
  // Read directly from draft (single source of truth)
  const productContext = draft.productContext || ""

  // Validation: Product context must be provided
  const isValid = productContext.trim().length > 0

  // Update draft immediately on input change
  const handleChange = (value: string) => {
    onUpdate({ productContext: value })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Tell us about your product to help create better ads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productContext">
              What does your product offer? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="productContext"
              value={productContext}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Describe what your product/service does, who it's for, and what makes it special. For example: 'We offer premium coffee makers for busy professionals who want barista-quality coffee at home. Our machines are easy to use and make café-style drinks in under 2 minutes.'"
              rows={8}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {productContext.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This context helps our AI generate better ad images and copy tailored specifically to your product.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Message */}
      {!isValid && (
        <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ Product context is required to create your ad
          </p>
        </div>
      )}
    </div>
  )
}

