"use client"

/**
 * Feature: Ad Builder
 * Purpose: Simplified 5-step wizard for creating Facebook ads
 * Steps: Get Started → Creative & Copy → Target Audience → Budget & Schedule → Review & Launch
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { AdDraft, AdBuilderStep, AdBuilderStepProps } from "@/lib/types/ad-builder"
import { useAutoFullscreen } from "@/lib/context/fullscreen-mode-context"
import { ExitConfirmationDialog } from "./exit-confirmation-dialog"
import { useCampaignContext } from "@/lib/context/campaign-context"

// Step components
import { GetStarted } from "./steps/get-started"
import { CreativeAndCopy } from "./steps/creative-and-copy"
import { TargetLocation } from "./steps/target-location"
import { TargetAudience } from "./steps/target-audience"
import { BudgetSchedule } from "./steps/budget-schedule"
import { ReviewLaunch } from "./steps/review-launch"
import { LocationTargetingProvider } from "@/lib/context/location-targeting-context"

// Export types for use in step components
export type { AdDraft, AdBuilderStepProps }

const steps: AdBuilderStep[] = [
  { id: 1, name: "Get Started", component: GetStarted },
  { id: 2, name: "Creative & Copy", component: CreativeAndCopy },
  { id: 3, name: "Target Location", component: TargetLocation },
  { id: 4, name: "Target Audience", component: TargetAudience },
  { id: 5, name: "Budget & Schedule", component: BudgetSchedule },
  { id: 6, name: "Review & Launch", component: ReviewLaunch },
]

interface AdBuilderProps {
  lovableProjectId?: string
  initialDraft?: Partial<AdDraft>
}

export function AdBuilder({ lovableProjectId, initialDraft = {} }: AdBuilderProps) {
  console.log('[AD-BUILDER] Component mounting with projectId:', lovableProjectId)
  
  const router = useRouter()
  const { campaign, createCampaign, loadCampaign } = useCampaignContext()
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<AdDraft>(initialDraft)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draftAdId, setDraftAdId] = useState<string | null>(null)
  const [campaignInitialized, setCampaignInitialized] = useState(false)
  
  // Enter fullscreen mode on mount, exit on unmount
  useAutoFullscreen()

  const handleUpdate = (updates: Partial<AdDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Auto-create campaign for Lovable projects
  const ensureLovableCampaign = async () => {
    try {
      console.log("[AdBuilder] Ensuring campaign for Lovable project:", lovableProjectId)
      
      // Check for existing campaign in sessionStorage
      const existingId = sessionStorage.getItem('lovable_campaign_id')
      
      if (existingId) {
        console.log("[AdBuilder] Found existing campaign ID:", existingId)
        // Try to load existing campaign into context
        try {
          await loadCampaign(existingId)
          console.log("[AdBuilder] ✅ Loaded existing campaign")
          return true
        } catch (err) {
          console.warn("[AdBuilder] Existing campaign not found, will create new one:", err)
          sessionStorage.removeItem('lovable_campaign_id')
        }
      }
      
      // Create new campaign for Lovable project
      const campaignName = `Lovable - ${lovableProjectId.slice(0, 15)}`
      
      console.log("[AdBuilder] Creating new campaign:", campaignName)
      
      const newCampaign = await createCampaign(
        campaignName,
        undefined, // No initial prompt for Lovable
        'leads'    // Default goal
      )
      
      if (newCampaign) {
        sessionStorage.setItem('lovable_campaign_id', newCampaign.id)
        console.log("[AdBuilder] ✅ Campaign created:", newCampaign.id)
        return true
      } else {
        throw new Error('Failed to create campaign')
      }
    } catch (error) {
      console.error('[AdBuilder] Failed to ensure campaign:', error)
      toast.error('Failed to initialize campaign')
      return false
    }
  }

  // Check if there are any unsaved changes
  const hasUnsavedChanges = 
    !!draft.productContext ||
    !!draft.creative?.headline ||
    !!draft.creative?.primaryText ||
    !!draft.targeting?.locations?.length ||
    !!draft.targeting?.interests?.length ||
    !!draft.budget?.amount

  const handleCancel = () => {
    // If there are changes, show exit dialog
    if (hasUnsavedChanges) {
      setShowExitDialog(true)
    } else {
      // No changes, just redirect to ads list
      const redirectUrl = campaign?.id ? `/${campaign.id}?view=all-ads` : "/ads"
      router.push(redirectUrl)
    }
  }

  const handleSaveAsDraft = async () => {
    setIsSaving(true)
    try {
      // ⚠️ BACKEND OPERATION: Save ad draft to database
      console.log("[AdBuilder] Saving draft:", { draft, campaignId: campaign?.id, lovableProjectId })
      
      // If no campaign, try to create one for Lovable projects
      if (!campaign?.id) {
        if (lovableProjectId) {
          console.log("[AdBuilder] No campaign found, creating for Lovable project...")
          const success = await ensureLovableCampaign()
          
          if (!success || !campaign?.id) {
            toast.error("Failed to create campaign. Please try again.")
            setIsSaving(false)
            return
          }
          
          console.log("[AdBuilder] Campaign created, proceeding with save")
        } else {
          toast.error("No campaign found. Please create a campaign first.")
          setIsSaving(false)
          return
        }
      }

      let adId = draftAdId

      // Step 1: Create draft ad if doesn't exist
      if (!adId) {
        const adName = `Draft Ad - ${new Date().toLocaleString()}`
        const createResponse = await fetch(`/api/v1/ads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            name: adName,
            status: 'draft',
          }),
        })

        if (!createResponse.ok) {
          const error = await createResponse.json()
          throw new Error(error.error || 'Failed to create draft ad')
        }

        const createData = await createResponse.json()
        adId = createData.ad.id
        setDraftAdId(adId)
        console.log("[AdBuilder] Created draft ad:", adId)
      }

      // Step 2: Save ad data sections (matching SaveAdPayload interface)
      const savePayload: Record<string, any> = {}

      // Save creative data if exists
      if (draft.creative) {
        savePayload.creative = {
          imageVariations: draft.creative.images || [],
          selectedImageIndex: 0,
          selectedCreativeVariation: {
            gradient: 'default',
            imageUrl: draft.creative.images?.[0],
          },
          baseImageUrl: draft.creative.images?.[0],
          format: 'feed' as const,
        }
        
        savePayload.copy = {
          headline: draft.creative.headline,
          primaryText: draft.creative.primaryText,
          description: draft.creative.description || '',
          cta: draft.creative.callToAction,
          selectedCopyIndex: 0,
          variations: [{
            headline: draft.creative.headline,
            primaryText: draft.creative.primaryText,
            description: draft.creative.description || '',
          }],
        }
      }

      // Save targeting data if exists (location)
      if (draft.targeting?.locations && draft.targeting.locations.length > 0) {
        savePayload.location = {
          locations: draft.targeting.locations.map(name => ({
            name,
            type: 'country',
            mode: 'include',
            coordinates: [0, 0] as [number, number],
          })),
        }
      }

      // Save budget data if exists
      if (draft.budget) {
        savePayload.budget = {
          dailyBudget: draft.budget.amount,
          currency: 'USD',
          startTime: draft.budget.schedule === 'date_range' ? draft.budget.startDate : undefined,
          endTime: draft.budget.schedule === 'date_range' ? draft.budget.endDate : undefined,
          timezone: 'UTC',
        }
      }

      // Add metadata for tracking
      savePayload.metadata = {
        savedFrom: 'ad-builder-wizard',
        editContext: 'draft-save',
      }

      // Only call save API if we have data to save
      if (Object.keys(savePayload).length > 0) {
        console.log("[AdBuilder] Saving payload:", savePayload)
        
        const saveResponse = await fetch(`/api/v1/ads/${adId}/save`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload),
        })

        if (!saveResponse.ok) {
          const error = await saveResponse.json()
          throw new Error(error.error || 'Failed to save ad data')
        }

        console.log("[AdBuilder] ✅ Saved ad data successfully")
      }
      
      toast.success("Ad saved as draft")
      
      // Redirect to ads list page within campaign
      router.push(`/${campaign.id}?view=all-ads`)
    } catch (error) {
      console.error("Failed to save draft:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save draft. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeepEditing = () => {
    setShowExitDialog(false)
  }

  // Auto-create campaign on mount for Lovable projects
  useEffect(() => {
    async function initializeCampaign() {
      // Skip if already initialized
      if (campaignInitialized) return
      
      // If already have campaign from context, mark as initialized
      if (campaign?.id) {
        setCampaignInitialized(true)
        console.log("[AdBuilder] Using existing campaign:", campaign.id)
        return
      }
      
      // If lovableProjectId provided, auto-create campaign
      if (lovableProjectId) {
        console.log("[AdBuilder] Lovable project detected, ensuring campaign...")
        const success = await ensureLovableCampaign()
        if (success) {
          setCampaignInitialized(true)
        }
      } else {
        setCampaignInitialized(true)
      }
    }
    
    initializeCampaign()
  }, [lovableProjectId, campaign?.id, campaignInitialized])

  // Warn before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSaving) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, isSaving])

  // Get current step component
  const CurrentStepComponent = steps[currentStep - 1].component
  
  // Step-specific validation
  const canProceed = (() => {
    switch (currentStep) {
      case 1: // Get Started
        return !!draft.productContext && draft.productContext.trim().length > 0
      case 2: // Creative & Copy
        return !!(draft.creative?.headline && draft.creative?.primaryText)
      case 3: // Target Location
        return !!draft.targeting?.locations && draft.targeting.locations.length > 0
      case 4: // Target Audience
        return !!draft.targeting?.interests && draft.targeting.interests.length > 0
      case 5: // Budget & Schedule
        return !!draft.budget?.amount && draft.budget.amount >= 10
      case 6: // Review & Launch
        return true // Always enabled on last step
      default:
        return true
    }
  })()
  
  const isLastStep = currentStep === steps.length

  console.log('[AD-BUILDER] Rendering, about to mount LocationTargetingProvider')

  return (
    <LocationTargetingProvider>
      {console.log('[AD-BUILDER] LocationTargetingProvider rendered')}
      <div className="flex flex-col h-full bg-background">
        {console.log('[AD-BUILDER] Main div rendering')}
        {/* Minimal Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: Title */}
            <h1 className="text-xl font-semibold">Create Ad</h1>
            
            {/* Center: Minimal Progress */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      currentStep > idx + 1 ? "bg-green-600" :
                      currentStep === idx + 1 ? "bg-primary" :
                      "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {currentStep}/{steps.length} • {steps[currentStep - 1].name}
              </span>
            </div>
            
            {/* Right: Exit */}
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="container mx-auto px-6 py-8 max-w-6xl">
            <CurrentStepComponent
              draft={draft}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        </div>

        {/* Sticky Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="min-w-[120px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-[200px]"
            >
              {isLastStep ? (
                <>
                  Complete Setup
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next: {steps[currentStep]?.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Exit Confirmation Dialog */}
        <ExitConfirmationDialog
          open={showExitDialog}
          onOpenChange={setShowExitDialog}
          onSaveAsDraft={handleSaveAsDraft}
          onKeepEditing={handleKeepEditing}
          isSaving={isSaving}
        />
      </div>
    </LocationTargetingProvider>
  )
}


