/**
 * Feature: Lovable Extension - Edit Post Page
 * Purpose: Edit existing post using the post builder
 */

"use client"

import { useState, useEffect } from "react"
import { PostBuilder } from "@/components/post-builder/post-builder"
import { CampaignProvider } from "@/lib/context/campaign-context"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { usePostService } from "@/lib/services/service-provider"
import { Skeleton } from "@/components/ui/skeleton"
import type { PostDraft } from "@/lib/types/post"

interface EditPostPageProps {
  params: {
    postId: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const postService = usePostService()
  const [initialDraft, setInitialDraft] = useState<Partial<PostDraft> | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [lovableProjectId, setLovableProjectId] = useState<string | undefined>(undefined)

  // Load existing post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const result = await postService.getPost.execute({ postId: params.postId })

        if (result.success) {
          const post = result.data
          
          // Convert database format to draft format
          const draft: Partial<PostDraft> = {
            postText: post.post_text,
            mediaUrl: post.media_url,
            mediaType: post.media_type,
            publishToFacebook: post.publish_to_facebook,
            publishToInstagram: post.publish_to_instagram,
            scheduleType: post.schedule_type,
            scheduledAt: post.scheduled_at,
          }

          setInitialDraft(draft)
          setLovableProjectId(post.lovable_project_id)
        }
      } catch (error) {
        console.error('Failed to load post:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [params.postId])

  if (isLoading) {
    return (
      <LovableLayout>
        <div className="container mx-auto p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </LovableLayout>
    )
  }

  return (
    <LovableLayout>
      <CampaignProvider>
        <PostBuilder
          lovableProjectId={lovableProjectId}
          initialDraft={initialDraft}
          editPostId={params.postId}
        />
      </CampaignProvider>
    </LovableLayout>
  )
}

