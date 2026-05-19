import React, { useState, useEffect } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { logMood, getUserMoodHistory } from '../utils/databaseUtils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Smile } from 'lucide-react'

const MoodTrackerPage = () => {
  const { user } = useAuth()
  const [moodScore, setMoodScore] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [moodHistory, setMoodHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const moodEmojis = [
    { score: 1, emoji: '😢', label: 'Very Bad' },
    { score: 2, emoji: '😟', label: 'Bad' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '🙂', label: 'Good' },
    { score: 5, emoji: '😄', label: 'Great' },
  ]

  // Load mood history on mount
  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (user) {
        const { moods } = await getUserMoodHistory(user.id, 30)
        if (moods) {
          const chartData = moods.map((mood) => ({
            date: new Date(mood.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            mood: mood.mood_score,
            timestamp: new Date(mood.created_at),
          }))
          setMoodHistory(chartData)
        }
        setHistoryLoading(false)
      }
    }

    fetchMoodHistory()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (moodScore === null) {
      setError('Please select your current mood')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await logMood(user.id, moodScore, notes)

      if (!result.success) {
        setError(result.error || 'Failed to log mood')
        setLoading(false)
        return
      }

      setSuccess('Mood logged successfully!')
      setMoodScore(null)
      setNotes('')

      // Refresh mood history
      const { moods } = await getUserMoodHistory(user.id, 30)
      if (moods) {
        const chartData = moods.map((mood) => ({
          date: new Date(mood.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          mood: mood.mood_score,
        }))
        setMoodHistory(chartData)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout pageTitle="Mood Tracker">
      {/* How Are You Feeling Section */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How are you feeling right now?</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Mood Selection */}
          <div className="mb-8">
            <p className="text-gray-700 font-medium mb-4">Select your current mood:</p>
            <div className="flex justify-around gap-4">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.score}
                  type="button"
                  onClick={() => setMoodScore(mood.score)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                    moodScore === mood.score
                      ? 'bg-teal-100 border-2 border-teal-600 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Add a note about how you're feeling (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind? What triggered this mood? What helped?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 resize-none"
              rows="4"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || moodScore === null}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging Mood...' : 'Log My Mood'}
          </button>
        </form>
      </div>

      {/* Mood History Chart */}
      {moodHistory.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mood History (Last 30 Days)</h2>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip
                  formatter={(value) => {
                    const labels = { 1: 'Very Bad', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Great' }
                    return labels[value] || value
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Mood Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Latest Mood</p>
              <p className="text-2xl">{moodEmojis[moodHistory[moodHistory.length - 1].mood - 1]?.emoji}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Average Mood</p>
              <p className="text-2xl font-bold text-teal-600">
                {(moodHistory.reduce((sum, m) => sum + m.mood, 0) / moodHistory.length).toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Days Tracked</p>
              <p className="text-2xl font-bold text-teal-600">{moodHistory.length}</p>
            </div>
          </div>
        </div>
      )}

      {historyLoading && (
        <div className="card text-center">
          <p className="text-gray-600">Loading mood history...</p>
        </div>
      )}

      {!historyLoading && moodHistory.length === 0 && (
        <div className="card border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-4">
            <Smile className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-bold text-yellow-900">Start Tracking Your Mood</h3>
              <p className="text-yellow-800 text-sm">
                Log your mood daily to see patterns and trends in your emotional well-being.
              </p>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}

export default MoodTrackerPage
