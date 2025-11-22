"use client"

/**
 * Feature: AI Generation Examples
 * Purpose: Demonstrate usage of triggerLovableAI utility in various scenarios
 * 
 * NOTE: This is an example/demo component to show developers how to use the AI trigger utility.
 * Use these patterns in your actual ad creation components.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Image as ImageIcon, Type, Target, TrendingUp } from "lucide-react"
import { triggerLovableAI, PromptTemplates } from "@/lib/utils/trigger-lovable-ai"

export function AIGenerationExamples() {
  const [productName, setProductName] = useState("Coffee Mug")
  const [headline, setHeadline] = useState("Start Your Morning Right")
  const [style, setStyle] = useState("modern")
  const [audience, setAudience] = useState("busy professionals")
  const [tone, setTone] = useState("friendly")

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Generation Examples</h1>
        <p className="text-muted-foreground">
          Examples of triggering Lovable AI from AdPilot components
        </p>
      </div>

      {/* Example 1: Generate Ad Image */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <CardTitle>Generate Ad Image</CardTitle>
          </div>
          <CardDescription>
            Create a Facebook ad image with AI using product details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Coffee Mug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="headline">Headline (Optional)</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Your catchy headline"
              />
            </div>
          </div>

          <Button
            onClick={() => {
              const prompt = PromptTemplates.generateImage({
                productName,
                style,
                headline: headline || undefined,
                width: 1200,
                height: 628,
              })

              triggerLovableAI({
                prompt,
                context: {
                  feature: 'ad-image-generation',
                  productName,
                  style,
                },
                toastMessage: 'AI is creating your ad image...',
              })
            }}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Image with AI
          </Button>
        </CardContent>
      </Card>

      {/* Example 2: Generate Ad Copy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            <CardTitle>Generate Ad Copy</CardTitle>
          </div>
          <CardDescription>
            Create multiple ad copy variations for A/B testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="busy professionals"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => {
              const prompt = PromptTemplates.generateCopy({
                productName,
                targetAudience: audience,
                tone,
                variations: 3,
              })

              triggerLovableAI({
                prompt,
                context: {
                  feature: 'ad-copy-generation',
                  productName,
                  audience,
                  tone,
                },
                toastMessage: 'AI is writing your ad copy variations...',
              })
            }}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate 3 Copy Variations
          </Button>
        </CardContent>
      </Card>

      {/* Example 3: Generate Targeting Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Targeting Suggestions</CardTitle>
          </div>
          <CardDescription>
            Get AI-powered targeting recommendations for your ad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <Select defaultValue="consumer-goods">
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consumer-goods">Consumer Goods</SelectItem>
                <SelectItem value="software">Software/SaaS</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="food-beverage">Food & Beverage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => {
              const prompt = PromptTemplates.generateTargeting({
                productName,
                productCategory: 'Consumer Goods',
                targetCountry: 'United States',
              })

              triggerLovableAI({
                prompt,
                context: {
                  feature: 'targeting-suggestions',
                  productName,
                },
                toastMessage: 'AI is analyzing targeting options...',
              })
            }}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get Targeting Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Example 4: Analyze Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Performance Analysis</CardTitle>
          </div>
          <CardDescription>
            Get AI insights on your ad performance and optimization tips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Impressions</Label>
              <Input defaultValue="10,000" disabled />
            </div>
            <div className="space-y-2">
              <Label>Clicks</Label>
              <Input defaultValue="250" disabled />
            </div>
            <div className="space-y-2">
              <Label>Conversions</Label>
              <Input defaultValue="15" disabled />
            </div>
            <div className="space-y-2">
              <Label>Spend</Label>
              <Input defaultValue="$125.50" disabled />
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span>CTR:</span>
              <span className="font-medium">2.50%</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion Rate:</span>
              <span className="font-medium">6.00%</span>
            </div>
            <div className="flex justify-between">
              <span>CPC:</span>
              <span className="font-medium">$0.50</span>
            </div>
          </div>

          <Button
            onClick={() => {
              const prompt = PromptTemplates.analyzePerformance({
                impressions: 10000,
                clicks: 250,
                conversions: 15,
                spend: 125.50,
              })

              triggerLovableAI({
                prompt,
                context: {
                  feature: 'performance-analysis',
                  adId: 'demo-ad-123',
                },
                toastMessage: 'AI is analyzing your performance...',
              })
            }}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get AI Insights
          </Button>
        </CardContent>
      </Card>

      {/* Example 5: Custom Prompt */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Prompt</CardTitle>
          <CardDescription>
            Send any custom prompt to Lovable AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Your Prompt</Label>
            <Input
              id="custom-prompt"
              placeholder="Generate a landing page for my product..."
              defaultValue=""
            />
          </div>

          <Button
            onClick={() => {
              const input = document.getElementById('custom-prompt') as HTMLInputElement
              const customPrompt = input?.value

              if (!customPrompt) {
                return
              }

              triggerLovableAI({
                prompt: customPrompt,
                context: {
                  feature: 'custom-prompt',
                  source: 'examples-page',
                },
              })
            }}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Send Custom Prompt
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

