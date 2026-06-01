// assessmentUtils.js
// 7 Core Domains:
// 1. Stress              2. Anxiety             3. Depression
// 4. Emotional Well-being 5. Academic Pressure  6. Social Connectedness
// 7. Sleep Quality

export const ASSESSMENT_QUESTIONS_FULL = [
  // 1. Stress (3 questions)
  { text: "I feel overwhelmed by my responsibilities and tasks.", domain: "stress" },
  { text: "I have difficulty managing my time and workload.", domain: "stress" },
  { text: "I feel constant pressure that is hard to control.", domain: "stress" },

  // 2. Anxiety (3 questions)
  { text: "I feel nervous, anxious, or on edge frequently.", domain: "anxiety" },
  { text: "I experience panic attacks or sudden intense fear.", domain: "anxiety" },
  { text: "I worry excessively about things that might go wrong.", domain: "anxiety" },

  // 3. Depression (3 questions)
  { text: "I feel hopeless or empty about my future.", domain: "depression" },
  { text: "I have lost interest in activities I used to enjoy.", domain: "depression" },
  { text: "I feel unmotivated and have little energy to do things.", domain: "depression" },

  // 4. Emotional Well-being (3 questions)
  { text: "I feel irritable, angry, or emotionally unstable.", domain: "emotional" },
  { text: "I feel disconnected from my body or surroundings.", domain: "emotional" },
  { text: "I struggle to manage or express my emotions in healthy ways.", domain: "emotional" },

  // 5. Academic Pressure (3 questions)
  { text: "I feel anxious or stressed about my grades and academic performance.", domain: "academic" },
  { text: "I have difficulty concentrating or focusing during class or study.", domain: "academic" },
  { text: "I feel pressure to be perfect in my academic work.", domain: "academic" },

  // 6. Social Connectedness (3 questions)
  { text: "I feel lonely or isolated from my peers and classmates.", domain: "social" },
  { text: "I have difficulty forming or maintaining meaningful relationships.", domain: "social" },
  { text: "I feel misunderstood or unsupported by the people around me.", domain: "social" },

  // 7. Sleep Quality (3 questions)
  { text: "I have trouble falling or staying asleep due to worries.", domain: "sleep" },
  { text: "I feel tired or exhausted even after a full night of sleep.", domain: "sleep" },
  { text: "Poor sleep is affecting my mood and daily functioning.", domain: "sleep" },
]

// Flat array of question texts (for the assessment page)
export const ASSESSMENT_QUESTIONS = ASSESSMENT_QUESTIONS_FULL.map((q) => q.text)

// ── SCORING ───────────────────────────────────────────────────
export const calculateScore = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) return 0
  return answers.reduce((sum, a) => sum + (a || 0), 0)
}

export const calculatePercentage = (score) => {
  const maxScore = ASSESSMENT_QUESTIONS.length * 3
  return Math.round((score / maxScore) * 100)
}

export const getStressLevel = (percentage) => {
  if (percentage <= 25) return 'Low'
  if (percentage <= 50) return 'Mild'
  if (percentage <= 75) return 'Moderate'
  return 'High'
}

// ── DOMAIN BREAKDOWN ─────────────────────────────────────────
// Returns per-domain scores and severity for the result page
export const getDomainBreakdown = (answers) => {
  const domainScores = {}
  const domainCounts = {}

  ASSESSMENT_QUESTIONS_FULL.forEach((q, i) => {
    const score = answers[i] || 0
    if (!domainScores[q.domain]) {
      domainScores[q.domain] = 0
      domainCounts[q.domain] = 0
    }
    domainScores[q.domain] += score
    domainCounts[q.domain]++
  })

  const domains = Object.keys(domainScores).map((domain) => {
    const maxPossible = domainCounts[domain] * 3
    const pct = Math.round((domainScores[domain] / maxPossible) * 100)
    return {
      domain,
      score: domainScores[domain],
      max: maxPossible,
      percentage: pct,
      level: pct <= 25 ? 'Low' : pct <= 50 ? 'Mild' : pct <= 75 ? 'Moderate' : 'High',
    }
  })

  // Sort by percentage descending (highest concern first)
  return domains.sort((a, b) => b.percentage - a.percentage)
}

