"use client"

/**
 * Post Preview Panel
 * Unified preview component with platform tabs for Facebook and Instagram
 * Shows real-time preview as user creates post
 */

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Instagram, AlertCircle } from "lucide-react"
import { FacebookPostMockup } from "./facebook-post-mockup"
import { InstagramPostMockup } from "./instagram-post-mockup"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PostPreviewPanelProps {
  selectedTab: 'facebook' | 'instagram'
  onTabChange: (tab: 'facebook' | 'instagram') => void
  postText?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'none'
  publishToFacebook: boolean
  publishToInstagram: boolean
}

export function PostPreviewPanel({
  selectedTab,
  onTabChange,
  postText,
  mediaUrl,
  mediaType = 'none',
  publishToFacebook,
  publishToInstagram,
}: PostPreviewPanelProps) {
  const hasContent = !!(postText?.trim() || mediaUrl)
  const instagramNeedsMedia = publishToInstagram && !mediaUrl

  return (
    <div className="lg:sticky lg:top-6 h-fit space-y-4">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pb-2">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <p className="text-xs text-muted-foreground">See how your post will look</p>
            </div>

            {/* Platform Tabs */}
            <Tabs value={selectedTab} onValueChange={(v) => onTabChange(v as 'facebook' | 'instagram')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="facebook" className="gap-2 data-[state=active]:bg-[#1877F2] data-[state=active]:text-white transition-all">
                  <Facebook className="h-4 w-4" />
                  <span className="hidden sm:inline">Facebook</span>
                  {publishToFacebook && <span className="text-xs">✓</span>}
                </TabsTrigger>
                <TabsTrigger value="instagram" className="gap-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#F58529] data-[state=active]:via-[#DD2A7B] data-[state=active]:to-[#8134AF] data-[state=active]:text-white transition-all">
                  <Instagram className="h-4 w-4" />
                  <span className="hidden sm:inline">Instagram</span>
                  {publishToInstagram && <span className="text-xs">✓</span>}
                </TabsTrigger>
              </TabsList>

              {/* Facebook Preview */}
              <TabsContent value="facebook" className="mt-4 space-y-3 animate-in fade-in-50 duration-300">
                <FacebookPostMockup
                  text={postText}
                  mediaUrl={mediaUrl}
                  mediaType={mediaType}
                />
                {!publishToFacebook && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                      Not publishing to Facebook. Enable it in the Platforms section.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Instagram Preview */}
              <TabsContent value="instagram" className="mt-4 space-y-3 animate-in fade-in-50 duration-300">
                <InstagramPostMockup
                  text={postText}
                  mediaUrl={mediaUrl}
                  mediaType={mediaType}
                />
                {!publishToInstagram && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                      Not publishing to Instagram. Enable it in the Platforms section.
                    </AlertDescription>
                  </Alert>
                )}
                {publishToInstagram && instagramNeedsMedia && (
                  <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">
                      Instagram posts require media. Please upload an image or video.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            {/* Empty State Message */}
            {!hasContent && (
              <div className="text-center py-6 animate-in fade-in-50 duration-500">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Add text or media to see your post preview
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Tip */}
      <div className="lg:hidden text-center">
        <p className="text-xs text-muted-foreground">
          💡 Tip: Scroll down to see your preview on mobile
        </p>
      </div>
    </div>
  )
}

