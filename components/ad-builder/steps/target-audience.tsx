"use client"

/**
 * Step 2: Target Audience
 * Purpose: Define who should see your ad with AI-powered suggestions
 */

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sparkles, X, Users, User, Info, Loader2 } from "lucide-react"
import { triggerLovableAI } from "@/lib/utils/trigger-lovable-ai"
import { cn } from "@/lib/utils"
import type { AdDraft, AdBuilderStepProps } from "@/lib/types/ad-builder"

type TargetAudienceProps = AdBuilderStepProps

interface InterestSuggestion {
  id: string
  name: string
  audience_size?: number
}

export function TargetAudience({ draft, onUpdate }: TargetAudienceProps) {
  // Read directly from draft (single source of truth)
  const ageRange: [number, number] = [
    draft.targeting?.ageMin || 18,
    draft.targeting?.ageMax || 65,
  ]
  const gender = draft.targeting?.gender || "all"
  const interests = draft.targeting?.interests || []
  const locations = draft.targeting?.locations || []
  
  // Helper to update targeting fields
  const updateTargeting = (updates: Partial<typeof draft.targeting>) => {
    onUpdate({
      targeting: {
        ...draft.targeting,
        locations,
        ...updates,
      },
    })
  }
  
  // Search states
  const [interestSearch, setInterestSearch] = useState("")
  const [interestSuggestions, setInterestSuggestions] = useState<InterestSuggestion[]>([])
  const [interestLoading, setInterestLoading] = useState(false)

  // Audience estimate
  const [audienceSize, setAudienceSize] = useState({ min: 50000, max: 100000 })

  // Validation
  const isValid = interests.length > 0

  // Search interests via Meta API
  const searchInterests = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setInterestSuggestions([])
      return
    }

    try {
      setInterestLoading(true)
      
      // ⚠️ BACKEND OPERATION: Call Meta Interest Search API
      const response = await fetch(
        `/api/v1/meta/search-interests?q=${encodeURIComponent(query)}`
      )

      if (response.ok) {
        const data = await response.json()
        setInterestSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Interest search error:", error)
    } finally {
      setInterestLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInterests(interestSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [interestSearch, searchInterests])

  // Estimate audience size
  useEffect(() => {
    // Mock estimation based on targeting
    const baseSize = 1000000
    const locationMultiplier = Math.min(locations.length, 3) * 0.3
    const ageMultiplier = ((ageRange[1] - ageRange[0]) / 47) * 0.5
    const genderMultiplier = gender === "all" ? 1 : 0.5
    const interestMultiplier = Math.max(0.1, 1 - interests.length * 0.1)

    const estimated = baseSize * locationMultiplier * ageMultiplier * genderMultiplier * interestMultiplier

    setAudienceSize({
      min: Math.floor(estimated * 0.8),
      max: Math.floor(estimated * 1.2),
    })
  }, [locations, ageRange, gender, interests])

  const handleAISuggestInterests = () => {
    const productName = sessionStorage.getItem("ad_product_name") || "Your Product"
    
    const prompt = `Suggest Facebook ad targeting interests for:

Product: ${productName}
Target audience: Ages ${ageRange[0]}-${ageRange[1]}, ${gender === "all" ? "all genders" : gender}
Goal: Drive signups

Provide 10-15 relevant interest keywords available in Meta's interest targeting. Format as a simple list.`

    triggerLovableAI({
      prompt,
      context: {
        feature: "interest-suggestions",
        productName,
        ageRange,
        gender,
      },
      toastMessage: "AI is suggesting interests for your audience...",
    })
  }

  const handleAddInterest = (interest: string) => {
    if (!interests.includes(interest)) {
      const newInterests = [...interests, interest]
      updateTargeting({ interests: newInterests })
    }
    setInterestSearch("")
    setInterestSuggestions([])
  }

  const handleRemoveInterest = (interest: string) => {
    const newInterests = interests.filter((i) => i !== interest)
    updateTargeting({ interests: newInterests })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Targeting Controls */}
      <div className="space-y-6">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Demographics
            </CardTitle>
            <CardDescription>Age and gender targeting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Range Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Age Range</Label>
                <div className="text-sm font-medium text-primary">
                  {ageRange[0]} - {ageRange[1] === 65 ? "65+" : ageRange[1]}
                </div>
              </div>
              <Slider
                min={18}
                max={65}
                step={1}
                value={ageRange}
                onValueChange={(value) => updateTargeting({ 
                  ageMin: value[0], 
                  ageMax: value[1] 
                })}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>18</span>
                <span>65+</span>
              </div>
            </div>

            {/* Gender - Visual Radio Group */}
            <div className="space-y-3">
              <Label>Gender</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => updateTargeting({ gender: "all" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    gender === "all"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">All</span>
                </button>

                <button
                  onClick={() => updateTargeting({ gender: "male" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    gender === "male"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Men</span>
                </button>

                <button
                  onClick={() => updateTargeting({ gender: "female" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    gender === "female"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Women</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Interest Targeting</CardTitle>
            <CardDescription>Reach people based on their interests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                placeholder="Search interests (e.g., fitness, technology)..."
                className="pr-10"
              />
              {interestLoading && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              )}

              {/* Autocomplete Suggestions */}
              {interestSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {interestSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleAddInterest(suggestion.name)}
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.audience_size && (
                        <div className="text-xs text-muted-foreground">
                          {(suggestion.audience_size / 1000000).toFixed(1)}M people
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Suggest Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleAISuggestInterests}
            >
              <Sparkles className="w-4 h-4" />
              ✨ AI Suggest Interests
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  The AI will suggest interests. Select the ones you want to target.
                </p>
              </div>
            </div>

            {/* Selected Interests */}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {interests.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No interests selected yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Audience Size Estimator */}
      <div className="lg:sticky lg:top-6 h-fit space-y-6">
        <AudienceEstimator
          locations={locations}
          ageRange={ageRange}
          gender={gender}
          interests={interests}
          audienceSize={audienceSize}
        />

        {/* Validation Message */}
        {!isValid && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Select at least 1 interest to continue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Audience Size Estimator Component
 * Shows estimated reach based on targeting
 */
interface AudienceEstimatorProps {
  locations: string[]
  ageRange: [number, number]
  gender: "all" | "male" | "female"
  interests: string[]
  audienceSize: { min: number; max: number }
}

function AudienceEstimator({
  locations,
  ageRange,
  gender,
  interests,
  audienceSize,
}: AudienceEstimatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Estimate</CardTitle>
        <CardDescription>Potential reach for your targeting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estimated Reach */}
        <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">Estimated Daily Reach</p>
          <p className="text-3xl font-bold text-primary">
            {audienceSize.min.toLocaleString()} - {audienceSize.max.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">people</p>
        </div>

        {/* Note */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Estimates are based on your targeting settings. Actual reach may vary based on budget and competition.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