// ── DOMAIN LABELS & ICONS ─────────────────────────────────────
export const DOMAIN_META = {
  stress:     { label: 'Stress',                color: 'orange' },
  anxiety:    { label: 'Anxiety',               color: 'yellow' },
  depression: { label: 'Depression',            color: 'purple' },
  emotional:  { label: 'Emotional Well-being',  color: 'pink'   },
  academic:   { label: 'Academic Pressure',     color: 'teal'   },
  social:     { label: 'Social Connectedness',  color: 'blue'   },
  sleep:      { label: 'Sleep Quality',         color: 'indigo' },
}

const LEVEL_COLORS = {
  Low:      { bar: 'bg-green-400',  text: 'text-green-700',  badge: 'bg-green-50 text-green-700 border-green-200' },
  Mild:     { bar: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  Moderate: { bar: 'bg-orange-400', text: 'text-orange-700', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  High:     { bar: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-50 text-red-700 border-red-200' },
}
export const getLevelColors = (level) => LEVEL_COLORS[level] || LEVEL_COLORS.Low

// ── RECOMMENDATIONS per domain & level ───────────────────────
export const getDomainRecommendations = (domain, level) => {
  const recs = {
    stress: {
      Low:      ["Keep using your current time management strategies.", "Celebrate small wins to maintain motivation."],
      Mild:     ["Break large tasks into smaller steps.", "Try the Pomodoro technique (25 min work, 5 min break)."],
      Moderate: ["Create a weekly planner and stick to it.", "Talk to a trusted person about your workload."],
      High:     ["Speak with your guidance counselor about your stress load.", "Consider temporarily reducing non-essential commitments."],
    },
    anxiety: {
      Low:      ["Continue practicing calm breathing when you feel nervous.", "Maintain your healthy routines."],
      Mild:     ["Try the 5-4-3-2-1 grounding technique when anxious.", "Limit caffeine intake."],
      Moderate: ["Practice daily deep breathing or progressive muscle relaxation.", "Journal your worries to externalize them."],
      High:     ["Reach out to your school counselor for anxiety support.", "Consider professional mental health support."],
    },
    depression: {
      Low:      ["Keep engaging in activities that bring you joy.", "Maintain social connections and routines."],
      Mild:     ["Schedule one enjoyable activity per day.", "Talk to a friend or family member about how you feel."],
      Moderate: ["Try journaling your thoughts and feelings daily.", "Reach out to your school counselor for support."],
      High:     ["Please speak with a mental health professional as soon as possible.", "Contact NCMH Crisis Hotline 1553 if you need immediate support."],
    },
    emotional: {
      Low:      ["Continue checking in with your emotions daily.", "Practice gratitude journaling."],
      Mild:     ["Name your emotions when you feel them — it reduces their intensity.", "Take short breaks when feeling overwhelmed."],
      Moderate: ["Try journaling to process difficult emotions.", "Talk to someone you trust about how you feel."],
      High:     ["Seek support from your guidance counselor or a mental health professional.", "Practice grounding exercises daily."],
    },
    academic: {
      Low:      ["Keep up your study habits and celebrate your progress.", "Help a classmate — teaching reinforces learning."],
      Mild:     ["Review your study environment — minimize distractions.", "Use active recall instead of passive re-reading."],
      Moderate: ["Talk to your teacher or professor about your struggles.", "Break study sessions into shorter, focused blocks."],
      High:     ["Seek academic support or tutoring.", "Speak with your counselor about academic pressure."],
    },
    social: {
      Low:      ["Nurture your existing relationships.", "Reach out to a friend you haven't talked to in a while."],
      Mild:     ["Schedule regular time with friends or family.", "Join a club or group activity at school."],
      Moderate: ["Be open about how you're feeling with someone you trust.", "Consider peer support groups."],
      High:     ["Talk to your counselor about social difficulties.", "Remember: asking for help is a sign of strength."],
    },
    sleep: {
      Low:      ["Keep your consistent sleep schedule.", "Avoid screens 30 minutes before bed."],
      Mild:     ["Set a fixed bedtime and wake time.", "Try a short relaxation routine before sleeping."],
      Moderate: ["Avoid studying in bed — keep it for sleep only.", "Try a sleep meditation or white noise app."],
      High:     ["Talk to a health professional about your sleep difficulties.", "Avoid all screens at least 1 hour before bed."],
    },
  }
  return recs[domain]?.[level] || ["Take care of yourself and seek support when needed."]
}

// Maps stress level string to numeric value for chart plotting
export const stressLevelToNum = (level) => {
  const map = { Low: 1, Mild: 2, Moderate: 3, High: 4 }
  return map[level] ?? null
}

// ── MOOD MAPPING ──────────────────────────────────────────────
// Maps mood score (1-5) to a mental health category label
export const getMoodCategory = (score) => {
  const map = {
    1: { label: 'Very Distressed',  color: 'text-red-600',    bg: 'bg-red-50',    emoji: '😞', hint: 'You may be experiencing high stress or emotional distress.' },
    2: { label: 'Struggling',       color: 'text-orange-600', bg: 'bg-orange-50', emoji: '😟', hint: 'You seem to be having a difficult time. Consider talking to someone.' },
    3: { label: 'Neutral',          color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '😐', hint: 'You\'re getting by. Small self-care steps can help improve your mood.' },
    4: { label: 'Doing Well',       color: 'text-teal-600',   bg: 'bg-teal-50',   emoji: '😊', hint: 'You\'re in a good place. Keep up your healthy habits.' },
    5: { label: 'Thriving',         color: 'text-green-600',  bg: 'bg-green-50',  emoji: '😄', hint: 'You\'re feeling great! Share your positive energy with others.' },
  }
  return map[score] || map[3]
}

// Legacy exports (used by other pages)
export const getStressColor = (level) => {
  const colors = {
    Low:      'text-green-600 bg-green-50',
    Mild:     'text-yellow-600 bg-yellow-50',
    Moderate: 'text-orange-600 bg-orange-50',
    High:     'text-red-600 bg-red-50',
  }
  return colors[level] || 'text-gray-600 bg-gray-50'
}

export const getStressBgColor = (level) => {
  const colors = {
    Low:      'bg-green-100',
    Mild:     'bg-yellow-100',
    Moderate: 'bg-orange-100',
    High:     'bg-red-100',
  }
  return colors[level] || 'bg-gray-100'
}

export const getCopingStrategies = (level) => {
  const strategies = {
    Low: [
      { title: "Continue maintaining your healthy habits — you're doing great!", emoji: "✅" },
      { title: "Keep a regular sleep schedule to support your well-being.", emoji: "😴" },
      { title: "Stay connected with friends and family for emotional support.", emoji: "👥" },
      { title: "Engage in hobbies and activities you enjoy.", emoji: "🎯" },
      { title: "Practice gratitude by noting 3 things you're thankful for each day.", emoji: "🙏" },
    ],
    Mild: [
      { title: "Take short breaks during study sessions to refresh your mind.", emoji: "⏸️" },
      { title: "Practice deep breathing exercises (4-7-8 breathing technique).", emoji: "🌬️" },
      { title: "Limit screen time, especially before bedtime.", emoji: "📱" },
      { title: "Organize your tasks into manageable steps.", emoji: "📋" },
      { title: "Spend time outdoors or engage in light physical activity.", emoji: "🚶" },
    ],
    Moderate: [
      { title: "Schedule regular breaks and practice self-care activities.", emoji: "💆" },
      { title: "Try journaling to process your emotions and thoughts.", emoji: "📔" },
      { title: "Establish a consistent workout routine (even 20 minutes helps).", emoji: "🏃" },
      { title: "Talk to someone you trust about how you're feeling.", emoji: "💬" },
      { title: "Consider reaching out to your school counselor for support.", emoji: "🤝" },
    ],
    High: [
      { title: "Please reach out to your guidance counselor or trusted adult immediately.", emoji: "🆘" },
      { title: "Contact a mental health professional for professional support.", emoji: "👨‍⚕️" },
      { title: "Call NCMH Crisis Hotline 1553 if you're in acute distress.", emoji: "☎️" },
      { title: "Practice grounding techniques: 5 senses method.", emoji: "🌍" },
      { title: "Reach out to trusted friends or family for immediate support.", emoji: "❤️" },
    ],
  }
  return strategies[level] || []
}
