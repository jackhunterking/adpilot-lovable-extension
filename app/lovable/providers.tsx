/**
 * Feature: Lovable Routes Providers
 * Purpose: Client component providers for lovable routes
 */

"use client"

import { ReactNode } from "react"
import { BudgetProvider } from "@/lib/context/budget-context"
import { AdCopyProvider } from "@/lib/context/ad-copy-context"
import { LocationProvider } from "@/lib/context/location-context"
import { CurrentAdProvider } from "@/lib/context/current-ad-context"
import { AdPreviewProvider } from "@/lib/context/ad-preview-context"
import { GoalProvider } from "@/lib/context/goal-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CurrentAdProvider>
      <GoalProvider>
        <BudgetProvider>
          <AdCopyProvider>
            <LocationProvider>
              <AdPreviewProvider>
                {children}
              </AdPreviewProvider>
            </LocationProvider>
          </AdCopyProvider>
        </BudgetProvider>
      </GoalProvider>
    </CurrentAdProvider>
  )
}

