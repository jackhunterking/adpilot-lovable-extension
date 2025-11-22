/**
 * Feature: Setup Status Hook
 * Purpose: Check if user has completed initial setup
 */

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export interface SetupStatus {
  isLoading: boolean
  needsSetup: boolean
  hasMetaConnection: boolean
  hasConversionTracking: boolean
}

export function useSetupStatus() {
  const [status, setStatus] = useState<SetupStatus>({
    isLoading: true,
    needsSetup: false,
    hasMetaConnection: false,
    hasConversionTracking: false,
  })

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus({
          isLoading: false,
          needsSetup: false,
          hasMetaConnection: false,
          hasConversionTracking: false,
        })
        return
      }

      // ⚠️ BACKEND OPERATION: Check if user has Meta connection
      const { data: metaConnection } = await supabase
        .from("meta_connections")
        .select("id, access_token, ad_account_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      const hasMetaConnection = !!metaConnection?.ad_account_id

      // Check if conversion tracking is set up
      // This could be checking for a specific edge function or configuration
      // For now, we'll assume it's set up if they have a Meta connection
      const hasConversionTracking = hasMetaConnection

      const needsSetup = !hasMetaConnection

      setStatus({
        isLoading: false,
        needsSetup,
        hasMetaConnection,
        hasConversionTracking,
      })
    } catch (error) {
      console.error("Failed to check setup status:", error)
      setStatus({
        isLoading: false,
        needsSetup: true,
        hasMetaConnection: false,
        hasConversionTracking: false,
      })
    }
  }

  const refreshSetupStatus = () => {
    checkSetupStatus()
  }

  return {
    ...status,
    refreshSetupStatus,
  }
}

