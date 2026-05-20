import React, { useState, useEffect } from 'react'
import { AdminLayout } from '../components/Layout'
import { getAllAssessments } from '../utils/databaseUtils'
import { AlertCircle, Users, Eye, EyeOff } from 'lucide-react'

// PANSAMANTALANG MOCK DATA LINKER habang wala pa ang production database mo
const MOCK_USERS_DATABASE = {
  "usr-1": { name: "John kurby Morales", email: "johnkurby@school.edu.ph" },
  "usr-2": { name: "Ana Reyes", email: "ana.reyes@school.edu.ph" },
  "usr-3": { name: "Juan Dela Cruz", email: "juan.delacruz@school.edu.ph" },
  "usr-4": { name: "Carlo Mendoza", email: "carlo.mendoza@school.edu.ph" },
  "usr-5": { name: "Maria Santos", email: "maria.santos@school.edu.ph" },
}

const AdminRiskMonitoringPage = () => {
  const [highRiskAssessments, setHighRiskAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHighRiskData = async () => {
      // Kuhanin ang lahat ng assessments
      const { assessments: data } = await getAllAssessments(null)
      
      // I-map ang pangalan mula sa mock database gamit ang user_id
      const linkedData = (data || []).map(assessment => {
        const matchedUser = MOCK_USERS_DATABASE[assessment.user_id];
        return {
          ...assessment,
          resolved_name: matchedUser ? matchedUser.name : (assessment.student_name || 'Unknown Student'),
          resolved_email: matchedUser ? matchedUser.email : (assessment.users?.email || 'N/A')
        }
      })

      // I-FILTER: Moderate o High stress levels lamang ang ipapakita sa ledger na ito
      const filtered = linkedData.filter(
        item => item.stress_level === 'High' || item.stress_level === 'Moderate'
      )

      setHighRiskAssessments(filtered)
      setLoading(false)
    }

    setLoading(true)
    fetchHighRiskData()
  }, [])

  // Dynamic Tailwind style badges base sa na-detect na system level
  const stressLevelColor = {
    Moderate: 'bg-orange-50 text-orange-500 border-orange-100',
    High: 'bg-red-50 text-red-400 border-red-100',
  }

  return (
    <AdminLayout pageTitle={
      <div className="flex items-center gap-2 text-gray-800">
        <AlertCircle className="w-6 h-6 text-red-500 stroke-[2]" />
        <span>High-Risk Indicators</span>
      </div>
    }>
      <p className="text-gray-500 text-sm mb-6 -mt-2">
        Students with Moderate or High stress levels that may need face-to-face consultation.
      </p>

      {/* Important Warning Alert Banner */}
      <div className="mb-6 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl">
        <p className="text-amber-800 text-xs leading-relaxed font-medium">
          <strong className="text-amber-900 font-bold">Important:</strong> These flags are used ONLY as reference for face-to-face consultations. This system does NOT automatically diagnose or label students. Final assessment must be done by a qualified counselor.
        </p>
      </div>

      {/* High-Risk Assessment List Container */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          Loading high-risk indicator records...
        </div>
      ) : highRiskAssessments.length === 0 ? (
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-12 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-emerald-900 font-bold text-sm">No High-Risk Cases Detected</p>
          <p className="text-emerald-700 text-xs mt-1">
            All student submissions are currently at normal or safe stress thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {highRiskAssessments.map((assessment, index) => {
            const isAnonymous = assessment.anonymous === true
            const studentName = isAnonymous ? 'Anonymous (no consent)' : assessment.resolved_name
            const stressLevel = assessment.stress_level || 'Moderate'

            return (
              <div 
                key={assessment.id || index}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-gray-200 transition-all"
              >
                {/* Left Side: Avatar Icon and Student Info Block */}
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isAnonymous 
                      ? 'bg-red-50 border-red-100 text-red-400' 
                      : 'bg-orange-50 border-orange-100 text-orange-400'
                  }`}>
                    {isAnonymous ? <EyeOff className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${isAnonymous ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                      {studentName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-gray-400 text-xs font-medium">
                      <span>
                        {new Date(assessment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(assessment.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Score Metrics & Stress Badge */}
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-gray-800 tracking-tight">
                    {assessment.percentage || 0}%
                  </span>
                  
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border min-w-[85px] text-center capitalize ${stressLevelColor[stressLevel]}`}>
                    {stressLevel.toLowerCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recommended Standard Protocol Directive Section */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-400 leading-relaxed shadow-inner">
        <p className="font-bold text-gray-500 mb-1">Recommended Response Protocol:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-1">
          <li><strong className="text-gray-500 font-semibold">HIGH Risk Submissions:</strong> Prioritize for urgent counseling.</li>
          <li><strong className="text-gray-500 font-semibold">MODERATE Risk Submissions:</strong> Schedule standard check-in updates and provide local self-care materials.</li>
          <li>Always coordinate with school administrative workflows before initiating emergency escalations.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

export default AdminRiskMonitoringPage