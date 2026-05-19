// Chatbot AI logic for crisis detection and responses

const CRISIS_KEYWORDS = [
  'want to die',
  'want to end my life',
  'ayoko na mabuhay', // Tagalog: I don't want to live
  'end it all',
  'no point living',
  'kill myself',
  'harm myself',
  'cut myself',
  'suicide',
  'self harm',
  'i am worthless',
  'nobody cares',
  'better off dead',
  'gusto ko maubos',
]

const SUPPORTIVE_RESPONSES = {
  stress: [
    "It sounds like you're feeling overwhelmed with stress. Remember, this feeling is temporary. Have you tried talking to someone you trust about what's bothering you?",
    "Stress is a normal part of student life, but it shouldn't consume you. Consider taking a break and doing something you enjoy.",
    "When you're stressed, remember to take deep breaths and break tasks into smaller, manageable steps.",
  ],
  anxiety: [
    "Anxiety can be challenging, but there are ways to manage it. Have you tried grounding techniques like the 5-4-3-2-1 method?",
    "Remember, anxiety is often worse in our minds than reality. Try to focus on what you can control.",
    "Consider reaching out to your school counselor if anxiety is affecting your daily life.",
  ],
  sleep: [
    "Sleep is crucial for your mental health. Try establishing a consistent bedtime routine and limit screen time before bed.",
    "If you're having trouble sleeping, try relaxation techniques like deep breathing or meditation.",
    "Lack of sleep can worsen your mood and stress. Prioritize getting 7-9 hours of sleep.",
  ],
  grades: [
    "Remember, grades don't define your worth as a person. Focus on doing your best and learning.",
    "If you're struggling academically, consider seeking help from your teachers or tutors.",
    "It's okay to ask for help. Your teachers want you to succeed.",
  ],
  general: [
    "I'm here to listen and support you. What specifically is troubling you today?",
    "It takes courage to reach out. I appreciate you sharing with me.",
    "You're not alone in how you're feeling. Many students experience similar challenges.",
    "Remember to practice self-compassion. You deserve kindness, especially from yourself.",
  ],
}

const CRISIS_RESPONSES = {
  initial:
    "I'm deeply concerned about what you've shared. Your safety is the most important thing right now. Please reach out to someone who can help immediately.",
  resources: [
    {
      name: "National Suicide Prevention Lifeline (USA)",
      number: "988",
      description: "Call or text 988 anytime, day or night",
    },
    {
      name: "Crisis Text Line (USA)",
      number: "Text HOME to 741741",
      description: "Text-based crisis support",
    },
    {
      name: "Philippine Crisis Hotline",
      number: "(02) 7954-4673",
      description: "24/7 crisis counseling support",
    },
    {
      name: "Your School Counselor",
      number: "Contact your guidance office",
      description: "Immediate support at your school",
    },
  ],
}

const detectCrisis = (message) => {
  const lowerMessage = message.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  )
}

const categorizeMessage = (message) => {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('stress') ||
    lowerMessage.includes('overwhelm') ||
    lowerMessage.includes('pressure')
  ) {
    return 'stress'
  }
  if (
    lowerMessage.includes('anxiety') ||
    lowerMessage.includes('anxious') ||
    lowerMessage.includes('nervous')
  ) {
    return 'anxiety'
  }
  if (
    lowerMessage.includes('sleep') ||
    lowerMessage.includes('tired') ||
    lowerMessage.includes('insomnia')
  ) {
    return 'sleep'
  }
  if (
    lowerMessage.includes('grade') ||
    lowerMessage.includes('score') ||
    lowerMessage.includes('fail')
  ) {
    return 'grades'
  }
  return 'general'
}

const getRandomResponse = (category) => {
  const responses = SUPPORTIVE_RESPONSES[category] || SUPPORTIVE_RESPONSES.general
  return responses[Math.floor(Math.random() * responses.length)]
}

export const processChatMessage = (userMessage) => {
  const isCrisis = detectCrisis(userMessage)
  const category = categorizeMessage(userMessage)

  if (isCrisis) {
    return {
      response: CRISIS_RESPONSES.initial,
      riskFlag: true,
      isCrisis: true,
      resources: CRISIS_RESPONSES.resources,
    }
  }

  return {
    response: getRandomResponse(category),
    riskFlag: false,
    isCrisis: false,
    resources: null,
  }
}

export const HOTLINE_INFO = [
  {
    name: "National Suicide Prevention Lifeline (USA)",
    number: "988",
    url: "https://988lifeline.org",
    available: "24/7",
  },
  {
    name: "Crisis Text Line (USA)",
    number: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    available: "24/7",
  },
  {
    name: "Philippine Crisis Hotline",
    number: "(02) 7954-4673",
    available: "24/7",
  },
  {
    name: "International Association for Suicide Prevention",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    description: "Find hotlines in your country",
  },
]
