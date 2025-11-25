"use client"

/**
 * Platform Connections Hook
 * Checks Facebook and Instagram account connection status
 * Reads from campaign_meta_connections table
 * Real-time updates via Supabase subscriptions
 */

import { useState, useEffect, useRef } from "react"
import { useCampaignContext } from "@/lib/context/campaign-context"
import { supabase } from "@/lib/supabase/client"

export interface PlatformConnections {
  businessConnected: boolean
  facebookConnected: boolean
  instagramConnected: boolean
  loading: boolean
  businessName?: string
  adAccountName?: string
  facebookPageName?: string
  instagramUsername?: string
  error?: string
}

export function usePlatformConnections(): PlatformConnections {
  const { campaign } = useCampaignContext()
  const [connections, setConnections] = useState<PlatformConnections>({
    businessConnected: false,
    facebookConnected: false,
    instagramConnected: false,
    loading: true,
  })
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!campaign?.id) {
      setConnections({
        businessConnected: false,
        facebookConnected: false,
        instagramConnected: false,
        loading: false,
      })
      return
    }

    // Prevent re-fetching on re-renders
    if (hasInitialized.current) return
    hasInitialized.current = true

    const checkConnections = async () => {
      try {
        setConnections((prev) => ({ ...prev, loading: true }))

        // Fetch all three connection types
        const { data, error } = await supabase
          .from("campaign_meta_connections")
          .select("connection_type, selected_business_name, selected_ad_account_name, selected_page_id, selected_page_name, selected_ig_user_id, selected_ig_username, connection_status")
          .eq("campaign_id", campaign.id)

        if (error) {
          console.error("[usePlatformConnections] Error fetching connections:", error)
          setConnections({
            businessConnected: false,
            facebookConnected: false,
            instagramConnected: false,
            loading: false,
            error: "Failed to check connection status",
          })
          return
        }

        // No connections found
        if (!data || data.length === 0) {
          setConnections({
            businessConnected: false,
            facebookConnected: false,
            instagramConnected: false,
            loading: false,
          })
          return
        }

        // Parse connections by type
        const businessConn = data.find((c) => c.connection_type === 'business')
        const pageConn = data.find((c) => c.connection_type === 'facebook_page')
        const instaConn = data.find((c) => c.connection_type === 'instagram')

        // Check connection status with backward compatibility:
        // - If connection_status is explicitly set, use it
        // - If connection_status is NULL but required fields exist, treat as connected (backward compat)
        const businessConnected = !!businessConn && 
          (businessConn.connection_status === 'connected' || 
           (!businessConn.connection_status && !!businessConn.selected_business_id))
        
        const facebookConnected = !!pageConn && 
          (pageConn.connection_status === 'connected' || 
           (!pageConn.connection_status && !!pageConn.selected_page_id)) && 
          !!pageConn.selected_page_id
        
        const instagramConnected = !!instaConn && 
          (instaConn.connection_status === 'connected' || 
           (!instaConn.connection_status && !!instaConn.selected_ig_user_id)) && 
          !!instaConn.selected_ig_user_id

        setConnections({
          businessConnected,
          facebookConnected,
          instagramConnected,
          loading: false,
          businessName: businessConn?.selected_business_name || undefined,
          adAccountName: businessConn?.selected_ad_account_name || undefined,
          facebookPageName: pageConn?.selected_page_name || undefined,
          instagramUsername: instaConn?.selected_ig_username || undefined,
        })

        console.log("[usePlatformConnections] Connection status:", {
          campaignId: campaign.id,
          businessConnected,
          facebookConnected,
          instagramConnected,
          businessName: businessConn?.selected_business_name,
          facebookPageName: pageConn?.selected_page_name,
          instagramUsername: instaConn?.selected_ig_username,
        })
      } catch (err) {
        console.error("[usePlatformConnections] Unexpected error:", err)
        setConnections({
          businessConnected: false,
          facebookConnected: false,
          instagramConnected: false,
          loading: false,
          error: "Unexpected error checking connections",
        })
      }
    }

    void checkConnections()

    // Real-time subscription for connection changes
    const channel = supabase
      .channel(`platform_connections_${campaign.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_meta_connections",
          filter: `campaign_id=eq.${campaign.id}`,
        },
        (payload) => {
          console.log("[usePlatformConnections] Real-time update:", payload)

          // Re-fetch all connections when any change occurs
          void checkConnections()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
      hasInitialized.current = false
    }
  }, [campaign?.id])

  return connections
}

