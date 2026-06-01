// chatbotUtils.js
// Crisis detection runs locally (instant, no API).
// All other responses go through Groq (Llama 3.3 70B) for real AI replies.

// ── CRISIS KEYWORDS (local detection) ────────────────────────
const CRISIS_KEYWORDS = [
  'want to die', 'want to end my life', 'ayoko na mabuhay',
  'end it all', 'no point living', 'kill myself', 'harm myself',
  'cut myself', 'suicide', 'self harm', 'self-harm',
  'i am worthless', 'nobody cares', 'better off dead',
  'gusto ko maubos', 'wala na akong dahilan', 'tired of living',
  'end my life', 'hurt myself', 'no reason to live',
]

export const detectCrisis = (message) => {
  const lower = message.toLowerCase()
  return CRISIS_KEYWORDS.some((k) => lower.includes(k))
}

// ── CRISIS RESOURCES ─────────────────────────────────────────
const CRISIS_RESOURCES = [
  { name: 'NCMH Crisis Hotline',  number: '1553',                    description: 'Libre, 24/7' },
  { name: 'In Touch Crisis Line', number: '(02) 8893-7603 / 0917-800-1123', description: '24/7 emotional support' },
  { name: 'Hopeline Philippines', number: '(02) 8804-4673 / 0917-558-4673', description: '24/7 suicide prevention' },
  { name: 'Your School Counselor', number: 'Guidance office',        description: 'Immediate school support' },
]

const CRISIS_RESPONSE =
  "Nag-aalala ako sa iyong sinabi. Ang iyong kaligtasan ang pinakamahalagang bagay ngayon. Mangyaring makipag-ugnayan sa isang taong makakatulong sa iyo agad."

// ── SYSTEM PROMPT (trains the AI) ────────────────────────────
const SYSTEM_PROMPT = `You are MindMate, a compassionate and professional AI mental health companion for Filipino college students at Gordon College.

Your role:
- Provide empathetic, supportive, and non-judgmental responses
- Help students manage stress, anxiety, depression, sleep issues, academic pressure, and social difficulties
- Offer practical coping strategies based on evidence-based mental health practices
- Encourage students to seek professional help when needed
- Respond in a warm, friendly, and conversational tone

Important rules:
1. NEVER diagnose mental health conditions — you are a support tool, not a doctor
2. ALWAYS encourage professional help for serious concerns
3. If a student mentions self-harm, suicide, or crisis — respond with immediate concern and direct them to hotlines (NCMH: 1553, Hopeline: 0917-558-4673)
4. Keep responses concise (2-4 sentences) unless the student needs detailed guidance
5. You may respond in English or Filipino/Tagalog depending on what the student uses
6. Be culturally sensitive to Filipino student life — academic pressure, family expectations, peer relationships
7. When a student mentions stress, anxiety, or depression — acknowledge their feelings first, then offer a specific coping strategy
8. Never give generic responses — always address what the student specifically said

Crisis protocol: If you detect any mention of self-harm, suicide, or wanting to die — immediately express concern, validate their feelings, and provide the NCMH hotline number 1553.`

// ── GROQ API CALL ─────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

export const getAIResponse = async (userMessage, conversationHistory = []) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.warn('Groq API key not set — using fallback response')
    return getFallbackResponse(userMessage)
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      // Include last 6 messages for context (3 exchanges)
      ...conversationHistory.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ]

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq API error:', err)
      return getFallbackResponse(userMessage)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || getFallbackResponse(userMessage)
  } catch (error) {
    console.error('Groq fetch error:', error)
    return getFallbackResponse(userMessage)
  }
}

// ── FALLBACK (when API key not set or request fails) ──────────
const FALLBACK_RESPONSES = {
  stress: [
    "It sounds like you're carrying a lot right now. Try breaking your tasks into smaller steps — even finishing one small thing can help you feel more in control.",
    "Stress is your body's signal that something needs attention. Take a 5-minute break, breathe deeply, and come back with fresh eyes.",
  ],
  anxiety: [
    "Anxiety can feel overwhelming, but you're not alone. Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    "When anxiety hits, focus on what you can control right now — not what might happen. One breath at a time.",
  ],
  sleep: [
    "Poor sleep makes everything harder. Try putting your phone away 30 minutes before bed and doing something calming like reading or light stretching.",
    "A consistent sleep schedule — even on weekends — can make a big difference. Your body thrives on routine.",
  ],
  general: [
    "I hear you, and I'm here to listen. What's been weighing on you the most lately?",
    "Thank you for sharing that with me. You're taking a brave step by talking about how you feel.",
    "You don't have to face this alone. I'm here to support you through whatever you're going through.",
  ],
}

const getFallbackResponse = (message) => {
  const lower = message.toLowerCase()
  if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('pressure')) {
    const r = FALLBACK_RESPONSES.stress
    return r[Math.floor(Math.random() * r.length)]
  }
  if (lower.includes('anxi') || lower.includes('nervous') || lower.includes('worry')) {
    const r = FALLBACK_RESPONSES.anxiety
    return r[Math.floor(Math.random() * r.length)]
  }
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia')) {
    const r = FALLBACK_RESPONSES.sleep
    return r[Math.floor(Math.random() * r.length)]
  }
  const r = FALLBACK_RESPONSES.general
  return r[Math.floor(Math.random() * r.length)]
}

// ── MAIN EXPORT — used by ChatPage ────────────────────────────
export const processChatMessage = async (userMessage, conversationHistory = []) => {
  // 1. Crisis check first — local, instant, no API needed
  if (detectCrisis(userMessage)) {
    return {
      response:  CRISIS_RESPONSE,
      riskFlag:  true,
      isCrisis:  true,
      resources: CRISIS_RESOURCES,
    }
  }

  // 2. Get AI response from Groq
  const aiResponse = await getAIResponse(userMessage, conversationHistory)

  return {
    response:  aiResponse,
    riskFlag:  false,
    isCrisis:  false,
    resources: null,
  }
}

// ── HOTLINE INFO (used in UI) ─────────────────────────────────
export const HOTLINE_INFO = CRISIS_RESOURCES
