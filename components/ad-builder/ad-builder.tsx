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
import { useAdService } from "@/lib/services/service-provider"

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
  refreshAds?: () => Promise<void>
}

export function AdBuilder({ lovableProjectId, initialDraft = {}, refreshAds }: AdBuilderProps) {
  console.log('[AD-BUILDER] Component mounting with projectId:', lovableProjectId)
  
  const router = useRouter()
  const { campaign, createCampaign, loadCampaign } = useCampaignContext()
  const adService = useAdService()
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

  // Simplified: Just log that we have the project ID
  useEffect(() => {
    if (lovableProjectId) {
      console.log("[AdBuilder] Lovable project ID available:", lovableProjectId)
      console.log("[AdBuilder] Campaign will be auto-created via API when ad is saved")
    }
  }, [lovableProjectId])

  // Check if there are any unsaved changes
  const hasUnsavedChanges = 
    !!draft.productContext ||
    !!draft.creative?.headline ||
    !!draft.creative?.primaryText ||
    !!draft.targeting?.locations?.length ||
    !!draft.targeting?.interests?.length ||
    !!draft.budget?.amount

  const handleCancel = () => {
    // Always show exit confirmation dialog (unless actively saving)
    if (!isSaving) {
      setShowExitDialog(true)
    }
  }

  const handleSaveAsDraft = async () => {
    setIsSaving(true)
    try {
      // ⚠️ BACKEND OPERATION: Save ad draft to database
      console.log("[AdBuilder] Saving draft:", { draft, lovableProjectId, hasCampaign: !!campaign?.id })
      
      let adId = draftAdId
      let finalCampaignId = campaign?.id

      // Step 1: Create draft ad (API will auto-create campaign if needed)
      if (!adId) {
        const adName = `Draft Ad - ${new Date().toLocaleString()}`
        console.log("[AdBuilder] Creating ad:", adName, "with lovableProjectId:", lovableProjectId)
        
        const result = await adService.createAd.execute({
          ...(finalCampaignId ? { campaignId: finalCampaignId } : {}),
          ...(lovableProjectId ? { lovableProjectId: lovableProjectId } : {}),
          name: adName,
          status: 'draft',
        })

        if (!result.success) {
          console.error("[AdBuilder] Failed to create ad:", result.error)
          throw new Error(result.error?.message || 'Failed to create draft ad')
        }

        adId = result.data.id
        finalCampaignId = result.data.campaign_id
        
        setDraftAdId(adId)
        
        // Update campaign in context if it was auto-created
        if (finalCampaignId && !campaign?.id) {
          sessionStorage.setItem('lovable_campaign_id', finalCampaignId)
        }
        
        console.log("[AdBuilder] ✅ Created draft ad:", adId, "campaign:", finalCampaignId)
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

      // Check if we actually have data to save (not just metadata)
      const hasActualData = !!(
        savePayload.creative || 
        savePayload.copy || 
        savePayload.location || 
        savePayload.budget || 
        savePayload.destination
      )

      if (hasActualData) {
        // Add metadata for tracking
        savePayload.metadata = {
          savedFrom: 'ad-builder-wizard',
          editContext: 'draft-save',
        }
        
        console.log("[AdBuilder] Saving payload:", savePayload)
        
        const saveResponse = await fetch(`/api/v1/ads/${adId}/save`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(savePayload),
        })

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json()
          console.error("[AdBuilder] Save failed:", errorData)
          throw new Error(errorData.error || 'Failed to save ad data')
        }

        console.log("[AdBuilder] ✅ Saved ad data successfully")
        toast.success("Ad saved as draft")
      } else {
        console.log("[AdBuilder] No data to save yet - just created draft ad")
        toast.success("Draft ad created - fill in details and save again")
      }
      
      // Refresh ads list to show updated draft
      if (refreshAds) {
        await refreshAds()
        console.log("[AdBuilder] ✅ Ads list refreshed")
      }
      
      // Redirect to ads list page within campaign (if campaign exists)
      if (finalCampaignId || campaign?.id) {
        router.push(`/lovable?view=all-ads`)
      }
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

  // Simplified initialization - no complex campaign creation
  // Campaign is auto-created by API when user saves first ad
  useEffect(() => {
    setCampaignInitialized(true)
    if (campaign?.id) {
      console.log("[AdBuilder] Using existing campaign:", campaign.id)
    } else if (lovableProjectId) {
      console.log("[AdBuilder] No campaign yet - will be auto-created when ad is saved")
    }
  }, [campaign?.id, lovableProjectId])

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
  const CurrentStepComponent = steps[currentStep - 1]?.component
  
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
      <div className="flex flex-col h-full bg-background">
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
                {currentStep}/{steps.length} • {steps[currentStep - 1]?.name}
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


