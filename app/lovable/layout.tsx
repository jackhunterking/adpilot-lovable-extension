/**
 * Feature: Lovable Routes Layout
 * Purpose: Provides context providers for all lovable sub-routes
 * Force dynamic rendering for all nested routes (authentication required)
 */

import { ReactNode } from "react"
import { Providers } from "./providers"

// Force dynamic rendering - lovable routes require authentication
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LovableRoutesLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>
}

