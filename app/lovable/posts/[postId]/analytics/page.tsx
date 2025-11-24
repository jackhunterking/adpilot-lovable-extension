/**
 * Feature: Lovable Extension - Post Analytics Page
 * Purpose: Display analytics for a published post
 */

"use client"

import { LovableLayout } from "@/components/lovable/lovable-layout"
import { PostAnalyticsPanel } from "@/components/posts/post-analytics-panel"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PostAnalyticsPageProps {
  params: {
    postId: string
  }
}

export default function PostAnalyticsPage({ params }: PostAnalyticsPageProps) {
  const router = useRouter()

  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/lovable/posts')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>

        {/* Analytics Panel */}
        <PostAnalyticsPanel postId={params.postId} />
      </div>
    </LovableLayout>
  )
}

