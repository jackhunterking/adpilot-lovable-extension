/**
 * Feature: Lovable Extension - Posts List Page
 * Purpose: Display and manage all social media posts
 */

"use client"

import { useState } from "react"
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { AllPostsGrid } from "@/components/posts/all-posts-grid"

export default function PostsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreatePost = () => {
    router.push('/lovable/posts/create')
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">
              Create and manage your social media posts
            </p>
          </div>
          <Button onClick={handleCreatePost} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Post
          </Button>
        </div>

        {/* Posts Grid */}
        <AllPostsGrid refreshTrigger={refreshTrigger} />
      </div>
    </LovableLayout>
  )
}

