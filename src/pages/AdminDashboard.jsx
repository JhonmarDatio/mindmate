import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { getDashboardStats, getData } from '../utils/databaseUtils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, AlertTriangle, TrendingUp, Users } from 'lucide-react'

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
        
        // Fetch recent submissions
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

  const COLORS = {
    Low: '#10b981',
    Mild: '#eab308',
    Moderate: '#f97316',
    High: '#ef4444',
  }

  const getStressColor = (level) => {
    const colorMap = {
      Low: 'bg-green-100 text-green-700',
      Mild: 'bg-yellow-100 text-yellow-700',
      Moderate: 'bg-orange-100 text-orange-700',
      High: 'bg-red-100 text-red-700'
    }
    return colorMap[level] || 'bg-gray-100 text-gray-700'
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Counselor Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error loading dashboard:</p>
          <p className="text-sm">{error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout pageTitle="Admin Dashboard">
      <p className="text-gray-600 mb-8">Overview of student mental health assessment data.</p>

      {/* Quick Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Assessments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Assessments</p>
              <p className="text-4xl font-bold text-gray-900">{loading ? '-' : stats?.totalAssessments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Students at Risk */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Students at Risk</p>
              <p className="text-4xl font-bold text-gray-900">{loading ? '-' : stats?.stressDistribution.High || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Low Stress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stress</p>
              <p className="text-4xl font-bold text-gray-900">{loading ? '-' : stats?.stressDistribution.Low || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Consented */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Consented</p>
              <p className="text-4xl font-bold text-gray-900">{loading ? '-' : stats?.totalStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stress Level Distribution and Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stress Level Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Stress Level Distribution</h3>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading data...</p>
          ) : pieData.length > 0 ? (
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={2}
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
          ) : (
            <p className="text-gray-500 text-center py-8">No assessment data available yet</p>
          )}
          
          {/* Legend */}
          {pieData.length > 0 && (
            <div className="mt-6 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name] }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Submissions</h3>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentSubmissions.map((submission, index) => {
                const stressLevel = submission.stress_level
                const percentage = submission.percentage || 0
                const colorClass = getStressColor(stressLevel)
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {submission.anonymous ? 'Anonymous' : `Student ${submission.user_id?.substring(0, 8) || 'Unknown'}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()} {new Date(submission.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded whitespace-nowrap ${colorClass}`}>
                      {percentage}% {stressLevel}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          )}
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 flex gap-3">
        <div className="text-blue-600 flex-shrink-0 mt-0.5">ℹ️</div>
        <p>This dashboard is a support tool only. Assessment results are for reference in face-to-face consultations. Final assessment and intervention must be done by a qualified counselor.</p>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
