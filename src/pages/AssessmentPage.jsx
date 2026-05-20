import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

import { submitAssessment } from '../utils/databaseUtils'

import {
  ASSESSMENT_QUESTIONS,
  calculateScore,
  calculatePercentage,
  getStressLevel,
} from '../utils/assessmentUtils'

const AssessmentPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [currentQuestion, setCurrentQuestion] =
    useState(0)

  const [answers, setAnswers] = useState(
    Array(ASSESSMENT_QUESTIONS.length).fill(null)
  )

  const [consentChecked, setConsentChecked] =
    useState(false)

  const [showConsentPage, setShowConsentPage] =
    useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

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

      const percentage =
        calculatePercentage(score)

      const stressLevel =
        getStressLevel(percentage)

      const result = await submitAssessment(
        user.id,
        score,
        percentage,
        stressLevel,
        consentChecked
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
    </StudentLayout>
  )
}

export default AssessmentPage