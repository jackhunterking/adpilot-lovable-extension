/**
 * Feature: Lovable Extension - Ad Builder Page
 * Purpose: Full 6-step ad builder wizard for Lovable Chrome extension
 * Steps: Get Started → Creative & Copy → Target Location → Target Audience → Budget & Schedule → Review & Launch
 */

"use client"

import { useCallback } from "react"
import { AdBuilder } from "@/components/ad-builder/ad-builder"
import { CampaignProvider } from "@/lib/context/campaign-context"

export default function LovableCreateAdPage() {
  console.log('[CREATE-AD] Page component mounting')
  
  // Get Lovable project context from extension
  const getLovableContext = useCallback(() => {
    console.log('[CREATE-AD] Getting Lovable context')
    try {
      const context = sessionStorage.getItem('adpilot_lovable_context')
      if (context) {
        return JSON.parse(context)
      }
    } catch (err) {
      console.error('[Lovable Create Ad] Error parsing context:', err)
    }
    return null
  }, [])

  const lovableContext = getLovableContext()
  const lovableProjectId = lovableContext?.lovableProjectId
  
  console.log('[CREATE-AD] Rendering with projectId:', lovableProjectId)

  return (
    <CampaignProvider>
      {console.log('[CREATE-AD] CampaignProvider rendered')}
      <AdBuilder lovableProjectId={lovableProjectId} />
    </CampaignProvider>
  )
}
