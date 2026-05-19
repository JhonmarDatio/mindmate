import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { submitAssessment } from '../utils/databaseUtils'
import { ASSESSMENT_QUESTIONS, calculateScore, calculatePercentage, getStressLevel } from '../utils/assessmentUtils'

const AssessmentPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState(Array(ASSESSMENT_QUESTIONS.length).fill(null))
  const [consentChecked, setConsentChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnswerChange = (score) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = score
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (answers[currentQuestion] !== null && currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!consentChecked) {
      setError('Please confirm your consent before submitting.')
      return
    }

    if (answers.some((ans) => ans === null)) {
      setError('Please answer all questions before submitting.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const score = calculateScore(answers)
      const percentage = calculatePercentage(score)
      const stressLevel = getStressLevel(percentage)

      const result = await submitAssessment(user.id, score, percentage, stressLevel, consentChecked)

      if (!result.success) {
        setError(result.error || 'Failed to submit assessment')
        setLoading(false)
        return
      }

      // Redirect to results page
      navigate('/assessment-result', { state: { assessment: result.assessment } })
    } catch (err) {
      setError('An unexpected error occurred while submitting your assessment.')
      setLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100
  const questionNumber = currentQuestion + 1

  return (
    <StudentLayout pageTitle="Mental Health Assessment">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {questionNumber} of {ASSESSMENT_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {ASSESSMENT_QUESTIONS[currentQuestion]}
          </h3>

          <div className="space-y-3">
            {[
              { value: 0, label: 'Not at all', color: 'border-green-500 hover:bg-green-50' },
              { value: 1, label: 'Sometimes', color: 'border-yellow-500 hover:bg-yellow-50' },
              { value: 2, label: 'Often', color: 'border-orange-500 hover:bg-orange-50' },
              { value: 3, label: 'Almost always', color: 'border-red-500 hover:bg-red-50' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswerChange(option.value)}
                className={`w-full p-4 border-2 rounded-lg text-left font-medium transition-colors ${
                  answers[currentQuestion] === option.value
                    ? `${option.color} border-2 bg-opacity-100`
                    : `border-gray-200 ${option.color}`
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full ml-3">
                    Score: {option.value}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {currentQuestion < ASSESSMENT_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={answers[currentQuestion] === null}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !consentChecked}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>

        {/* Consent Section - Only show on last question */}
        {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 && (
          <div className="card border-2 border-teal-200 bg-teal-50">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-5 h-5 cursor-pointer"
              />
              <label htmlFor="consent" className="cursor-pointer flex-1">
                <p className="font-bold text-gray-900 mb-2">Consent to Share Results</p>
                <p className="text-sm text-gray-700">
                  I agree to share my assessment results with the school's guidance office. This will help
                  counselors provide better support and identify students who may need additional resources.
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Your name will only be visible to authorized counselors if you provide consent.
                </p>
              </label>
            </div>
          </div>
        )}

        {/* Question Numbers Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mt-8">
          {ASSESSMENT_QUESTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              disabled={answers[idx] === null}
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
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}

export default AssessmentPage
