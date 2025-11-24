"use client"

/**
 * Step 2: Creative & Copy
 * Purpose: Generate and edit ad images and copy with AI assistance
 * Layout: Chat-style interface with content at top, AI input at bottom
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Type, X, Sparkles, Upload, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdBuilderStepProps } from "@/lib/types/ad-builder"
import { AdMockupFormatToggle } from "@/components/ad-mockup-format-toggle"
import { useAdPreview } from "@/lib/context/ad-preview-context"
import { AdMockup } from "@/components/ad-mockup"
import { toast } from "sonner"
import { useImageUpload } from "@/lib/hooks/use-image-upload"
import { useCampaignContext } from "@/lib/context/campaign-context"
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

type CreativeAndCopyProps = AdBuilderStepProps

export function CreativeAndCopy({ draft, onUpdate }: CreativeAndCopyProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'copy'>('image')
  const { campaign } = useCampaignContext()
  const { uploadMultipleImages, isUploading, validateFiles } = useImageUpload()
  
  // Read from draft
  const images = draft.creative?.images || []
  const headline = draft.creative?.headline || ""
  const primaryText = draft.creative?.primaryText || ""
  const description = draft.creative?.description || ""
  const callToAction = draft.creative?.callToAction || "Learn More"
  const productContext = draft.productContext || ""
  const goal = draft.goal || "signups"
  
  // Validation
  const hasImage = images.length > 0
  const hasCopy = headline.trim().length > 0 && primaryText.trim().length > 0
  const isValid = hasImage && hasCopy
  
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

  // Handle AI image generation
  const handleImageAISubmit = async (message: PromptInputMessage) => {
    const prompt = message.text || ""
    const attachedFiles = message.files || []
    
    const fullPrompt = `Generate a Facebook ad image for: ${productContext}
Goal: ${goal === 'signups' ? 'Get signups and leads' : goal}

User request: ${prompt}

Requirements:
- Professional, eye-catching design
- Square (1080x1080) and Vertical (1080x1920) formats
- Modern, clean aesthetic`
    
    toast.info("AI is generating your image...", {
      description: "This may take a few seconds",
      duration: 3000,
    })
    
    console.log('Image AI Prompt:', fullPrompt, 'References:', attachedFiles)
    
    // TODO: Call your AI image generation service
    // For now, mock implementation
  }

  // Handle AI copy generation
  const handleCopyAISubmit = async (message: PromptInputMessage) => {
    const prompt = message.text || ""
    
    const fullPrompt = `Write Facebook ad copy for: ${productContext}
Goal: ${goal === 'signups' ? 'Get signups and leads' : goal}
Call-to-action: ${callToAction}

User request: ${prompt}

Requirements:
- Headline: Max 40 characters, attention-grabbing
- Primary Text: Max 125 characters, compelling and clear
- Description: Max 30 characters, concise value prop
- Tone: Professional yet conversational`
    
    toast.info("AI is writing your copy...", {
      description: "Generating headline, text, and description",
      duration: 3000,
    })
    
    console.log('Copy AI Prompt:', fullPrompt)
    
    // TODO: Call your AI copy generation service
    // For now, mock implementation
  }

  const handleManualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate files first
    const validation = validateFiles(files)
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    // Check if we have campaign and can upload
    if (!campaign?.id) {
      toast.error("Campaign not found. Please save your ad first.")
      return
    }

    // Check image limit
    const availableSlots = 3 - images.length
    if (availableSlots <= 0) {
      toast.error("Maximum 3 images allowed. Remove an image first.")
      return
    }

    const filesToUpload = validation.validFiles.slice(0, availableSlots)
    
    if (filesToUpload.length < validation.validFiles.length) {
      toast.info(`Uploading ${filesToUpload.length} of ${validation.validFiles.length} images (3 max)`)
    }

    try {
      toast.info(`Uploading ${filesToUpload.length} image(s)...`)
      
      // Create a temporary ad ID if we don't have one yet
      // In reality, the ad should be created first, but we'll use campaign ID as fallback
      const adId = draft.creative?.images?.[0] ? 'temp-ad-id' : campaign.id
      
      const results = await uploadMultipleImages(filesToUpload, adId, campaign.id)
      
      const successfulUploads = results.filter(r => r.success && r.url)
      const failedUploads = results.filter(r => !r.success)

      if (successfulUploads.length > 0) {
        const newImageUrls = successfulUploads.map(r => r.url!)
        updateCreative({ images: [...images, ...newImageUrls].slice(0, 3) })
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`)
      }

      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} upload(s) failed`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
    }

    // Clear the file input
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    updateCreative({ images: images.filter((_, i) => i !== index) })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Chat-Style Interface */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'copy')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Ad Image
              {hasImage && <span className="ml-1 text-xs">✓</span>}
            </TabsTrigger>
            <TabsTrigger value="copy" className="gap-2">
              <Type className="w-4 h-4" />
              Ad Copy
              {hasCopy && <span className="ml-1 text-xs">✓</span>}
            </TabsTrigger>
          </TabsList>

          {/* IMAGE TAB - Content at Top, Input at Bottom */}
          <TabsContent value="image" className="mt-4">
            <Card className="flex flex-col" style={{ minHeight: '500px' }}>
              {/* TOP: Generated Images or Empty State */}
              <CardContent className="flex-1 pt-6 pb-4">
                {images.length > 0 ? (
                  // Has Images
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Your Images</Label>
                      <span className="text-xs text-muted-foreground">{images.length}/3</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                          <img src={img} alt={`Ad ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Manual Upload Option */}
                    {images.length < 3 && (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">Add More</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => document.getElementById("manual-upload")?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  // Empty State
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">No images yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Use AI below to generate images or upload your own
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("manual-upload")?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>

              {/* BOTTOM: AI Prompt Input - HIDDEN (Feature temporarily disabled) */}
              {false && (
                <div className="border-t bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Generate with AI</span>
                  </div>
                  
                  <PromptInput
                    onSubmit={handleImageAISubmit}
                    accept="image/*"
                    multiple
                    maxFiles={3}
                    maxFileSize={10 * 1024 * 1024}
                    onError={(err) => toast.error(err.message)}
                  >
                    <PromptInputBody>
                      <PromptInputAttachments>
                        {(attachment) => <PromptInputAttachment data={attachment} />}
                      </PromptInputAttachments>
                      <PromptInputTextarea
                        placeholder="Describe your ad image... (e.g., 'Modern workspace with laptop, blue gradient')"
                        className="min-h-[80px]"
                      />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputActionMenu>
                          <PromptInputActionMenuTrigger />
                          <PromptInputActionMenuContent>
                            <PromptInputActionAddAttachments label="Attach references" />
                          </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
                      </PromptInputTools>
                      <PromptInputSubmit />
                    </PromptInputFooter>
                  </PromptInput>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* COPY TAB - Content at Top, Input at Bottom */}
          <TabsContent value="copy" className="mt-4">
            <Card className="flex flex-col" style={{ minHeight: '500px' }}>
              {/* TOP: Copy Fields - Always Show (Manual Input) */}
              <CardContent className="flex-1 pt-6 pb-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="headline" className="text-sm">
                        Headline <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="headline"
                        value={headline}
                        onChange={(e) => updateCreative({ headline: e.target.value })}
                        placeholder="Grab attention"
                        maxLength={40}
                      />
                      <p className="text-xs text-muted-foreground text-right">{headline.length}/40</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryText" className="text-sm">
                        Primary Text <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="primaryText"
                        value={primaryText}
                        onChange={(e) => updateCreative({ primaryText: e.target.value })}
                        placeholder="Tell your story"
                        rows={4}
                        maxLength={125}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-right">{primaryText.length}/125</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">Description (optional)</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => updateCreative({ description: e.target.value })}
                        placeholder="Additional details"
                        maxLength={30}
                      />
                      <p className="text-xs text-muted-foreground text-right">{description.length}/30</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta" className="text-sm">Call to Action <span className="text-destructive">*</span></Label>
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
                  </div>
              </CardContent>

              {/* BOTTOM: AI Prompt Input - HIDDEN (Feature temporarily disabled) */}
              {false && (
                <div className="border-t bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-600">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium">Generate with AI</span>
                  </div>
                  
                  <PromptInput
                    onSubmit={handleCopyAISubmit}
                    onError={(err) => toast.error(err.message)}
                  >
                    <PromptInputBody>
                      <PromptInputTextarea
                        placeholder="Write copy for... (e.g., 'Emphasize ease of use, free trial, target busy professionals')"
                        className="min-h-[80px]"
                      />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <div className="flex-1" />
                      <PromptInputSubmit />
                    </PromptInputFooter>
                  </PromptInput>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <input
          id="manual-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleManualImageUpload}
        />
      </div>

      {/* Right Column: Live Preview */}
      <div className="lg:sticky lg:top-6 h-fit">
        <Card>
          <CardContent className="pt-6">
            <LiveAdPreview
              image={images[0]}
              headline={headline}
              primaryText={primaryText}
              description={description}
              callToAction={callToAction}
            />
          </CardContent>
        </Card>

        {/* Validation */}
        {(!hasImage || !hasCopy) && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {!hasImage && !hasCopy && "⚠️ Add image and copy to continue"}
              {hasImage && !hasCopy && "⚠️ Add copy to continue"}
              {!hasImage && hasCopy && "⚠️ Add image to continue"}
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
  const { selectedFormat, setSelectedFormat, adContent } = useAdPreview()
  
  const currentImage = selectedFormat === 'square' 
    ? (adContent?.imageUrlSquare || image)
    : (adContent?.imageUrlVertical || image)
  
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="flex justify-center">
        <AdMockupFormatToggle
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
        />
      </div>
      
      <AdMockup
        format={selectedFormat}
        imageUrl={currentImage}
        brandName="Your Business"
        primaryText={primaryText || "Your text here..."}
        headline={headline || "Headline..."}
        description={description}
        ctaText={callToAction || "Learn More"}
        showEngagement={true}
      />
      
      <p className="text-xs text-muted-foreground text-center">
        {selectedFormat === 'square' ? '📱 Square (1080x1080)' : '📲 Vertical (1080x1920)'}
      </p>
    </div>
  )
}
