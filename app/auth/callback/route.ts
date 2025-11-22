/**
 * Feature: Email/Magic Link callback handler
 * Purpose: Handles email verification and magic link sign-in redirects
 * 
 * NOTE: Google OAuth uses popup mode (handled entirely client-side by Supabase).
 *       This route is ONLY for email-based flows (verification, magic links, password reset).
 * 
 * References:
 *  - Supabase Email Auth: https://supabase.com/docs/guides/auth/server-side-auth
 *  - Supabase Magic Links: https://supabase.com/docs/guides/auth/auth-magic-link
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  console.log('[OAUTH-CALLBACK] Starting OAuth callback', { 
    hasCode: !!code, 
    next, 
    origin,
    fullUrl: request.url 
  })

  // We'll collect cookies set by Supabase and attach them to the redirect response
  const cookiesToSet: { name: string; value: string; options: Parameters<NextResponse['cookies']['set']>[2] }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(newCookies) {
          console.log('[OAUTH-CALLBACK] Setting cookies', { 
            count: newCookies.length,
            cookieNames: newCookies.map(c => c.name)
          })
          newCookies.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options })
          })
        },
      },
    }
  )

  if (code) {
    console.log('[OAUTH-CALLBACK] Exchanging code for session')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('[OAUTH-CALLBACK] Code exchange successful', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email
      })
      
      // Build final redirect URL using the actual request host/protocol so users
      // remain on the domain they initiated auth from (staging vs production).
      const currentUrl = new URL(request.url)
      const host = request.headers.get('host') ?? currentUrl.host
      const proto = request.headers.get('x-forwarded-proto') ?? currentUrl.protocol.replace(':', '')
      const originForRedirect = `${proto}://${host}`

      // Simple redirect with success indicator
      const redirectUrl = `${originForRedirect}${next}${next.includes('?') ? '&' : '?'}auth=success`
      
      console.log('[OAUTH-CALLBACK] Redirecting to', { redirectUrl, cookieCount: cookiesToSet.length })

      const response = NextResponse.redirect(redirectUrl)
      
      // Set cookies with proper production attributes
      cookiesToSet.forEach(({ name, value, options }) => {
        const productionOptions = {
          ...options,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
        }
        response.cookies.set(name, value, productionOptions)
      })
      
      return response
    } else {
      console.error('[OAUTH-CALLBACK] Code exchange failed', { 
        error: error.message,
        errorCode: error.code,
        status: error.status
      })
    }
  } else {
    console.error('[OAUTH-CALLBACK] No code provided in callback')
  }

  // Auth failed - redirect to destination with error parameter
  console.log('[OAUTH-CALLBACK] Auth failed, redirecting with error indicator')
  
  const currentUrl = new URL(request.url)
  const host = request.headers.get('host') ?? currentUrl.host
  const proto = request.headers.get('x-forwarded-proto') ?? currentUrl.protocol.replace(':', '')
  const originForRedirect = `${proto}://${host}`
  
  // Redirect to next destination with error indicator
  const errorResponse = NextResponse.redirect(
    `${originForRedirect}${next}${next.includes('?') ? '&' : '?'}auth_error=true`
  )
  cookiesToSet.forEach(({ name, value, options }) => errorResponse.cookies.set(name, value, options))
  return errorResponse
}


