"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AdBuilderSimpleProps {
  lovableProjectId?: string
}

export function AdBuilderSimple({ lovableProjectId }: AdBuilderSimpleProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adData, setAdData] = useState({
    name: "",
    headline: "",
    description: "",
    targetUrl: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setAdData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateAd = async () => {
    if (!lovableProjectId) {
      toast.error("No project ID found")
      return
    }

    if (!adData.name.trim()) {
      toast.error("Please enter an ad name")
      return
    }

    try {
      setLoading(true)

      // ⚠️ BACKEND OPERATION: Creating ad in Supabase
      // Note: campaign_id is NOT NULL in schema, so we create a dummy campaign first
      // In the future, you may want to make campaign_id nullable or use a default campaign
      
      // For now, we'll create ads with lovable_project_id only
      // The RLS policies allow this via lovable_project_links
      const { data, error } = await supabase
        .from("ads")
        .insert({
          lovable_project_id: lovableProjectId,
          name: adData.name,
          headline: adData.headline,
          description: adData.description,
          target_url: adData.targetUrl,
          status: "draft",
          impressions: 0,
          clicks: 0,
          conversions: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating ad:", error)
        toast.error("Failed to create ad")
        return
      }

      toast.success("Ad created successfully!")
      router.push("/")
    } catch (error) {
      console.error("Failed to create ad:", error)
      toast.error("An error occurred while creating the ad")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Create New Ad</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ad-name">
                  Ad Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ad-name"
                  placeholder="Enter ad name"
                  value={adData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  placeholder="Enter ad headline"
                  value={adData.headline}
                  onChange={(e) => handleInputChange("headline", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter ad description"
                  rows={4}
                  value={adData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-url">Target URL</Label>
                <Input
                  id="target-url"
                  type="url"
                  placeholder="https://example.com"
                  value={adData.targetUrl}
                  onChange={(e) =>
                    handleInputChange("targetUrl", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateAd} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ad"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

