import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resendVerificationEmail } from '../utils/authUtils'
import { Mail, CheckCircle, Clock, RefreshCw } from 'lucide-react'

const EmailVerificationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Email address not found. Please register again.')
      return
    }

    setResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const result = await resendVerificationEmail(email)

      if (result.success) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setResendError(result.error || 'Failed to resend email')
      }
    } catch (err) {
      console.error('Resend error:', err)
      setResendError('An unexpected error occurred')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden bg-white">
            <img
              src="/gordon-college-logo.png"
              alt="MindMate Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-white/20">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
              <Mail className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a confirmation email to
            </p>
            <p className="font-semibold text-teal-700 mt-1">
              {email || 'your email address'}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Check your inbox</p>
                <p className="text-blue-700">
                  Click the verification link in the email to activate your account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">After verification</p>
                <p className="text-green-700">
                  You'll be redirected to the login page to access your account.
                </p>
              </div>
            </div>
          </div>

          {/* Didn't receive email */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the email? Check your spam folder.
            </p>

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
                ✓ Verification email sent! Check your inbox.
              </div>
            )}

            {/* Resend Error Message */}
            {resendError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {resendError}
              </div>
            )}

            {/* Resend Button */}
            <button
              onClick={handleResendEmail}
              disabled={resending || resendSuccess}
              className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 border-2 border-teal-600 text-teal-700 rounded-xl font-semibold hover:bg-teal-50 transition"
          >
            Go to Login Page
          </button>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 font-semibold mb-2">
              💡 Tips:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The link expires after 24 hours</li>
              <li>• You can request a new link anytime</li>
            </ul>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-white/80 mt-6">
          Need help? Contact support at{' '}
          <a href="mailto:support@mindmate.com" className="font-semibold underline">
            support@mindmate.com
          </a>
        </p>

      </div>
    </div>
  )
}

export default EmailVerificationPage
