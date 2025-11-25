"use client"

/**
 * Post Card
 * Individual post card for grid display
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Facebook, Instagram, MoreVertical, Edit, Copy, Trash2, BarChart3, Image as ImageIcon, Video, Calendar } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePostService } from "@/lib/services/service-provider"
import type { Post } from "@/lib/types/post"
import { format } from "date-fns"
import { toast } from "sonner"
import { DeletePostDialog } from "@/components/dialogs/delete-post-dialog"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
  onUpdate?: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const router = useRouter()
  const postService = usePostService()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/lovable/posts/${post.id}/edit`)
  }

  const handleDuplicate = async () => {
    try {
      const result = await postService.duplicatePost.execute({ postId: post.id })
      
      if (result.success) {
        toast.success('Post duplicated successfully')
        onUpdate?.()
      } else {
        toast.error(result.error?.message || 'Failed to duplicate post')
      }
    } catch (error) {
      console.error('Duplicate error:', error)
      toast.error('Failed to duplicate post')
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await postService.deletePost.execute({ postId: post.id })
      
      if (result.success) {
        toast.success('Post deleted successfully')
        setShowDeleteDialog(false)
        onUpdate?.()
      } else {
        toast.error(result.error?.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleViewAnalytics = () => {
    router.push(`/lovable/posts/${post.id}/analytics`)
  }

  const getStatusBadge = () => {
    switch (post.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Scheduled</Badge>
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return null
    }
  }

  const truncateText = (text?: string, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Get status-based styling
  const getStatusBorderClass = () => {
    switch (post.status) {
      case 'draft':
        return 'border-l-4 border-l-gray-400'
      case 'scheduled':
        return 'border-l-4 border-l-blue-500'
      case 'published':
        return 'border-l-4 border-l-green-500'
      case 'failed':
        return 'border-l-4 border-l-red-500'
      default:
        return ''
    }
  }

  return (
    <>
      <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", getStatusBorderClass())}>
        {/* Media Thumbnail */}
        {post.media_url && (
          <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
            {post.media_type === 'image' ? (
              <img
                src={post.media_url}
                alt={post.name}
                className="w-full h-full object-cover"
              />
            ) : post.media_type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={post.media_url}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="h-12 w-12 text-white" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Post Text Preview */}
          <p className="text-sm line-clamp-3 min-h-[3.75rem]">
            {truncateText(post.post_text, 150) || <em className="text-muted-foreground">No text</em>}
          </p>

          {/* Platform Badges */}
          <div className="flex flex-wrap gap-2">
            {post.publish_to_facebook && (
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                <Facebook className="mr-1 h-3 w-3" />
                Facebook
              </Badge>
            )}
            {post.publish_to_instagram && (
              <Badge variant="outline" className="border-pink-500 text-pink-600">
                <Instagram className="mr-1 h-3 w-3" />
                Instagram
              </Badge>
            )}
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {post.status === 'scheduled' && post.scheduled_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.scheduled_at), 'MMM d, h:mm a')}
                </div>
              )}
              {post.status === 'published' && post.published_at && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(post.published_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(post.status === 'draft' || post.status === 'failed') && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {post.status === 'published' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleViewAnalytics}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        postName={post.name}
        postStatus={post.status}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}

