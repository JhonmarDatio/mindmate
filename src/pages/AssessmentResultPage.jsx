import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getLatestAssessment } from '../utils/databaseUtils'
import { getCopingStrategies, getStressColor } from '../utils/assessmentUtils'
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

const AssessmentResultPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [assessment, setAssessment] = useState(location.state?.assessment || null)
  const [loading, setLoading] = useState(!assessment)
  const [copingStrategies, setCopingStrategies] = useState([])

  useEffect(() => {
    if (!assessment) {
      const fetchAssessment = async () => {
        const { assessment: latest } = await getLatestAssessment(user.id)
        setAssessment(latest)
        setLoading(false)
      }
      fetchAssessment()
    }
  }, [assessment, user])

  useEffect(() => {
    if (assessment) {
      setCopingStrategies(getCopingStrategies(assessment.stress_level))
    }
  }, [assessment])

  if (loading) {
    return (
      <StudentLayout pageTitle="Assessment Results">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </StudentLayout>
    )
  }

  if (!assessment) {
    return (
      <StudentLayout pageTitle="Assessment Results">
        <div className="card border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-bold text-yellow-900">No Assessment Results Found</h3>
              <p className="text-yellow-800 text-sm">
                Please complete the mental health assessment first.
              </p>
              <Link to="/assessment" className="text-teal-600 hover:text-teal-700 font-medium mt-2 inline-block">
                Take Assessment →
              </Link>
            </div>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const stressColors = {
    Low: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    Mild: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    Moderate: {
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    High: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }

  const stressInfo = stressColors[assessment.stress_level]
  const Icon = stressInfo.icon

  return (
    <StudentLayout pageTitle="Your Assessment Results">
      {/* Results Header */}
      <div className={`card border-2 ${stressInfo.borderColor} ${stressInfo.bgColor} mb-8`}>
        <div className="flex items-start gap-6">
          <Icon className={`w-12 h-12 ${stressInfo.color} flex-shrink-0`} />
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              <span className={stressInfo.color}>{assessment.stress_level}</span> Stress Level
            </h2>
            <p className="text-gray-700 mb-4">
              Based on your assessment, your current stress level is classified as{' '}
              <strong>{assessment.stress_level.toLowerCase()}</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Completed on {new Date(assessment.created_at).toLocaleDateString()} at{' '}
              {new Date(assessment.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Total Score</p>
            <p className="text-4xl font-bold text-teal-600">{assessment.score}</p>
            <p className="text-xs text-gray-500 mt-2">out of 63 possible points</p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Stress Percentage</p>
            <p className="text-4xl font-bold text-orange-600">{assessment.percentage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${
                  assessment.percentage <= 25
                    ? 'bg-green-500'
                    : assessment.percentage <= 50
                      ? 'bg-yellow-500'
                      : assessment.percentage <= 75
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                }`}
                style={{ width: `${assessment.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Stress Range</p>
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">Low</span>
                <span className="text-gray-500">0-25%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600 font-medium">Mild</span>
                <span className="text-gray-500">26-50%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-orange-600 font-medium">Moderate</span>
                <span className="text-gray-500">51-75%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600 font-medium">High</span>
                <span className="text-gray-500">76-100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coping Strategies */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Coping Strategies</h3>

        {assessment.stress_level === 'High' && (
          <div className="card border-2 border-red-200 bg-red-50 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-red-900 mb-2">Important - High Stress Level Detected</h4>
                <p className="text-red-800 text-sm mb-3">
                  Your assessment indicates a high level of stress. It's important to reach out for professional
                  support immediately.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="tel:988"
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Call Crisis Hotline (988)
                  </a>
                  <Link
                    to="/chat"
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Chat with Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {copingStrategies.map((strategy, idx) => (
            <div key={idx} className="card">
              <div className="flex gap-4">
                <span className="text-3xl flex-shrink-0">{strategy.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900">{strategy.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="card border-2 border-teal-200 bg-teal-50">
        <h3 className="text-lg font-bold text-teal-900 mb-4">Next Steps</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <span className="text-teal-900">
              <strong>Log your mood daily</strong> using the Mood Tracker to see patterns in your well-being
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <span className="text-teal-900">
              <strong>Chat with MindMate</strong> whenever you need support or guidance
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <span className="text-teal-900">
              <strong>Try coping strategies</strong> that resonate with you and track what works
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <span className="text-teal-900">
              <strong>Talk to a counselor</strong> if you need additional professional support
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Link to="/" className="flex-1 btn-secondary text-center">
          Return Home
        </Link>
        <Link to="/mood-tracker" className="flex-1 btn-primary text-center">
          Track Your Mood
        </Link>
      </div>
    </StudentLayout>
  )
}

export default AssessmentResultPage
