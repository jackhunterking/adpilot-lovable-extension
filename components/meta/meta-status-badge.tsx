/**
 * Feature: Meta Connection Status Badge
 * Purpose: Reusable component to show Meta connection and payment status
 * Extracted from WorkspaceHeader for reusability
 */

"use client"

import { Facebook, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetaStatusBadgeProps {
  metaConnectionStatus?: 'disconnected' | 'pending' | 'connected' | 'error' | 'expired'
  paymentStatus?: 'unknown' | 'verified' | 'missing' | 'flagged' | 'processing'
  className?: string
}

export function MetaStatusBadge({
  metaConnectionStatus = 'disconnected',
  paymentStatus = 'unknown',
  className,
}: MetaStatusBadgeProps) {
  const isConnected = metaConnectionStatus === 'connected'
  const hasPaymentIssue = paymentStatus === 'missing' || paymentStatus === 'flagged'

  // Don't show badge if disconnected
  if (!isConnected) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Meta Connection Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
        <Facebook className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
          Meta Connected
        </span>
      </div>

      {/* Payment Status Badge */}
      {hasPaymentIssue && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
            Payment Setup Required
          </span>
        </div>
      )}

      {paymentStatus === 'verified' && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Payment Verified
          </span>
        </div>
      )}
    </div>
  )
}

