"use client"

/**
 * Facebook Post Mockup
 * Visual preview of how the post will appear on Facebook
 */

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { useMetaConnection } from "@/lib/hooks/use-meta-connection"

interface FacebookPostMockupProps {
  text?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'none'
}

export function FacebookPostMockup({ text, mediaUrl, mediaType }: FacebookPostMockupProps) {
  const { metaStatus } = useMetaConnection()
  
  // Get page info from Meta connection
  const pageName = "Your Page" // TODO: Get from meta connection
  const pageAvatar = "" // TODO: Get from meta connection

  return (
    <Card className="w-full max-w-md overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={pageAvatar} alt={pageName} />
              <AvatarFallback className="bg-blue-600 text-white">
                {pageName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{pageName}</p>
              <p className="text-xs text-muted-foreground">
                Just now · <span className="inline-flex items-center">🌎 Public</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Post Text */}
      {text && (
        <div className="px-4 pb-3">
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        </div>
      )}

      {/* Media */}
      {mediaUrl && (
        <div className="w-full">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt="Post media"
              className="w-full h-auto object-cover"
            />
          ) : mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-auto"
            />
          ) : null}
        </div>
      )}

      {/* Engagement Stats (Mock) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
            </div>
          </div>
          <span>0</span>
        </div>
        <div className="flex gap-2">
          <span>0 comments</span>
          <span>0 shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t">
        <div className="flex">
          <Button
            variant="ghost"
            className="flex-1 rounded-none gap-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">Like</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-none gap-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Comment</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 rounded-none gap-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}

