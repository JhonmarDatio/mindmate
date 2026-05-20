import React, { useState, useEffect, useRef } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { saveChatMessage, getUserChatHistory } from '../utils/databaseUtils'
import { processChatMessage, HOTLINE_INFO } from '../utils/chatbotUtils'
import { Send, AlertTriangle, Bot, User, Loader2 } from 'lucide-react'

const DISTRESS_KEYWORDS = [
  'suicide',
  'kill myself',
  'want to die',
  'end my life',
  'self-harm',
  'hurt myself',
  'hopeless',
  'give up',
  'no reason to live',
]

const detectDistress = (text) => {
  return DISTRESS_KEYWORDS.some((keyword) => text.toLowerCase().includes(keyword))
}

const ChatPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 'assistant-1',
      role: 'assistant',
      content: "Hi there! 😊 I'm MindMate, your friendly AI companion. I'm here to listen and support you. How are you feeling today?",
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [riskDetected, setRiskDetected] = useState(false)
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const [crisisMessage, setCrisisMessage] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (user) {
        const { chats } = await getUserChatHistory(user.id)
        if (chats) {
          const formattedMessages = chats.flatMap((chat) => [
            {
              id: `${chat.id}-user`,
              role: 'user',
              content: chat.message,
              timestamp: chat.created_at,
            },
            {
              id: `${chat.id}-assistant`,
              role: 'assistant',
              content: chat.response,
              timestamp: chat.created_at,
              isRisk: chat.risk_flag,
            },
          ])
          setMessages(formattedMessages)
          setRiskDetected(formattedMessages.some((m) => m.isRisk))
        }
        setHistoryLoading(false)
      }
    }

    fetchChatHistory()
  }, [user])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInputValue('')
    setLoading(true)

    const isDistress = detectDistress(userMessage.content)
    if (isDistress) {
      setRiskDetected(true)
    }

    const response = processChatMessage(userMessage.content)

    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      content: response.response,
      timestamp: new Date().toISOString(),
      isRisk: response.riskFlag,
    }

    setMessages((prev) => [...prev, assistantMessage])
    await saveChatMessage(user.id, userMessage.content, response.response, response.riskFlag)

    if (response.isCrisis) {
      setShowCrisisAlert(true)
      setCrisisMessage(response)
    }

    setLoading(false)
  }

  return (
    <StudentLayout>
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-border bg-white/70 backdrop-blur">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              MindMate Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Your supportive AI companion
            </p>
          </div>
        </div>
      </div>

      {/* Chat container centered */}
      <main className="flex-1 flex items-stretch justify-center">
        <section className="w-full max-w-3xl rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="flex-1 h-0 overflow-y-auto p-4 md:p-6">
            {riskDetected && (
              <div className="p-4 rounded-3xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-semibold text-destructive">
                    If you're in crisis, please reach out for help:
                  </p>
                  <p>
                    Contact your guidance counselor, a trusted teacher, or call a
                    crisis hotline.
                  </p>
                </div>
              </div>
            )}

            {historyLoading ? (
              <div className="flex h-72 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading chat history...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] px-5 py-4 rounded-[32px] text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-white border border-border rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-9 h-9 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>

                    <div className="bg-white border border-border rounded-[32px] px-5 py-4 text-sm text-muted-foreground shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        MindMate is typing...
                      </div>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <footer className="flex-shrink-0 p-4 md:p-6 border-t border-border bg-white">
            <form
              onSubmit={handleSendMessage}
              className="max-w-full mx-auto relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 rounded-full border border-border bg-background pl-5 pr-14 py-3.5 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* FIXED POSITIONED ARROW BUTTON: Gumagamit ng system variables para kakulay ng overall template mo */}
            <button
               type="submit"
                 disabled={!inputValue.trim() || loading}
                 className={`absolute right-4 p-2.5 rounded-full transition-all duration-200 inline-flex items-center justify-center shadow-sm
                  ${inputValue.trim() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                             >
                             <Send className="w-4 h-4 stroke-[2.5]" />
</button>
            </form>

            <p className="text-[10px] text-muted-foreground text-center mt-3">
              MindMate is an AI assistant and does not provide medical diagnoses.
              For emergencies, contact your guidance counselor or <br /> <span className="text-red-600 font-bold">(National Center for Mental Health (NCMH) Crisis Hotline 1553)</span>
            </p>
          </footer>
        </section>
      </main>

      {/* Crisis modal */}
      {showCrisisAlert && crisisMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">
                  Crisis Support Available
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  I'm concerned about what you shared. Your safety matters most.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-destructive/5 p-4">
              {crisisMessage.resources?.slice(0, 2).map((resource, idx) => (
                <div key={idx}>
                  <p className="font-medium text-destructive">
                    {resource.name}
                  </p>
                  <p className="text-sm text-destructive/80">
                    {resource.number}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCrisisAlert(false)}
              className="mt-5 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              I will reach out for help
            </button>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}

export default ChatPage