"use client"

/**
 * Feature: Post Builder
 * Purpose: Simplified 3-step wizard for creating social media posts
 * Steps: Content & Media → Platforms & Schedule → Review & Publish
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { PostDraft, PostBuilderStep, PostBuilderStepProps } from "@/lib/types/post"
import { useAutoFullscreen } from "@/lib/context/fullscreen-mode-context"
import { ExitConfirmationDialog } from "./exit-confirmation-dialog"
import { useCampaignContext } from "@/lib/context/campaign-context"
import { usePostService } from "@/lib/services/service-provider"

// Step components
import { ContentAndMedia } from "./steps/content-and-media"
import { PlatformsAndSchedule } from "./steps/platforms-and-schedule"
import { ReviewAndPublish } from "./steps/review-and-publish"

// Export types for use in step components
export type { PostDraft, PostBuilderStepProps }

const steps: PostBuilderStep[] = [
  { id: 1, name: "Content & Media", component: ContentAndMedia },
  { id: 2, name: "Platforms & Schedule", component: PlatformsAndSchedule },
  { id: 3, name: "Review & Publish", component: ReviewAndPublish },
]

interface PostBuilderProps {
  lovableProjectId?: string
  initialDraft?: Partial<PostDraft>
  refreshPosts?: () => Promise<void>
  editPostId?: string  // If provided, we're editing an existing post
}

export function PostBuilder({ lovableProjectId, initialDraft = {}, refreshPosts, editPostId }: PostBuilderProps) {
  console.log('[POST-BUILDER] Component mounting with projectId:', lovableProjectId, 'editPostId:', editPostId)
  
  const router = useRouter()
  const { campaign } = useCampaignContext()
  const postService = usePostService()
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<PostDraft>({
    publishToFacebook: true,
    publishToInstagram: true,
    scheduleType: 'immediate',
    ...initialDraft,
  })
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draftPostId, setDraftPostId] = useState<string | null>(editPostId || null)
  const isEditMode = !!editPostId
  
  // Enter fullscreen mode on mount, exit on unmount
  useAutoFullscreen()

  const handleUpdate = (updates: Partial<PostDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Check if there are any unsaved changes
  const hasUnsavedChanges = 
    !!draft.postText ||
    !!draft.mediaUrl

  const handleCancel = () => {
    if (!isSaving) {
      setShowExitDialog(true)
    }
  }

  const handleSaveAsDraft = async () => {
    setIsSaving(true)
    try {
      console.log("[PostBuilder] Saving draft:", { draft, lovableProjectId, hasCampaign: !!campaign?.id, isEditMode })
      
      let postId = draftPostId

      // Create draft post if not editing
      if (!postId && !isEditMode) {
        const postName = `Draft Post - ${new Date().toLocaleString()}`
        console.log("[PostBuilder] Creating post:", postName, "with lovableProjectId:", lovableProjectId)
        
        const result = await postService.createPost.execute({
          userId: '', // Will be set by API from auth
          ...(campaign?.id ? { campaignId: campaign.id } : {}),
          ...(lovableProjectId ? { lovableProjectId } : {}),
          name: postName,
          status: 'draft',
        })

        if (!result.success) {
          console.error("[PostBuilder] Failed to create post:", result.error)
          throw new Error(result.error?.message || 'Failed to create draft post')
        }

        postId = result.data.id
        setDraftPostId(postId)
        
        console.log("[PostBuilder] ✅ Created draft post:", postId)
      }

      // Save post data if we have any
      if (postId && (draft.postText || draft.mediaUrl)) {
        const saveResult = await postService.savePost.execute({
          postId,
          postText: draft.postText,
          mediaUrl: draft.mediaUrl,
          mediaType: draft.mediaType,
          publishToFacebook: draft.publishToFacebook,
          publishToInstagram: draft.publishToInstagram,
          scheduleType: draft.scheduleType,
          scheduledAt: draft.scheduledAt,
        })

        if (!saveResult.success) {
          throw new Error(saveResult.error?.message || 'Failed to save post')
        }

        toast.success(isEditMode ? "Post updated successfully" : "Post saved as draft")
        console.log("[PostBuilder] ✅ Post saved successfully")
      } else {
        toast.success(isEditMode ? "Post updated" : "Draft post created")
      }
      
      // Refresh posts list
      if (refreshPosts) {
        await refreshPosts()
      }
      
      // Redirect to posts list
      router.push(`/lovable/posts`)
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
      case 1: // Content & Media
        // Must have text or media
        return !!(draft.postText?.trim() || draft.mediaUrl)
      case 2: // Platforms & Schedule
        // Must have at least one platform selected
        return draft.publishToFacebook || draft.publishToInstagram
      case 3: // Review & Publish
        return true // Always enabled on last step
      default:
        return true
    }
  })()
  
  const isLastStep = currentStep === steps.length

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Minimal Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Title */}
          <h1 className="text-xl font-semibold">{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
          
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
  )
}

