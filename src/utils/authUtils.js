import { supabase } from '../supabaseClient'

// ============================================================
// AUTHENTICATION UTILITIES — SUPABASE EDITION
// ============================================================

/**
 * Sign up a new user with email and password
 * Creates user in auth.users and profile in profiles table
 * Sends email verification if enabled in Supabase settings
 */
export const signUp = async (email, password, name, role = 'student') => {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      return { success: false, error: 'All fields are required' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' }
    }

    // 1. Create auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (authError) {
      console.error('SignUp auth error:', authError)
      
      // Provide user-friendly error messages
      if (authError.message.includes('already registered')) {
        return { success: false, error: 'This email is already registered. Please sign in instead.' }
      }
      if (authError.message.includes('invalid email')) {
        return { success: false, error: 'Please enter a valid email address.' }
      }
      if (authError.message.includes('weak password')) {
        return { success: false, error: 'Password is too weak. Use a stronger password.' }
      }
      
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'User creation failed. Please try again.' }
    }

    // 2. Create profile (the trigger should do this, but we'll ensure it)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        role,
        consent_status: false,
      })

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Profile creation error:', profileError)
      // Don't fail signup if profile already exists (trigger may have created it)
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_metadata: { name, role },
      },
      needsEmailVerification: authData.user.identities?.length === 0,
    }
  } catch (error) {
    console.error('SignUp error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Sign in user with email and password
 * Lean version — just auth, no extra profile fetch
 * AuthContext handles profile loading via onAuthStateChange
 */
export const signIn = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('SignIn error:', error)
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password. Please try again.' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please verify your email address before signing in. Check your inbox for the confirmation link.' }
      }
      if (error.message.includes('User not found')) {
        return { success: false, error: 'No account found with this email. Please sign up first.' }
      }
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Sign in failed. Please try again.' }
    }

    // Return immediately — AuthContext will load profile via onAuthStateChange
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
      session: data.session,
    }
  } catch (error) {
    console.error('SignIn exception:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
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
      callback(session, event)
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

/**
 * Resend email verification
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      console.error('Resend verification error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Resend verification exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify OTP (One-Time Password) from email
 */
export const verifyOTP = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (error) {
      console.error('Verify OTP error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, session: data.session }
  } catch (error) {
    console.error('Verify OTP exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Check auth error:', error)
      return false
    }
    
    return !!session
  } catch (error) {
    console.error('Check auth exception:', error)
    return false
  }
}

/**
 * Update user password
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error('Update password exception:', error)
    return { success: false, error: error.message }
  }
}
