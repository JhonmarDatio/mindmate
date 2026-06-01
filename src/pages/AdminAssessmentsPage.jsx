import { useState, useEffect } from 'react'
import { CounselorLayout } from '../components/Layout'
import { getAllAssessments, markInterventionDone } from '../utils/databaseUtils'
import { Search, SlidersHorizontal, Users, X, BookOpen, CheckCircle2, Filter } from 'lucide-react'

const stressLevelColor = {
  Low:      'bg-green-50 text-green-500 border-green-100',
  Mild:     'bg-yellow-50 text-yellow-600 border-yellow-100',
  Moderate: 'bg-orange-50 text-orange-500 border-orange-100',
  High:     'bg-red-50 text-red-400 border-red-100',
}

const getCopingStrategies = (level) => {
  const strategies = {
    Low:      ['Continue maintaining a healthy sleep schedule.', 'Engage in your favorite hobbies during free time.', 'Practice daily gratitude mindfulness entries.'],
    Mild:     ['Take short breaks between study sessions to recharge.', 'Practice deep breathing exercises for 5 minutes daily.', 'Create a weekly schedule to balance academics and leisure.'],
    Moderate: ['Try time management techniques like the Pomodoro method.', 'Start a journal to express your thoughts and feelings.', 'Talk to a trusted friend or family member about your current workload.'],
    High:     ['Schedule a face-to-face priority checkup consultation with the school counselor.', 'Practice immediate grounding and box breathing exercises under high pressure.', 'Break large complex academic tasks into smaller, manageable micro-goals.', 'Limit caffeine intake and prioritize getting 7-8 hours of sleep.'],
  }
  return strategies[level] || ['Reflect on your current tasks and take short restorative breaks.']
}

