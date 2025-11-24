"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Calendar, Check, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { FacebookPostMockup } from "../facebook-post-mockup"
import { InstagramPostMockup } from "../instagram-post-mockup"
import { useState } from "react"
import { usePostService } from "@/lib/services/service-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ReviewAndPublish({ draft }: PostBuilderStepProps) {
  const postService = usePostService()
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Get post ID from URL or context
  const searchParams = new URLSearchParams(window.location.search)
  const postId = searchParams.get('postId')

  const handlePublish = async () => {
    if (!postId) {
      toast.error('Post ID not found. Please save your post first.')
      return
    }

    setIsPublishing(true)
    try {
      const result = await postService.publishPost.execute({ postId })

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to publish post')
      }

      const { facebookPostId, instagramMediaId, errors } = result.data

      if (errors && Object.keys(errors).length > 0) {
        // Partial success
        const errorMessages = Object.entries(errors)
          .map(([platform, error]) => `${platform}: ${error}`)
          .join(', ')
        
        toast.warning(`Post published with errors: ${errorMessages}`)
      } else {
        toast.success('Post published successfully!')
      }

      // Redirect to posts list
      router.push('/lovable/posts')
    } catch (error) {
      console.error('Publish error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish post')
    } finally {
      setIsPublishing(false)
    }
  }

  // Validation warnings
  const warnings: string[] = []
  if (!draft.postText && !draft.mediaUrl) {
    warnings.push('Post is empty. Add text or media before publishing.')
  }
  if (draft.publishToInstagram && !draft.mediaUrl) {
    warnings.push('Instagram posts require an image or video.')
  }
  if (!draft.publishToFacebook && !draft.publishToInstagram) {
    warnings.push('No platforms selected.')
  }

  const canPublish = warnings.length === 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Review & Publish</h2>
        <p className="text-muted-foreground text-lg">
          Review your post before publishing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Summary */}
        <div className="space-y-6">
          {/* Content Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Post Text:</p>
                <p className="text-sm text-muted-foreground">
                  {draft.postText || <em>No text</em>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Media:</p>
                {draft.mediaUrl ? (
                  <Badge variant="secondary">
                    {draft.mediaType === 'image' ? 'Image' : 'Video'} attached
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground"><em>No media</em></p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platforms Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {draft.publishToFacebook && (
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    <Facebook className="mr-1 h-3 w-3" />
                    Facebook
                  </Badge>
                )}
                {draft.publishToInstagram && (
                  <Badge className="bg-pink-600 hover:bg-pink-700">
                    <Instagram className="mr-1 h-3 w-3" />
                    Instagram
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {draft.scheduleType === 'immediate' ? (
                <p className="text-sm">
                  <Check className="inline mr-2 h-4 w-4 text-green-600" />
                  Publish immediately
                </p>
              ) : (
                <p className="text-sm">
                  <Calendar className="inline mr-2 h-4 w-4 text-blue-600" />
                  Scheduled for{' '}
                  <span className="font-medium">
                    {draft.scheduledAt
                      ? format(new Date(draft.scheduledAt), 'PPP p')
                      : 'Not set'}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Publish Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handlePublish}
            disabled={!canPublish || isPublishing || !postId}
          >
            {isPublishing ? (
              'Publishing...'
            ) : draft.scheduleType === 'scheduled' ? (
              'Schedule Post'
            ) : (
              'Publish Now'
            )}
          </Button>
        </div>

        {/* Right: Mockups */}
        <div className="space-y-6">
          {draft.publishToFacebook && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook Preview
              </h3>
              <FacebookPostMockup
                text={draft.postText}
                mediaUrl={draft.mediaUrl}
                mediaType={draft.mediaType}
              />
            </div>
          )}

          {draft.publishToInstagram && (
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram Preview
              </h3>
              <InstagramPostMockup
                text={draft.postText}
                mediaUrl={draft.mediaUrl}
                mediaType={draft.mediaType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

