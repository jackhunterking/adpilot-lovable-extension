"use client"

/**
 * Connection Prompt Modal
 * Shown when user tries to create post without connected accounts
 * Prompts to connect Facebook and/or Instagram
 */

import { useRouter } from "next/navigation"
import { AlertCircle, Facebook, Instagram, ExternalLink, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ConnectionPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facebookConnected: boolean
  instagramConnected: boolean
}

export function ConnectionPromptModal({
  open,
  onOpenChange,
  facebookConnected,
  instagramConnected,
}: ConnectionPromptModalProps) {
  const router = useRouter()

  const allConnected = facebookConnected && instagramConnected
  const anyConnected = facebookConnected || instagramConnected

  const handleGoToIntegrations = () => {
    onOpenChange(false)
    router.push("/lovable/integrations?from=posts")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Accounts</DialogTitle>
          <DialogDescription>
            Connect at least one social media account to start creating posts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Facebook Connection Status */}
          <div
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              facebookConnected
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                : "bg-muted border-border"
            )}
          >
            <div className="mt-0.5">
              {facebookConnected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Facebook className="h-5 w-5 text-[#1877F2]" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium text-sm">Facebook Page</div>
              <div className="text-xs text-muted-foreground">
                {facebookConnected
                  ? "Connected and ready to post"
                  : "Not connected - Required to post to Facebook"}
              </div>
            </div>
          </div>

          {/* Instagram Connection Status */}
          <div
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              instagramConnected
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                : "bg-muted border-border"
            )}
          >
            <div className="mt-0.5">
              {instagramConnected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Instagram className="h-5 w-5 text-[#E4405F]" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium text-sm">Instagram Account</div>
              <div className="text-xs text-muted-foreground">
                {instagramConnected
                  ? "Connected and ready to post"
                  : "Not connected - Required to post to Instagram"}
              </div>
            </div>
          </div>

          {/* Alert */}
          {!anyConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                You must connect at least one account (Facebook or Instagram) to create posts.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleGoToIntegrations} className="w-full sm:w-auto gap-2">
            Go to Integrations
            <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

