// Assessment scoring and stress level classification

export const ASSESSMENT_QUESTIONS = [
  "I feel overwhelmed by my schoolwork.",
  "I have difficulty concentrating in class.",
  "I feel anxious about my grades.",
  "I experience headaches or physical pain due to stress.",
  "I have trouble sleeping because of worries.",
  "I feel irritable or angry more often.",
  "I lose interest in activities I usually enjoy.",
  "I feel hopeless about my future.",
  "I experience stomach problems due to stress.",
  "I have trouble managing my time.",
  "I feel lonely or isolated from my peers.",
  "I have difficulty making decisions.",
  "I experience panic attacks or severe anxiety.",
  "I use unhealthy coping mechanisms (food, scrolling, gaming).",
  "I feel pressure to be perfect.",
  "I have conflicts with friends or family.",
  "I feel unmotivated to do anything.",
  "I experience social anxiety.",
  "I feel disconnected from my body or surroundings.",
  "I have thoughts of self-harm.",
  "I feel unable to cope with my problems.",
]

export const calculateScore = (answers) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return 0
  }
  return answers.reduce((sum, answer) => sum + (answer || 0), 0)
}

export const calculatePercentage = (score) => {
  const maxScore = ASSESSMENT_QUESTIONS.length * 3
  const percentage = (score / maxScore) * 100
  return Math.round(percentage)
}

export const getStressLevel = (percentage) => {
  if (percentage >= 0 && percentage <= 25) return 'Low'
  if (percentage > 25 && percentage <= 50) return 'Mild'
  if (percentage > 50 && percentage <= 75) return 'Moderate'
  if (percentage > 75 && percentage <= 100) return 'High'
  return 'Unknown'
}

export const getStressColor = (level) => {
  const colors = {
    Low: 'text-green-600 bg-green-50',
    Mild: 'text-yellow-600 bg-yellow-50',
    Moderate: 'text-orange-600 bg-orange-50',
    High: 'text-red-600 bg-red-50',
  }
  return colors[level] || 'text-gray-600 bg-gray-50'
}

export const getStressBgColor = (level) => {
  const colors = {
    Low: 'bg-green-100',
    Mild: 'bg-yellow-100',
    Moderate: 'bg-orange-100',
    High: 'bg-red-100',
  }
  return colors[level] || 'bg-gray-100'
}

export const getCopingStrategies = (level) => {
  const strategies = {
    Low: [
      {
        title: "Continue maintaining your healthy habits — you're doing great!",
        emoji: "✅",
      },
      {
        title: "Keep a regular sleep schedule to support your well-being.",
        emoji: "😴",
      },
      {
        title: "Stay connected with friends and family for emotional support.",
        emoji: "👥",
      },
      {
        title: "Engage in hobbies and activities you enjoy.",
        emoji: "🎯",
      },
      {
        title: "Practice gratitude by noting 3 things you're thankful for each day.",
        emoji: "🙏",
      },
    ],
    Mild: [
      {
        title: "Take short breaks during study sessions to refresh your mind.",
        emoji: "⏸️",
      },
      {
        title: "Practice deep breathing exercises (4-7-8 breathing technique).",
        emoji: "🌬️",
      },
      {
        title: "Limit screen time, especially before bedtime.",
        emoji: "📱",
      },
      {
        title: "Organize your tasks into manageable steps.",
        emoji: "📋",
      },
      {
        title: "Spend time outdoors or engage in light physical activity.",
        emoji: "🚶",
      },
    ],
    Moderate: [
      {
        title: "Schedule regular breaks and practice self-care activities.",
        emoji: "💆",
      },
      {
        title: "Try journaling to process your emotions and thoughts.",
        emoji: "📔",
      },
      {
        title: "Establish a consistent workout routine (even 20 minutes helps).",
        emoji: "🏃",
      },
      {
        title: "Talk to someone you trust about how you're feeling.",
        emoji: "💬",
      },
      {
        title: "Consider reaching out to your school counselor for support.",
        emoji: "🤝",
      },
    ],
    High: [
      {
        title: "Please reach out to your guidance counselor or trusted adult immediately.",
        emoji: "🆘",
      },
      {
        title: "Contact a mental health professional for professional support.",
        emoji: "👨‍⚕️",
      },
      {
        title: "Call a crisis helpline if you're in acute distress.",
        emoji: "☎️",
      },
      {
        title: "Practice grounding techniques: 5 senses method (5 see, 4 touch, 3 hear, 2 smell, 1 taste).",
        emoji: "🌍",
      },
      {
        title: "Reach out to trusted friends or family for immediate support.",
        emoji: "❤️",
      },
    ],
  }

  return strategies[level] || []
}
