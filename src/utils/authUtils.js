// Mock users for local development
const MOCK_USERS = {
  'student@test.com': {
    id: 'user-student-1',
    email: 'student@test.com',
    password: 'password1234',
    name: 'Test Student',
    role: 'student',
    consent_status: false,
    created_at: new Date().toISOString(),
  },
  'admin@test.com': {
    id: 'user-admin-1',
    email: 'admin@test.com',
    password: 'password123',
    name: 'Test Admin',
    role: 'admin',
    consent_status: true,
    created_at: new Date().toISOString(),
  },
}

// Initialize mock data
const initMockData = () => {
  const existingUsers = localStorage.getItem('mindmate_users')
  if (!existingUsers) {
    localStorage.setItem('mindmate_users', JSON.stringify(MOCK_USERS))
  }
  
  const existingSession = localStorage.getItem('mindmate_current_user')
  if (!existingSession) {
    localStorage.setItem('mindmate_current_user', JSON.stringify(null))
  }
}

initMockData()

// Sign up a new user
export const signUp = async (email, password, name, role = 'student') => {
  try {
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')
    
    if (users[email]) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role,
      consent_status: false,
      created_at: new Date().toISOString(),
    }

    users[email] = newUser
    localStorage.setItem('mindmate_users', JSON.stringify(users))

    return { success: true, user: newUser }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Sign in user
export const signIn = async (email, password) => {
  try {
    console.log('SignIn attempt:', { email, password })
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')
    console.log('Available users:', Object.keys(users))
    console.log('Stored users data:', users)
    const user = users[email]
    console.log('Found user:', user)

    if (!user || user.password !== password) {
      console.log('Authentication failed:', { userExists: !!user, passwordMatch: user?.password === password })
      return { success: false, error: 'Invalid email or password' }
    }

    const session = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      },
    }

    localStorage.setItem('mindmate_current_user', JSON.stringify(session.user))
    return { success: true, user: session.user, session }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const sendPasswordReset = async (email) => {
  try {
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')

    if (!users[email]) {
      return { success: false, error: 'No account found with that email address' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Sign out user
export const signOut = async () => {
  try {
    localStorage.setItem('mindmate_current_user', JSON.stringify(null))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Get current session
export const getCurrentSession = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('mindmate_current_user') || 'null')
    if (user) {
      return { session: { user }, error: null }
    } else {
      return { session: null, error: null }
    }
  } catch (error) {
    return { session: null, error: error.message }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('mindmate_current_user') || 'null')
    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Get user profile from users table
export const getUserProfile = async (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')
    const profile = Object.values(users).find((u) => u.id === userId)

    if (!profile) {
      return { profile: null, error: 'User not found' }
    }

    return { profile, error: null }
  } catch (error) {
    return { profile: null, error: error.message }
  }
}

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')
    const userEntry = Object.entries(users).find(([_, u]) => u.id === userId)

    if (!userEntry) {
      return { profile: null, error: 'User not found' }
    }

    const [email, user] = userEntry
    const updatedUser = { ...user, ...updates }
    users[email] = updatedUser

    localStorage.setItem('mindmate_users', JSON.stringify(users))
    return { profile: updatedUser, error: null }
  } catch (error) {
    return { profile: null, error: error.message }
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  const checkAuth = async () => {
    const { session } = await getCurrentSession()
    callback(session)
  }

  checkAuth()

  // Simulate checking for changes every second
  const interval = setInterval(checkAuth, 1000)

  return {
    unsubscribe: () => clearInterval(interval),
  }
}
