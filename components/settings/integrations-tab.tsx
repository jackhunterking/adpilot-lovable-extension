"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { MetaConversionsApiSetup } from "./meta-conversions-api-setup"
import { supabase } from "@/lib/supabase/client"

export function IntegrationsTab() {
  const [metaConnected, setMetaConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMetaConnection()
  }, [])

  const checkMetaConnection = async () => {
    try {
      setLoading(true)

      // Check if user has Meta account connected
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: metaAccounts } = await supabase
          .from("meta_accounts")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)

        setMetaConnected((metaAccounts?.length || 0) > 0)
      }
    } catch (error) {
      console.error("Error checking Meta connection:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectMeta = () => {
    // Redirect to Meta OAuth flow
    window.location.href = "/meta/oauth/authorize"
  }

  return (
    <div className="space-y-6">
      {/* Meta Business Account */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meta Business Account</CardTitle>
              <CardDescription>
                Connect your Facebook Business account to publish ads
              </CardDescription>
            </div>
            {metaConnected ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                <XCircle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metaConnected ? (
            <>
              <p className="text-sm text-muted-foreground">
                Your Meta Business account is connected. You can publish ads to Facebook and Instagram.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={checkMetaConnection}>
                  Refresh Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://business.facebook.com", "_blank")}
                  className="gap-2"
                >
                  Open Meta Business Suite
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Connect your Meta Business account to start publishing ads. You'll need:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>A Facebook Business account</li>
                <li>An Ad Account with payment method</li>
                <li>A Facebook Page (for ad publishing)</li>
              </ul>
              <Button onClick={handleConnectMeta} disabled={loading}>
                Connect Meta Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Meta Conversions API */}
      <MetaConversionsApiSetup />
    </div>
  )
}

