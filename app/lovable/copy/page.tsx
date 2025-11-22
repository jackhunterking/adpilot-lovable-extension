/**
 * Feature: Lovable Copy Generation Page
 * Purpose: AI-powered ad copy generation
 */

"use client"

import { useState } from "react"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCopyGeneration, GeneratedCopy } from "@/lib/hooks/use-copy-generation"
import { useAdCopyContext } from "@/lib/context/ad-copy-context"
import { Loader2, Sparkles, Copy as CopyIcon, Check } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function CopyPage() {
  const {
    generateCopy,
    clearVariations,
    loading,
    variations
  } = useCopyGeneration()

  const { headline, setHeadline, body, setBody, cta, setCta } = useAdCopyContext()

  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState("professional")
  const [variationCount, setVariationCount] = useState("3")
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    await generateCopy(prompt, tone, parseInt(variationCount))
  }

  const handleSelectVariation = (variation: GeneratedCopy) => {
    setHeadline(variation.headline)
    setBody(variation.body)
    setCta(variation.cta)
    setSelectedVariation(variation.id)
    toast.success("Copy applied to your ad!")
  }

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual & Friendly" },
    { value: "urgent", label: "Urgent & Action-Oriented" },
    { value: "luxury", label: "Premium & Luxury" },
    { value: "playful", label: "Playful & Fun" },
    { value: "informative", label: "Educational & Informative" },
  ]

  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Ad Copy Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate compelling ad copy with AI-powered suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Generator Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Copy</CardTitle>
                <CardDescription>
                  Describe your product or service to generate copy variations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">What are you advertising?</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A mobile app that helps people track their fitness goals with personalized workout plans"
                    rows={5}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length}/500 characters
                  </p>
                </div>

                {/* Tone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone of Voice</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Variation Count */}
                <div className="space-y-2">
                  <Label htmlFor="count">Number of Variations</Label>
                  <Select value={variationCount} onValueChange={setVariationCount}>
                    <SelectTrigger id="count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 variation</SelectItem>
                      <SelectItem value="3">3 variations</SelectItem>
                      <SelectItem value="5">5 variations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Copy
                    </>
                  )}
                </Button>

                {variations.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearVariations()
                      setSelectedVariation(null)
                    }}
                    className="w-full"
                  >
                    Clear Variations
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Copy Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  ✓ Keep headlines under 40 characters
                </p>
                <p className="text-muted-foreground">
                  ✓ Use clear, action-oriented language
                </p>
                <p className="text-muted-foreground">
                  ✓ Highlight key benefits, not just features
                </p>
                <p className="text-muted-foreground">
                  ✓ Include a strong call-to-action
                </p>
                <p className="text-muted-foreground">
                  ✓ Test multiple variations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generated Variations */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Generating copy variations...
                  </p>
                </CardContent>
              </Card>
            ) : variations.length > 0 ? (
              variations.map((variation, index) => (
                <Card
                  key={variation.id}
                  className={selectedVariation === variation.id ? "border-primary" : ""}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">Variation {index + 1}</CardTitle>
                        {selectedVariation === variation.id && (
                          <Badge variant="default">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectVariation(variation)}
                      >
                        <CopyIcon className="h-4 w-4 mr-2" />
                        Use This
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Headline */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Headline</Label>
                      <p className="font-semibold text-lg">{variation.headline}</p>
                    </div>

                    {/* Body */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Body Text</Label>
                      <p className="text-sm">{variation.body}</p>
                    </div>

                    {/* CTA */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Call to Action</Label>
                      <div className="inline-block">
                        <Button size="sm">{variation.cta}</Button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tone: {variation.tone}</span>
                      <span>{new Date(variation.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No variations yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Enter a description of your product or service and click "Generate Copy" to create AI-powered ad copy variations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Current Ad Copy Preview */}
        {(headline || body || cta) && (
          <Card>
            <CardHeader>
              <CardTitle>Current Ad Copy</CardTitle>
              <CardDescription>
                This is the copy currently set for your ad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Headline</Label>
                  <p className="font-semibold mt-1">{headline || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <p className="text-sm mt-1">{body || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CTA</Label>
                  <p className="text-sm mt-1">{cta || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LovableLayout>
  )
}

