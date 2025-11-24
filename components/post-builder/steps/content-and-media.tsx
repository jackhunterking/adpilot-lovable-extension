"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image as ImageIcon, Video } from "lucide-react"
import { useState, useRef } from "react"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function ContentAndMedia({ draft, onUpdate }: PostBuilderStepProps) {
  const [isUploading, setIsUploading] = useState(false)
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Create Your Post</h2>
        <p className="text-muted-foreground text-lg">
          Add your text and media
        </p>
      </div>

      {/* Post Text */}
      <Card>
        <CardHeader>
          <CardTitle>Post Text</CardTitle>
          <CardDescription>
            Write your post caption or message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="What's on your mind?"
              value={draft.postText || ''}
              onChange={(e) => onUpdate({ postText: e.target.value })}
              rows={8}
              className={cn(
                "resize-none",
                isOverLimit && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Share your thoughts, updates, or announcements
              </span>
              <span className={cn(
                "font-medium",
                isNearLimit && !isOverLimit && "text-yellow-600",
                isOverLimit && "text-red-600"
              )}>
                {characterCount} / {maxChars}
              </span>
            </div>
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
                className="w-full h-32"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-5 w-5 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Image or Video
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Max file size: 50MB • Supported: JPG, PNG, MP4, MOV
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Media Preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {draft.mediaType === 'image' ? (
                  <img
                    src={draft.mediaUrl}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={draft.mediaUrl}
                    controls
                    className="w-full h-auto max-h-96"
                  />
                )}
                
                {/* Media type badge */}
                <Badge className="absolute top-2 left-2">
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
                className="w-full mt-4"
              >
                Replace Media
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {draft.publishToInstagram && !draft.mediaUrl && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              📸 <strong>Instagram posts require media.</strong> Please upload an image or video to post to Instagram.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

