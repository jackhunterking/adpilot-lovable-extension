"use client"

/**
 * Feature: Post Builder
 * Purpose: Simplified 3-step wizard for creating social media posts
 * Steps: Content & Media → Platforms & Schedule → Review & Publish
 */

import { useState, useEffect, useRef, useCallback } from "react"
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
import { usePlatformConnections } from "@/lib/hooks/use-platform-connections"
import { validatePostForPlatforms } from "@/lib/types/post-validation"

// Step components
import { ContentAndMedia } from "./steps/content-and-media"
import { ReviewAndPublish } from "./steps/review-and-publish"

// Export types for use in step components
export type { PostDraft, PostBuilderStepProps }

const steps: PostBuilderStep[] = [
  { id: 1, name: "Content & Media", component: ContentAndMedia },
  { id: 2, name: "Review & Publish", component: ReviewAndPublish },
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
  const { facebookConnected, instagramConnected } = usePlatformConnections()
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
  const publishHandlerRef = useRef<(() => Promise<void>) | null>(null)
  
  // Enter fullscreen mode on mount, exit on unmount
  useAutoFullscreen()

  const handleUpdate = (updates: Partial<PostDraft>) => {
    setDraft((prev) => {
      const newDraft = {
        ...prev,
        ...updates,
      }

      // Auto-uncheck Instagram if media is removed AND Instagram is selected
      if (updates.mediaUrl === undefined && prev.mediaUrl && prev.publishToInstagram) {
        newDraft.publishToInstagram = false
        toast.warning("Instagram requires an image - Instagram has been unchecked", {
          description: "Upload an image to post to Instagram",
        })
      }

      return newDraft
    })
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
      console.log("[PostBuilder] ========== SAVE DRAFT START ==========")
      console.log("[PostBuilder] Draft state:", {
        hasPostText: !!draft.postText,
        hasMediaUrl: !!draft.mediaUrl,
        publishToFacebook: draft.publishToFacebook,
        publishToInstagram: draft.publishToInstagram,
        scheduleType: draft.scheduleType,
      })
      console.log("[PostBuilder] Context:", {
        lovableProjectId,
        hasCampaign: !!campaign?.id,
        campaignId: campaign?.id,
        isEditMode,
        draftPostId,
      })
      
      let postId = draftPostId

      // Create draft post if not editing
      if (!postId && !isEditMode) {
        const postName = `Draft Post - ${new Date().toLocaleString()}`
        console.log("[PostBuilder] Creating new post with name:", postName)
        
        const createPayload = {
          userId: '', // Will be set by API from auth
          ...(campaign?.id ? { campaignId: campaign.id } : {}),
          ...(lovableProjectId ? { lovableProjectId } : {}),
          name: postName,
          status: 'draft' as const,
        }
        
        console.log("[PostBuilder] Create post payload:", JSON.stringify(createPayload, null, 2))
        
        const result = await postService.createPost.execute(createPayload)

        console.log("[PostBuilder] Create post result:", {
          success: result.success,
          hasData: !!result.data,
          error: result.error,
        })

        if (!result.success) {
          console.error("[PostBuilder] ❌ Failed to create post:", result.error)
          const errorMsg = result.error?.message || 'Failed to create draft post'
          toast.error(errorMsg)
          throw new Error(errorMsg)
        }

        if (!result.data?.id) {
          console.error("[PostBuilder] ❌ No post ID returned from create")
          toast.error('Invalid response: no post ID received')
          throw new Error('No post ID returned from create')
        }

        postId = result.data.id
        setDraftPostId(postId)
        
        console.log("[PostBuilder] ✅ Created draft post:", postId)
      }

      // Save post data if we have a postId and any content
      if (postId && (draft.postText || draft.mediaUrl)) {
        console.log("[PostBuilder] Saving post data to existing post:", postId)
        
        const savePayload = {
          postId,
          postText: draft.postText,
          mediaUrl: draft.mediaUrl,
          mediaType: draft.mediaType,
          publishToFacebook: draft.publishToFacebook,
          publishToInstagram: draft.publishToInstagram,
          scheduleType: draft.scheduleType,
          scheduledAt: draft.scheduledAt,
        }
        
        console.log("[PostBuilder] Save post payload:", JSON.stringify(savePayload, null, 2))
        
        const saveResult = await postService.savePost.execute(savePayload)

        console.log("[PostBuilder] Save post result:", {
          success: saveResult.success,
          error: saveResult.error,
        })

        if (!saveResult.success) {
          console.error("[PostBuilder] ❌ Failed to save post data:", saveResult.error)
          const errorMsg = saveResult.error?.message || 'Failed to save post'
          toast.error(errorMsg)
          throw new Error(errorMsg)
        }

        toast.success(isEditMode ? "Post updated successfully" : "Post saved as draft")
        console.log("[PostBuilder] ✅ Post saved successfully")
      } else if (postId) {
        // Post created but no content yet
        toast.success(isEditMode ? "Post updated" : "Draft post created")
        console.log("[PostBuilder] ✅ Draft post created (no content yet)")
      } else {
        console.error("[PostBuilder] ❌ No post ID available for saving")
        toast.error('Unable to save: no post ID')
        throw new Error('No post ID available')
      }
      
      // Refresh posts list
      if (refreshPosts) {
        console.log("[PostBuilder] Refreshing posts list...")
        await refreshPosts()
      }
      
      console.log("[PostBuilder] ========== SAVE DRAFT END (SUCCESS) ==========")
      
      // Redirect to posts list
      router.push(`/lovable/posts`)
    } catch (error) {
      console.error("[PostBuilder] ========== SAVE DRAFT END (ERROR) ==========")
      console.error("[PostBuilder] Error details:", error)
      if (error instanceof Error) {
        console.error("[PostBuilder] Error message:", error.message)
        console.error("[PostBuilder] Error stack:", error.stack)
      }
      // Error toast already shown in the try block
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeepEditing = () => {
    setShowExitDialog(false)
  }

  const handlePublishCallback = useCallback((handler: () => Promise<void>) => {
    publishHandlerRef.current = handler
  }, [])

  const handlePublishClick = async () => {
    if (publishHandlerRef.current) {
      await publishHandlerRef.current()
    }
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
      case 2: // Review & Publish
        // Validate content for platforms
        const validation = validatePostForPlatforms(draft)
        
        // Must have at least one platform selected
        const hasPlatform = draft.publishToFacebook || draft.publishToInstagram
        
        // Check connection status
        const hasConnection = (draft.publishToFacebook && facebookConnected) || 
                             (draft.publishToInstagram && instagramConnected)
        
        // Validate platform-specific requirements
        const platformValid = 
          (!draft.publishToFacebook || validation.canPublishToFacebook) &&
          (!draft.publishToInstagram || validation.canPublishToInstagram)
        
        // If scheduled, must have a date/time
        const hasValidSchedule = draft.scheduleType === 'immediate' || 
          (draft.scheduleType === 'scheduled' && !!draft.scheduledAt)
        
        return hasPlatform && hasConnection && platformValid && hasValidSchedule
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
            onPublish={handlePublishCallback}
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
          
          {isLastStep ? (
            <Button
              variant="default"
              size="lg"
              onClick={handlePublishClick}
              disabled={!canProceed || !publishHandlerRef.current || !draftPostId}
              className="min-w-[200px]"
            >
              {draft.scheduleType === 'scheduled' ? 'Schedule Post' : 'Publish Now'}
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed}
              className="min-w-[200px]"
            >
              Next: {steps[currentStep]?.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
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

