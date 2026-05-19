import React, { useState, useEffect } from 'react'
import { AdminLayout } from '../components/Layout'
import { getAllAssessments } from '../utils/databaseUtils'
import { Search } from 'lucide-react'

const AdminAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStressLevel, setFilterStressLevel] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchAssessments = async () => {
      const { assessments: data } = await getAllAssessments(filterStressLevel || null)
      setAssessments(data || [])
      setLoading(false)
    }

    setLoading(true)
    fetchAssessments()
  }, [filterStressLevel])

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      !searchTerm ||
      (assessment.users?.name?.toLowerCase().includes(searchLower) ||
        assessment.users?.email?.toLowerCase().includes(searchLower) ||
        assessment.stress_level.toLowerCase().includes(searchLower))
    )
  })

  const stressLevelColor = {
    Low: 'bg-green-100 text-green-800',
    Mild: 'bg-yellow-100 text-yellow-800',
    Moderate: 'bg-orange-100 text-orange-800',
    High: 'bg-red-100 text-red-800',
  }

  return (
    <AdminLayout pageTitle="Student Assessments">
      <p className="text-gray-600 mb-8">View and filter student assessment submissions.</p>
      {/* Filters */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name or Email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="John Doe or john@email.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Stress Level Filter */}
          <div>
            <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Stress Level
            </label>
            <select
              id="stressLevel"
              value={filterStressLevel}
              onChange={(e) => setFilterStressLevel(e.target.value)}
              className="input-field"
            >
              <option value="">All Levels</option>
              <option value="Low">Low</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-700 font-medium">
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </p>
      </div>

      {/* Assessments Table */}
      {loading ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No assessments found matching your criteria.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-900">Student Name</th>
                <th className="text-left px-4 py-3 font-bold text-gray-900">Email</th>
                <th className="text-center px-4 py-3 font-bold text-gray-900">Score</th>
                <th className="text-center px-4 py-3 font-bold text-gray-900">Percentage</th>
                <th className="text-center px-4 py-3 font-bold text-gray-900">Stress Level</th>
                <th className="text-left px-4 py-3 font-bold text-gray-900">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {assessment.users?.name || 'Anonymous'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">{assessment.users?.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-center text-gray-900 font-medium">{assessment.score}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-orange-600">{assessment.percentage}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        stressLevelColor[assessment.stress_level]
                      }`}
                    >
                      {assessment.stress_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Privacy Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-2">Data Privacy Notice:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Only assessments with student consent are displayed.</li>
          <li>Student names are anonymized if consent was not given.</li>
          <li>All data must be handled confidentially per school policy.</li>
          <li>Export or sharing of this data requires proper authorization.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

export default AdminAssessmentsPage
