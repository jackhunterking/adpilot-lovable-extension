"use client"

/**
 * Review & Publish Step - Split Screen Layout
 * Left: Platform selection and scheduling options
 * Right: Live preview with platform tabs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Facebook, Instagram, CalendarIcon, AlertCircle, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { PostPreviewPanel } from "../post-preview-panel"
import { useState } from "react"
import { usePostService } from "@/lib/services/service-provider"
import { useMetaConnection } from "@/lib/hooks/use-meta-connection"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function ReviewAndPublish({ draft, onUpdate }: PostBuilderStepProps) {
  const postService = usePostService()
  const router = useRouter()
  const { metaStatus } = useMetaConnection()
  const [isPublishing, setIsPublishing] = useState(false)
  const [previewTab, setPreviewTab] = useState<'facebook' | 'instagram'>('facebook')
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    draft.scheduledAt ? new Date(draft.scheduledAt) : undefined
  )
  const [selectedTime, setSelectedTime] = useState(
    draft.scheduledAt ? format(new Date(draft.scheduledAt), 'HH:mm') : '12:00'
  )
  
  // Get post ID from URL or context
  const searchParams = new URLSearchParams(window.location.search)
  const postId = searchParams.get('postId')

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const [hours, minutes] = selectedTime.split(':')
      date.setHours(parseInt(hours), parseInt(minutes))
      onUpdate({ scheduledAt: date.toISOString() })
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onUpdate({ scheduledAt: newDate.toISOString() })
    }
  }

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

  // Check if Meta is connected
  const isMetaConnected = metaStatus === 'connected'

  // Validation
  const canPublish = !!(draft.publishToFacebook || draft.publishToInstagram) &&
    (draft.scheduleType === 'immediate' || (draft.scheduleType === 'scheduled' && draft.scheduledAt)) &&
    isMetaConnected

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Column: Platform Selection & Scheduling */}
      <div className="space-y-6 animate-in fade-in-50 slide-in-from-left-4 duration-500">
        {/* Meta Connection Alert */}
        {!isMetaConnected && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You need to connect your Meta account before publishing posts.
              <Link href="/lovable/integrations" className="ml-2 underline inline-flex items-center gap-1">
                Connect Now <ExternalLink className="h-3 w-3" />
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Platforms</CardTitle>
            <CardDescription>
              Choose where to publish your post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="facebook"
                checked={draft.publishToFacebook}
                onCheckedChange={(checked) => {
                  onUpdate({ publishToFacebook: !!checked })
                  if (checked) setPreviewTab('facebook')
                }}
                disabled={!isMetaConnected}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="facebook"
                  className={cn(
                    "flex items-center gap-2 text-base font-medium cursor-pointer",
                    !isMetaConnected && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  Facebook
                </Label>
                <p className="text-xs text-muted-foreground">
                  Post to your Facebook Page
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="instagram"
                checked={draft.publishToInstagram}
                onCheckedChange={(checked) => {
                  onUpdate({ publishToInstagram: !!checked })
                  if (checked) setPreviewTab('instagram')
                }}
                disabled={!isMetaConnected}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="instagram"
                  className={cn(
                    "flex items-center gap-2 text-base font-medium cursor-pointer",
                    !isMetaConnected && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Instagram className="h-4 w-4 text-[#E4405F]" />
                  Instagram
                </Label>
                <p className="text-xs text-muted-foreground">
                  Post to your Instagram account
                </p>
                {draft.publishToInstagram && !draft.mediaUrl && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Instagram requires an image or video
                  </p>
                )}
              </div>
            </div>

            {!draft.publishToFacebook && !draft.publishToInstagram && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Please select at least one platform to publish
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Publish now or schedule for later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={draft.scheduleType}
              onValueChange={(value) => onUpdate({ scheduleType: value as 'immediate' | 'scheduled' })}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="cursor-pointer font-medium">
                  Publish now
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="cursor-pointer font-medium">
                  Schedule for later
                </Label>
              </div>
            </RadioGroup>

            {draft.scheduleType === 'scheduled' && (
              <div className="space-y-3 pl-7 pt-2">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label className="text-sm">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Picker */}
                <div className="space-y-2">
                  <Label className="text-sm">Time</Label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                {selectedDate && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Scheduled for{' '}
                      <span className="font-semibold text-foreground">
                        {format(selectedDate, 'PPP')} at {selectedTime}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Right Column: Live Preview */}
      <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500 delay-150">
        <PostPreviewPanel
          selectedTab={previewTab}
          onTabChange={setPreviewTab}
          postText={draft.postText}
          mediaUrl={draft.mediaUrl}
          mediaType={draft.mediaType}
          publishToFacebook={draft.publishToFacebook}
          publishToInstagram={draft.publishToInstagram}
        />
      </div>
    </div>
  )
}

