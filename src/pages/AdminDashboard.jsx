import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getData } from '../utils/databaseUtils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, AlertTriangle, TrendingUp, Users, Eye, EyeOff } from 'lucide-react'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { stats: dashboardStats, error: statsError } = await getDashboardStats()
        
        if (statsError) {
          setError(statsError)
          setStats(null)
        } else {
          setStats(dashboardStats)
        }
        
        const assessments = getData('assessments') || []
        const sortedAssessments = assessments
          .filter(a => a && a.created_at && a.stress_level)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
        
        setRecentSubmissions(sortedAssessments)
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const pieData = stats
    ? [
        { name: 'Low', value: stats.stressDistribution.Low || 0 },
        { name: 'Mild', value: stats.stressDistribution.Mild || 0 },
        { name: 'Moderate', value: stats.stressDistribution.Moderate || 0 },
        { name: 'High', value: stats.stressDistribution.High || 0 },
      ].filter((item) => item.value > 0)
    : []

  // Sakto sa kulay ng dinala mong UI dashboard screenshot
  const COLORS = {
    Low: '#10b981',      // Green
    Mild: '#eab308',     // Yellow/Orange
    Moderate: '#f97316', // Orange Dark
    High: '#ef4444',     // Red
  }

  // Soft background pills para sa listahan sa kanan
  const getStressColor = (level) => {
    const colorMap = {
      Low: 'bg-green-50 text-green-500 border-green-100',
      Mild: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      Moderate: 'bg-orange-50 text-orange-500 border-orange-100',
      High: 'bg-red-50 text-red-400 border-red-100'
    }
    return colorMap[level] || 'bg-gray-50 text-gray-500 border-gray-100'
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Counselor Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <p className="font-semibold">Error loading dashboard:</p>
          <p className="text-sm">{error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout pageTitle="Counselor Dashboard">
      <p className="text-gray-500 text-sm mb-8 -mt-2">Overview of student mental health assessment data.</p>

      {/* Quick Stats - 4 Columns Layout na may square indicators sa taas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Assessments */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-[#e6f7f4] rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-[#00a884]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stats?.totalAssessments || 0}</p>
          <p className="text-gray-400 text-xs mt-1">Total Assessments</p>
        </div>

        {/* Students at Risk */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stats?.stressDistribution?.High || 0}</p>
          <p className="text-gray-400 text-xs mt-1">Students at Risk</p>
        </div>

        {/* Low Stress */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stats?.stressDistribution?.Low || 0}</p>
          <p className="text-gray-400 text-xs mt-1">Low Stress</p>
        </div>

        {/* Consented */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '-' : stats?.totalStudents || 0}</p>
          <p className="text-gray-400 text-xs mt-1">Consented</p>
        </div>

      </div>

      {/* 2-Column Split Section for Distribution and Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Stress Level Distribution (Donut Format) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[440px] flex flex-col justify-between">
          <h3 className="text-md font-bold text-gray-800">Stress Level Distribution</h3>
          
          {loading ? (
            <p className="text-gray-400 text-center py-8 my-auto text-sm">Loading Chart Data...</p>
          ) : pieData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center my-4">
              <div className="w-full h-52 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}   // Mas manipis na ring para maging malinis ang donut look
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Layout na may text at color squares sa ilalim ng tsart */}
              <div className="grid grid-cols-4 gap-2 w-full text-center mt-4 border-t border-gray-50 pt-4">
                {['Low', 'Mild', 'Moderate', 'High'].map((level) => (
                  <div key={level} className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[level] }}></span>
                      <span className="text-xs font-semibold text-gray-600">{level}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold mt-0.5">
                      {stats?.stressDistribution?.[level] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 my-auto text-sm">No assessment records found</p>
          )}
        </div>

        {/* Right Card: Recent Submissions Container */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[440px] flex flex-col">
          <h3 className="text-md font-bold text-gray-800 mb-4">Recent Submissions</h3>
          
          {loading ? (
            <p className="text-gray-400 text-center py-8 my-auto text-sm">Loading Submissions...</p>
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
              {recentSubmissions.map((submission, index) => {
                const stressLevel = submission.stress_level
                const percentage = submission.percentage || 0
                const colorClass = getStressColor(stressLevel)
                const isAnonymous = submission.anonymous === true
                
                // Fallback structure para sa rendering ng name string
                const displayStudentName = isAnonymous 
                  ? 'Anonymous' 
                  : (submission.student_name || submission.user_name || `Student ${submission.user_id?.substring(0, 6) || 'Unknown'}`)

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-3">
                      {isAnonymous ? (
                        <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-50 rounded-full flex-shrink-0">
                          <Eye className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${isAnonymous ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                          {displayStudentName}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                          {new Date(submission.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(submission.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    
                    {/* Percentage at dynamic label badging */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-400">{percentage}%</span>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border min-w-[75px] text-center capitalize ${colorClass}`}>
                        {stressLevel.toLowerCase()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 my-auto text-sm">No student submissions available</p>
          )}
        </div>

      </div>

      {/* Static bottom layout information note disclaimer */}
      <div className="mt-6 p-4 bg-[#f8fafc] border border-gray-100 rounded-xl text-xs text-gray-400 flex items-start gap-2.5 shadow-sm">
        <span className="text-sm -mt-0.5">ℹ️</span>
        <p className="leading-relaxed">This dashboard is a support tool only. Assessment results are for reference in face-to-face consultations. Final assessment and intervention must be done by a qualified counselor.</p>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard