import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getLatestAssessment } from '../utils/databaseUtils'
import { getCopingStrategies } from '../utils/assessmentUtils'
// Idinagdag ang RotateCcw (para sa retake) at BookOpen (para sa view strategies)
import { CheckCircle, AlertTriangle, AlertCircle, Heart, FileText, RotateCcw, BookOpen } from 'lucide-react'

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
      <StudentLayout pageTitle="Results">
        <div className="text-center py-10 text-gray-500">
          Loading...
        </div>
      </StudentLayout>
    )
  }

  if (!assessment) {
    return (
      <StudentLayout pageTitle="Results">
        <div className="text-center text-gray-600">
          No assessment found.
        </div>
      </StudentLayout>
    )
  }

  const percentage = assessment.percentage

  // SIMPLE STATUS LOGIC (based on UI style)
  const getStatus = () => {
    if (percentage <= 25) {
      return {
        label: 'Low Stress',
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: CheckCircle
      }
    }
    if (percentage <= 50) {
      return {
        label: 'Mild Stress',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: AlertTriangle
      }
    }
    if (percentage <= 75) {
      return {
        label: 'Moderate Stress',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        icon: AlertTriangle
      }
    }
    return {
      label: 'High Stress',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: AlertCircle
    }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <StudentLayout pageTitle="Assessment Result">

      {/* MAIN RESULT CARD */}
      <div className="max-w-2xl mx-auto mt-10 mb-10">

        <div className={`rounded-2xl shadow-md p-10 text-center ${status.bg}`}>

          {/* ICON */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow">
              <Icon className={`w-10 h-10 ${status.color}`} />
            </div>
          </div>

          {/* TITLE */}
          <h2 className={`text-3xl font-bold ${status.color}`}>
            {status.label}
          </h2>

          {/* DETAILS */}
          <p className="text-gray-600 mt-2">
            {percentage}% stress level
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Score: {assessment.score} / 63
          </p>

        </div>

        {/* COPING STRATEGIES */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recommended Coping Strategies
          </h3>

          <div className="space-y-3">
            {copingStrategies.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-sm font-bold text-gray-700">
                  {index + 1}
                </div>

                <span className="text-2xl">{item.emoji}</span>

                <p className="text-gray-700">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DYNAMIC ALERT BOX */}
        {status.label === 'High Stress' && (
          <div className="mt-6 flex gap-3 items-start border border-red-200 bg-red-50/50 p-4 rounded-xl text-sm text-red-600 leading-relaxed">
            <Heart className="w-5 h-5 text-red-500 shrink-0 mt-0.5 fill-red-100" />
            <p>
              <strong>We care about you.</strong> Please consider reaching out to your guidance counselor or a trusted adult for additional support.
            </p>
          </div>
        )}

        {/* BUTTONS WITH ICONS */}
        <div className="mt-6 flex gap-4">
          <Link
            to="/assessment"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Assessment
          </Link>

          <Link
            to="/coping-strategies" 
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View All Strategies
          </Link>
        </div>

        {/* MEDICAL DISCLAIMER */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 text-center px-4">
         
          <span>⚕️This assessment is for educational purposes only and does not constitute a medical diagnosis.</span>
        </div>

      </div>
    </StudentLayout>
  )
}

export default AssessmentResultPage