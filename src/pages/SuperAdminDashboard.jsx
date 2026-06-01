import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SuperAdminLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, getDashboardStats, getSystemAnalytics } from '../utils/databaseUtils'
import {
  ShieldCheck, UserCog, Users, Activity,
  TrendingUp, AlertTriangle,
  ClipboardList, MessageSquare, Info,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const SuperAdminDashboard = () => {
  const { profile } = useAuth()

  const [stats, setStats] = useState({
    totalUsers: 0, students: 0, counselors: 0,
    totalAssessments: 0, highRisk: 0, chatLogs: 0,
  })
  const [usageData, setUsageData]   = useState([])
  const [distribution, setDistribution] = useState({ Low: 0, Mild: 0, Moderate: 0, High: 0 })
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [{ users }, { stats: dashStats }, { usageData: ud }] =
        await Promise.all([getAllUsers(), getDashboardStats(), getSystemAnalytics()])

      const userList = users || []
      const dist     = dashStats?.stressDistribution || {}

      setStats({
        totalUsers:       userList.length,
        students:         userList.filter((u) => u.role === 'student').length,
        counselors:       userList.filter((u) => u.role === 'counselor').length,
        totalAssessments: dashStats?.totalAssessments || 0,
        highRisk:         dist.High || 0,
        chatLogs:         dashStats?.chatLogs || 0,
      })
      setDistribution(dist)
      setUsageData((ud || []).filter((d) => d.assessments + d.moods + d.chats > 0))
      setLoading(false)
    }
    fetch()
  }, [])

  const statCards = [
    { label: 'Total Users',       value: stats.totalUsers,       icon: Users,         color: 'bg-blue-50 text-blue-500' },
    { label: 'Students',          value: stats.students,         icon: Activity,      color: 'bg-teal-50 text-teal-500' },
    { label: 'Counselors',        value: stats.counselors,       icon: TrendingUp,    color: 'bg-purple-50 text-purple-500' },
    { label: 'High-Risk Cases',   value: stats.highRisk,         icon: AlertTriangle, color: 'bg-red-50 text-red-500' },
    { label: 'Total Assessments', value: stats.totalAssessments, icon: ClipboardList, color: 'bg-orange-50 text-orange-500' },
    { label: 'Chat Logs',         value: stats.chatLogs,         icon: MessageSquare, color: 'bg-indigo-50 text-indigo-500' },
  ]

  const COLORS = {
    Low:      '#10b981',
    Mild:     '#eab308',
    Moderate: '#f97316',
    High:     '#ef4444',
  }

  const pieData = ['Low', 'Mild', 'Moderate', 'High']
    .map((l) => ({ name: l, value: distribution[l] || 0 }))
    .filter((d) => d.value > 0)

  // Intervention rate ring segments
  const total = 0

  return (
    <SuperAdminLayout pageTitle="System Management">
      <p className="text-gray-500 text-sm mb-8 -mt-2">
        Full system configuration and monitoring for MindMate.
      </p>

      {/* Welcome banner */}
      <div className="mb-8 p-5 bg-gray-900 rounded-2xl flex items-center gap-4 text-white shadow-md">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-lg">Welcome, {profile?.user_metadata?.name || 'Admin'}</p>
          <p className="text-gray-400 text-sm mt-0.5">
            You have full system access. Changes made here affect all users immediately.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : card.value}
            </p>
            <p className="text-gray-400 text-[11px] mt-0.5 leading-tight">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── 2-col: Intervention Rate + Usage Graph ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Risk Level Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 text-sm mb-1">Risk Level Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Overall stress levels across all assessments.</p>

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">Loading...</p>
          ) : pieData.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No assessment data yet.</p>
          ) : (
            <>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 border-t border-gray-50 pt-3">
                {['Low', 'Mild', 'Moderate', 'High'].map((level) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[level] }} />
                      <span className="text-xs text-gray-600 font-medium">{level}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{distribution[level] || 0}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* System Usage Graph */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 text-sm mb-1">System Usage (Last 30 Days)</h3>
          <p className="text-xs text-gray-400 mb-5">
            Daily activity across assessments, mood logs, and chat sessions.
          </p>

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">Loading chart...</p>
          ) : usageData.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No activity in the last 30 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={usageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="assessments" name="Assessments" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="moods"       name="Mood Logs"   fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="chats"       name="Chats"       fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This panel is restricted to system administrators only. All configuration changes are applied immediately and are subject to institutional data governance policies.
        </p>
      </div>
    </SuperAdminLayout>
  )
}

export default SuperAdminDashboard
