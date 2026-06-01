// databaseUtils.js — Supabase edition
import { supabase } from '../supabaseClient'

// =======================
// ASSESSMENT
// =======================

export const submitAssessment = async (userId, score, percentage, stressLevel, consentStatus, domainScores = null) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        score,
        percentage,
        stress_level: stressLevel,
        consent_status: consentStatus,
        domain_scores: domainScores,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, assessment: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserAssessments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return { assessments: null, error: error.message }
    return { assessments: data, error: null }
  } catch (error) {
    return { assessments: null, error: error.message }
  }
}

export const getLatestAssessment = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') return { assessment: null, error: error.message }
    return { assessment: data || null, error: null }
  } catch (error) {
    return { assessment: null, error: error.message }
  }
}

// =======================
// MOOD TRACKING
// =======================

export const logMood = async (userId, moodScore, notes = '') => {
  try {
    const { data, error } = await supabase
      .from('mood_tracking')
      .insert({ user_id: userId, mood_score: moodScore, notes })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, mood: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserMoodHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('mood_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) return { moods: null, error: error.message }
    return { moods: data, error: null }
  } catch (error) {
    return { moods: null, error: error.message }
  }
}

// =======================
// CHAT
// =======================

export const saveChatMessage = async (userId, message, response, riskFlag = false, sessionId = null) => {
  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .insert({ user_id: userId, message, response, risk_flag: riskFlag, session_id: sessionId })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, log: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserChatHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) return { chats: null, error: error.message }
    return { chats: data, error: null }
  } catch (error) {
    return { chats: null, error: error.message }
  }
}

export const getChatSessions = async (userId) => {
  try {
    // Group chats by session_id, get the first message of each session as preview
    const { data, error } = await supabase
      .from('chatbot_logs')
      .select('session_id, message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return { sessions: [], error: error.message }

    // Deduplicate by session_id, keep the earliest message as title
    const sessionMap = new Map()
    ;(data || []).forEach((row) => {
      const sid = row.session_id || 'default'
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          session_id: sid,
          preview: row.message?.slice(0, 50) || 'Chat',
          created_at: row.created_at,
        })
      }
    })

    const sessions = Array.from(sessionMap.values())
    return { sessions, error: null }
  } catch (error) {
    return { sessions: [], error: error.message }
  }
}

export const getSessionMessages = async (userId, sessionId) => {
  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) return { chats: null, error: error.message }
    return { chats: data, error: null }
  } catch (error) {
    return { chats: null, error: error.message }
  }
}

export const getHighRiskMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('chatbot_logs')
      .select('*')
      .eq('risk_flag', true)
      .order('created_at', { ascending: false })

    if (error) return { riskMessages: null, error: error.message }
    return { riskMessages: data, error: null }
  } catch (error) {
    return { riskMessages: null, error: error.message }
  }
}

export const getHighRiskStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('consent_status', true)
      .in('stress_level', ['High', 'Moderate'])
      .order('created_at', { ascending: false })

    if (error) return { highRiskStudents: null, error: error.message }

    // Keep only the latest per user
    const seen = new Set()
    const latest = (data || []).filter((a) => {
      if (seen.has(a.user_id)) return false
      seen.add(a.user_id)
      return true
    })

    // Fetch profiles for these users
    const userIds = latest.map((a) => a.user_id)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)

    const profileMap = {}
    ;(profilesData || []).forEach((p) => { profileMap[p.id] = p })

    const highRiskStudents = latest.map((a) => ({
      id:           a.user_id,
      name:         profileMap[a.user_id]?.name  || 'Anonymous',
      email:        profileMap[a.user_id]?.email || '',
      stress_level: a.stress_level,
      percentage:   a.percentage,
      date:         a.created_at,
      has_consent:  a.consent_status,
    }))

    return { highRiskStudents, error: null }
  } catch (error) {
    return { highRiskStudents: null, error: error.message }
  }
}

// =======================
// COUNSELOR / ADMIN
// =======================

export const getAllAssessments = async (filterStressLevel = null, filterDate = null) => {
  try {
    let query = supabase
      .from('assessments')
      .select('*')
      .eq('consent_status', true)
      .order('created_at', { ascending: false })

    if (filterStressLevel) query = query.eq('stress_level', filterStressLevel)
    if (filterDate) query = query.gte('created_at', new Date(filterDate).toISOString())

    const { data: assessmentData, error } = await query
    if (error) return { assessments: null, error: error.message }
    if (!assessmentData || assessmentData.length === 0) return { assessments: [], error: null }

    // Get all unique user_ids and fetch their profiles in one query
    const userIds = [...new Set(assessmentData.map((a) => a.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds)

    // Build a lookup map
    const profileMap = {}
    ;(profilesData || []).forEach((p) => { profileMap[p.id] = p })

    // Merge profile data into each assessment
    const assessments = assessmentData.map((a) => ({
      ...a,
      student_name:  profileMap[a.user_id]?.name  || null,
      student_email: profileMap[a.user_id]?.email || null,
    }))

    return { assessments, error: null }
  } catch (error) {
    return { assessments: null, error: error.message }
  }
}

export const getDashboardStats = async () => {
  try {
    // Total students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    // ALL consented assessments for distribution (not just latest per user)
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('user_id, stress_level, created_at, consent_status')
      .order('created_at', { ascending: false })

    if (error) return { stats: null, error: error.message }

    // Chat log count
    const { count: chatLogs } = await supabase
      .from('chatbot_logs')
      .select('*', { count: 'exact', head: true })

    // Use ALL assessments for distribution (shows full picture)
    const stressDistribution = { Low: 0, Mild: 0, Moderate: 0, High: 0 }
    ;(assessments || []).forEach((a) => {
      if (a.stress_level in stressDistribution) stressDistribution[a.stress_level]++
    })

    const consentedCount = (assessments || []).filter((a) => a.consent_status === true).length

    console.log('stressDistribution:', stressDistribution)

    return {
      stats: {
        totalStudents:    totalStudents || 0,
        consentedCount,
        stressDistribution,
        totalAssessments: (assessments || []).length,
        chatLogs:         chatLogs || 0,
      },
      error: null,
    }
  } catch (error) {
    return { stats: null, error: error.message }
  }
}

// =======================
// SUPER ADMIN
// =======================

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role, consent_status, created_at')
      .order('created_at', { ascending: false })

    if (error) return { users: null, error: error.message }
    return { users: data, error: null }
  } catch (error) {
    return { users: null, error: error.message }
  }
}

export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, profile: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Legacy helper — some pages still call getData() for superadmin stats
// Returns empty array so nothing crashes while fully migrated
export const getData = (_key) => []

export const getSystemAnalytics = async () => {
  try {
    // Daily assessment submissions for the last 30 days
    const since = new Date()
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)

    const { data: assessments } = await supabase
      .from('assessments')
      .select('created_at, stress_level, consent_status')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    const { data: moods } = await supabase
      .from('mood_tracking')
      .select('created_at')
      .gte('created_at', since.toISOString())

    const { data: chats } = await supabase
      .from('chatbot_logs')
      .select('created_at')
      .gte('created_at', since.toISOString())

    // Build daily usage map (last 30 days)
    const dayMap = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(since)
      d.setDate(since.getDate() + i)
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dayMap[key] = { date: key, assessments: 0, moods: 0, chats: 0 }
    }

    const toKey = (iso) =>
      new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    ;(assessments || []).forEach((a) => {
      const k = toKey(a.created_at)
      if (dayMap[k]) dayMap[k].assessments++
    })
    ;(moods || []).forEach((m) => {
      const k = toKey(m.created_at)
      if (dayMap[k]) dayMap[k].moods++
    })
    ;(chats || []).forEach((c) => {
      const k = toKey(c.created_at)
      if (dayMap[k]) dayMap[k].chats++
    })

    const usageData = Object.values(dayMap)

    // Intervention success rate:
    // Definition: % of students whose LATEST assessment improved (stress level went down)
    // compared to their PREVIOUS assessment
    const { data: allAssessments } = await supabase
      .from('assessments')
      .select('user_id, stress_level, created_at')
      .order('created_at', { ascending: true })

    const userHistory = {}
    ;(allAssessments || []).forEach((a) => {
      if (!userHistory[a.user_id]) userHistory[a.user_id] = []
      userHistory[a.user_id].push(a.stress_level)
    })

    const LEVEL_NUM = { Low: 0, Mild: 1, Moderate: 2, High: 3 }
    let improved = 0, worsened = 0, unchanged = 0, singleOnly = 0

    Object.values(userHistory).forEach((history) => {
      if (history.length < 2) { singleOnly++; return }
      const prev = LEVEL_NUM[history[history.length - 2]] ?? 2
      const curr = LEVEL_NUM[history[history.length - 1]] ?? 2
      if (curr < prev) improved++
      else if (curr > prev) worsened++
      else unchanged++
    })

    const totalWithHistory = improved + worsened + unchanged
    const successRate = totalWithHistory > 0
      ? Math.round((improved / totalWithHistory) * 100)
      : null

    return {
      usageData,
      interventionStats: { improved, worsened, unchanged, singleOnly, successRate },
      error: null,
    }
  } catch (error) {
    return { usageData: [], interventionStats: null, error: error.message }
  }
}
