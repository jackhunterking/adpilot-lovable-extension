'use client'

/**
 * Feature: OAuth Popup Success Handler
 * Purpose: Close OAuth popup and notify parent iframe that authentication completed
 * Journey Context:
 *   - User authenticates via Google OAuth in popup window
 *   - This page loads after successful Supabase callback
 *   - Notifies parent iframe/window via postMessage
 *   - Closes popup automatically
 * References:
 *   - AUTH_JOURNEY_MASTER_PLAN.md - All OAuth journeys
 */

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PopupSuccessContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/lovable'
  const hasError = searchParams.get('error') === 'true'

  useEffect(() => {
    console.log('[POPUP-SUCCESS] Popup auth completed', {
      next,
      hasError,
      hasOpener: !!window.opener,
      origin: window.location.origin
    })
    
    // Wait a brief moment for cookies to be fully set
    setTimeout(() => {
      // Notify the opener (iframe) that auth process completed
      if (window.opener && !window.opener.closed) {
        console.log('[POPUP-SUCCESS] Notifying opener window')
        
        // Send message to opener (include error state)
        window.opener.postMessage(
          { 
            type: hasError ? 'OAUTH_ERROR' : 'OAUTH_SUCCESS', 
            next,
            error: hasError ? 'Authentication failed. Please try again.' : null
          },
          window.location.origin
        )
        
        // Close popup after notification
        setTimeout(() => {
          console.log('[POPUP-SUCCESS] Closing popup window')
          window.close()
        }, 500)
      } else {
        // Fallback: not a popup, redirect normally
        console.log('[POPUP-SUCCESS] No opener found, redirecting to:', next)
        window.location.href = next
      }
    }, 100)
  }, [next, hasError])

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br ${
      hasError 
        ? 'from-red-500 to-orange-500' 
        : 'from-blue-500 to-cyan-500'
    }`}>
      <div className="text-center text-white p-8 space-y-4">
        <div className="mb-4">
          {hasError ? (
            <svg 
              className="h-12 w-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          ) : (
            <svg 
              className="animate-spin h-12 w-12 mx-auto" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold">
          {hasError ? 'Authentication Failed' : 'Authentication successful!'}
        </h2>
        <p className={hasError ? 'text-orange-100' : 'text-blue-100'}>
          {hasError ? 'Please try again...' : 'Completing sign in...'}
        </p>
        <p className="text-xs text-blue-200 mt-4">This window will close automatically</p>
      </div>
    </div>
  )
}

export default function PopupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <PopupSuccessContent />
    </Suspense>
  )
}

