/**
 * Component: Ad Connection Gate
 * Purpose: Block ad creation until all three connections are present
 * Required: Business + Facebook Page + Instagram
 */

"use client"

import { useRouter } from "next/navigation"
import { AlertCircle, Facebook, Instagram, Briefcase, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useConnectionRequirements } from "@/lib/hooks/use-connection-requirements"
import { usePlatformConnections } from "@/lib/hooks/use-platform-connections"
import { ReactNode } from "react"

interface AdConnectionGateProps {
  children: ReactNode
}

export function AdConnectionGate({ children }: AdConnectionGateProps) {
  const router = useRouter()
  const { canCreateAd, getMissingConnections } = useConnectionRequirements()
  const { businessConnected, facebookConnected, instagramConnected, loading } = usePlatformConnections()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Checking connections...</p>
        </div>
      </div>
    )
  }

  // If all connections are present, render children (ad builder)
  if (canCreateAd()) {
    return <>{children}</>
  }

  // Get missing connections
  const missing = getMissingConnections('ad')

  // Show connection gate
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Connection Required
          </CardTitle>
          <CardDescription>
            To create ads, you need to connect all three Meta platforms: Business, Facebook Page, and Instagram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Missing Connections Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing {missing.length} connection{missing.length > 1 ? 's' : ''}</AlertTitle>
            <AlertDescription>
              Please connect the following to continue creating ads
            </AlertDescription>
          </Alert>

          {/* Connection Status List */}
          <div className="space-y-3">
            {/* Business Connection */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              businessConnected 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
            }`}>
              <div className="mt-0.5">
                {businessConnected ? (
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <Briefcase className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Facebook Business (Meta Business)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {businessConnected 
                    ? 'Connected - Required for creating ad campaigns'
                    : 'Not connected - Connect your Meta Business account to manage ads'}
                </div>
              </div>
            </div>

            {/* Facebook Page Connection */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              facebookConnected 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
            }`}>
              <div className="mt-0.5">
                {facebookConnected ? (
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <Facebook className="h-5 w-5 text-[#1877F2]" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Facebook Page</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {facebookConnected 
                    ? 'Connected - Your ads will appear on Facebook'
                    : 'Not connected - Connect your Facebook Page to publish ads'}
                </div>
              </div>
            </div>

            {/* Instagram Connection */}
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              instagramConnected 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
            }`}>
              <div className="mt-0.5">
                {instagramConnected ? (
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <Instagram className="h-5 w-5 text-[#E4405F]" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Instagram Account</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {instagramConnected 
                    ? 'Connected - Your ads will appear on Instagram'
                    : 'Not connected - Connect your Instagram Business account to publish ads'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/lovable/integrations?from=create-ad')}
              className="gap-2"
            >
              Go to Integrations
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

