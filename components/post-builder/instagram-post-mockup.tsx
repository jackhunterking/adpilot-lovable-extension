"use client"

/**
 * Instagram Post Mockup
 * Pixel-perfect preview matching Meta Business Suite styling
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

  // Truncate caption at 125 chars for preview with "more" link
  const displayText = text && text.length > 125 ? text.slice(0, 125) : text
  const needsMore = text && text.length > 125

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white dark:bg-[#000000] border-[#DBDBDB] dark:border-[#262626] transition-all duration-300 hover:shadow-xl" style={{ borderRadius: '8px' }}>
      {/* Profile Header */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#DBDBDB] dark:border-[#262626]" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px' }}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-2 ring-offset-0 ring-transparent" style={{ width: '32px', height: '32px' }}>
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-semibold">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold text-[#000000] dark:text-[#FAFAFA]" style={{ fontSize: '14px', lineHeight: '18px' }}>
            {username}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-transparent" style={{ width: '32px', height: '32px' }}>
          <MoreHorizontal className="h-6 w-6 text-[#000000] dark:text-[#FAFAFA]" style={{ width: '24px', height: '24px' }} />
        </Button>
      </div>

      {/* Media (Required for Instagram) */}
      <div className="aspect-square bg-[#F7F7F7] dark:bg-[#262626] relative border-b border-[#DBDBDB] dark:border-[#262626]">
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
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#DBDBDB] dark:bg-[#262626] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#8E8E8E]">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M3 16l5-5 3 3 6-6 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[#8E8E8E] font-semibold" style={{ fontSize: '14px' }}>No media</p>
              <p className="text-[#8E8E8E] mt-1" style={{ fontSize: '12px' }}>Instagram requires an image or video</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:opacity-50 transition-opacity" style={{ width: '24px', height: '24px' }}>
              <Heart className="h-6 w-6 text-[#000000] dark:text-[#FAFAFA]" style={{ width: '24px', height: '24px', strokeWidth: 1.5 }} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:opacity-50 transition-opacity" style={{ width: '24px', height: '24px' }}>
              <MessageCircle className="h-6 w-6 text-[#000000] dark:text-[#FAFAFA]" style={{ width: '24px', height: '24px', strokeWidth: 1.5 }} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:opacity-50 transition-opacity" style={{ width: '24px', height: '24px' }}>
              <Send className="h-6 w-6 text-[#000000] dark:text-[#FAFAFA]" style={{ width: '24px', height: '24px', strokeWidth: 1.5 }} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:opacity-50 transition-opacity" style={{ width: '24px', height: '24px' }}>
            <Bookmark className="h-6 w-6 text-[#000000] dark:text-[#FAFAFA]" style={{ width: '24px', height: '24px', strokeWidth: 1.5 }} />
          </Button>
        </div>

        {/* Likes Count (Mock) */}
        <p className="font-semibold text-[#000000] dark:text-[#FAFAFA] mb-2" style={{ fontSize: '14px', lineHeight: '18px' }}>
          0 likes
        </p>

        {/* Caption */}
        {displayText ? (
          <div className="text-[#000000] dark:text-[#FAFAFA] mb-1" style={{ fontSize: '14px', lineHeight: '18px' }}>
            <span className="font-semibold mr-2">{username}</span>
            <span className="whitespace-pre-wrap">{displayText}</span>
            {needsMore && (
              <button className="text-[#8E8E8E] ml-1 hover:text-[#262626] dark:hover:text-[#A8A8A8]">
                more
              </button>
            )}
          </div>
        ) : (
          <div className="text-[#8E8E8E] italic mb-1" style={{ fontSize: '14px', lineHeight: '18px' }}>
            <span className="font-semibold mr-2 not-italic text-[#000000] dark:text-[#FAFAFA]">{username}</span>
            <span>Your caption will appear here...</span>
          </div>
        )}

        {/* Timestamp (Mock) */}
        <p className="text-[#8E8E8E] uppercase" style={{ fontSize: '10px', lineHeight: '14px', letterSpacing: '0.2px' }}>
          JUST NOW
        </p>
      </div>
    </Card>
  )
}

