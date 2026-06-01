import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, History, ChevronDown, ChevronUp } from 'lucide-react'

import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

import { submitAssessment, getUserAssessments } from '../utils/databaseUtils'

import {
  getDailyQuestions,
  calculateScore,
  calculatePercentage,
  getStressLevel,
  getDomainBreakdown,
} from '../utils/assessmentUtils'

const levelBadge = {
  Low:      'bg-green-50 text-green-700 border-green-200',
  Mild:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  Moderate: 'bg-orange-50 text-orange-700 border-orange-200',
  High:     'bg-red-50 text-red-700 border-red-200',
}

const levelBar = {
  Low: 'bg-green-400', Mild: 'bg-yellow-400', Moderate: 'bg-orange-400', High: 'bg-red-500',
}

const AssessmentPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Get today's questions — rotates daily
  const todayQuestions = getDailyQuestions()
  const ASSESSMENT_QUESTIONS = todayQuestions.map((q) => q.text)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(Array(ASSESSMENT_QUESTIONS.length).fill(null))
  const [consentChecked, setConsentChecked] = useState(false)
  const [showConsentPage, setShowConsentPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // History
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (user) {
      getUserAssessments(user.id).then(({ assessments }) => {
        setHistory(assessments || [])
        setHistoryLoading(false)
      })
    }
  }, [user])

  // AUTO NEXT QUESTION
  const handleAnswerChange = (score) => {
    const newAnswers = [...answers]

    newAnswers[currentQuestion] = score

    setAnswers(newAnswers)

    // AUTO NEXT
    if (
      currentQuestion <
      ASSESSMENT_QUESTIONS.length - 1
    ) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1)
      }, 250)
    } else {
      // SHOW CONSENT PAGE
      setTimeout(() => {
        setShowConsentPage(true)
      }, 250)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!consentChecked) {
      setError(
        'Please confirm your consent before submitting.'
      )

      return
    }

    if (answers.some((ans) => ans === null)) {
      setError(
        'Please answer all questions before submitting.'
      )

      return
    }

    setLoading(true)
    setError('')

    try {
      const score = calculateScore(answers)
      const percentage = calculatePercentage(score)
      const stressLevel = getStressLevel(percentage)

      // Compute domain scores using today's questions
      const domainBreakdown = getDomainBreakdown(answers, todayQuestions)
      const domainScores = {}
      domainBreakdown.forEach((d) => { domainScores[d.domain] = d.percentage })

      const result = await submitAssessment(
        user.id,
        score,
        percentage,
        stressLevel,
        consentChecked,
        domainScores
      )

      if (!result.success) {
        setError(
          result.error ||
            'Failed to submit assessment'
        )

        setLoading(false)

        return
      }

      navigate('/assessment-result', {
        state: {
          assessment: result.assessment,
          answers,
        },
      })
    } catch (err) {
      setError(
        'An unexpected error occurred while submitting your assessment.'
      )

      setLoading(false)
    }
  }

  const progress =
    ((currentQuestion + 1) /
      ASSESSMENT_QUESTIONS.length) *
    100

  const questionNumber = currentQuestion + 1

  return (
    <StudentLayout pageTitle="Mental Health Assessment">
      <div className="max-w-2xl mx-auto">
        {/* CONSENT PAGE */}
        {showConsentPage ? (
          <div className="bg-white rounded-3xl shadow-lg border p-8 mt-10 animate-fade">
            <div className="flex flex-col items-center text-center">
              {/* ICON */}
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-teal-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Privacy & Consent
              </h2>

              <p className="text-gray-600 mb-8 max-w-lg">
                Before submitting your assessment,
                please review the consent option
                below. Your responses are private by
                default.
              </p>

              {/* CONSENT BOX */}
              <div className="w-full border rounded-2xl p-5 flex items-start gap-4 mb-6">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) =>
                    setConsentChecked(
                      e.target.checked
                    )
                  }
                  className="mt-1 w-5 h-5 accent-teal-600 cursor-pointer"
                />

                <label
                  htmlFor="consent"
                  className="text-left text-gray-700 cursor-pointer"
                >
                  I agree to share my results with
                  the guidance office. This will
                  allow the guidance counselor to
                  view my name and assessment
                  results for the purpose of
                  providing support.
                </label>
              </div>

             

              {/* ERROR */}
              {error && (
                <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => {
                    setShowConsentPage(false)

                    setCurrentQuestion(
                      ASSESSMENT_QUESTIONS.length -
                        1
                    )
                  }}
                  className="flex-1 border rounded-xl py-3 font-medium hover:bg-gray-50 transition"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={
                    loading || !consentChecked
                  }
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-medium transition disabled:opacity-50"
                >
                  {loading
                    ? 'Submitting...'
                    : 'Submit Assessment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* PROGRESS BAR */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {questionNumber} of{' '}
                  {
                    ASSESSMENT_QUESTIONS.length
                  }
                </span>

                <span className="text-sm font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* QUESTION CARD */}
            <div
              key={currentQuestion}
              className="card mb-8 animate-fade"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {
                  ASSESSMENT_QUESTIONS[
                    currentQuestion
                  ]
                }
              </h3>

              <div className="space-y-3">
                {[
                  {
                    value: 0,
                    label: 'Not at all',
                  },

                  {
                    value: 1,
                    label: 'Sometimes',
                  },

                  {
                    value: 2,
                    label: 'Often',
                  },

                  {
                    value: 3,
                    label: 'Almost always',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleAnswerChange(
                        option.value
                      )
                    }
                    className={`w-full p-4 border-2 rounded-xl text-left font-medium transition-all duration-200 ${
                      answers[
                        currentQuestion
                      ] === option.value
                        ? 'border-teal-600 bg-teal-50 scale-[1.02]'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>
                        {option.label}
                      </span>

                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                        Score: {option.value}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* PREVIOUS BUTTON */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </div>

            {/* QUESTION NAVIGATION */}
            <div className="flex flex-wrap gap-2 justify-center mt-8">
              {ASSESSMENT_QUESTIONS.map(
                (_, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setCurrentQuestion(idx)
                    }
                    disabled={
                      answers[idx] === null
                    }
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      idx === currentQuestion
                        ? 'bg-teal-600 text-white'
                        : answers[idx] !== null
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* ── PREVIOUS RESULTS ── */}
      <div className="max-w-2xl mx-auto mt-8">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-teal-300 transition"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-800 text-sm">Previous Assessment Results</span>
            {history.length > 0 && (
              <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>
          {showHistory
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showHistory && (
          <div className="mt-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {historyLoading ? (
              <p className="text-center text-sm text-gray-400 py-8">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No previous assessments found.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map((a, i) => (
                  <div key={a.id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                    {/* Number */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-500">{history.length - i}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${levelBadge[a.stress_level] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {a.stress_level}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{a.percentage}%</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${levelBar[a.stress_level] || 'bg-gray-300'}`}
                          style={{ width: `${a.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(a.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* View result link */}
                    <Link
                      to="/assessment-result"
                      state={{ assessment: a }}
                      className="flex-shrink-0 text-xs text-teal-600 hover:text-teal-700 font-semibold bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default AssessmentPage