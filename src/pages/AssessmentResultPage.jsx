import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getLatestAssessment } from '../utils/databaseUtils'
import {
  getStressLevel,
  getDomainBreakdown, DOMAIN_META,
  getLevelColors, getDomainRecommendations,
  getCopingStrategies,
} from '../utils/assessmentUtils'
import {
  RotateCcw, BookOpen, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, TrendingDown,
  TrendingUp, Zap, Activity, Moon, Heart,
  Users, GraduationCap, Dumbbell, Brain,
  HelpingHand, ShieldAlert, Info,
} from 'lucide-react'

// ── level styles ──────────────────────────────────────────────
const levelBadge = {
  Low:      'bg-green-50 text-green-700 border border-green-200',
  Mild:     'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Moderate: 'bg-orange-50 text-orange-700 border border-orange-200',
  High:     'bg-red-50 text-red-700 border border-red-200',
}

const overallCard = {
  Low:      { bg: 'bg-green-50  border-green-200',  text: 'text-green-700',  icon: CheckCircle2,  iconBg: 'bg-green-100',  iconColor: 'text-green-600'  },
  Mild:     { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: TrendingDown,  iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  Moderate: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: Zap,           iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  High:     { bg: 'bg-red-50    border-red-200',    text: 'text-red-700',    icon: AlertTriangle, iconBg: 'bg-red-100',    iconColor: 'text-red-600'    },
}

const levelLabel = {
  Low: 'Low Stress', Mild: 'Mild Stress', Moderate: 'Moderate Stress', High: 'High Stress',
}

// ── domain → lucide icon ──────────────────────────────────────
const DOMAIN_ICON = {
  stress:      Zap,
  anxiety:     Activity,
  sleep:       Moon,
  emotional:   Heart,
  social:      Users,
  academic:    GraduationCap,
  physical:    Dumbbell,
  coping:      Brain,
  helpseeking: HelpingHand,
  crisis:      ShieldAlert,
}

const DOMAIN_ICON_COLOR = {
  stress:      'text-orange-500 bg-orange-50',
  anxiety:     'text-yellow-500 bg-yellow-50',
  sleep:       'text-indigo-500 bg-indigo-50',
  emotional:   'text-purple-500 bg-purple-50',
  social:      'text-blue-500   bg-blue-50',
  academic:    'text-teal-500   bg-teal-50',
  physical:    'text-green-500  bg-green-50',
  coping:      'text-pink-500   bg-pink-50',
  helpseeking: 'text-cyan-500   bg-cyan-50',
  crisis:      'text-red-500    bg-red-50',
}

// ── component ─────────────────────────────────────────────────
export default function AssessmentResultPage() {
  const { user } = useAuth()
  const location = useLocation()

  const [assessment, setAssessment]         = useState(location.state?.assessment || null)
  const [answers, setAnswers]               = useState(location.state?.answers || null)
  const [loading, setLoading]               = useState(!location.state?.assessment)
  const [domains, setDomains]               = useState([])
  const [expandedDomain, setExpandedDomain] = useState(null)

  useEffect(() => {
    if (!assessment) {
      getLatestAssessment(user.id).then(({ assessment: a }) => {
        setAssessment(a)
        setLoading(false)
      })
    }
  }, [assessment, user])

  useEffect(() => {
    if (answers) setDomains(getDomainBreakdown(answers))
  }, [answers])

  if (loading) {
    return (
      <StudentLayout pageTitle="Assessment Result">
        <div className="text-center py-10 text-gray-400 text-sm">Loading your results...</div>
      </StudentLayout>
    )
  }

  if (!assessment) {
    return (
      <StudentLayout pageTitle="Assessment Result">
        <div className="text-center text-gray-500 py-10">No assessment found.</div>
      </StudentLayout>
    )
  }

  const level      = assessment.stress_level || getStressLevel(assessment.percentage)
  const percentage = assessment.percentage || 0
  const score      = assessment.score || 0
  const strategies = getCopingStrategies(level)
  const card       = overallCard[level] || overallCard.Low
  const CardIcon   = card.icon

  const topConcerns = domains
    .filter((d) => d.level === 'Moderate' || d.level === 'High')
    .slice(0, 3)

  return (
    <StudentLayout pageTitle="Assessment Result">
      <div className="max-w-2xl mx-auto pb-12">

        {/* ── OVERALL RESULT CARD ── */}
        <div className={`rounded-2xl border ${card.bg} p-8 text-center mb-6 shadow-sm`}>
          <div className={`w-16 h-16 rounded-2xl ${card.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <CardIcon className={`w-8 h-8 ${card.iconColor}`} strokeWidth={2} />
          </div>
          <h2 className={`text-2xl font-bold ${card.text}`}>{levelLabel[level]}</h2>
          <p className="text-gray-500 text-sm mt-1">
            Score: {score} / 63 &nbsp;·&nbsp; {percentage}%
          </p>

          <div className="mt-5 w-full bg-white/60 rounded-full h-3 border border-white">
            <div
              className={`h-3 rounded-full transition-all ${getLevelColors(level).bar}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-0.5">
            <span>Low</span><span>Mild</span><span>Moderate</span><span>High</span>
          </div>
        </div>

        {/* ── DOMAIN BREAKDOWN ── */}
        {domains.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Domain Breakdown</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your scores across 7 mental health areas</p>
            </div>

            <div className="p-5 space-y-4">
              {domains.map((d) => {
                const meta    = DOMAIN_META[d.domain] || { label: d.domain }
                const colors  = getLevelColors(d.level)
                const isOpen  = expandedDomain === d.domain
                const recs    = getDomainRecommendations(d.domain, d.level)
                const DIcon   = DOMAIN_ICON[d.domain] || Activity

                return (
                  <div key={d.domain}>
                    <button
                      onClick={() => setExpandedDomain(isOpen ? null : d.domain)}
                      className="w-full text-left"
                    >
                      {/* Label row */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <DIcon className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                          <span className="text-sm font-semibold text-gray-700">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{d.percentage}%</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelBadge[d.level]}`}>
                            {d.level}
                          </span>
                          {isOpen
                            ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${colors.bar}`}
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mt-3 pl-6 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Recommendations
                        </p>
                        <ul className="space-y-1.5">
                          {recs.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-1.5" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TOP CONCERNS ── */}
        {topConcerns.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-bold text-amber-800">Areas Needing Attention</p>
            </div>
            <div className="space-y-2">
              {topConcerns.map((d) => {
                const meta  = DOMAIN_META[d.domain] || { label: d.domain }
                const DIcon = DOMAIN_ICON[d.domain] || Activity
                const iconCls = DOMAIN_ICON_COLOR[d.domain] || 'text-gray-500 bg-gray-50'
                return (
                  <div key={d.domain} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                      <DIcon className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <p className="text-xs text-amber-900 font-medium flex-1">{meta.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelBadge[d.level]}`}>
                      {d.level}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── COPING STRATEGIES ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-800 text-sm mb-4">General Coping Strategies</h3>
          <div className="space-y-2.5">
            {strategies.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-teal-700">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{item.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HIGH STRESS ALERT ── */}
        {level === 'High' && (
          <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl mb-6">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-red-600" strokeWidth={2} />
            </div>
            <p className="text-sm text-red-700">
              <strong>We care about you.</strong> Please reach out to your guidance counselor or call{' '}
              <span className="font-bold">NCMH Crisis Hotline 1553</span> for immediate support.
            </p>
          </div>
        )}

        {/* ── BUTTONS ── */}
        <div className="flex gap-3">
          <Link
            to="/assessment"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Retake
          </Link>
          <Link
            to="/coping-strategies"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition text-sm"
          >
            <BookOpen className="w-4 h-4" />
            View All Strategies
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-6">
          <Info className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] text-gray-400">
            This assessment is for educational purposes only and does not constitute a medical diagnosis.
          </p>
        </div>

      </div>
    </StudentLayout>
  )
}
