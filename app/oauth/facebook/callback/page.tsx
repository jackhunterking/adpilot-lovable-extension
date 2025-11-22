"use client"

/**
 * Feature: Facebook OAuth Callback
 * Purpose: Handle OAuth redirect from Facebook and send code to parent window
 * References:
 *  - Meta OAuth: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function FacebookCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const errorReason = searchParams.get("error_reason")

    console.log('[FacebookCallback] Received OAuth callback:', {
      hasCode: !!code,
      error,
      errorDescription,
      errorReason,
    })

    if (code) {
      // Success - send code to opener window
      console.log('[FacebookCallback] ✓ OAuth successful, sending code to opener')
      
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "FACEBOOK_OAUTH_SUCCESS",
            code: code,
          },
          window.location.origin
        )

        setStatus('success')

        // Close window after short delay
        setTimeout(() => {
          console.log('[FacebookCallback] Closing window...')
          window.close()
        }, 1500)
      } else {
        console.error('[FacebookCallback] No opener window found')
        setStatus('error')
        setErrorMessage('No parent window found. Please close this window and try again.')
      }
      
    } else if (error) {
      // Error - send error to opener window
      console.error('[FacebookCallback] OAuth error:', {
        error,
        errorDescription,
        errorReason,
      })

      const fullError = errorDescription || errorReason || error || 'Unknown error'

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "FACEBOOK_OAUTH_ERROR",
            error: error,
            error_description: fullError,
          },
          window.location.origin
        )

        setStatus('error')
        setErrorMessage(fullError)

        // Close window after delay
        setTimeout(() => {
          console.log('[FacebookCallback] Closing error window...')
          window.close()
        }, 3000)
      } else {
        console.error('[FacebookCallback] No opener window found for error')
        setStatus('error')
        setErrorMessage(fullError)
      }
      
    } else {
      // No code and no error - unexpected state
      console.warn('[FacebookCallback] No code or error in callback')
      setStatus('error')
      setErrorMessage('Invalid OAuth callback - missing code or error')
    }
  }, [searchParams])

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold">Authorization Successful!</h1>
          <p className="text-sm text-muted-foreground">
            You've successfully connected your Facebook account.
          </p>
          <p className="text-xs text-muted-foreground">
            This window will close automatically...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold">Authorization Failed</h1>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
          <p className="text-xs text-muted-foreground">
            You can close this window and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
        <h1 className="text-xl font-semibold">Processing authorization...</h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we complete your Facebook connection.
        </p>
      </div>
    </div>
  )
}

export default function FacebookOAuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <FacebookCallbackContent />
    </Suspense>
  )
}

