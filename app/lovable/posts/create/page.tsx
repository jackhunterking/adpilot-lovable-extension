/**
 * Feature: Lovable Extension - Create Post Page
 * Purpose: 3-step post builder wizard for Lovable Chrome extension
 * Steps: Content & Media → Platforms & Schedule → Review & Publish
 */

"use client"

import { useState, useEffect } from "react"
import { PostBuilder } from "@/components/post-builder/post-builder"
import { CampaignProvider } from "@/lib/context/campaign-context"
import { LovableLayout } from "@/components/lovable/lovable-layout"

export default function CreatePostPage() {
  console.log('[CREATE-POST] Page component mounting')
  
  const [lovableProjectId, setLovableProjectId] = useState<string | undefined>(undefined)
  const [contextLoaded, setContextLoaded] = useState(false)
  
  // Request project context from extension on mount
  useEffect(() => {
    console.log('[CREATE-POST] Setting up postMessage listener')
    
    // First, check if context is already in sessionStorage
    try {
      const existingContext = sessionStorage.getItem('adpilot_lovable_context')
      if (existingContext) {
        const parsed = JSON.parse(existingContext)
        console.log('[CREATE-POST] Found existing context in sessionStorage:', parsed)
        setLovableProjectId(parsed.lovableProjectId)
        setContextLoaded(true)
        return
      }
    } catch (err) {
      console.error('[CREATE-POST] Error parsing existing context:', err)
    }
    
    // Listen for project context from extension (via postMessage)
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from parent (extension content script)
      if (event.data && event.data.type === 'ADPILOT_PROJECT_CONTEXT') {
        console.log('[CREATE-POST] Project context received:', event.data.payload)
        
        const { lovableProjectId: projectId, lovableProjectUrl } = event.data.payload
        
        // Store context in sessionStorage
        sessionStorage.setItem('adpilot_lovable_context', JSON.stringify(event.data.payload))
        
        // Update state
        setLovableProjectId(projectId)
        setContextLoaded(true)
        
        console.log('[CREATE-POST] ✅ Context loaded, projectId:', projectId)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Request context from extension on load
    console.log('[CREATE-POST] Requesting project context from extension...')
    window.parent.postMessage({
      type: 'ADPILOT_REQUEST_CONTEXT',
      timestamp: Date.now()
    }, '*')
    
    // Retry every 2 seconds if no response (max 5 retries)
    let retries = 0
    const retryInterval = setInterval(() => {
      if (sessionStorage.getItem('adpilot_lovable_context')) {
        clearInterval(retryInterval)
        return
      }
      
      if (retries < 5) {
        console.log('[CREATE-POST] Retrying context request...', retries + 1)
        window.parent.postMessage({
          type: 'ADPILOT_REQUEST_CONTEXT',
          timestamp: Date.now()
        }, '*')
        retries++
      } else {
        clearInterval(retryInterval)
        console.warn('[CREATE-POST] ⚠️  Failed to receive context after 5 retries')
        setContextLoaded(true) // Allow rendering anyway
      }
    }, 2000)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(retryInterval)
    }
  }, [])
  
  console.log('[CREATE-POST] Rendering with projectId:', lovableProjectId, 'loaded:', contextLoaded)

  return (
    <LovableLayout>
      <CampaignProvider>
        <PostBuilder lovableProjectId={lovableProjectId} />
      </CampaignProvider>
    </LovableLayout>
  )
}

