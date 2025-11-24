"use client"

/**
 * Platforms & Schedule Step (Simplified)
 * This step is now mostly handled in Step 1, so this serves as a confirmation/review
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import type { PostBuilderStepProps } from "@/lib/types/post"

export function PlatformsAndSchedule({ draft, onBack }: PostBuilderStepProps) {
  const scheduledDate = draft.scheduledAt ? new Date(draft.scheduledAt) : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
        <h2 className="text-3xl font-bold">Ready to Review</h2>
        <p className="text-muted-foreground text-lg">
          Your post settings have been configured
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4">
        {/* Platforms Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publishing To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.publishToFacebook && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20">
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Facebook</p>
                  <p className="text-xs text-muted-foreground">Post to your Facebook Page</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                  Selected
                </Badge>
              </div>
            )}
            
            {draft.publishToInstagram && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#E4405F]/10 border border-[#E4405F]/20">
                <Instagram className="h-5 w-5 text-[#E4405F]" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Instagram</p>
                  <p className="text-xs text-muted-foreground">Post to your Instagram account</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                  Selected
                </Badge>
              </div>
            )}

            {!draft.publishToFacebook && !draft.publishToInstagram && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No platforms selected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {draft.scheduleType === 'immediate' ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Publish Immediately</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your post will be published as soon as you complete the setup
                  </p>
                </div>
              </div>
            ) : scheduledDate ? (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Scheduled</p>
                  <p className="text-sm text-foreground mt-1">
                    {format(scheduledDate, 'PPPP')} at {format(scheduledDate, 'p')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your post will be automatically published at this time
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-amber-600 text-sm">
                ⚠️ Schedule not configured
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {draft.postText && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Text</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap line-clamp-4">
                  {draft.postText}
                </p>
              </div>
            )}
            
            {draft.mediaUrl && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Media</p>
                <div className="rounded-lg overflow-hidden bg-muted max-w-sm">
                  {draft.mediaType === 'image' ? (
                    <img
                      src={draft.mediaUrl}
                      alt="Post media"
                      className="w-full h-auto"
                    />
                  ) : (
                    <video
                      src={draft.mediaUrl}
                      controls
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          Edit Settings
        </Button>
      </div>
    </div>
  )
}

