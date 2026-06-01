import React, { useState, useEffect } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { logMood, getUserMoodHistory, getUserAssessments } from '../utils/databaseUtils'
import { DOMAIN_META } from '../utils/assessmentUtils'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Smile, Frown, Meh, Laugh, TrendingUp, AlertTriangle, BarChart2 } from 'lucide-react'

// ── Only 4 domains shown on the chart ────────────────────────
const CHART_DOMAINS = [
  { key: 'stress',     label: 'Stress',     color: '#ef4444' },
  { key: 'anxiety',    label: 'Anxiety',    color: '#f97316' },
  { key: 'depression', label: 'Depression', color: '#8b5cf6' },
  { key: 'sleep',      label: 'Sleep',      color: '#3b82f6' },
]

// ── Build chart data from assessment history ──────────────────
const buildDomainChartData = (assessments) => {
  return assessments
    .filter((a) => a.domain_scores)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((a) => {
      const date = new Date(a.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric',
      })
      const point = { date }
      CHART_DOMAINS.forEach(({ key }) => {
        point[key] = a.domain_scores[key] ?? null
      })
      return point
    })
}

// ── Custom tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs min-w-[160px]">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {sorted.map((p) => (
        p.value != null && (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-gray-600">{p.name}</span>
            </div>
            <span className="font-bold text-gray-800">{p.value}%</span>
          </div>
        )
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────
const MoodTrackerPage = () => {
  const { user } = useAuth()

  const [moodScore, setMoodScore]           = useState(null)
  const [notes, setNotes]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [success, setSuccess]               = useState('')
  const [error, setError]                   = useState('')
  const [domainChartData, setDomainChartData] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [topDomain, setTopDomain]           = useState(null)
  const [latestStressLevel, setLatestStressLevel] = useState(null)
  const [activeTab, setActiveTab]           = useState('domains') // 'domains' | 'mood'
  const [moodHistory, setMoodHistory]       = useState([])

  const moodEmojis = [
    { score: 5, label: 'Great',    icon: Laugh },
    { score: 4, label: 'Good',     icon: Smile },
    { score: 3, label: 'Neutral',  icon: Meh   },
    { score: 2, label: 'Bad',      icon: Frown },
    { score: 1, label: 'Very Bad', icon: Frown },
  ]

  const loadData = async () => {
    if (!user) return
    const [{ moods }, { assessments }] = await Promise.all([
      getUserMoodHistory(user.id, 60),
      getUserAssessments(user.id),
    ])

    const assessmentList = assessments || []
    const moodList = moods || []

    // Domain chart — from assessments
    setDomainChartData(buildDomainChartData(assessmentList))

    // Mood chart — from mood logs
    const moodData = [...moodList]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((m) => ({
        date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: m.mood_score,
      }))
    setMoodHistory(moodData)

    // Latest assessment info
    if (assessmentList.length > 0) {
      const latest = assessmentList[0]
      setLatestStressLevel(latest.stress_level)
      if (latest.domain_scores) {
        const entries = Object.entries(latest.domain_scores)
        if (entries.length > 0) {
          const top = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
          setTopDomain({ domain: top[0], percentage: top[1] })
        }
      }
    }

    setHistoryLoading(false)
  }

  useEffect(() => { loadData() }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (moodScore === null) { setError('Please select your current mood'); return }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const result = await logMood(user.id, moodScore, notes)
      if (!result.success) { setError(result.error || 'Failed to log mood'); return }
      setSuccess('Mood logged successfully!')
      setMoodScore(null)
      setNotes('')
      await loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const stressColor = {
    High: '#ef4444', Moderate: '#f97316', Mild: '#eab308', Low: '#10b981',
  }[latestStressLevel] || '#94a3b8'

  return (
    <StudentLayout pageTitle="Mood Tracker">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-teal-700 text-2xl font-bold">
            <Smile className="w-7 h-7" />
            <h2>Mood Tracker</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Log your mood and track your mental health domains over time.
          </p>
        </div>

        {/* Latest assessment banner */}
        {latestStressLevel && (
          <div className={`mb-5 flex items-center gap-3 p-4 rounded-2xl border ${
            latestStressLevel === 'High'     ? 'bg-red-50 border-red-200' :
            latestStressLevel === 'Moderate' ? 'bg-orange-50 border-orange-200' :
            latestStressLevel === 'Mild'     ? 'bg-yellow-50 border-yellow-200' :
                                               'bg-green-50 border-green-200'
          }`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stressColor + '22' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: stressColor }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">
                Latest Assessment: <span style={{ color: stressColor }}>{latestStressLevel} Stress</span>
              </p>
              {topDomain && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Highest concern: <span className="font-semibold text-gray-700">
                    {DOMAIN_META[topDomain.domain]?.label || topDomain.domain}
                  </span> at <span style={{ color: stressColor }}>{topDomain.percentage}%</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        {/* Mood input */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-md font-semibold text-gray-900 mb-6">How are you feeling right now?</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center items-center gap-6 md:gap-8 mb-8">
              {moodEmojis.map((mood) => {
                const MoodIcon = mood.icon
                const isSelected = moodScore === mood.score
                return (
                  <button key={mood.score} type="button" onClick={() => setMoodScore(mood.score)}
                    className="flex flex-col items-center gap-2 group focus:outline-none">
                    <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${isSelected
                        ? 'bg-amber-400 border-amber-500 text-gray-900 scale-110 shadow-md ring-4 ring-amber-100'
                        : 'bg-amber-50 border-amber-300 text-gray-700 group-hover:scale-105 group-hover:border-amber-400'}`}>
                      <MoodIcon className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {mood.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mb-6">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 resize-none transition-all"
                rows="3" />
            </div>
            <button type="submit" disabled={loading || moodScore === null}
              className={`w-full py-3 rounded-xl font-medium text-white text-sm transition-all duration-200
                ${moodScore !== null ? 'bg-teal-600 hover:bg-teal-700 shadow-sm' : 'bg-teal-200 cursor-not-allowed text-teal-500/80'}`}>
              {loading ? 'Logging Mood...' : 'Log My Mood'}
            </button>
          </form>
        </div>

        {/* Charts section */}
        {!historyLoading && (domainChartData.length > 0 || moodHistory.length > 0) && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
              <button
                onClick={() => setActiveTab('domains')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'domains'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Domain Trends
              </button>
              <button
                onClick={() => setActiveTab('mood')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'mood'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mood Log
              </button>
            </div>

            {/* ── DOMAIN TRENDS TAB ── */}
            {activeTab === 'domains' && (
              <>
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-1">
                  <BarChart2 className="w-4 h-4 text-teal-600" />
                  Mental Health Domain Trends
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Each point = one assessment submission. See how each domain changes over time.
                </p>

                {domainChartData.length < 2 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    Take at least 2 assessments to see your trends over time.
                  </div>
                ) : (
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={domainChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                          dy={8}
                        />
                        <YAxis
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                          width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                          iconType="circle"
                          iconSize={10}
                          formatter={(value) => {
                            const d = CHART_DOMAINS.find((x) => x.key === value)
                            return <span style={{ color: '#374151', fontWeight: 600 }}>{d?.label || value}</span>
                          }}
                        />
                        {CHART_DOMAINS.map(({ key, color }) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={key}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, stroke: '#fff', strokeWidth: 2.5, r: 5 }}
                            activeDot={{ fill: color, stroke: '#fff', strokeWidth: 2.5, r: 7 }}
                            connectNulls
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Domain color legend */}
                <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-50 pt-3">
                  {CHART_DOMAINS.map(({ key, label, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── MOOD LOG TAB ── */}
            {activeTab === 'mood' && (
              <>
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-1">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  Daily Mood Log
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Your manually logged mood scores over the last 60 days.
                </p>

                {moodHistory.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    No mood logs yet. Log your mood above to start tracking.
                  </div>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                          dy={6}
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => ({ 1: 'VBad', 2: 'Bad', 3: 'OK', 4: 'Good', 5: 'Great' }[v] || v)}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                          formatter={(v) => [({ 1: 'Very Bad', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Great' }[v] || v), 'Mood']}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          name="Mood"
                          stroke="#0d9488"
                          strokeWidth={2.5}
                          dot={{ fill: '#0d9488', stroke: '#fff', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {historyLoading && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Loading history...
          </div>
        )}

        {/* Empty state */}
        {!historyLoading && domainChartData.length === 0 && moodHistory.length === 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <Smile className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Start Tracking</h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                Take an assessment to see your domain trends, or log your mood above to start the mood log.
              </p>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  )
}

export default MoodTrackerPage
