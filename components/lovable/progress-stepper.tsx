/**
 * Feature: Progress Stepper
 * Purpose: Step indicator for multi-step flows
 */

"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  label: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

export function ProgressStepper({ steps, currentStep, onStepClick }: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((step, stepIdx) => {
          const isComplete = stepIdx < currentStep
          const isCurrent = stepIdx === currentStep
          const isClickable = !!onStepClick && stepIdx <= currentStep

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                stepIdx !== steps.length - 1 && "flex-1"
              )}
            >
              <button
                onClick={() => isClickable && onStepClick(stepIdx)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete && "border-primary bg-primary",
                    isCurrent && "border-primary bg-background",
                    !isComplete && !isCurrent && "border-muted bg-background"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrent && "text-primary",
                        !isCurrent && "text-muted-foreground"
                      )}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <div className="text-left hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (isComplete || isCurrent) && "text-foreground",
                      !isComplete && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 transition-colors",
                    isComplete ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

