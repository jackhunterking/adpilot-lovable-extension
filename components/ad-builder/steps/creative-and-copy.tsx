"use client"

/**
 * Step 2: Creative & Copy
 * Purpose: Select ad images and write compelling copy with live preview
 */

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Upload, X, Info } from "lucide-react"
import { triggerLovableAI } from "@/lib/utils/trigger-lovable-ai"
import { cn } from "@/lib/utils"
import type { AdDraft, AdBuilderStepProps } from "@/lib/types/ad-builder"
import { AdMockupFormatToggle } from "@/components/ad-mockup-format-toggle"
import { useAdPreview } from "@/lib/context/ad-preview-context"
import { AdMockup } from "@/components/ad-mockup"
import { PromptInputWithAttachments } from "@/components/lovable/prompt-input-with-attachments"
import type { AttachedImage } from "@/components/lovable/image-attachment-input"
import { toast } from "sonner"

type CreativeAndCopyProps = AdBuilderStepProps

export function CreativeAndCopy({ draft, onUpdate }: CreativeAndCopyProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  // Read directly from draft (single source of truth)
  const images = draft.creative?.images || []
  const headline = draft.creative?.headline || ""
  const primaryText = draft.creative?.primaryText || ""
  const description = draft.creative?.description || ""
  const callToAction = draft.creative?.callToAction || "Learn More"
  
  // Get product context from draft (provided in Get Started step)
  const productContext = draft.productContext || ""

  // Validation: All required fields filled
  const isValid = headline.trim().length > 0 && primaryText.trim().length > 0
  
  // Helper to update creative fields
  const updateCreative = (updates: Partial<typeof draft.creative>) => {
    onUpdate({
      creative: {
        images,
        headline,
        primaryText,
        description,
        callToAction,
        ...updates,
      },
    })
  }

  const handleSendPrompt = async (prompt: string, attachedImages: AttachedImage[]) => {
    // Build the full prompt with product context
    const fullPrompt = productContext 
      ? `Generate a Facebook ad image based on this product: ${productContext}.\n\nUser request: ${prompt}\n\nRequirements:\n- Style: modern, professional\n- Create both square (1080x1080) and vertical (1080x1920) formats`
      : `${prompt}\n\nRequirements:\n- Style: modern, professional\n- Create both square (1080x1080) and vertical (1080x1920) formats`

    // Note: In main ad builder (not iframe), this opens Lovable in new tab
    // User will manually download and upload generated images
    triggerLovableAI({
      prompt: fullPrompt,
      images: attachedImages.map(img => img.dataUrl), // Pass base64 for reference
      context: { 
        feature: "ad-image-generation-main-builder",
        productContext,
        dualFormat: true,
      },
      toastMessage: "Opening Lovable AI... You can download generated images and upload them here.",
    })

    // Show instruction toast
    toast.info("Lovable AI will generate your images", {
      description: "Once generated, download them and upload here using the + button",
      duration: 6000,
    })
  }

  const handleGenerateCopy = () => {
    const prompt = `Write Facebook ad copy for this product: ${productContext}. Goal: Drive signups. Tone: professional and persuasive. Provide variations for headline (max 40 chars), primary text (max 125 chars), and description (max 30 chars).`

    triggerLovableAI({
      prompt,
      context: { 
        feature: "ad-copy-generation",
        productContext,
      },
      toastMessage: "AI is writing your ad copy...",
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length > 0) {
      // Convert to data URLs (for demo - in production, upload to storage)
      imageFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          if (url && images.length < 3) {
            const newImages = [...images, url].slice(0, 3)
            updateCreative({ images: newImages })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }, [images, updateCreative])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        if (url && images.length < 3) {
          const newImages = [...images, url].slice(0, 3)
          updateCreative({ images: newImages })
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    updateCreative({ images: newImages })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Input Controls */}
      <div className="space-y-6">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Image</CardTitle>
            <CardDescription>Upload an image or describe what you want to create</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Prompt Input with Attachments */}
            <PromptInputWithAttachments
              onSend={handleSendPrompt}
              placeholder="Describe the image you want to create (e.g., 'Modern tech startup hero image with blue gradient')"
              maxLength={500}
            />

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 Click + to attach reference images, then describe what you want. AI will open in a new tab. Download the generated images and upload them using the + button.
                </p>
              </div>
            </div>

            {/* Manual Upload Section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or Upload Directly</span>
              </div>
            </div>

            {/* Drag & Drop Zone (Smaller, secondary) */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium mb-1">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB (max 3 images)
              </p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Image Thumbnails */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                    <img src={img} alt={`Ad ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(idx)
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Copy</CardTitle>
            <CardDescription>Write compelling text for your ad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">
                Headline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => updateCreative({ headline: e.target.value })}
                placeholder="Grab attention with a powerful headline"
                maxLength={40}
              />
              <p className="text-xs text-muted-foreground">{headline.length}/40 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryText">
                Primary Text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="primaryText"
                value={primaryText}
                onChange={(e) => updateCreative({ primaryText: e.target.value })}
                placeholder="Tell your story and explain what makes your offer special"
                rows={4}
                maxLength={125}
              />
              <p className="text-xs text-muted-foreground">{primaryText.length}/125 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => updateCreative({ description: e.target.value })}
                placeholder="Additional details about your offer"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">{description.length}/30 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action <span className="text-destructive">*</span></Label>
              <Select value={callToAction} onValueChange={(value) => updateCreative({ callToAction: value })}>
                <SelectTrigger id="cta">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sign Up">Sign Up</SelectItem>
                  <SelectItem value="Learn More">Learn More</SelectItem>
                  <SelectItem value="Get Started">Get Started</SelectItem>
                  <SelectItem value="Shop Now">Shop Now</SelectItem>
                  <SelectItem value="Download">Download</SelectItem>
                  <SelectItem value="Get Quote">Get Quote</SelectItem>
                  <SelectItem value="Contact Us">Contact Us</SelectItem>
                  <SelectItem value="Apply Now">Apply Now</SelectItem>
                  <SelectItem value="Book Now">Book Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Generate Copy Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGenerateCopy}
            >
              <MessageSquare className="w-4 h-4" />
              💬 Write Copy with AI
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  The AI will generate copy. Paste it here once ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Live Ad Preview */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your ad will look on Facebook</CardDescription>
          </CardHeader>
          <CardContent>
            <LiveAdPreview
              image={images[0]}
              headline={headline}
              primaryText={primaryText}
              description={description}
              callToAction={callToAction}
            />
          </CardContent>
        </Card>

        {/* Validation Message */}
        {!isValid && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Headline and primary text are required to continue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Live Ad Preview Component
 * Shows real-time preview of how ad will appear on Facebook (mobile view)
 * Supports dual format: Square (1080x1080) and Vertical (1080x1920)
 */
interface LiveAdPreviewProps {
  image?: string
  headline: string
  primaryText: string
  description: string
  callToAction: string
}

function LiveAdPreview({
  image,
  headline,
  primaryText,
  description,
  callToAction,
}: LiveAdPreviewProps) {
  // Get format state from context (for Lovable extension dual format support)
  const { selectedFormat, setSelectedFormat, adContent } = useAdPreview()
  
  // Get the correct image URL based on selected format
  const currentImage = selectedFormat === 'square' 
    ? (adContent?.imageUrlSquare || image)
    : (adContent?.imageUrlVertical || image)
  
  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Format Toggle - Square vs Vertical */}
      <div className="flex justify-center">
        <AdMockupFormatToggle
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
        />
      </div>
      
      {/* Use AdMockup component for consistent rendering */}
      <AdMockup
        format={selectedFormat}
        imageUrl={currentImage}
        brandName="Your Business"
        primaryText={primaryText || "Your primary text will appear here..."}
        headline={headline || "Your headline..."}
        description={description}
        ctaText={callToAction || "Learn More"}
        showEngagement={true}
      />
      
      {/* Legacy mockup kept as backup (hidden) */}
      <div className="hidden border border-border rounded-lg overflow-hidden bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            YB
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Your Business</p>
            <p className="text-xs text-muted-foreground">Sponsored</p>
          </div>
        </div>

        {/* Primary Text */}
        <div className="p-3">
          <p className="text-sm whitespace-pre-wrap">
            {primaryText || (
              <span className="text-muted-foreground italic">
                Your primary text will appear here...
              </span>
            )}
          </p>
        </div>

        {/* Image */}
        <div className="bg-muted aspect-[1.91/1] relative">
          {image ? (
            <img src={image} alt="Ad preview" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No image yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Link Card */}
        <div className="bg-muted/50 p-3 border-t border-border">
          <p className="font-semibold text-sm mb-0.5">
            {headline || (
              <span className="text-muted-foreground italic">Your headline...</span>
            )}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
          )}
          <p className="text-xs text-muted-foreground">yourwebsite.com</p>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-border flex gap-2">
          <Button size="sm" className="flex-1">
            {callToAction || "Learn More"}
          </Button>
        </div>
      </div>

      {/* Preview Info */}
      <p className="text-xs text-muted-foreground text-center">
        Mobile preview • Updates in real-time
      </p>
      <p className="text-xs text-muted-foreground text-center">
        {selectedFormat === 'square' ? '📱 Square (1080x1080)' : '📲 Vertical (1080x1920)'}
      </p>
    </div>
  )
}

