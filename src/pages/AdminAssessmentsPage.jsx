import React, { useState, useEffect } from 'react'
import { AdminLayout } from '../components/Layout'
import { getAllAssessments } from '../utils/databaseUtils'
// Siniguradong kasama ang Users sa imports galing lucide-react
import { Search, SlidersHorizontal, Users, X, BookOpen } from 'lucide-react'

const MOCK_USERS_DATABASE = {
  "usr-1": { name: "John kurby Morales", email: "johnkurby@school.edu.ph" },
  "usr-2": { name: "Ana Reyes", email: "ana.reyes@school.edu.ph" },
  "usr-3": { name: "Juan Dela Cruz", email: "juan.delacruz@school.edu.ph" },
  "usr-4": { name: "Carlo Mendoza", email: "carlo.mendoza@school.edu.ph" },
  "usr-5": { name: "Maria Santos", email: "maria.santos@school.edu.ph" },
}

const AdminAssessmentsPage = () => {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStressLevel, setFilterStressLevel] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState(null)

  useEffect(() => {
    const fetchAssessments = async () => {
      const { assessments: data } = await getAllAssessments(filterStressLevel || null)
      
      const linkedData = (data || []).map(assessment => {
        const matchedUser = MOCK_USERS_DATABASE[assessment.user_id];
        return {
          ...assessment,
          resolved_name: matchedUser ? matchedUser.name : (assessment.student_name || 'Unknown Student'),
          resolved_email: matchedUser ? matchedUser.email : (assessment.users?.email || 'N/A')
        }
      })

      setAssessments(linkedData)
      setLoading(false)
    }

    setLoading(true)
    fetchAssessments()
  }, [filterStressLevel])

  const filteredAssessments = assessments.filter((assessment) => {
    const searchLower = searchTerm.toLowerCase()
    const studentName = assessment.anonymous ? 'anonymous' : (assessment.resolved_name || '').toLowerCase()
    
    return (
      !searchTerm ||
      studentName.includes(searchLower) ||
      (assessment.stress_level || '').toLowerCase().includes(searchLower)
    )
  })

  const stressLevelColor = {
    Low: 'bg-green-50 text-green-500 border-green-100',
    Mild: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    Moderate: 'bg-orange-50 text-orange-500 border-orange-100',
    High: 'bg-red-50 text-red-400 border-red-100',
  }

  const getCopingStrategies = (level) => {
    const strategies = {
      Low: [
        "Continue maintaining a healthy sleep schedule.",
        "Engage in your favorite hobbies during free time.",
        "Practice daily gratitude mindfulness entries."
      ],
      Mild: [
        "Take short breaks between study sessions to recharge.",
        "Practice deep breathing exercises for 5 minutes daily.",
        "Create a weekly schedule to balance academics and leisure."
      ],
      Moderate: [
        "Try time management techniques like the Pomodoro method.",
        "Start a journal to express your thoughts and feelings.",
        "Talk to a trusted friend or family member about your current workload."
      ],
      High: [
        "Schedule a face-to-face priority checkup consultation with the school counselor.",
        "Practice immediate grounding and box breathing exercises under high pressure.",
        "Break large complex academic tasks into smaller, manageable micro-goals.",
        "Limit caffeine intake and prioritize getting 7-8 hours of sleep."
      ]
    }
    return strategies[level] || ["Reflect on your current tasks and take short restorative breaks."]
  }

  return (
    /* Dito natin pinalitan ng Capital 'U' (Users) para gumana ang Icon sa Header niyo */
    <AdminLayout pageTitle={
      <div className="flex items-center gap-2 text-gray-800">
        <Users className="w-6 h-6 text-emerald-600 stroke-[2]" />
        <span>Student Assessment Records</span>
      </div>
    }>
      <p className="text-gray-500 text-sm mb-6 -mt-2">View and filter student assessment submissions.</p>

      {/* Filter Block */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="relative w-full md:w-48 flex items-center">
          <SlidersHorizontal className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            id="stressLevel"
            value={filterStressLevel}
            onChange={(e) => setFilterStressLevel(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none text-gray-700 font-medium cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="Low">Low</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
          <div className="absolute right-3.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-500 w-0 h-0"></div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 w-2/5">Student</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Score</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Stress Level</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400 bg-white">
                    Loading student data records...
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400 bg-white">
                    No assessments found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((assessment, index) => {
                  const isAnonymous = assessment.anonymous === true;
                  const stressLevel = assessment.stress_level || 'Low';
                  const percentage = assessment.percentage || 0;
                  
                  const studentNameString = isAnonymous ? 'Anonymous' : assessment.resolved_name;

                  return (
                    <tr 
                      key={assessment.id || index} 
                      onClick={() => setSelectedAssessment(assessment)}
                      className="hover:bg-gray-50/80 active:bg-gray-100/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-3.5 text-sm font-semibold">
                        <span className={`group-hover:text-emerald-600 transition-colors ${
                          isAnonymous ? 'text-gray-400 italic font-medium' : 'text-gray-700 font-semibold'
                        }`}>
                          {studentNameString}
                        </span>
                      </td>
                      
                      <td className="px-6 py-3.5 text-sm text-gray-400 font-medium whitespace-nowrap">
                        {new Date(assessment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      
                      <td className="px-6 py-3.5 text-sm text-gray-800 font-bold text-center">
                        {percentage}%
                      </td>
                      
                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border min-w-[75px] text-center capitalize ${stressLevelColor[stressLevel]}`}>
                          {stressLevel.toLowerCase()}
                        </span>
                      </td>
                      
                      <td className={`px-6 py-3.5 text-sm font-semibold text-center whitespace-nowrap ${isAnonymous ? 'text-gray-300' : 'text-emerald-500'}`}>
                        {isAnonymous ? 'No' : 'Yes'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL COMPONENT */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative border border-gray-100">
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setSelectedAssessment(null);
              }}
              className="absolute right-4 top-4 p-1.5 bg-teal-50/60 text-teal-600 rounded-full hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <h3 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Assessment Details
            </h3>

            <div className="grid grid-cols-2 gap-y-4 mb-5 text-sm">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student</p>
                <p className={`font-semibold mt-0.5 ${selectedAssessment.anonymous ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                  {selectedAssessment.anonymous ? 'Anonymous' : selectedAssessment.resolved_name}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                <p className="font-medium text-gray-700 mt-0.5">
                  {new Date(selectedAssessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(selectedAssessment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                <p className="font-bold text-gray-800 mt-0.5">
                  {selectedAssessment.score !== undefined ? `${selectedAssessment.score} / 63` : `${Math.round((selectedAssessment.percentage * 63) / 100)} / 63`} ({selectedAssessment.percentage || 0}%)
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stress Level</p>
                <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border text-center capitalize ${stressLevelColor[selectedAssessment.stress_level || 'Low']}`}>
                  {(selectedAssessment.stress_level || 'Low').toLowerCase()}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs mb-2.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span>Suggested Coping Strategies</span>
              </div>
              
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                {getCopingStrategies(selectedAssessment.stress_level || 'Low').map((strategy, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-xs font-bold text-gray-400 w-4 text-right mt-0.5">{idx + 1}.</span>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{strategy}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-400 border-t border-gray-50 pt-3">
              Use these results as reference for face-to-face consultation only.
            </p>
          </div>
        </div>
      )}

      {/* Standard Footer Privacy Directive */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-400 leading-relaxed shadow-inner">
        <p className="font-bold text-gray-500 mb-1">Data Privacy Directive:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-1">
          <li>Only records backed by direct student file clearance profiles are explicitly de-anonymized.</li>
          <li>System auto-obfuscates profiles without digital consent waiver parameters.</li>
          <li>All actions within this ledger are subject to standard educational institutional privacy controls.</li>
        </ul>
      </div>
    </AdminLayout>
  )
}

export default AdminAssessmentsPage