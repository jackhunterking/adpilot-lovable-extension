/**
 * Feature: Lovable Layout
 * Purpose: Shared layout wrapper with auth check and navigation
 * Note: Uses AppSidebar (vertical sidebar) instead of LovableNavigation (horizontal tabs)
 */

"use client"

import { ReactNode, useEffect, useState, Suspense } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { LovableAuthBlocker } from "./auth-blocker"
import { AuthModal } from "@/components/auth/auth-modal"
import { MetaConnectionModal } from "@/components/meta/meta-connection-modal"
import { useFullscreenMode } from "@/lib/context/fullscreen-mode-context"
import { useCampaignContext } from "@/lib/context/campaign-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type AuthStep = 'checking' | 'need-google-auth' | 'need-meta-auth' | 'ready' | 'error'

interface LovableLayoutProps {
  children: ReactNode
  requireMeta?: boolean // Whether this page requires Meta connection
}

export function LovableLayout({ children, requireMeta = false }: LovableLayoutProps) {
  const { user } = useAuth()
  const { isFullscreen } = useFullscreenMode()
  const { campaign, loadCampaign } = useCampaignContext()
  const [authStep, setAuthStep] = useState<AuthStep>('checking')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [lovableProjectId, setLovableProjectId] = useState<string | null>(null)
  const [loadingCampaign, setLoadingCampaign] = useState(false)

  // Listen for project context from extension (via postMessage)
  useEffect(() => {
    console.log('[LovableLayout] Setting up postMessage listener')
    
    // Check if context already in sessionStorage
    try {
      const existingContext = sessionStorage.getItem('adpilot_lovable_context')
      if (existingContext) {
        const parsed = JSON.parse(existingContext)
        console.log('[LovableLayout] Found existing context:', parsed)
        setLovableProjectId(parsed.lovableProjectId)
      }
    } catch (err) {
      console.error('[LovableLayout] Error parsing existing context:', err)
    }
    
    // Listen for project context from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADPILOT_PROJECT_CONTEXT') {
        console.log('[LovableLayout] Project context received:', event.data.payload)
        
        const { lovableProjectId: projectId } = event.data.payload
        
        // Store in sessionStorage
        sessionStorage.setItem('adpilot_lovable_context', JSON.stringify(event.data.payload))
        
        // Update state
        setLovableProjectId(projectId)
        console.log('[LovableLayout] ✅ Project ID set:', projectId)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Request context from extension
    console.log('[LovableLayout] Requesting project context from extension...')
    window.parent.postMessage({
      type: 'ADPILOT_REQUEST_CONTEXT',
      timestamp: Date.now()
    }, '*')
    
    // Retry mechanism
    let retries = 0
    const retryInterval = setInterval(() => {
      if (sessionStorage.getItem('adpilot_lovable_context')) {
        clearInterval(retryInterval)
        return
      }
      
      if (retries < 5) {
        console.log('[LovableLayout] Retrying context request...', retries + 1)
        window.parent.postMessage({
          type: 'ADPILOT_REQUEST_CONTEXT',
          timestamp: Date.now()
        }, '*')
        retries++
      } else {
        clearInterval(retryInterval)
        console.warn('[LovableLayout] ⚠️ Failed to receive context after 5 retries')
      }
    }, 2000)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(retryInterval)
    }
  }, [])

  // Load campaign when we have lovableProjectId
  useEffect(() => {
    async function loadCampaignFromProject() {
      if (!user || !lovableProjectId || loadingCampaign) return
      
      // Check if we already have this campaign loaded in context
      if (campaign && campaign.lovable_project_id === lovableProjectId) {
        console.log('[LovableLayout] Campaign already loaded:', campaign.id)
        setCampaignId(campaign.id)
        return
      }
      
      // Check sessionStorage
      const existingCampaignId = sessionStorage.getItem('lovable_campaign_id')
      const existingProjectId = sessionStorage.getItem('lovable_project_id')
      
      if (existingCampaignId && existingProjectId === lovableProjectId) {
        console.log('[LovableLayout] Using existing campaign:', existingCampaignId)
        setCampaignId(existingCampaignId)
        return
      }
      
      console.log('[LovableLayout] Loading campaign for project:', lovableProjectId)
      setLoadingCampaign(true)
      
      try {
        const response = await fetch(`/api/v1/lovable/projects/${lovableProjectId}/campaigns`, {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to load campaign data')
        }
        
        const result = await response.json()
        console.log('[LovableLayout] Campaign data loaded:', result)
        
        if (result.success && result.data?.campaigns?.length > 0) {
          // Use the first (most recent) campaign
          const campaignData = result.data.campaigns[0]
          console.log('[LovableLayout] Using existing campaign:', campaignData.id)
          setCampaignId(campaignData.id)
          sessionStorage.setItem('lovable_campaign_id', campaignData.id)
          sessionStorage.setItem('lovable_project_id', lovableProjectId)
        } else {
          console.log('[LovableLayout] No campaigns found for project - will be auto-created when user creates first ad')
          // Don't set campaignId - it will be created when user creates first ad
        }
      } catch (error) {
        console.error('[LovableLayout] Error loading campaign:', error)
        setAuthError('Failed to load campaign data. Please try again.')
        setAuthStep('error')
      } finally {
        setLoadingCampaign(false)
      }
    }
    
    loadCampaignFromProject()
  }, [user, lovableProjectId, loadingCampaign, campaign])
  
  // Load campaign into context when we have a campaignId
  useEffect(() => {
    if (campaignId && !campaign) {
      console.log('[LovableLayout] Loading campaign into context:', campaignId)
      loadCampaign(campaignId)
    }
  }, [campaignId, campaign, loadCampaign])

  // Check authentication flow - SIMPLIFIED (no campaign creation here)
  useEffect(() => {
    async function checkAuth() {
      setAuthError(null)

      // Step 1: Check Google Auth
      if (!user) {
        setAuthStep('need-google-auth')
        return
      }

      // Step 2: Wait for campaign to be loaded if we have a lovableProjectId
      if (lovableProjectId && !campaignId && loadingCampaign) {
        // Still loading campaign, wait
        return
      }
      
      console.log('[LovableLayout] User authenticated, campaignId:', campaignId || 'none')

      // Step 3: Check Meta connection (if required)
      if (requireMeta && campaignId) {
        const isMetaConnected = await checkMetaConnection(campaignId)
        
        if (!isMetaConnected) {
          setAuthStep('need-meta-auth')
          setMetaModalOpen(true)
          return
        }
      }

      setAuthStep('ready')
    }

    checkAuth()
  }, [user, requireMeta, campaignId, lovableProjectId, loadingCampaign])

  const checkMetaConnection = async (cid: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/meta/status?campaignId=${cid}`, {
        credentials: 'include'
      })
      
      if (!response.ok) return false
      
      const data = await response.json()
      return data.connected && data.adAccount?.id
    } catch {
      return false
    }
  }

  const handleRetry = () => {
    setAuthError(null)
    setAuthStep('checking')
    window.location.reload()
  }

  // Render based on auth step
  if (authStep === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (authStep === 'need-google-auth') {
    return (
      <>
        <LovableAuthBlocker 
          type="google" 
          onGoogleAuthClick={() => setAuthModalOpen(true)}
        />
        <AuthModal 
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultTab="signin"
        />
      </>
    )
  }

  if (authStep === 'need-meta-auth') {
    return (
      <>
        <LovableAuthBlocker 
          type="meta" 
          onMetaAuthClick={() => setMetaModalOpen(true)}
        />
        {campaignId && (
          <MetaConnectionModal 
            open={metaModalOpen}
            onOpenChange={setMetaModalOpen}
            onSuccess={() => {
              setMetaModalOpen(false)
              setAuthStep('ready')
            }}
          />
        )}
      </>
    )
  }

  if (authStep === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError || 'An error occurred. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="w-full">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // authStep === 'ready'
  return (
    <div className="h-screen bg-background flex flex-row overflow-hidden">
      {!isFullscreen && (
        <Suspense fallback={<div className="w-64 border-r h-full" />}>
          <AppSidebar />
        </Suspense>
      )}
      <main className="flex-1 overflow-auto h-full">
        {children}
      </main>
    </div>
  )
}