const AdminAssessmentsPage = () => {
  const [assessments, setAssessments]             = useState([])
  const [loading, setLoading]                     = useState(true)
  const [filterStressLevel, setFilterStressLevel] = useState('')
  const [showDone, setShowDone]                   = useState(false)
  const [searchTerm, setSearchTerm]               = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [markingId, setMarkingId]                 = useState(null)
  const [successMsg, setSuccessMsg]               = useState('')

  const fetchAssessments = async () => {
    setLoading(true)
    const { assessments: data, error } = await getAllAssessments(filterStressLevel || null)
    if (!error) setAssessments(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAssessments() }, [filterStressLevel])

  const handleMarkDone = async (e, assessment) => {
    e.stopPropagation()
    setMarkingId(assessment.id)
    const { success, error } = await markInterventionDone(assessment.id)
    if (success) {
      // Update local state immediately — Supabase is now the source of truth
      setAssessments((prev) => prev.map((a) =>
        a.id === assessment.id ? { ...a, intervention_done: true } : a
      ))
      setSelectedAssessment(null)
      setSuccessMsg(`Intervention marked as done for ${assessment.student_name || 'student'}.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setSuccessMsg(`Error: ${error}`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
    setMarkingId(null)
  }

  // Split into active (not done) and completed (done)
  const activeAssessments    = assessments.filter((a) => !a.intervention_done)
  const completedAssessments = assessments.filter((a) => a.intervention_done)
  const displayList          = showDone ? completedAssessments : activeAssessments

  const filteredAssessments = displayList.filter((a) => {
    const q = searchTerm.toLowerCase()
    const name = (a.consent_status ? (a.student_name || '') : 'anonymous').toLowerCase()
    return !searchTerm || name.includes(q) || (a.stress_level || '').toLowerCase().includes(q)
  })

  return (
    <CounselorLayout pageTitle={
      <div className="flex items-center gap-2 text-gray-800">
        <Users className="w-6 h-6 text-emerald-600 stroke-[2]" />
        <span>Student Assessment Records</span>
      </div>
    }>
      <p className="text-gray-500 text-sm mb-6 -mt-2">View, filter, and manage student assessment submissions.</p>

      {/* Success toast */}
      {successMsg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium border ${
          successMsg.startsWith('Error')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {successMsg}
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or stress level..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Stress level filter */}
        <div className="relative w-full md:w-44 flex items-center">
          <SlidersHorizontal className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
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
        </div>

        {/* Active / Done toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
          <button
            onClick={() => setShowDone(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !showDone ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
            {activeAssessments.length > 0 && (
              <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeAssessments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowDone(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showDone ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
            {completedAssessments.length > 0 && (
              <span className="ml-1.5 bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {completedAssessments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
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
                {!showDone && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                    Loading student data records...
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-400">
                    {showDone ? 'No completed interventions yet.' : 'No active assessments found.'}
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((assessment, index) => {
                  const consented   = assessment.consent_status === true
                  const stressLevel = assessment.stress_level || 'Low'
                  const percentage  = assessment.percentage || 0
                  const studentName = consented ? (assessment.student_name || 'Unknown Student') : 'Anonymous'
                  const isDone      = assessment.intervention_done === true

                  return (
                    <tr
                      key={assessment.id || index}
                      onClick={() => setSelectedAssessment(assessment)}
                      className={`transition-colors cursor-pointer group ${
                        isDone ? 'bg-gray-50/50 opacity-70' : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <td className="px-6 py-3.5 text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          <span className={`group-hover:text-emerald-600 transition-colors ${
                            !consented ? 'text-gray-400 italic font-medium' : isDone ? 'text-gray-400 line-through' : 'text-gray-700 font-semibold'
                          }`}>
                            {studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-400 font-medium whitespace-nowrap">
                        {new Date(assessment.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-800 font-bold text-center">{percentage}%</td>
                      <td className="px-6 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border min-w-[75px] text-center capitalize ${stressLevelColor[stressLevel]}`}>
                          {stressLevel.toLowerCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-3.5 text-sm font-semibold text-center whitespace-nowrap ${consented ? 'text-emerald-500' : 'text-gray-300'}`}>
                        {consented ? 'Yes' : 'No'}
                      </td>
                      {!showDone && (
                        <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleMarkDone(e, assessment)}
                            disabled={markingId === assessment.id}
                            className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 hover:border-emerald-500 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {markingId === assessment.id ? 'Saving...' : 'Mark Done'}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative border border-gray-100">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedAssessment(null) }}
              className="absolute right-4 top-4 p-1.5 bg-teal-50/60 text-teal-600 rounded-full hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Done badge */}
            {selectedAssessment.intervention_done && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-700">Intervention completed</p>
              </div>
            )}

            <h3 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Assessment Details
            </h3>

            <div className="grid grid-cols-2 gap-y-4 mb-5 text-sm">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Student</p>
                <p className={`font-semibold mt-0.5 ${!selectedAssessment.consent_status ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                  {selectedAssessment.consent_status ? (selectedAssessment.student_name || 'Unknown Student') : 'Anonymous'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                <p className="font-medium text-gray-700 mt-0.5">
                  {new Date(selectedAssessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' • '}
                  {new Date(selectedAssessment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                <p className="font-bold text-gray-800 mt-0.5">
                  {selectedAssessment.score ?? Math.round((selectedAssessment.percentage * 63) / 100)} / 63
                  {' '}({selectedAssessment.percentage || 0}%)
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
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                {getCopingStrategies(selectedAssessment.stress_level || 'Low').map((strategy, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-gray-50/60 border border-gray-100 rounded-xl">
                    <span className="text-xs font-bold text-gray-400 w-4 text-right mt-0.5">{idx + 1}.</span>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{strategy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mark done button inside modal */}
            {!selectedAssessment.intervention_done && (
              <button
                onClick={(e) => handleMarkDone(e, selectedAssessment)}
                disabled={markingId === selectedAssessment.id}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 mb-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                {markingId === selectedAssessment.id ? 'Saving...' : 'Mark Intervention as Done'}
              </button>
            )}

            <p className="text-[10px] text-center text-gray-400 border-t border-gray-50 pt-3">
              Use these results as reference for face-to-face consultation only.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-[11px] text-gray-400 leading-relaxed shadow-inner">
        <p className="font-bold text-gray-500 mb-1">Data Privacy Directive:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-1">
          <li>Only consented records show the student's name. Non-consented records are shown as Anonymous.</li>
          <li>Marking a record as done moves it to the Completed tab. The data is preserved and not deleted.</li>
        </ul>
      </div>
    </CounselorLayout>
  )
}

export default AdminAssessmentsPage
