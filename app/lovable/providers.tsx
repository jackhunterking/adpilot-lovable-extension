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
import { DestinationProvider } from "@/lib/context/destination-context"
import { GenerationProvider } from "@/lib/context/generation-context"

export function Providers({ children }: { children: ReactNode }) {
  console.log('[PROVIDERS] Mounting provider chain')
  
  return (
    <CurrentAdProvider>
      <GoalProvider>
        <DestinationProvider>
          <GenerationProvider>
            <BudgetProvider>
              <AdCopyProvider>
                <LocationProvider>
                  <AdPreviewProvider>
                    {children}
                  </AdPreviewProvider>
                </LocationProvider>
              </AdCopyProvider>
            </BudgetProvider>
          </GenerationProvider>
        </DestinationProvider>
      </GoalProvider>
    </CurrentAdProvider>
  )
}

