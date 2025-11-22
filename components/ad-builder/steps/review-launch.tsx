"use client"

/**
 * Step 4: Review & Launch
 * Purpose: Review ad details and launch
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle2, Image as ImageIcon, Users, DollarSign, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { AdDraft, AdBuilderStepProps } from "@/lib/types/ad-builder"

type ReviewLaunchProps = AdBuilderStepProps

export function ReviewLaunch({ draft, onBack }: ReviewLaunchProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLaunch = async () => {
    try {
      setLoading(true)

      // Get Lovable project ID
      const lovableProjectId = sessionStorage.getItem("adpilot_lovable_project_id")

      if (!lovableProjectId) {
        toast.error("No project ID found")
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Please sign in to create ads")
        return
      }

      // ⚠️ BACKEND OPERATION: Create ad in Supabase
      const { data, error } = await supabase
        .from("ads")
        .insert({
          lovable_project_id: lovableProjectId,
          name: draft.creative?.headline || "Untitled Ad",
          headline: draft.creative?.headline,
          description: draft.creative?.description,
          target_url: "#", // TODO: Add URL field in creative step
          status: "draft",
          impressions: 0,
          clicks: 0,
          conversions: 0,
          // Store full draft in metadata for now
          // In production, normalize this into proper tables
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Ad created successfully!")
      router.push("/")
    } catch (error) {
      console.error("Failed to create ad:", error)
      toast.error("Failed to create ad. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Ad Preview</CardTitle>
          <CardDescription>Review how your ad will look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto border border-border rounded-lg p-4 space-y-3">
            {/* Mock ad preview */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div>
                <p className="font-medium text-sm">Your Business</p>
                <p className="text-xs text-muted-foreground">Sponsored</p>
              </div>
            </div>

            <p className="text-sm">{draft.creative?.primaryText || "No primary text"}</p>

            {draft.creative?.images && draft.creative.images.length > 0 ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={draft.creative.images[0]}
                  alt="Ad preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <div className="bg-muted p-3 rounded">
              <p className="font-semibold text-sm">
                {draft.creative?.headline || "No headline"}
              </p>
              {draft.creative?.description && (
                <p className="text-xs text-muted-foreground">{draft.creative.description}</p>
              )}
              <Button size="sm" className="w-full mt-2">
                {draft.creative?.callToAction || "Learn More"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Targeting */}
          <div className="flex gap-3">
            <Users className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Target Audience</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {draft.targeting?.locations?.map((loc) => (
                  <Badge key={loc} variant="secondary">
                    {loc}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ages {draft.targeting?.ageMin}-{draft.targeting?.ageMax} •{" "}
                {draft.targeting?.gender === "all" ? "All genders" : draft.targeting?.gender}
              </p>
              {draft.targeting?.interests && draft.targeting.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {draft.targeting.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Budget */}
          <div className="flex gap-3">
            <DollarSign className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Budget</p>
              <p className="text-sm text-muted-foreground">
                ${draft.budget?.amount}/day
              </p>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="flex gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Schedule</p>
              <p className="text-sm text-muted-foreground">
                {draft.budget?.schedule === "continuous"
                  ? "Continuous (starting today)"
                  : `${draft.budget?.startDate} to ${draft.budget?.endDate}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                  Ready to Launch
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your ad will be saved as a draft. You can review and publish it later from the
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

