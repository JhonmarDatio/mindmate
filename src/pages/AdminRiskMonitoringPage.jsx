import React, { useState, useEffect } from 'react'
import { AdminLayout } from '../components/Layout'
import { getHighRiskMessages } from '../utils/databaseUtils'
import { AlertCircle } from 'lucide-react'

const AdminRiskMonitoringPage = () => {
  const [riskMessages, setRiskMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' or 'recent'

  useEffect(() => {
    const fetchRiskMessages = async () => {
      const { riskMessages: data } = await getHighRiskMessages()
      setRiskMessages(data || [])
      setLoading(false)
    }

    fetchRiskMessages()
  }, [])

  const filteredMessages =
    filter === 'recent'
      ? riskMessages.slice(0, 10)
      : riskMessages

  const getRiskSeverity = (message) => {
    const lowerMessage = message.toLowerCase()
    if (
      lowerMessage.includes('want to die') ||
      lowerMessage.includes('want to end my life') ||
      lowerMessage.includes('kill myself') ||
      lowerMessage.includes('suicide')
    ) {
      return 'CRITICAL'
    }
    if (
      lowerMessage.includes('harm') ||
      lowerMessage.includes('cut') ||
      lowerMessage.includes('no point living')
    ) {
      return 'HIGH'
    }
    return 'ALERT'
  }

  const severityColor = {
    CRITICAL: 'bg-red-100 border-red-300 text-red-900',
    HIGH: 'bg-orange-100 border-orange-300 text-orange-900',
    ALERT: 'bg-yellow-100 border-yellow-300 text-yellow-900',
  }

  const severityBadgeColor = {
    CRITICAL: 'bg-red-600 text-white',
    HIGH: 'bg-orange-600 text-white',
    ALERT: 'bg-yellow-600 text-white',
  }

  return (
    <AdminLayout pageTitle="High-Risk Monitoring">
      {/* Warning Banner */}
      <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Crisis Detection System</h3>
            <p className="text-red-800 text-sm">
              This system monitors chatbot messages for crisis keywords and flags potential high-risk cases.
              Follow up immediately with any flagged students. If immediate danger is suspected, contact
              emergency services.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Messages ({riskMessages.length})
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'recent'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Recent (10)
          </button>
        </div>
      </div>

      {/* Risk Messages */}
      {loading ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">Loading risk data...</p>
        </div>
      ) : riskMessages.length === 0 ? (
        <div className="card border-2 border-green-200 bg-green-50 text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-green-900 font-medium">No High-Risk Cases Detected</p>
          <p className="text-green-800 text-sm mt-2">
            All students appear to be in a safe state. Continue monitoring.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((log, idx) => {
            const severity = getRiskSeverity(log.message)
            return (
              <div
                key={log.id}
                className={`card border-2 ${severityColor[severity]} p-4`}
              >
                <div className="flex items-start gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityBadgeColor[severity]}`}>
                    {severity}
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {log.users?.consent_status ? log.users.name : 'Anonymous Student'}
                        </h4>
                        {log.users?.consent_status && (
                          <p className="text-xs text-gray-600 mt-1">{log.users.email}</p>
                        )}
                      </div>
                      <time className="text-xs text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </time>
                    </div>

                    <div className="bg-white rounded p-3 mb-3 border-l-4 border-current">
                      <p className="text-sm font-medium mb-2 text-gray-700">Student's Message:</p>
                      <p className="text-sm text-gray-900 italic">"{log.message}"</p>
                    </div>

                    <div className="bg-white rounded p-3 border-l-4 border-current">
                      <p className="text-sm font-medium mb-2 text-gray-700">AI Response:</p>
                      <p className="text-sm text-gray-900 italic">"{log.response}"</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {log.users?.consent_status ? (
                        <>
                          <a
                            href={`mailto:${log.users.email}`}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium"
                          >
                            Email Student
                          </a>
                          <button className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded font-medium">
                            Schedule Counseling
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-600 italic">
                          Student identity not available (no consent given)
                        </p>
                      )}
                      <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded font-medium">
                        Mark as Addressed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Emergency Resources */}
      <div className="mt-8 card border-2 border-red-200 bg-red-50">
        <h3 className="text-lg font-bold text-red-900 mb-4">Emergency Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-4 border-l-4 border-red-600">
            <p className="font-bold text-red-900">National Suicide Prevention Lifeline </p>
            <p className="text-lg font-bold text-red-600 mt-1">988</p>
            <p className="text-xs text-gray-600 mt-2">Call or text anytime, day or night</p>
          </div>
          <div className="bg-white rounded p-4 border-l-4 border-red-600">
            <p className="font-bold text-red-900">Crisis Text Line </p>
            <p className="text-lg font-bold text-red-600 mt-1">Text HOME to 741741</p>
            <p className="text-xs text-gray-600 mt-2">Text-based crisis support</p>
          </div>
          <div className="bg-white rounded p-4 border-l-4 border-red-600">
            <p className="font-bold text-red-900">Emergency Services</p>
            <p className="text-lg font-bold text-red-600 mt-1">911  or Local Emergency</p>
            <p className="text-xs text-gray-600 mt-2">For immediate life-threatening situations</p>
          </div>
          <div className="bg-white rounded p-4 border-l-4 border-red-600">
            <p className="font-bold text-red-900">School Crisis Protocol</p>
            <p className="text-lg font-bold text-red-600 mt-1">Contact Administration</p>
            <p className="text-xs text-gray-600 mt-2">Follow your school's crisis management procedures</p>
          </div>
        </div>
      </div>

      {/* Protocol Guidelines */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-3">Recommended Response Protocol:</p>
        <ol className="list-decimal list-inside space-y-2 text-xs">
          <li>
            <strong>CRITICAL Risk:</strong> Immediately contact student, parent/guardian, and school administration.
            Consider emergency services referral.
          </li>
          <li>
            <strong>HIGH Risk:</strong> Schedule urgent counseling session within 24 hours. Monitor student closely.
          </li>
          <li>
            <strong>ALERT:</strong> Schedule standard counseling appointment. Provide resources and support.
          </li>
          <li>Document all interventions and follow-ups for student records.</li>
          <li>
            Maintain confidentiality while ensuring student safety is the priority.
          </li>
        </ol>
      </div>
    </AdminLayout>
  )
}

export default AdminRiskMonitoringPage
