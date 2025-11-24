"use client"

/**
 * Content & Media Step - Split Screen Layout
 * Left: Form (text, media only)
 * Right: Live preview with platform tabs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image as ImageIcon, Video, Loader2, ChevronDown } from "lucide-react"
import { useState, useRef } from "react"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PostPreviewPanel } from "../post-preview-panel"

export function ContentAndMedia({ draft, onUpdate }: PostBuilderStepProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewTab, setPreviewTab] = useState<'facebook' | 'instagram'>('facebook')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
              Share photos or a video. Instagram posts can't exceed 10 photos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!draft.mediaUrl ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Facebook Business Suite Style Buttons */}
                <div className="flex gap-3">
                  {/* Add Photo Button */}
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 h-12 justify-start gap-2 bg-background hover:bg-accent"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-medium">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-medium">Add photo</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      </>
                    )}
                  </Button>

                  {/* Add Video Button - Coming Soon */}
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1 h-12 justify-start gap-2 bg-background opacity-60 cursor-not-allowed"
                  >
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Add video</span>
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </div>

                {/* Coming Soon Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs">
                    Video upload coming soon
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground text-center">
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

