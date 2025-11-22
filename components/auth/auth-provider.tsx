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
        
        // If we're in a popup (opened by parent), notify and close
        if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
          console.log('[AUTH-PROVIDER] In popup window, notifying parent')
          
          try {
            if (session) {
              // Success: notify parent
              console.log('[POPUP] Session established, notifying parent and waiting for cookie persistence')
              window.opener.postMessage(
                { type: 'OAUTH_SUCCESS' },
                window.location.origin
              )
              
              // CRITICAL: Wait for cookies to be written to persistent storage
              // Browser needs time to flush cookies from memory to disk
              // Without this delay, parent window won't find the cookies
              setTimeout(() => {
                console.log('[POPUP] Closing popup after cookie persistence delay (1000ms)')
                window.close()
              }, 1000) // Increased from 100ms to 1000ms for cookie persistence
              
            } else {
              // No session: notify parent of error and close
              console.log('[POPUP] No session found, notifying parent of error')
              window.opener.postMessage(
                { type: 'OAUTH_ERROR', error: 'No session established' },
                window.location.origin
              )
              
              setTimeout(() => {
                console.log('[POPUP] Closing popup after error')
                window.close()
              }, 500)
            }
            
            return // Don't continue initialization in popup
          } catch (err) {
            console.error('[AUTH-PROVIDER] Error communicating with parent:', err)
          }
        }
        
        // Continue normal initialization for parent window
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
    const handleOAuthMessage = (event: MessageEvent) => {
      // Security: Only accept messages from our own origin
      if (event.origin !== window.location.origin) {
        return
      }
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        console.log('[AUTH-PROVIDER] OAuth popup succeeded, getting session with retry')
        
        // Retry logic: Storage sync can take 100-500ms across windows
        const attemptGetSession = async (retryCount = 0, maxRetries = 5) => {
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('[AUTH-PROVIDER] Error getting session after popup:', error)
            return
          }
          
          if (data.session) {
            console.log('[AUTH-PROVIDER] Session retrieved successfully after popup')
            setSession(data.session)
            setUser(data.session?.user ?? null)
            
            if (data.session?.user) {
              fetchProfile(data.session.user.id)
            }
          } else if (retryCount < maxRetries) {
            // No session yet, retry after delay
            console.log(`[AUTH-PROVIDER] No session found, retrying (${retryCount + 1}/${maxRetries})...`)
            setTimeout(() => {
              attemptGetSession(retryCount + 1, maxRetries)
            }, 200) // Wait 200ms between retries
          } else {
            console.warn('[AUTH-PROVIDER] No session found after all retries, will rely on onAuthStateChange')
          }
        }
        
        // Start with a small initial delay to let storage sync
        setTimeout(() => {
          attemptGetSession()
        }, 100)
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('[AUTH-PROVIDER] OAuth popup failed:', event.data.error)
        // UI remains in unauthenticated state - user can retry
      }
    }
    
    window.addEventListener('message', handleOAuthMessage)
    return () => window.removeEventListener('message', handleOAuthMessage)
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
    // Read temp_prompt_id from localStorage before OAuth redirect
    const tempPromptId = typeof window !== 'undefined' 
      ? localStorage.getItem('temp_prompt_id')
      : null

    console.log('[AUTH-PROVIDER] Starting Google OAuth (popup mode)', { 
      hasTempPrompt: !!tempPromptId,
      journey: tempPromptId ? 'Journey 1 (automation)' : 'Journey 2/3 (no automation)'
    })

    // SIMPLIFIED: Always use popup mode (works everywhere, handles PKCE perfectly)
    // No redirectTo needed - Supabase handles OAuth entirely in popup window
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,  // Pure popup mode - Supabase handles everything
        data: tempPromptId ? { temp_prompt_id: tempPromptId } : undefined
      }
    })

    if (error) {
      console.error('[AUTH-PROVIDER] OAuth error:', error)
      return
    }

    // Open OAuth popup - Supabase automatically updates session when complete
    if (data?.url) {
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
        console.error('[AUTH-PROVIDER] Popup blocked by browser')
        alert('Please allow popups to sign in with Google')
      } else {
        console.log('[AUTH-PROVIDER] OAuth popup opened - session will update automatically')
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

