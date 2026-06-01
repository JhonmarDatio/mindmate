import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Fetch the profile row from the profiles table
  const fetchProfile = async (authUser) => {
    if (!authUser) {
      setUser(null)
      setProfile(null)
      return
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role, consent_status, email')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      console.error('fetchProfile error:', profileError.message)
      // Fallback to metadata if profile row not found yet
      setUser(authUser)
      setProfile({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || '',
        role: authUser.user_metadata?.role || 'student',
        consent_status: false,
        user_metadata: {
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'student',
        },
      })
      return
    }

    // If profile role is still 'student' but metadata says otherwise,
    // trust the metadata (happens when role wasn't set in DB yet)
    const metaRole = authUser.user_metadata?.role
    const resolvedRole = (data.role && data.role !== 'student')
      ? data.role
      : (metaRole || data.role || 'student')

    setUser(authUser)
    setProfile({
      ...data,
      role: resolvedRole,
      email: data.email || authUser.email,
      user_metadata: {
        name: data.name || authUser.user_metadata?.name || '',
        role: resolvedRole,
      },
    })
  }

  // On mount — restore session and listen for auth changes
  useEffect(() => {
    // 1. Get existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null).finally(() => setLoading(false))
    })

    // 2. Listen for sign-in / sign-out / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchProfile(session?.user ?? null).finally(() => setLoading(false))
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // login() is kept so LoginPage doesn't need changes
  // signIn() in authUtils already calls supabase — this just syncs context
  const login = async () => {
    // Session is already set by supabase.auth.signInWithPassword in authUtils
    // onAuthStateChange above will fire and call fetchProfile automatically
    return { success: true }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
