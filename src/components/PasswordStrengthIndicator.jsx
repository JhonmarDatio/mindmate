import React from 'react'
import { Check, X } from 'lucide-react'

const PasswordStrengthIndicator = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /\d/.test(password) },
    { label: 'Contains special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const passedCount = requirements.filter(req => req.test).length
  const strength = passedCount <= 2 ? 'weak' : passedCount <= 4 ? 'medium' : 'strong'

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500'
  }

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong'
  }

  if (!password) return null

  return (
    <div className="mt-3 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${(passedCount / requirements.length) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${
          strength === 'weak' ? 'text-red-600' : 
          strength === 'medium' ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {strengthLabels[strength]}
        </span>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.test ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <X size={14} className="text-gray-400" />
            )}
            <span className={req.test ? 'text-green-600' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator
