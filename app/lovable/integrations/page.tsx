/**
 * Feature: Lovable Integrations Page
 * Purpose: Manage third-party integrations (Meta Business, Facebook Auth, etc.)
 */

"use client"

import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Facebook, Zap, X, ExternalLink } from "lucide-react"
import { useMetaConnection } from "@/lib/hooks/use-meta-connection"
import { useMetaActions } from "@/lib/hooks/use-meta-actions"
import { useState } from "react"

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
  const [isConnecting, setIsConnecting] = useState(false)

  const handleMetaConnect = () => {
    setIsConnecting(true)
    metaActions.connect()
    setTimeout(() => setIsConnecting(false), 1000)
  }

  const integrations: Integration[] = [
    {
      id: 'meta-business',
      name: 'Meta Business',
      description: 'Connect your Meta Business account to create and manage Facebook and Instagram ads.',
      icon: Facebook,
      status: metaStatus === 'connected' ? 'connected' : 'available',
      category: 'advertising'
    },
    {
      id: 'facebook-auth',
      name: 'Facebook Authentication',
      description: 'Enable Facebook login for your users and access Facebook data.',
      icon: Facebook,
      status: 'available',
      category: 'auth'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track user behavior and campaign performance with Google Analytics.',
      icon: Zap,
      status: 'available',
      category: 'analytics'
    },
    {
      id: 'pixel-tracking',
      name: 'Meta Pixel',
      description: 'Track conversions and optimize ads with Meta Pixel.',
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
        return (
          <Badge variant="outline">
            Available
          </Badge>
        )
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

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isMetaBusiness = integration.id === 'meta-business'
            const isConnected = integration.status === 'connected'
            
            return (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="text-xs capitalize mt-1">
                          {integration.category}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  {isMetaBusiness ? (
                    <Button
                      className="w-full"
                      variant={isConnected ? "outline" : "default"}
                      onClick={handleMetaConnect}
                      disabled={isConnecting || isConnected}
                    >
                      {isConnecting ? (
                        "Connecting..."
                      ) : isConnected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
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

