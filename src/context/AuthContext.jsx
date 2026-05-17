import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Not configured' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) console.error('[Supabase] Google sign-in error:', error.message)
    return { error: error?.message || null }
  }

  const signInWithEmail = async (email) => {
    if (!supabase) {
      console.warn('[Supabase] Cannot sign in — Supabase is not configured.')
      return { error: 'Not configured' }
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      console.error('[Supabase] Sign-in error:', error.message)
      return { error: error.message }
    }
    setMagicLinkSent(true)
    return { error: null }
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Supabase] Sign-out error:', error.message)
  }

  const value = { user, loading, magicLinkSent, setMagicLinkSent, signInWithGoogle, signInWithEmail, signOut }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
