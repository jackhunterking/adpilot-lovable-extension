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
      {console.log('[PROVIDERS] CurrentAdProvider rendered')}
      <GoalProvider>
        {console.log('[PROVIDERS] GoalProvider rendered')}
        <DestinationProvider>
          {console.log('[PROVIDERS] DestinationProvider rendered')}
          <GenerationProvider>
            {console.log('[PROVIDERS] GenerationProvider rendered')}
            <BudgetProvider>
              {console.log('[PROVIDERS] BudgetProvider rendered')}
              <AdCopyProvider>
                {console.log('[PROVIDERS] AdCopyProvider rendered')}
                <LocationProvider>
                  {console.log('[PROVIDERS] LocationProvider rendered')}
                  <AdPreviewProvider>
                    {console.log('[PROVIDERS] AdPreviewProvider rendered')}
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

