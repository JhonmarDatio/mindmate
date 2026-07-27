import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Fetch the profile row from the profiles table — runs in background
  const fetchProfile = async (authUser) => {
    if (!authUser) return

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role, consent_status, email')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('fetchProfile error:', profileError.message)
        // Use metadata as fallback — already set from session
        return
      }

      const metaRole = authUser.user_metadata?.role
      const resolvedRole = (data.role && data.role !== 'student')
        ? data.role
        : (metaRole || data.role || 'student')

      setProfile({
        ...data,
        role: resolvedRole,
        email: data.email || authUser.email,
        user_metadata: {
          name: data.name || authUser.user_metadata?.name || '',
          role: resolvedRole,
        },
      })
    } catch (err) {
      console.error('fetchProfile exception:', err)
    }
  }

  // Build an instant profile from JWT/session data — no DB needed
  const buildProfileFromSession = (authUser) => {
    if (!authUser) return null
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || '',
      role: authUser.user_metadata?.role || 'student',
      consent_status: false,
      user_metadata: {
        name: authUser.user_metadata?.name || '',
        role: authUser.user_metadata?.role || 'student',
      },
    }
  }

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        console.log('Auth event:', event)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session?.user) {
            // Set user + instant profile from JWT immediately — no waiting
            setUser(session.user)
            setProfile(buildProfileFromSession(session.user))
            setLoading(false)
            // Then fetch full profile from DB in background
            fetchProfile(session.user)
          } else {
            // No session
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            setUser(session.user)
            fetchProfile(session.user)
          }
        }
      }
    )

    // Safety net — if events never fire within 5s
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth safety timeout')
        setLoading(false)
      }
    }, 5000)

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      setUser(null)
      setProfile(null)
      setError(null)
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent:    profile?.role === 'student',
    isCounselor:  profile?.role === 'counselor',
    isAdmin:      profile?.role === 'superadmin',
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
