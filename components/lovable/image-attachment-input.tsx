"use client"

/**
 * Image Attachment Input Component
 * Purpose: Reusable component for + button and attachment preview
 * Features:
 * - File picker for images (PNG, JPG, max 10MB)
 * - Preview thumbnails with remove button
 * - Support for multiple attachments (max 3)
 * - Validation and error handling
 */

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface AttachedImage {
  id: string
  file: File
  dataUrl: string // For preview
  uploadedUrl?: string // After Supabase upload
}

interface ImageAttachmentInputProps {
  attachedImages: AttachedImage[]
  onImagesChange: (images: AttachedImage[]) => void
  maxImages?: number
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export function ImageAttachmentInput({
  attachedImages,
  onImagesChange,
  maxImages = 3,
  maxSizeMB = 10,
  disabled = false,
  className
}: ImageAttachmentInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleButtonClick = () => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File must be an image'
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return 'Only PNG and JPG images are supported'
    }

    // Check file size (convert MB to bytes)
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // Check if adding these files would exceed max
    if (attachedImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)

    try {
      const newImages: AttachedImage[] = []

      for (const file of files) {
        // Validate file
        const error = validateFile(file)
        if (error) {
          toast.error(error)
          continue
        }

        // Create preview using FileReader
        const dataUrl = await readFileAsDataURL(file)
        
        const newImage: AttachedImage = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          dataUrl
        }

        newImages.push(newImage)
      }

      if (newImages.length > 0) {
        onImagesChange([...attachedImages, ...newImages])
        toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} attached`)
      }
    } catch (error) {
      console.error('[ImageAttachment] Error reading files:', error)
      toast.error('Failed to attach images')
    } finally {
      setIsUploading(false)
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (imageId: string) => {
    onImagesChange(attachedImages.filter(img => img.id !== imageId))
    toast.success('Image removed')
  }

  const canAddMore = attachedImages.length < maxImages && !disabled && !isUploading

  return (
    <div className={cn("space-y-2", className)}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {/* Add Button */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={handleButtonClick}
        disabled={!canAddMore}
        title={canAddMore ? "Attach image" : `Maximum ${maxImages} images`}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {/* Attachment Previews */}
      {attachedImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Attached ({attachedImages.length}/{maxImages}):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {attachedImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
              >
                <img
                  src={image.dataUrl}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                />
                {/* Overlay with file name */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                  <p className="text-white text-xs text-center truncate w-full">
                    {image.file.name}
                  </p>
                  <p className="text-white/70 text-xs">
                    {(image.file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-1 right-1 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {attachedImages.length === 0 && !isUploading && (
        <p className="text-xs text-muted-foreground">
          Click + to attach reference images (max {maxImages}, {maxSizeMB}MB each)
        </p>
      )}

      {isUploading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="animate-spin">⏳</span> Processing images...
        </p>
      )}
    </div>
  )
}

