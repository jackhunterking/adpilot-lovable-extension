/**
 * Feature: Lovable Integrations Page
 * Purpose: Manage third-party integrations (Meta Business, Facebook Auth, etc.)
 */

"use client"

import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Facebook, Instagram, Zap, X, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useMetaConnection } from "@/lib/hooks/use-meta-connection"
import { useMetaActions } from "@/lib/hooks/use-meta-actions"
import { usePlatformConnections } from "@/lib/hooks/use-platform-connections"
import { useMetaService } from "@/lib/services/service-provider"
import { useCampaignContext } from "@/lib/context/campaign-context"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'connected' | 'disconnected' | 'available'
  category: 'advertising' | 'auth' | 'analytics'
}

export default function IntegrationsPage() {
  const { metaStatus, paymentStatus } = useMetaConnection()
  const metaActions = useMetaActions()
  const { facebookConnected, instagramConnected, facebookPageName, instagramUsername } = usePlatformConnections()
  const metaService = useMetaService()
  const { campaign } = useCampaignContext()
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const fromPosts = searchParams?.get('from') === 'posts'

  // Use isConnecting from metaActions instead of local state
  const isConnecting = metaActions.isConnecting

  const handleMetaConnect = () => {
    metaActions.connect()
  }

  const handleConnectInstagram = () => {
    metaActions.connectInstagram()
  }

  const handleConnectPage = () => {
    metaActions.connectPage()
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!campaign?.id) {
      toast.error("No campaign selected")
      return
    }

    setIsDisconnecting(integrationId)
    
    try {
      const result = await metaService.disconnect.execute(campaign.id)
      
      if (result.success) {
        toast.success("Integration disconnected successfully")
        // Reload to reflect changes
        window.location.reload()
      } else {
        toast.error(result.error.message || "Failed to disconnect")
      }
    } catch (error) {
      toast.error("An error occurred while disconnecting")
    } finally {
      setIsDisconnecting(null)
    }
  }

  // Listen for OAuth popup completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      if (event.origin !== window.location.origin) return
      
      const data = event.data
      if (data?.type === 'META_CONNECTED') {
        const status = data?.status || 'connected'
        const connectionType = data?.connectionType
        
        if (status === 'connected') {
          // Show success message based on connection type
          if (connectionType === 'instagram') {
            toast.success("Instagram account connected successfully!")
          } else if (connectionType === 'facebook_page') {
            toast.success("Facebook Page connected successfully!")
          } else {
            toast.success("Meta account connected successfully!")
          }
          
          // Reload page to show updated connection status
          setTimeout(() => window.location.reload(), 500)
        } else if (status.includes('error') || status.includes('no_')) {
          // Handle error states
          const errorMessages: Record<string, string> = {
            'no_pages': 'No Facebook Pages found. Please create a page first.',
            'no_instagram': 'No Instagram Business account found. Please connect one to your Facebook Page.',
            'no_businesses': 'No Meta Business accounts found.',
            'no_ad_accounts': 'No Ad Accounts found.',
            'token_exchange_failed': 'Failed to exchange authorization code.',
            'persist_failed': 'Failed to save connection.',
            'unauthorized': 'You are not authorized.',
            'forbidden': 'Access forbidden.',
            'missing_code': 'Authorization code missing.',
            'missing_campaign': 'Campaign not found.',
          }
          
          const errorMessage = errorMessages[status] || `Connection failed: ${status}`
          toast.error(errorMessage)
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [searchParams])

  // Handle OAuth callback URL parameters (fallback for when bridge doesn't work)
  useEffect(() => {
    const meta = searchParams?.get('meta')
    const type = searchParams?.get('type')
    
    if (meta === 'connected') {
      if (type === 'instagram') {
        toast.success("Instagram account connected!")
      } else if (type === 'facebook_page') {
        toast.success("Facebook Page connected!")
      } else {
        toast.success("Meta account connected!")
      }
      
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('meta')
      url.searchParams.delete('type')
      window.history.replaceState({}, '', url)
      
      // Reload after a short delay
      setTimeout(() => window.location.reload(), 500)
    } else if (meta && (meta.includes('error') || meta.includes('no_') || meta === 'unauthorized' || meta === 'forbidden')) {
      // Handle error states
      const errorMessages: Record<string, string> = {
        'no_pages': 'No Facebook Pages found. Please create a page first.',
        'no_instagram': 'No Instagram Business account found. Please connect one to your Facebook Page.',
        'no_businesses': 'No Meta Business accounts found.',
        'no_ad_accounts': 'No Ad Accounts found.',
        'token_exchange_failed': 'Failed to exchange authorization code.',
        'persist_failed': 'Failed to save connection.',
        'unauthorized': 'You are not authorized.',
        'forbidden': 'Access forbidden.',
        'missing_code': 'Authorization code missing.',
        'missing_campaign': 'Campaign not found.',
        'invalid_type': 'Invalid connection type.',
      }
      
      const errorMessage = errorMessages[meta] || `Connection failed: ${meta}`
      toast.error(errorMessage)
      
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('meta')
      url.searchParams.delete('type')
      window.history.replaceState({}, '', url)
    }
  }, [searchParams])

  const integrations: Integration[] = [
    {
      id: 'facebook-page',
      name: 'Facebook Page',
      description: 'Connect your Facebook Page to publish posts and organic content.',
      icon: Facebook,
      status: facebookConnected ? 'connected' : 'available',
      category: 'advertising'
    },
    {
      id: 'instagram-account',
      name: 'Instagram Account',
      description: 'Connect your Instagram Business account to publish Instagram posts and stories.',
      icon: Instagram,
      status: instagramConnected ? 'connected' : 'available',
      category: 'advertising'
    },
    {
      id: 'meta-business',
      name: 'Facebook Business (Meta Business)',
      description: 'Connect for advertising features. Coming Soon.',
      icon: Facebook,
      status: 'available',
      category: 'advertising'
    },
    {
      id: 'pixel-tracking',
      name: 'Meta Pixel',
      description: 'Track conversions and optimize ads. Coming Soon.',
      icon: Facebook,
      status: 'available',
      category: 'advertising'
    }
  ]

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case 'disconnected':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <X className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect third-party services to enhance your advertising capabilities
          </p>
        </div>

        {/* "From Posts" Banner */}
        {fromPosts && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Facebook or Instagram account to start creating posts.
            </AlertDescription>
          </Alert>
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isMetaBusiness = integration.id === 'meta-business'
            const isFacebookPage = integration.id === 'facebook-page'
            const isInstagramAccount = integration.id === 'instagram-account'
            const isPixelTracking = integration.id === 'pixel-tracking'
            const isConnected = integration.status === 'connected'
            const currentlyDisconnecting = isDisconnecting === integration.id
            const isComingSoon = isMetaBusiness || isPixelTracking
            
            // Get account details for connected state
            const accountName = isInstagramAccount ? instagramUsername : 
                               isFacebookPage ? facebookPageName : 
                               null
            
            // Render connected state
            if (isConnected && accountName) {
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow flex flex-col h-full relative border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
                  {/* Connected Badge - Top Right */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>

                  <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-1 space-y-4">
                    {/* Profile Icon/Avatar - Centered, Larger */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      integration.id === 'instagram-account' 
                        ? 'bg-gradient-to-br from-[#E4405F] via-[#C13584] to-[#833AB4]' 
                        : integration.id === 'facebook-page'
                        ? 'bg-[#1877F2]'
                        : 'bg-primary'
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Account Name */}
                    <div className="space-y-1">
                      <p className="text-base font-medium">
                        {isInstagramAccount && accountName ? `@${accountName}` : accountName}
                      </p>
                      <p className="text-sm text-muted-foreground">{integration.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Connected</p>
                    </div>

                    {/* Disconnect Button */}
                    <Button
                      className="w-full mt-auto cursor-pointer"
                      variant="outline"
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={currentlyDisconnecting || isConnecting}
                    >
                      {currentlyDisconnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            }
            
            // Render disconnected state (vertical centered layout)
            return (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardContent className="flex flex-col items-center justify-center text-center p-6 flex-1 space-y-4">
                  {/* Icon - Centered, Larger */}
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                    integration.id === 'instagram-account' 
                      ? 'bg-pink-500/10' 
                      : integration.id === 'facebook-page'
                      ? 'bg-blue-500/10'
                      : 'bg-primary/10'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      integration.id === 'instagram-account' 
                        ? 'text-[#E4405F]' 
                        : integration.id === 'facebook-page'
                        ? 'text-[#1877F2]'
                        : 'text-primary'
                    }`} />
                  </div>

                  {/* Title and Subtitle */}
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {integration.category}
                    </CardDescription>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground flex-1">
                    {integration.description}
                  </p>
                  
                  {/* Action Button */}
                  {isComingSoon ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  ) : isFacebookPage ? (
                    <Button
                      className="w-full cursor-pointer"
                      onClick={handleConnectPage}
                      disabled={isConnecting || currentlyDisconnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect Page
                        </>
                      )}
                    </Button>
                  ) : isInstagramAccount ? (
                    <Button
                      className="w-full cursor-pointer"
                      onClick={handleConnectInstagram}
                      disabled={isConnecting || currentlyDisconnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect Instagram
                        </>
                      )}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Need a custom integration?
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Contact us to discuss custom integration options for your specific needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LovableLayout>
  )
}

