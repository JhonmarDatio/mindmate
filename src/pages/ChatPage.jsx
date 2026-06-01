import { useState, useEffect, useRef } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import {
  saveChatMessage,
  getChatSessions,
  getSessionMessages,
} from '../utils/databaseUtils'
import { processChatMessage, detectCrisis } from '../utils/chatbotUtils'
import {
  Send, AlertTriangle, Bot, User, Loader2,
  Plus, MessageSquare, ChevronLeft, ChevronRight, ShieldAlert,
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────────
const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi there! 😊 I'm MindMate, your friendly AI companion. I'm here to listen and support you. How are you feeling today?",
}

const genSessionId = () =>
  `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Math.floor((Date.now() - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── component ─────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth()

  const [sessions, setSessions]             = useState([])
  const [activeSession, setActiveSession]   = useState(null)
  const [messages, setMessages]             = useState([WELCOME])
  const [inputValue, setInputValue]         = useState('')
  const [loading, setLoading]               = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyOpen, setHistoryOpen]       = useState(false)
  const [riskDetected, setRiskDetected]     = useState(false)
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [crisisResources, setCrisisResources] = useState([])
  const scrollRef  = useRef(null)
  const textareaRef = useRef(null)

  // Load session list
  useEffect(() => {
    if (!user) return
    getChatSessions(user.id).then(({ sessions: s }) => {
      setSessions(s || [])
      setHistoryLoading(false)
    })
  }, [user])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Open a past session
  const openSession = async (sessionId) => {
    setActiveSession(sessionId)
    setRiskDetected(false)
    setHistoryOpen(false)
    const { chats } = await getSessionMessages(user.id, sessionId)
    if (chats && chats.length > 0) {
      const formatted = chats.flatMap((c) => [
        { id: `${c.id}-u`, role: 'user',      content: c.message,  timestamp: c.created_at },
        { id: `${c.id}-a`, role: 'assistant', content: c.response, timestamp: c.created_at, isRisk: c.risk_flag },
      ])
      setMessages(formatted)
      setRiskDetected(formatted.some((m) => m.isRisk))
    } else {
      setMessages([WELCOME])
    }
  }

  // New chat
  const startNewChat = () => {
    setActiveSession(genSessionId())
    setMessages([WELCOME])
    setRiskDetected(false)
    setHistoryOpen(false)
  }

  // Send
  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const sessionId = activeSession || genSessionId()
    if (!activeSession) setActiveSession(sessionId)

    const userMsg = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    if (detectCrisis(userMsg.content)) setRiskDetected(true)

    // Pass conversation history for context-aware AI responses
    const result = await processChatMessage(userMsg.content, messages)
    const botMsg = {
      id: `${Date.now()}-a`,
      role: 'assistant',
      content: result.response,
      timestamp: new Date().toISOString(),
      isRisk: result.riskFlag,
    }
    setMessages((prev) => [...prev, botMsg])

    await saveChatMessage(user.id, userMsg.content, result.response, result.riskFlag, sessionId)

    // Refresh session list
    const { sessions: s } = await getChatSessions(user.id)
    setSessions(s || [])

    if (result.isCrisis) {
      setCrisisResources(result.resources || [])
      setShowCrisisModal(true)
    }
    setLoading(false)
  }

  // ── render ────────────────────────────────────────────────
  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex gap-4">

        {/* ── HISTORY PANEL (collapsible) ── */}
        <div className={`flex-shrink-0 transition-all duration-300 ${historyOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          <div className="w-64 h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Chat History</p>
              <button
                onClick={startNewChat}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto p-2">
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6 px-2">
                  No previous chats yet.
                </p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.session_id}
                    onClick={() => openSession(s.session_id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition ${
                      activeSession === s.session_id
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {s.preview || 'Chat'}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 pl-5">
                      {formatDate(s.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-w-0">

          {/* Chat header */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
            {/* Toggle history */}
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500"
              title={historyOpen ? 'Hide history' : 'Show history'}
            >
              {historyOpen
                ? <ChevronLeft className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">MindMate Chat</p>
              <p className="text-[11px] text-gray-400">Your supportive AI companion</p>
            </div>

            {/* New chat button */}
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Chat
            </button>
          </div>

          {/* Risk banner */}
          {riskDetected && (
            <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                If you're in crisis, please contact your guidance counselor or call{' '}
                <span className="font-bold">NCMH Crisis Hotline 1553</span>.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-teal-600" />
                    </div>
                  )}

                  <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-sm'
                        : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.timestamp && (
                      <span className="text-[10px] text-gray-400 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder="Type your message... (Enter to send)"
                disabled={loading}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60 transition"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  inputValue.trim() && !loading
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              MindMate is an AI assistant and does not provide medical diagnoses. For emergencies call{' '}
              <span className="text-red-500 font-semibold">NCMH Crisis Hotline 1553</span>
            </p>
          </div>
        </div>
      </div>

      {/* Crisis modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Crisis Support Available</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  I'm concerned about what you shared. Your safety matters most.
                </p>
              </div>
            </div>
            <div className="space-y-3 bg-red-50 rounded-2xl p-4 mb-5">
              {crisisResources.slice(0, 3).map((r, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-red-700">{r.name}</p>
                  <p className="text-sm text-red-600">{r.number}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCrisisModal(false)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-3 text-sm font-semibold transition"
            >
              I will reach out for help
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}
