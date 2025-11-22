"use client"

/**
 * Feature: Meta OAuth Callback
 * Purpose: Handle OAuth redirect from Facebook and send code to parent window
 */

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function OAuthCallbackContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  useEffect(() => {
    if (code) {
      // Send code to parent window (opener)
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
            code: code,
          },
          window.location.origin
        )

        // Close popup after a short delay
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        console.error("No opener window found")
      }
    } else if (error) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: error,
            errorDescription: errorDescription,
          },
          window.location.origin
        )

        setTimeout(() => {
          window.close()
        }, 2000)
      }
    }
  }, [code, error, errorDescription])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-semibold">Authorization Failed</h1>
          <p className="text-sm text-muted-foreground">
            {errorDescription || error}
          </p>
          <p className="text-xs text-muted-foreground">
            This window will close automatically...
          </p>
        </div>
      </div>
    )
  }

  if (code) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-semibold">Authorization Successful</h1>
          <p className="text-sm text-muted-foreground">
            This window will close automatically...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Processing authorization...</p>
      </div>
    </div>
  )
}

export default function MetaOAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}

