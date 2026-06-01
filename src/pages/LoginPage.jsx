import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../utils/authUtils'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Smile, MessagesSquare, AlertTriangle, BookOpen } from 'lucide-react'

const LoginPage = () => {
  const navigate = useNavigate()
  const { profile, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingRedirect, setPendingRedirect] = useState(false)

  // Once profile loads after login, redirect to the correct page
  useEffect(() => {
    if (pendingRedirect && isAuthenticated && profile?.role) {
      const role = profile.role
      console.log('=== REDIRECT DEBUG ===')
      console.log('profile:', profile)
      console.log('role:', role)
      if (role === 'superadmin') {
        navigate('/superadmin', { replace: true })
      } else if (role === 'counselor') {
        navigate('/counselor', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
      setPendingRedirect(false)
    }
  }, [pendingRedirect, isAuthenticated, profile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const authResult = await signIn(email, password)

      if (!authResult.success) {
        setError(authResult.error || 'Failed to sign in')
        return
      }

      // Tell the effect above to redirect once profile is ready
      setPendingRedirect(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 flex items-center justify-center px-4 relative overflow-hidden">

    {/* Background Shapes */}
    <div className="absolute top-20 left-10 w-24 h-24 bg-white/5 rounded-3xl rotate-12"></div>
    <div className="absolute bottom-16 right-20 w-40 h-40 bg-white/5 rounded-3xl rotate-12"></div>

    {/* Main Container */}
    <div className="w-full max-w-4xl min-h-[180px] rounded-[28px] overflow-hidden shadow-2xl flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center w-[55%] bg-gradient-to-br from-teal-950 to-teal-800 p-10 text-white">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center">
            <Brain size={40} />
          </div>

          <h1 className="text-2xl font-bold"></h1>
        </div>

        <h2 className="text-4xl font-extrabold leading-tight">
          MindMate – <br />
          <span className="text-teal-300">AI-Powered</span>
          <br />
          Mental Health <br />
          Support System
        </h2>

        <p className="mt-5 text-gray-300 leading-relaxed text-sm">
          A comprehensive web application providing mental health support through smart system.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8 text-white">
  
  <div className="bg-white/10 rounded-xl px-4 py-3 text-sm backdrop-blur-md flex items-center gap-2">
    <AlertTriangle size={18} />
    Stress Assessment
  </div>

  <div className="bg-white/10 rounded-xl px-4 py-3 text-sm backdrop-blur-md flex items-center gap-2">
    <Smile size={18} />
    Mood Tracking
  </div>

  <div className="bg-white/10 rounded-xl px-4 py-3 text-sm backdrop-blur-md flex items-center gap-2">
    <MessagesSquare size={18} />
    AI Support Chat
  </div>

  <div className="bg-white/10 rounded-xl px-4 py-3 text-sm backdrop-blur-md flex items-center gap-2">
    <BookOpen size={18} />
    Coping Strategies
  </div>

</div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[45%] bg-white flex flex-col justify-center p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg bg-white flex items-center justify-center">
            <img
              src="/gordon-college-logo.png"
              alt="MindMate Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">USER LOGIN</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to access your MindMate portal
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />

          <div className="flex justify-end">
            <Link to="/forgot" className="text-sm text-gray-500 hover:text-teal-600">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300"
          >
            {loading ? 'Signing in...' : 'LOGIN'}
          </button>

        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  </div>
)
}

export default LoginPage