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
  facebookConnected: boolean
  instagramConnected: boolean
  loading: boolean
  facebookPageName?: string
  instagramUsername?: string
  error?: string
}

export function usePlatformConnections(): PlatformConnections {
  const { campaign } = useCampaignContext()
  const [connections, setConnections] = useState<PlatformConnections>({
    facebookConnected: false,
    instagramConnected: false,
    loading: true,
  })
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!campaign?.id) {
      setConnections({
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

        const { data, error } = await supabase
          .from("campaign_meta_connections")
          .select("selected_page_id, selected_page_name, selected_ig_user_id, selected_ig_username")
          .eq("campaign_id", campaign.id)
          .single()

        if (error) {
          // If no connection found, it's okay - just means not connected
          if (error.code === "PGRST116") {
            setConnections({
              facebookConnected: false,
              instagramConnected: false,
              loading: false,
            })
            return
          }

          console.error("[usePlatformConnections] Error fetching connections:", error)
          setConnections({
            facebookConnected: false,
            instagramConnected: false,
            loading: false,
            error: "Failed to check connection status",
          })
          return
        }

        const facebookConnected = !!data?.selected_page_id
        const instagramConnected = !!data?.selected_ig_user_id

        setConnections({
          facebookConnected,
          instagramConnected,
          loading: false,
          facebookPageName: data?.selected_page_name || undefined,
          instagramUsername: data?.selected_ig_username || undefined,
        })

        console.log("[usePlatformConnections] Connection status:", {
          campaignId: campaign.id,
          facebookConnected,
          instagramConnected,
          facebookPageName: data?.selected_page_name,
          instagramUsername: data?.selected_ig_username,
        })
      } catch (err) {
        console.error("[usePlatformConnections] Unexpected error:", err)
        setConnections({
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

          // Re-check connections when data changes
          const newData = payload.new as any
          if (newData) {
            setConnections({
              facebookConnected: !!newData.selected_page_id,
              instagramConnected: !!newData.selected_ig_user_id,
              loading: false,
              facebookPageName: newData.selected_page_name || undefined,
              instagramUsername: newData.selected_ig_username || undefined,
            })
          }
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

