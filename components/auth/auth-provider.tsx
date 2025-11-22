"use client"

/**
 * Feature: Auth Provider (Global Authentication Context)
 * Purpose: Manage authentication state, provide auth methods to entire app
 * Journey Context:
 *   - Journey 1: Handles OAuth with temp_prompt metadata, redirects to /auth/post-login
 *   - Journey 2: Handles direct sign up, OAuth redirects to homepage (no automation)
 *   - Journey 3: Handles direct sign in, OAuth redirects to homepage (no automation)
 *   - Journey 4: Provides user state for authenticated prompt submission
 * Key Behavior:
 *   - Smart OAuth redirect: checks temp_prompt_id to decide destination
 *   - Manages session state across all components
 *   - Fetches user profile after authentication
 * References:
 *   - AUTH_JOURNEY_MASTER_PLAN.md - All Journeys
 *   - Supabase Auth: https://supabase.com/docs/guides/auth/server-side
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Tables } from '@/lib/supabase/database.types'

type Profile = Tables<'profiles'>

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, redirectUrl?: string, tempPromptId?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const isInitializingRef = useRef(false)
  const hasInitializedRef = useRef(false)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitializingRef.current) {
      console.log('[AUTH-PROVIDER] Already initializing, skipping')
      return
    }

    isInitializingRef.current = true

    // Check if we just came from OAuth callback
    const hasAuthCallback = typeof window !== 'undefined' && 
      (window.location.search.includes('auth=success') || 
       window.location.search.includes('code='))

    console.log('[AUTH-PROVIDER] Initializing auth', { 
      hasAuthCallback, 
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      search: typeof window !== 'undefined' ? window.location.search : ''
    })

    const initAuth = async () => {
      try {
        // Get current session first to check if we already have one
        let { data: { session } } = await supabase.auth.getSession()
        
        // Only refresh if coming from OAuth callback AND we don't already have a session
        if (hasAuthCallback && !session) {
          console.log('[AUTH-PROVIDER] OAuth callback without session, refreshing')
          const refreshResult = await supabase.auth.refreshSession()
          session = refreshResult.data.session
        } else if (hasAuthCallback && session) {
          console.log('[AUTH-PROVIDER] OAuth callback with existing session, skipping refresh')
        }
        
        console.log('[AUTH-PROVIDER] Got session', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
        
        setLoading(false)
        hasInitializedRef.current = true
        
        // Clean up URL parameters after successful auth
        if (hasAuthCallback && typeof window !== 'undefined') {
          console.log('[AUTH-PROVIDER] Cleaning up URL parameters')
          window.history.replaceState({}, '', window.location.pathname)
        }
      } catch (error) {
        console.error('[AUTH-PROVIDER] Error initializing auth:', error)
        setLoading(false)
        hasInitializedRef.current = true
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't process auth state changes during initialization
      if (!hasInitializedRef.current) {
        console.log('[AUTH-PROVIDER] Skipping auth state change during initialization', { event })
        return
      }

      console.log('[AUTH-PROVIDER] Auth state changed', { 
        event, 
        hasSession: !!session,
        userId: session?.user?.id 
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      isInitializingRef.current = false
    }
  }, [])

  // Listen for OAuth popup completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from our own domain
      const allowedOrigins = [
        'https://www.adpilot.studio',
        'https://staging.adpilot.studio',
        'http://localhost:3000'
      ]
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('[AUTH-PROVIDER] Ignoring message from unauthorized origin:', event.origin)
        return
      }
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        console.log('[AUTH-PROVIDER] OAuth popup completed, refreshing session')
        
        // Refresh session to get the new user data
        supabase.auth.refreshSession().then(({ data, error }) => {
          if (error) {
            console.error('[AUTH-PROVIDER] Error refreshing session:', error)
          } else {
            console.log('[AUTH-PROVIDER] Session refreshed successfully', {
              hasSession: !!data.session,
              userId: data.session?.user?.id,
              userEmail: data.session?.user?.email
            })
            
            setSession(data.session)
            setUser(data.session?.user ?? null)
            
            if (data.session?.user) {
              fetchProfile(data.session.user.id)
            }
          }
        })
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('[AUTH-PROVIDER] OAuth popup failed', event.data.error)
        // Popup closed gracefully with error - user stays in Lovable
        // Could show a toast notification here in the future
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    redirectUrl?: string,
    tempPromptId?: string
  ) => {
    try {
      // Build options object conditionally to satisfy ESLint
      const signUpOptions: {
        emailRedirectTo?: string
        data?: { temp_prompt_id: string }
      } = {}
      
      if (redirectUrl) {
        signUpOptions.emailRedirectTo = redirectUrl
      }
      
      if (tempPromptId) {
        signUpOptions.data = { temp_prompt_id: tempPromptId }
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: Object.keys(signUpOptions).length > 0 ? signUpOptions : undefined,
      })
      
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const signInWithGoogle = async () => {
    // Detect if we're in an iframe (inside Lovable)
    const isInIframe = typeof window !== 'undefined' && window !== window.top

    // Read temp_prompt_id from localStorage before OAuth redirect
    const tempPromptId = typeof window !== 'undefined' 
      ? localStorage.getItem('temp_prompt_id')
      : null

    // Smart redirect: only go to post-login if temp prompt exists
    // Journey 1 (has temp_prompt) → /auth/post-login (creates campaign)
    // Journey 2/3 (no temp_prompt) → /lovable (stay in extension view)
    const nextPath = tempPromptId ? '/auth/post-login' : '/lovable'

    console.log('[AUTH-PROVIDER] Starting Google OAuth', { 
      nextPath, 
      hasTempPrompt: !!tempPromptId,
      isInIframe,
      environment: process.env.NODE_ENV,
      origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
      journey: tempPromptId ? 'Journey 1 (automation)' : 'Journey 2/3 (no automation)'
    })

    // Use the actual origin where the app is running
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined
    const redirectTo = origin
      ? `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : undefined

    // Build OAuth options with temp_prompt_id in user metadata if available
    const oauthOptions: {
      redirectTo?: string
      data?: { temp_prompt_id: string }
      skipBrowserRedirect?: boolean
    } = {}
    
    if (redirectTo) {
      oauthOptions.redirectTo = redirectTo
    }
    
    if (tempPromptId) {
      oauthOptions.data = { temp_prompt_id: tempPromptId }
      console.log('[AUTH-PROVIDER] Attaching temp_prompt_id to OAuth metadata for Journey 1')
    }

    // Force popup mode when in iframe to avoid third-party cookie issues
    if (isInIframe) {
      oauthOptions.skipBrowserRedirect = true
      console.log('[AUTH-PROVIDER] Using popup mode (iframe detected)')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: Object.keys(oauthOptions).length > 0 ? oauthOptions : undefined,
    })

    if (error) {
      console.error('[AUTH-PROVIDER] OAuth error:', error)
      return
    }

    // If in iframe and we have a URL, open in popup
    if (isInIframe && data?.url) {
      const width = 500
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      const popup = window.open(
        data.url,
        'google-oauth-popup',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      )

      if (!popup) {
        console.error('[AUTH-PROVIDER] Popup blocked! Please allow popups for this site.')
        alert('Please allow popups to sign in with Google')
      } else {
        console.log('[AUTH-PROVIDER] OAuth popup opened successfully')
      }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

