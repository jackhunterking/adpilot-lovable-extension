/**
 * Post Validation Helpers
 * Platform-specific validation rules for social media posts
 */

import type { PostDraft } from "./post"

export interface PostValidationResult {
  canPublishToFacebook: boolean
  canPublishToInstagram: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate post draft against platform requirements
 * 
 * Rules:
 * - Facebook: Allows text-only, image-only, or text+image
 * - Instagram: REQUIRES image (cannot post text-only)
 */
export function validatePostForPlatforms(draft: PostDraft): PostValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const hasText = !!draft.postText?.trim()
  const hasMedia = !!draft.mediaUrl

  // Facebook validation (flexible - allows anything)
  const canPublishToFacebook = true // Facebook has no content restrictions

  // Instagram validation (strict - requires image)
  let canPublishToInstagram = true
  if (!hasMedia) {
    canPublishToInstagram = false
    errors.push("Instagram requires an image or video")
  }

  // General warnings
  if (!hasText && !hasMedia) {
    warnings.push("Post has no content")
  }

  if (hasText && draft.postText!.length > 2200) {
    errors.push("Post text exceeds 2,200 character limit (Instagram caption max)")
  }

  return {
    canPublishToFacebook,
    canPublishToInstagram,
    errors,
    warnings,
  }
}

/**
 * Check if user can proceed based on selected platforms and content
 */
export function canProceedWithPost(
  draft: PostDraft,
  validation: PostValidationResult
): { canProceed: boolean; reason?: string } {
  // Must select at least one platform
  if (!draft.publishToFacebook && !draft.publishToInstagram) {
    return {
      canProceed: false,
      reason: "Please select at least one platform (Facebook or Instagram)",
    }
  }

  // If Facebook selected, check if we can publish there
  if (draft.publishToFacebook && !validation.canPublishToFacebook) {
    return {
      canProceed: false,
      reason: "Cannot publish to Facebook with current content",
    }
  }

  // If Instagram selected, check if we can publish there
  if (draft.publishToInstagram && !validation.canPublishToInstagram) {
    return {
      canProceed: false,
      reason: "Instagram requires an image or video",
    }
  }

  return { canProceed: true }
}

