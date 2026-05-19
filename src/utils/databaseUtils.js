// localDatabaseUtils.js

// =======================
// HELPERS
// =======================

const getUsersObject = () => {
  return JSON.parse(localStorage.getItem('mindmate_users') || '{}')
}

const getUsersArray = () => {
  return Object.values(getUsersObject())
}

export const getData = (key) => {
  return JSON.parse(localStorage.getItem(key)) || []
}

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// =======================
// AUTH (READ ONLY - AUTH FILE NA BAHALA SA LOGIN)
// =======================

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('mindmate_current_user'))
}

// =======================
// ASSESSMENT
// =======================

export const submitAssessment = async (
  userId,
  score,
  percentage,
  stressLevel,
  consentStatus
) => {
  try {
    const assessments = getData('assessments')

    const newAssessment = {
      id: Date.now(),
      user_id: userId,
      score,
      percentage,
      stress_level: stressLevel,
      consent_status: consentStatus,
      created_at: new Date().toISOString(),
    }

    assessments.push(newAssessment)
    saveData('assessments', assessments)

    return { success: true, assessment: newAssessment }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserAssessments = async (userId) => {
  try {
    const data = getData('assessments')
      .filter((a) => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { assessments: data, error: null }
  } catch (error) {
    return { assessments: null, error: error.message }
  }
}

export const getLatestAssessment = async (userId) => {
  try {
    const data = getData('assessments')
      .filter((a) => a.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { assessment: data[0] || null, error: null }
  } catch (error) {
    return { assessment: null, error: error.message }
  }
}

// =======================
// MOOD TRACKING
// =======================

export const logMood = async (userId, moodScore, notes = '') => {
  try {
    const moods = getData('mood_tracking')

    const newMood = {
      id: Date.now(),
      user_id: userId,
      mood_score: moodScore,
      notes,
      created_at: new Date().toISOString(),
    }

    moods.push(newMood)
    saveData('mood_tracking', moods)

    return { success: true, mood: newMood }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserMoodHistory = async (userId, days = 30) => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const moods = getData('mood_tracking')
      .filter(
        (m) =>
          m.user_id === userId &&
          new Date(m.created_at) >= startDate
      )
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    return { moods, error: null }
  } catch (error) {
    return { moods: null, error: error.message }
  }
}

// =======================
// CHAT
// =======================

export const saveChatMessage = async (
  userId,
  message,
  response,
  riskFlag = false
) => {
  try {
    const chats = getData('chatbot_logs')

    const newChat = {
      id: Date.now(),
      user_id: userId,
      message,
      response,
      risk_flag: riskFlag,
      created_at: new Date().toISOString(),
    }

    chats.push(newChat)
    saveData('chatbot_logs', chats)

    return { success: true, log: newChat }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserChatHistory = async (userId) => {
  try {
    const chats = getData('chatbot_logs')
      .filter((c) => c.user_id === userId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    return { chats, error: null }
  } catch (error) {
    return { chats: null, error: error.message }
  }
}

export const getHighRiskMessages = async () => {
  try {
    const chats = getData('chatbot_logs')
      .filter((c) => c.risk_flag === true)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { riskMessages: chats, error: null }
  } catch (error) {
    return { riskMessages: null, error: error.message }
  }
}

export const getHighRiskStudents = async () => {
  try {
    const assessments = getData('assessments')
    const users = JSON.parse(localStorage.getItem('mindmate_users') || '{}')
    
    // Get latest assessment for each student
    const latestAssessments = {}
    assessments.forEach(assessment => {
      if (assessment.consent_status === true) {
        if (!latestAssessments[assessment.user_id] || 
            new Date(assessment.created_at) > new Date(latestAssessments[assessment.user_id].created_at)) {
          latestAssessments[assessment.user_id] = assessment
        }
      }
    })

    // Filter for high-risk students
    const highRiskStudents = Object.values(latestAssessments)
      .filter(assessment => assessment.stress_level === 'High' || assessment.stress_level === 'Moderate')
      .map(assessment => {
        const user = Object.values(users).find(u => u.id === assessment.user_id)
        return {
          id: user?.id || 'unknown',
          name: user?.name || 'Anonymous',
          email: user?.email || 'no-consent@example.com',
          stress_level: assessment.stress_level,
          percentage: assessment.percentage,
          date: assessment.created_at,
          has_consent: user?.consent_status || false
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return { highRiskStudents, error: null }
  } catch (error) {
    return { highRiskStudents: null, error: error.message }
  }
}

// =======================
// ADMIN
// =======================

export const getAllAssessments = async (
  filterStressLevel = null,
  filterDate = null
) => {
  try {
    let data = getData('assessments').filter(
      (a) => a.consent_status === true
    )

    if (filterStressLevel) {
      data = data.filter((a) => a.stress_level === filterStressLevel)
    }

    if (filterDate) {
      data = data.filter(
        (a) => new Date(a.created_at) >= new Date(filterDate)
      )
    }

    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return { assessments: data, error: null }
  } catch (error) {
    return { assessments: null, error: error.message }
  }
}

export const getDashboardStats = async () => {
  try {
    const users = getUsersArray()
    const assessments = getData('assessments')

    const studentCount = users.filter((u) => u.role === 'student').length

    const latestAssessments = {}

    assessments.forEach((a) => {
      if (!latestAssessments[a.user_id]) {
        latestAssessments[a.user_id] = a
      }
    })

    const stressDistribution = {
      Low: 0,
      Mild: 0,
      Moderate: 0,
      High: 0,
    }

    Object.values(latestAssessments).forEach((a) => {
      if (a.stress_level in stressDistribution) {
        stressDistribution[a.stress_level]++
      }
    })

    return {
      stats: {
        totalStudents: studentCount,
        stressDistribution,
        totalAssessments: Object.keys(latestAssessments).length,
      },
      error: null,
    }
  } catch (error) {
    return { stats: null, error: error.message }
  }
}