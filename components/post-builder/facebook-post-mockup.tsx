"use client"

/**
 * Facebook Post Mockup
 * Pixel-perfect preview matching Meta Business Suite styling
 */

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe } from "lucide-react"
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

  // Truncate text at 250 chars for preview
  const displayText = text && text.length > 250 ? text.slice(0, 250) + '...' : text

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white dark:bg-[#242526] border-[#CED0D4] dark:border-[#3E4042] transition-all duration-300 hover:shadow-xl" style={{ borderRadius: '8px' }}>
      {/* Post Header */}
      <div className="p-3" style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-10 w-10" style={{ width: '40px', height: '40px' }}>
              <AvatarImage src={pageAvatar} alt={pageName} />
              <AvatarFallback className="bg-[#1877F2] text-white text-sm font-semibold">
                {pageName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-[#050505] dark:text-[#E4E6EB]" style={{ fontSize: '15px', lineHeight: '20px' }}>
                {pageName}
              </p>
              <div className="flex items-center gap-1 text-[#65676B] dark:text-[#B0B3B8]" style={{ fontSize: '13px', lineHeight: '16px' }}>
                <span>Just now</span>
                <span>·</span>
                <Globe className="h-3 w-3" style={{ width: '12px', height: '12px' }} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-[#F2F3F5] dark:hover:bg-[#3A3B3C]" style={{ width: '36px', height: '36px' }}>
            <MoreHorizontal className="h-5 w-5 text-[#65676B] dark:text-[#B0B3B8]" style={{ width: '20px', height: '20px' }} />
          </Button>
        </div>
      </div>

      {/* Post Text */}
      {displayText && (
        <div className="px-4 pb-3" style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '12px' }}>
          <p className="text-[#050505] dark:text-[#E4E6EB] whitespace-pre-wrap" style={{ fontSize: '15px', lineHeight: '20px' }}>
            {displayText}
            {text && text.length > 250 && (
              <button className="text-[#65676B] dark:text-[#B0B3B8] ml-1 hover:underline font-medium">
                See more
              </button>
            )}
          </p>
        </div>
      )}

      {/* Empty State for Text */}
      {!displayText && !mediaUrl && (
        <div className="px-4 pb-3" style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '12px' }}>
          <p className="text-[#65676B] dark:text-[#B0B3B8] italic" style={{ fontSize: '15px', lineHeight: '20px' }}>
            Your post text will appear here...
          </p>
        </div>
      )}

      {/* Media */}
      {mediaUrl && (
        <div className="w-full bg-[#F0F2F5] dark:bg-[#18191A]">
          {mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt="Post media"
              className="w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
            />
          ) : mediaType === 'video' ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-auto"
              style={{ maxHeight: '600px' }}
            />
          ) : null}
        </div>
      )}

      {/* Engagement Stats (Mock) */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#CED0D4] dark:border-[#3E4042]" style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <div className="h-[18px] w-[18px] rounded-full bg-[#1877F2] flex items-center justify-center">
              <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
            </div>
          </div>
          <span className="text-[#65676B] dark:text-[#B0B3B8]" style={{ fontSize: '13px' }}>0</span>
        </div>
        <div className="flex gap-2 text-[#65676B] dark:text-[#B0B3B8]" style={{ fontSize: '13px' }}>
          <button className="hover:underline">0 Comments</button>
          <button className="hover:underline">0 Shares</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex">
        <Button
          variant="ghost"
          className="flex-1 rounded-none gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F2F3F5] dark:hover:bg-[#3A3B3C] h-11"
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          <ThumbsUp className="h-[18px] w-[18px]" />
          <span>Like</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F2F3F5] dark:hover:bg-[#3A3B3C] h-11"
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>Comment</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 rounded-none gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F2F3F5] dark:hover:bg-[#3A3B3C] h-11"
          style={{ fontSize: '15px', fontWeight: 600 }}
        >
          <Share2 className="h-[18px] w-[18px]" />
          <span>Share</span>
        </Button>
      </div>
    </Card>
  )
}

