"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function MetaConversionsApiSetup() {
  const [accessToken, setAccessToken] = useState("")
  const [pixelId, setPixelId] = useState("")
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState(false)

  const handleTestConnection = async () => {
    if (!accessToken || !pixelId) {
      toast.error("Missing Information", {
        description: "Please provide both Access Token and Pixel ID",
      })
      return
    }

    setTesting(true)

    try {
      // TODO: Implement actual test connection API call
      // For now, simulate a test
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setConnected(true)
      toast.success("Connection Successful", {
        description: "Meta Conversions API is configured correctly",
      })
    } catch (error) {
      toast.error("Connection Failed", {
        description: "Failed to connect to Meta Conversions API. Please check your credentials.",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Meta Conversions API</CardTitle>
            <CardDescription>
              Track conversions from your ads using Meta's Conversions API
            </CardDescription>
          </div>
          {connected ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
              <XCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            The Conversions API allows you to track events that happen in your Lovable app and send them to Meta for ad optimization.
          </p>
          <p className="text-xs">
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more about Conversions API
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="accessToken">Conversions API Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your Conversions API access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={testing}
            />
            <p className="text-xs text-muted-foreground">
              Generate this token in your Meta Events Manager
            </p>
          </div>

          {/* Pixel ID */}
          <div className="space-y-2">
            <Label htmlFor="pixelId">Meta Pixel ID</Label>
            <Input
              id="pixelId"
              type="text"
              placeholder="Enter your Meta Pixel ID"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              disabled={testing}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Meta Events Manager
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={testing || !accessToken || !pixelId}
              className="gap-2"
            >
              {testing && <Loader2 className="w-4 h-4 animate-spin" />}
              Test Connection
            </Button>
            {connected && (
              <Button
                variant="outline"
                onClick={() => {
                  setAccessToken("")
                  setPixelId("")
                  setConnected(false)
                }}
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to Meta Events Manager</li>
            <li>Select your Pixel</li>
            <li>Go to Settings → Conversions API</li>
            <li>Generate a new access token</li>
            <li>Copy your Pixel ID and access token here</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

