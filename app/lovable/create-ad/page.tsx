/**
 * Feature: Lovable Extension - Ad Builder Page with Authentication
 * Purpose: Simplified ad builder for Lovable Chrome extension with auth gates
 * References:
 *  - Lovable Extension Integration
 *  - Dual Format Image Support (square + vertical)
 *  - Sequential Auth Flow (Google → Meta)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { AdMockup } from "@/components/ad-mockup"
import { AdMockupFormatToggle } from "@/components/ad-mockup-format-toggle"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, AlertCircle, Check } from "lucide-react"
import { useAdPreview } from "@/lib/context/ad-preview-context"
import { generateDualFormatImage } from "@/server/images"
import { useAuth } from "@/components/auth/auth-provider"
import { CampaignProvider, useCampaignContext } from "@/lib/context/campaign-context"
import { LovableAuthBlocker } from "@/components/lovable/auth-blocker"
import { AuthModal } from "@/components/auth/auth-modal"
import { MetaConnectionModal } from "@/components/meta/meta-connection-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PromptInputWithAttachments } from "@/components/lovable/prompt-input-with-attachments"
import type { AttachedImage } from "@/components/lovable/image-attachment-input"
import { triggerLovableAI } from "@/lib/utils/trigger-lovable-ai"
import { imageContextUploader } from "@/lib/services/image-context-uploader"
import { toast } from "sonner"
import { isImageGeneratedMessage } from "@/types/chrome-extension-messages"

type AuthStep = 'checking' | 'need-google-auth' | 'need-meta-auth' | 'ready' | 'error'

interface Campaign {
  id: string
  name: string
  user_id: string
  status: string
  initial_goal?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// Inner component that uses campaign context
function LovableAdBuilderInner() {
  const { user } = useAuth()
  const { createCampaign, loadCampaign } = useCampaignContext()
  const {
    adContent,
    setAdContent,
    selectedFormat,
    setSelectedFormat
  } = useAdPreview()
  
  const [authStep, setAuthStep] = useState<AuthStep>('checking')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string
    url: string
    format: 'square' | 'vertical'
    createdAt: string
  }>>([])


  // Get Lovable project context from extension
  const getLovableContext = useCallback(() => {
    try {
      const context = sessionStorage.getItem('adpilot_lovable_context')
      if (context) {
        const parsed = JSON.parse(context)
        console.log('[Lovable Ad Builder] Project context:', parsed)
        return parsed
      }
    } catch (err) {
      console.error('[Lovable Ad Builder] Error parsing context:', err)
    }
    return null
  }, [])

  // Check or create campaign
  const ensureCampaign = useCallback(async () => {
    try {
      // Check if we already have a campaign for this Lovable project
      const existingCampaignId = sessionStorage.getItem('lovable_campaign_id')
      
      if (existingCampaignId) {
        console.log('[Lovable] Loading existing campaign:', existingCampaignId)
        
        // Verify campaign still exists
        try {
          await loadCampaign(existingCampaignId)
          
          // Fetch campaign data to set in state
          const response = await fetch(`/api/v1/campaigns/${existingCampaignId}`, {
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            const campaignData = data.data?.campaign
            
            if (campaignData) {
              setCampaign(campaignData)
              console.log('[Lovable] Reusing existing campaign:', campaignData.name)
              return campaignData
            }
          }
        } catch (err) {
          console.warn('[Lovable] Existing campaign not found, creating new one:', err)
          sessionStorage.removeItem('lovable_campaign_id')
        }
      }
      
      // Create new campaign for Lovable project
      const lovableContext = getLovableContext()
      const projectId = lovableContext?.lovableProjectId || 'Project'
      const campaignName = `Lovable - ${projectId.slice(0, 15)}`
      
      console.log('[Lovable] Creating new campaign:', campaignName)
      
      const newCampaign = await createCampaign(
        campaignName,
        undefined, // No initial prompt for Lovable users
        'leads'    // Default goal
      )
      
      if (newCampaign) {
        setCampaign(newCampaign)
        sessionStorage.setItem('lovable_campaign_id', newCampaign.id)
        console.log('[Lovable] Campaign created:', newCampaign.id)
        return newCampaign
      } else {
        throw new Error('Failed to create campaign')
      }
    } catch (err) {
      console.error('[Lovable] Campaign creation error:', err)
      setAuthError('Failed to create campaign. Please try again.')
      setAuthStep('error')
      return null
    }
  }, [createCampaign, loadCampaign, getLovableContext])

  // Check Meta connection
  const checkMetaConnection = useCallback(async (campaignId: string) => {
    try {
      console.log('[Lovable] Checking Meta connection for campaign:', campaignId)
      
      const response = await fetch(`/api/v1/meta/status?campaignId=${campaignId}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.warn('[Lovable] Meta status check failed, assuming not connected')
        return false
      }
      
      const data = await response.json()
      const isConnected = data.connected && data.adAccount?.id
      
      console.log('[Lovable] Meta connection status:', isConnected)
      return isConnected
    } catch (err) {
      console.error('[Lovable] Meta connection check error:', err)
      return false
    }
  }, [])

  // Main authentication flow
  useEffect(() => {
    async function checkAuth() {
      console.log('[Lovable] Starting auth check...')
      setAuthError(null)
      
      // Step 1: Check Google Auth
      if (!user) {
        console.log('[Lovable] User not authenticated, showing Google auth')
        setAuthStep('need-google-auth')
        return
      }
      
      console.log('[Lovable] User authenticated:', user.id)
      
      // Step 2: Ensure campaign exists
      const campaignData = await ensureCampaign()
      
      if (!campaignData) {
        console.error('[Lovable] Failed to ensure campaign')
        return // Error state already set by ensureCampaign
      }
      
      // Step 3: Check Meta connection
      const isMetaConnected = await checkMetaConnection(campaignData.id)
      
      if (!isMetaConnected) {
        console.log('[Lovable] Meta not connected, showing Meta connection prompt')
        setAuthStep('need-meta-auth')
        setMetaModalOpen(true)
        return
      }
      
      console.log('[Lovable] All auth checks passed, ready to build ads')
      setAuthStep('ready')
    }
    
    checkAuth()
  }, [user, ensureCampaign, checkMetaConnection])

  // Handle Google auth success
  const handleGoogleAuthSuccess = useCallback(() => {
    console.log('[Lovable] Google auth successful, closing modal')
    setAuthModalOpen(false)
    // The useEffect will re-run when user changes and progress to next step
  }, [])

  // Handle Meta auth success
  const handleMetaAuthSuccess = useCallback(() => {
    console.log('[Lovable] Meta auth successful, closing modal')
    setMetaModalOpen(false)
    setAuthStep('ready')
  }, [])

  // Retry auth flow
  const handleRetry = useCallback(() => {
    setAuthError(null)
    setAuthStep('checking')
    // Trigger re-check by clearing and re-setting user dependency
    window.location.reload()
  }, [])

  // Handle prompt submission with images
  const handleSendPrompt = async (prompt: string, attachedImages: AttachedImage[]) => {
    if (!user || !campaign) {
      toast.error('Authentication required')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGenerationProgress('Preparing to send to Lovable AI...')
    
    try {
      // Upload attached images to Supabase if any
      let imageUrls: string[] = []
      
      if (attachedImages.length > 0) {
        setGenerationProgress(`Uploading ${attachedImages.length} context image(s)...`)
        
        const uploadResults = await imageContextUploader.uploadMultipleImages(
          attachedImages.map(img => img.file),
          user.id,
          campaign.id
        )
        
        // Filter successful uploads
        imageUrls = uploadResults
          .filter(result => result.success && result.url)
          .map(result => result.url!)
        
        console.log('[Lovable] Uploaded context images:', imageUrls)
      }
      
      setGenerationProgress('Sending to Lovable AI...')
      
      // Trigger Lovable AI with prompt and image context
      triggerLovableAI({
        prompt: `${prompt}\n\nRequirements:\n- Generate TWO formats: Square (1080x1080) AND Vertical (1080x1920)\n- Professional, modern design\n- Suitable for Facebook/Instagram ads`,
        images: imageUrls,
        context: {
          feature: 'ad-image-with-context',
          campaignId: campaign.id,
          format: 'dual'
        },
        toastMessage: 'Lovable AI is creating your images...'
      })
      
      setGenerationProgress('Waiting for AI to generate images...')
      
      // Note: Images will be synced automatically via message listener
      // Don't reset isGenerating here - let the message listener do it
      
    } catch (err) {
      console.error('[Lovable Ad Builder] Send error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send prompt')
      setGenerationProgress('')
      setIsGenerating(false)
      toast.error('Failed to send prompt to Lovable AI')
    }
  }
  
  // Listen for generated images from content script
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Only accept messages from same origin or parent
      if (!event.data || !event.data.type) return
      
      if (isImageGeneratedMessage(event.data)) {
        console.log('[Lovable] Image generated:', event.data.payload)
        
        const { imageUrl, format, timestamp } = event.data.payload
        
        // Add to generated images list
        const newImage = {
          id: `${timestamp}-${format || 'unknown'}`,
          url: imageUrl,
          format: (format || 'square') as 'square' | 'vertical',
          createdAt: new Date(timestamp).toISOString()
        }
        
        setGeneratedImages(prev => [...prev, newImage])
        
        // Import image via API (⚠️ BACKEND operation)
        try {
          setGenerationProgress('Syncing image to your ad...')
          
          const response = await fetch('/api/v1/lovable/import-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              sourceUrl: imageUrl,
              campaignId: campaign?.id,
              adId: campaign?.id, // Temporary - using campaign ID as ad ID
              format: format || 'square'
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to import image')
          }
          
          const data = await response.json()
          console.log('[Lovable] Image imported:', data)
          
          // Update ad preview with the imported image
          if (format === 'square') {
            setAdContent(prev => ({
              ...prev,
              imageUrlSquare: data.data?.creative?.imageUrl || imageUrl
            }))
          } else if (format === 'vertical') {
            setAdContent(prev => ({
              ...prev,
              imageUrlVertical: data.data?.creative?.imageUrl || imageUrl
            }))
          }
          
          toast.success('Image synced successfully!', {
            description: 'Image has been added to your ad'
          })
          
          setGenerationProgress('')
          setIsGenerating(false)
          
        } catch (err) {
          console.error('[Lovable] Import error:', err)
          toast.error('Failed to sync image', {
            description: 'You can still use the image URL manually'
          })
          setGenerationProgress('')
          setIsGenerating(false)
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [campaign, setAdContent])

  // Get the current format's image URL
  const currentImageUrl = selectedFormat === 'square' 
    ? adContent?.imageUrlSquare 
    : adContent?.imageUrlVertical

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
        {campaign && (
          <MetaConnectionModal 
            open={metaModalOpen}
            onOpenChange={setMetaModalOpen}
            onSuccess={handleMetaAuthSuccess}
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
              {authError || 'An error occurred during authentication. Please try again.'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="w-full">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // authStep === 'ready' - Show ad builder
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Ad</h1>
          <p className="text-muted-foreground">
            Generate AI-powered ads for Meta with dual format support
          </p>
          {campaign && (
            <p className="text-xs text-muted-foreground mt-2">
              Campaign: {campaign.name}
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Ad Image</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Upload an image or describe what you want to create
              </p>
              
              {/* Prompt Input with Attachments */}
              <PromptInputWithAttachments
                onSend={handleSendPrompt}
                isGenerating={isGenerating}
                placeholder="Describe the image you want to create (e.g., 'Modern tech startup hero image with blue gradient')"
                maxLength={500}
              />

              {/* Progress Message */}
              {generationProgress && (
                <div className="mt-4 p-3 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                  <span>{generationProgress}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Info */}
              <div className="mt-6 p-4 rounded-md bg-muted text-sm space-y-2">
                <p className="font-medium">💡 How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Describe your desired image in the prompt</li>
                  <li>Optionally attach reference images for context</li>
                  <li>AI generates square (1080x1080) and vertical (1080x1920) formats</li>
                  <li>Images automatically sync to your ad</li>
                </ul>
              </div>
            </div>
            
            {/* Generated Images Grid */}
            {generatedImages.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Generated Images ({generatedImages.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
                    >
                      <img
                        src={image.url}
                        alt={`Generated ${image.format}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Format Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {image.format === 'square' ? '📱 Square' : '📲 Vertical'}
                      </div>
                      {/* Use Button */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (image.format === 'square') {
                              setAdContent(prev => ({ ...prev, imageUrlSquare: image.url }))
                            } else {
                              setAdContent(prev => ({ ...prev, imageUrlVertical: image.url }))
                            }
                            toast.success(`${image.format === 'square' ? 'Square' : 'Vertical'} image applied!`)
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Use This
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            {/* Format Toggle */}
            <div className="flex justify-center">
              <AdMockupFormatToggle
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
              />
            </div>

            {/* Ad Mockup */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <AdMockup
                  format={selectedFormat}
                  imageUrl={currentImageUrl}
                  brandName="Your Business"
                  primaryText={adContent?.body || 'Your ad copy will appear here'}
                  headline={adContent?.headline || 'Your Headline'}
                  description="Learn more about what we offer"
                  ctaText={adContent?.cta || 'Learn More'}
                  isLoading={isGenerating}
                />
              </div>
            </div>

            {/* Format Info */}
            <div className="p-4 rounded-md bg-muted text-sm text-center">
              <p className="font-medium">
                {selectedFormat === 'square' ? '📱 Square Format' : '📲 Vertical Format'}
              </p>
              <p className="text-muted-foreground">
                {selectedFormat === 'square' 
                  ? '1080x1080 - Perfect for feed ads' 
                  : '1080x1920 - Perfect for stories and reels'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with CampaignProvider wrapper
export default function LovableCreateAdPage() {
  return (
    <CampaignProvider>
      <LovableAdBuilderInner />
    </CampaignProvider>
  )
}

