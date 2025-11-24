"use client"

/**
 * All Posts Grid
 * Displays grid of all posts with filters
 */

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { PostCard } from "./post-card"
import { usePostService } from "@/lib/services/service-provider"
import type { Post } from "@/lib/types/post"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

interface AllPostsGridProps {
  campaignId?: string
  refreshTrigger?: number
}

export function AllPostsGrid({ campaignId, refreshTrigger }: AllPostsGridProps) {
  const postService = usePostService()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadPosts = async () => {
    setIsLoading(true)
    try {
      const result = await postService.listPosts.execute({
        campaignId,
        status: filter === 'all' ? undefined : filter,
      })

      if (result.success) {
        setPosts(result.data)
      } else {
        console.error('Failed to load posts:', result.error)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [filter, campaignId, refreshTrigger])

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        post.name.toLowerCase().includes(query) ||
        post.post_text?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No posts found matching your search' : 'No posts yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))}
        </div>
      )}
    </div>
  )
}

