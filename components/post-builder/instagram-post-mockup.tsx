"use client"

/**
 * Instagram Post Mockup
 * Visual preview of how the post will appear on Instagram
 */

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { useMetaConnection } from "@/lib/hooks/use-meta-connection"

interface InstagramPostMockupProps {
  text?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'none'
}

export function InstagramPostMockup({ text, mediaUrl, mediaType }: InstagramPostMockupProps) {
  const { metaStatus } = useMetaConnection()
  
  // Get Instagram info from Meta connection
  const username = "your_account" // TODO: Get from meta connection
  const avatar = "" // TODO: Get from meta connection

  return (
    <Card className="w-full max-w-md overflow-hidden">
      {/* Profile Header */}
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm">{username}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Media (Required for Instagram) */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
        {mediaUrl ? (
          mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          ) : mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No media</p>
              <p className="text-xs mt-1">Instagram requires an image or video</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Likes Count (Mock) */}
        <p className="text-sm font-semibold">0 likes</p>

        {/* Caption */}
        {text && (
          <div className="text-sm">
            <span className="font-semibold mr-2">{username}</span>
            <span className="whitespace-pre-wrap">{text}</span>
          </div>
        )}

        {/* Timestamp (Mock) */}
        <p className="text-xs text-muted-foreground uppercase">Just now</p>
      </div>
    </Card>
  )
}

