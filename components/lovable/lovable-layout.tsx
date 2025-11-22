/**
 * Feature: Lovable Layout
 * Purpose: Shared layout wrapper with auth check and navigation
 */

"use client"

import { ReactNode, useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { LovableNavigation } from "./lovable-navigation"
import { LovableAuthBlocker } from "./auth-blocker"
import { AuthModal } from "@/components/auth/auth-modal"
import { MetaConnectionModal } from "@/components/meta/meta-connection-modal"
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
  const [authStep, setAuthStep] = useState<AuthStep>('checking')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [campaignId, setCampaignId] = useState<string | null>(null)

  // Check authentication flow
  useEffect(() => {
    async function checkAuth() {
      setAuthError(null)

      // Step 1: Check Google Auth
      if (!user) {
        setAuthStep('need-google-auth')
        return
      }

      // Step 2: Get or create campaign
      try {
        const existingCampaignId = sessionStorage.getItem('lovable_campaign_id')
        
        if (existingCampaignId) {
          setCampaignId(existingCampaignId)
        } else {
          // Create campaign via API
          const response = await fetch('/api/v1/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: `Lovable - ${new Date().toISOString().split('T')[0]}`,
              initial_goal: 'leads'
            })
          })

          if (response.ok) {
            const data = await response.json()
            const newCampaignId = data.data?.campaign?.id
            if (newCampaignId) {
              setCampaignId(newCampaignId)
              sessionStorage.setItem('lovable_campaign_id', newCampaignId)
            }
          }
        }
      } catch (err) {
        console.error('[Lovable Layout] Campaign setup error:', err)
      }

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
  }, [user, requireMeta, campaignId])

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
    <div className="min-h-screen bg-background flex flex-col">
      <LovableNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

