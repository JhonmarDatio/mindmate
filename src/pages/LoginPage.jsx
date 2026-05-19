import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn } from '../utils/authUtils'
import { useAuth } from '../contexts/AuthContext'
import { Brain } from 'lucide-react'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First authenticate with authUtils
      const authResult = await signIn(email, password)

      if (!authResult.success) {
        setError(authResult.error || 'Failed to sign in')
        return
      }

      // Then update AuthContext state
      await login(email, password)
      
      // Navigate to the appropriate page based on user role
      if (authResult.user?.user_metadata?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center px-4">

  <div className="w-full max-w-md">

    {/* Logo Only */}
    <div className="flex justify-center mb-6">

      <div className="w-28 h-28 rounded-full shadow-lg overflow-hidden">

        <img
          src="/mindmate/public/gordon college logo.png"
          alt="MindMate Logo"
          className="w-full h-full object-cover"
        />

      </div>

    </div>

    {/* Login Card */}
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-white/30">

      {/* Title Inside Card */}
      <div className="text-center mb-6">

        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to MindMate
        </h1>

        <p className="text-gray-600 mt-2">
          Sign in to continue
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot"
            className="text-sm text-gray-500 hover:text-teal-600"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-300"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-teal-600 hover:text-teal-700 font-semibold"
        >
          Create Account
        </Link>
      </div>

    </div>

  </div>

</div>
  )
}

export default LoginPage
