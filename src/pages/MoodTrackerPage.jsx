import React, { useState, useEffect } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { logMood, getUserMoodHistory } from '../utils/databaseUtils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Smile, Frown, Meh, Laugh, TrendingUp } from 'lucide-react'

const MoodTrackerPage = () => {
  const { user } = useAuth()
  const [moodScore, setMoodScore] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [moodHistory, setMoodHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Inayos mula Great (5) pababa ng Very Bad (1) para maunang makita ang magagandang mukha sa kaliwa
  const moodEmojis = [
    { score: 5, label: 'Great', icon: Laugh },
    { score: 4, label: 'Good', icon: Smile },
    { score: 3, label: 'Neutral', icon: Meh },
    { score: 2, label: 'Bad', icon: Frown },
    { score: 1, label: 'Very Bad', icon: Frown },
  ]

  // Helper para sa pag-convert ng score papuntang text label sa Y-Axis at Tooltip
  const getMoodLabel = (score) => {
    const labels = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }
    return labels[score] || score
  }

  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (user) {
        const { moods } = await getUserMoodHistory(user.id, 30)
        if (moods && moods.length > 0) {
          // Naka-sort mula sa pinakamatanda (kaliwa) papunta sa pinakabago (kanan) para sa graph timeline
          const sortedMoods = [...moods].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          
          const chartData = sortedMoods.map((mood) => ({
            date: new Date(mood.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            mood: mood.mood_score,
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

      const { moods } = await getUserMoodHistory(user.id, 30)
      if (moods && moods.length > 0) {
        const sortedMoods = [...moods].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        
        const chartData = sortedMoods.map((mood) => ({
          date: new Date(mood.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          mood: mood.mood_score,
        }))
        setMoodHistory(chartData)
      }

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout pageTitle="Mood Tracker">
      <div className="max-w-3xl mx-auto px-4 py-6">
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-teal-700 text-2xl font-bold">
            <Smile className="w-7 h-7" />
            <h2>Mood Tracker</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">Check in with yourself. How are you feeling today?</p>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}

        {/* CARD 1: MOOD INPUT FORM */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-6">How are you feeling right now?</h3>

          <form onSubmit={handleSubmit}>
            {/* Mood Buttons Grid - Naka-order na mula Great hanggang Very Bad */}
            <div className="flex justify-center items-center gap-6 md:gap-8 mb-8">
              {moodEmojis.map((mood) => {
                const MoodIcon = mood.icon
                const isSelected = moodScore === mood.score
                
                return (
                  <button
                    key={mood.score}
                    type="button"
                    onClick={() => setMoodScore(mood.score)}
                    className="flex flex-col items-center gap-2 group focus:outline-none"
                  >
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 
                      ${isSelected 
                        ? 'bg-amber-400 border-amber-500 text-gray-900 scale-110 shadow-md ring-4 ring-amber-100' 
                        : 'bg-amber-50 border-amber-300 text-gray-700 group-hover:scale-105 group-hover:border-amber-400'}`}
                    >
                      <MoodIcon className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {mood.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Note Textarea */}
            <div className="mb-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none transition-all"
                rows="3"
              />
            </div>

            {/* Log Mood Button */}
            <button
              type="submit"
              disabled={loading || moodScore === null}
              className={`w-full py-3 rounded-xl font-medium text-white text-sm transition-all duration-200
                ${moodScore !== null 
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-100' 
                  : 'bg-teal-200 cursor-not-allowed text-teal-500/80'}`}
            >
              {loading ? 'Logging Mood...' : 'Log My Mood'}
            </button>
          </form>
        </div>

        {/* CARD 2: MOOD HISTORY CHART */}
        {!historyLoading && moodHistory.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-teal-700 font-semibold mb-6">
              <TrendingUp className="w-5 h-5" />
              <h3>Mood History</h3>
            </div>

            {/* Mas kitang-kitang Grid Lines at Borders sa Graph area */}
            <div className="w-full h-64 pr-4 text-xs font-semibold text-gray-500">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodHistory} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.22}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Binago ang kulay at ginawang solid dasharray para kitang-kita ang guhit ng grid */}
                  <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" vertical={true} />
                  
                  <XAxis 
                    dataKey="date" 
                    tickLine={true} 
                    axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }} 
                    dy={10}
                    stroke="#64748b"
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    ticks={[1, 2, 3, 4, 5]} 
                    tickLine={true} 
                    axisLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
                    dx={-5}
                    stroke="#64748b"
                    tickFormatter={getMoodLabel}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value) => {
                      const labels = { 1: 'Very Bad', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Great' }
                      return [labels[value] || value, 'Mood']
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#0d9488"
                    strokeWidth={3} // Mas makapal na linya ng wave graph
                    fillOpacity={1}
                    fill="url(#moodGradient)"
                    dot={{ fill: '#0d9488', stroke: '#fff', strokeWidth: 2.5, r: 5.5 }}
                    activeDot={{ fill: '#0d9488', stroke: '#fff', strokeWidth: 2.5, r: 7.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LOADING & EMPTY STATES */}
        {historyLoading && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Loading mood history...
          </div>
        )}

        {!historyLoading && moodHistory.length === 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <Smile className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Start Tracking Your Mood</h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                Log your mood daily to see patterns and trends in your emotional well-being over time.
              </p>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  )
}

export default MoodTrackerPage