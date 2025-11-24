"use client"

/**
 * Content & Media Step - Split Screen Layout
 * Left: Form (text, media, platforms, scheduling)
 * Right: Live preview with platform tabs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Upload, X, Image as ImageIcon, Video, CalendarIcon, Facebook, Instagram, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { format } from "date-fns"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PostPreviewPanel } from "../post-preview-panel"

export function ContentAndMedia({ draft, onUpdate }: PostBuilderStepProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewTab, setPreviewTab] = useState<'facebook' | 'instagram'>('facebook')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    draft.scheduledAt ? new Date(draft.scheduledAt) : undefined
  )
  const [selectedTime, setSelectedTime] = useState(
    draft.scheduledAt ? format(new Date(draft.scheduledAt), 'HH:mm') : '12:00'
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      toast.error('Please upload an image or video file')
      return
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setIsUploading(true)
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload to our backend
      const response = await fetch('/api/v1/upload/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      
      onUpdate({
        mediaUrl: url,
        mediaType: isImage ? 'image' : 'video',
      })

      toast.success('Media uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload media. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveMedia = () => {
    onUpdate({
      mediaUrl: undefined,
      mediaType: 'none',
    })
  }

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

  const characterCount = draft.postText?.length || 0
  const maxChars = 2200 // Instagram caption limit
  const isNearLimit = characterCount > maxChars * 0.9
  const isOverLimit = characterCount > maxChars

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Left Column: Form */}
      <div className="space-y-6 animate-in fade-in-50 slide-in-from-left-4 duration-500">
        {/* Post Text */}
        <Card>
          <CardHeader>
            <CardTitle>Post Text</CardTitle>
            <CardDescription>
              Write your post caption or message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={draft.postText || ''}
              onChange={(e) => onUpdate({ postText: e.target.value })}
              rows={6}
              className={cn(
                "resize-none text-[15px]",
                isOverLimit && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <div className="flex justify-end items-center text-xs">
              <span className={cn(
                "font-medium",
                isNearLimit && !isOverLimit && "text-yellow-600",
                isOverLimit && "text-red-600"
              )}>
                {characterCount} / {maxChars}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>
              Upload an image or video (optional for Facebook, required for Instagram)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!draft.mediaUrl ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-24 border-dashed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm">Upload Image or Video</span>
                    </div>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Max 50MB • JPG, PNG, MP4, MOV
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Media Preview */}
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  {draft.mediaType === 'image' ? (
                    <img
                      src={draft.mediaUrl}
                      alt="Post media"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  ) : (
                    <video
                      src={draft.mediaUrl}
                      controls
                      className="w-full h-auto max-h-64"
                    />
                  )}
                  
                  {/* Media type badge */}
                  <Badge className="absolute top-2 left-2 bg-black/70 hover:bg-black/70">
                    {draft.mediaType === 'image' ? (
                      <>
                        <ImageIcon className="mr-1 h-3 w-3" />
                        Image
                      </>
                    ) : (
                      <>
                        <Video className="mr-1 h-3 w-3" />
                        Video
                      </>
                    )}
                  </Badge>
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Replace button */}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                  size="sm"
                >
                  Replace Media
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Platforms</CardTitle>
            <CardDescription>
              Select where to publish your post
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
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="facebook"
                  className="flex items-center gap-2 text-base font-medium cursor-pointer"
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
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="instagram"
                  className="flex items-center gap-2 text-base font-medium cursor-pointer"
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

