import { supabase } from '../supabaseClient'

// ============================================================
// AUTHENTICATION UTILITIES — SUPABASE EDITION
// ============================================================

/**
 * Sign up a new user with email and password
 * Creates user in auth.users and profile in profiles table
 */
export const signUp = async (email, password, name, role = 'student') => {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (authError) {
      console.error('SignUp auth error:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed' }
    }

    // 2. Create profile (the trigger should do this, but we'll ensure it)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        role,
        consent_status: false,
      })

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile already exists
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_metadata: { name, role },
      },
    }
  } catch (error) {
    console.error('SignUp error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign in user with email and password
 */
export const signIn = async (email, password) => {
  try {
    console.log('SignIn attempt:', { email })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('SignIn error:', error)
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Sign in failed' }
    }

    // Fetch the profile to get role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      // Continue anyway, use metadata as fallback
    }

    const session = {
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: {
          name: profileData?.name || data.user.user_metadata?.name || '',
          role: profileData?.role || data.user.user_metadata?.role || 'student',
        },
      },
    }

    console.log('SignIn success:', session)
    return { success: true, user: session.user, session }
  } catch (error) {
    console.error('SignIn exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('SignOut error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('SignOut exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Get session error:', error)
      return { session: null, error: error.message }
    }

    return { session: data.session, error: null }
  } catch (error) {
    console.error('Get session exception:', error)
    return { session: null, error: error.message }
  }
}

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Get user error:', error)
      return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
  } catch (error) {
    console.error('Get user exception:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Get user profile from profiles table
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Get profile error:', error)
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  } catch (error) {
    console.error('Get profile exception:', error)
    return { profile: null, error: error.message }
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update profile error:', error)
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  } catch (error) {
    console.error('Update profile exception:', error)
    return { profile: null, error: error.message }
  }
}

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  try {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      callback(session)
    })

    return {
      unsubscribe: () => {
        if (data?.subscription) {
          data.subscription.unsubscribe()
        }
      },
    }
  } catch (error) {
    console.error('Auth state listener error:', error)
    return {
      unsubscribe: () => {},
    }
  }
}
