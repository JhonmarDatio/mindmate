import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getLatestAssessment } from '../utils/databaseUtils'
import { Heart, Book, MessageCircle, Smile, TrendingUp } from 'lucide-react'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [latestAssessment, setLatestAssessment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestAssessment = async () => {
      if (user) {
        const { assessment } = await getLatestAssessment(user.id)
        setLatestAssessment(assessment)
        setLoading(false)
      }
    }

    fetchLatestAssessment()
  }, [user])

  return (
    <StudentLayout pageTitle="Welcome back">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mental Health Status</p>
              <p className="text-2xl font-bold text-teal-600">
                {latestAssessment?.stress_level || 'Not Assessed'}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stress Score</p>
              <p className="text-2xl font-bold text-orange-600">
                {latestAssessment?.percentage || '—'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mood Today</p>
              <p className="text-2xl font-bold text-yellow-600">—</p>
            </div>
            <Smile className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Support Check-in</p>
              <p className="text-2xl font-bold text-green-600">Available</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mental Health Assessment */}
        <Link
          to="/assessment"
          className="card hover:shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mental Health Assessment</h3>
              <p className="text-gray-600 text-sm mb-4">
                Take our comprehensive 21-question assessment to understand your current stress levels
                and get personalized recommendations.
              </p>
              <div className="text-teal-600 font-medium group-hover:text-teal-700">
                Start Assessment →
              </div>
            </div>
          </div>
        </Link>

        {/* Mood Tracker */}
        <Link
          to="/mood-tracker"
          className="card hover:shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
              <Smile className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mood Tracker</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check in with yourself daily and track your emotional well-being. See patterns and
                trends in your mood over time.
              </p>
              <div className="text-teal-600 font-medium group-hover:text-teal-700">
                Track Your Mood →
              </div>
            </div>
          </div>
        </Link>

        {/* AI Chat Assistant */}
        <Link
          to="/chat"
          className="card hover:shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Chat Assistant</h3>
              <p className="text-gray-600 text-sm mb-4">
                Talk to MindMate, your supportive AI companion. Get immediate guidance and support
                whenever you need it.
              </p>
              <div className="text-teal-600 font-medium group-hover:text-teal-700">
                Start Chatting →
              </div>
            </div>
          </div>
        </Link>

        {/* Coping Strategies */}
        <Link
          to="/coping-strategies"
          className="card hover:shadow-xl cursor-pointer transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coping Strategies</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn practical techniques like breathing exercises, journaling, and mindfulness to
                manage stress effectively.
              </p>
              <div className="text-teal-600 font-medium group-hover:text-teal-700">
                Explore Strategies →
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Latest Assessment Results */}
      {latestAssessment && (
        <div className="mt-8 card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Latest Assessment Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Stress Level</p>
              <p className="text-lg font-bold text-teal-600">{latestAssessment.stress_level}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Score</p>
              <p className="text-lg font-bold text-orange-600">{latestAssessment.percentage}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Date Completed</p>
              <p className="text-lg font-bold text-gray-700">
                {new Date(latestAssessment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link
            to="/assessment-result"
            className="mt-4 inline-block text-teal-600 hover:text-teal-700 font-medium"
          >
            View Full Results →
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-2">Important Notice:</p>
        <p>
          This system is support purposes only and is not a substitute for professional
          mental health services. If you are in crisis, please contact emergency services or call your local
          crisis hotline immediately.
        </p>
      </div>
    </StudentLayout>
  )
}

export default StudentDashboard
