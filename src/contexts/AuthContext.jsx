import React, { createContext, useEffect, useState } from 'react'
import { getCurrentSession, signOut } from '../utils/authUtils'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false )
  const [error, setError] = useState(null)

  // Simple check for current user on mount
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('mindmate_current_user')
        console.log('AuthContext: Raw stored user:', storedUser)
        if (storedUser && storedUser !== 'null') {
          const parsedUser = JSON.parse(storedUser)
          console.log('AuthContext: Parsed user:', parsedUser)
          console.log('AuthContext: User role:', parsedUser.user_metadata?.role)
          setUser(parsedUser)
          // Set profile with role directly accessible for ProtectedRoute
          const profileData = {
            ...parsedUser,
            role: parsedUser.user_metadata?.role
          }
          console.log('AuthContext: Setting profile:', profileData)
          setProfile(profileData)
        }
      } catch (err) {
        console.error('Error checking user:', err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  // Simple login function
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      // Wait a bit for localStorage to be updated by signIn function
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const storedUser = localStorage.getItem('mindmate_current_user')
      console.log('AuthContext login: Checking stored user:', storedUser)
      
      if (storedUser && storedUser !== 'null') {
        const parsedUser = JSON.parse(storedUser)
        console.log('AuthContext login: Parsed user:', parsedUser)
        setUser(parsedUser)
        // Set profile with role directly accessible for ProtectedRoute
        const profileData = {
          ...parsedUser,
          role: parsedUser.user_metadata?.role
        }
        console.log('AuthContext login: Setting profile:', profileData)
        setProfile(profileData)
      }
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setLoading(true)
    try {
      await signOut()
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
    isStudent: profile?.role === 'student',
    isAdmin: profile?.role === 'admin',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
