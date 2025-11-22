"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, DollarSign } from "lucide-react"

export function BillingTab() {
  const handleOpenPolarPortal = () => {
    // TODO: Replace with actual Polar billing portal URL
    window.open("https://polar.sh/billing", "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription and usage information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Free Tier</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Usage-based pricing for Meta Ads
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Management</CardTitle>
          <CardDescription>
            Manage your subscription, payment methods, and invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">
                Access your billing portal to manage your subscription, update payment methods, and view invoices.
              </p>
              <Button
                onClick={handleOpenPolarPortal}
                variant="default"
                size="sm"
                className="gap-2"
              >
                Open Billing Portal
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Pricing</CardTitle>
          <CardDescription>
            How AdPilot charges for Meta advertising
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground mb-2">
                AdPilot uses a transparent usage-based pricing model:
              </p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>No monthly subscription fees</li>
                <li>Pay only for the ads you publish</li>
                <li>Direct billing through Polar</li>
                <li>Clear invoicing and usage tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

