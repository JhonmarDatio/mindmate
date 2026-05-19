import React, { useState, useEffect, useRef } from 'react'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { saveChatMessage, getUserChatHistory } from '../utils/databaseUtils'
import { processChatMessage, HOTLINE_INFO } from '../utils/chatbotUtils'
import { Send, AlertCircle } from 'lucide-react'

const ChatPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const [crisisMessage, setCrisisMessage] = useState(null)
  const messagesEndRef = useRef(null)

  // Load chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (user) {
        const { chats } = await getUserChatHistory(user.id)
        if (chats) {
          const formattedMessages = chats.flatMap((chat) => [
            { id: `${chat.id}-user`, text: chat.message, sender: 'user', timestamp: chat.created_at },
            {
              id: `${chat.id}-bot`,
              text: chat.response,
              sender: 'bot',
              timestamp: chat.created_at,
              isRisk: chat.risk_flag,
            },
          ])
          setMessages(formattedMessages)
        }
        setHistoryLoading(false)
      }
    }

    fetchChatHistory()
  }, [user])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    setLoading(true)

    try {
      // Add user message
      const userMessage = {
        id: Date.now() + 'user',
        text: inputValue,
        sender: 'user',
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Process message with chatbot logic
      const response = processChatMessage(inputValue)

      // Add bot message
      const botMessage = {
        id: Date.now() + 'bot',
        text: response.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isRisk: response.riskFlag,
        resources: response.resources,
      }

      setMessages((prev) => [...prev, botMessage])

      // Save to database
      await saveChatMessage(user.id, inputValue, response.response, response.riskFlag)

      // Show crisis alert if needed
      if (response.isCrisis) {
        setShowCrisisAlert(true)
        setCrisisMessage(response)
      }

      setInputValue('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentLayout pageTitle="MindMate Chat - Your AI Support Companion">
      <div className="flex flex-col h-full gap-4 max-w-4xl mx-auto">
        {/* Crisis Alert */}
        {showCrisisAlert && crisisMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-red-600">Crisis Support Available</h3>
                  <p className="text-gray-700 text-sm mt-2">
                    I'm deeply concerned about what you've shared. Your safety is the most important thing.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-bold text-red-900 mb-3">Please reach out immediately:</p>
                <div className="space-y-2 text-sm">
                  {crisisMessage.resources?.slice(0, 2).map((resource, idx) => (
                    <div key={idx}>
                      <p className="font-medium text-red-900">{resource.name}</p>
                      <p className="text-red-800">{resource.number}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowCrisisAlert(false)}
                className="w-full btn-primary"
              >
                I Will Reach Out for Help
              </button>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="flex-1 card overflow-y-auto max-h-96 md:max-h-[500px] bg-gray-50">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-4xl">💬</div>
              <p className="text-gray-600 text-center">
                Welcome to MindMate! I'm here to listen and support you. How are you feeling today?
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : `${
                            message.isRisk ? 'bg-red-100 text-red-900' : 'bg-white text-gray-900 border border-gray-200'
                          } rounded-bl-none`
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}

              {/* Crisis Resources */}
              {messages.some((m) => m.isRisk) && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 my-4">
                  <h4 className="font-bold text-red-900 mb-3">Support Resources:</h4>
                  <div className="space-y-2 text-sm">
                    {HOTLINE_INFO.map((info, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border border-red-200">
                        <p className="font-medium text-red-900">{info.name}</p>
                        {info.number && <p className="text-red-800">{info.number}</p>}
                        {info.available && <p className="text-xs text-red-700">{info.available}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            disabled={loading}
            className="flex-1 input-field disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Disclaimer */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
          <p className="font-medium mb-1">About MindMate Chat:</p>
          <p>
            This is an AI-powered support chat and is not a substitute for professional mental health
            counseling. If you're in crisis, please call emergency services or a crisis hotline immediately.
          </p>
        </div>
      </div>
    </StudentLayout>
  )
}

export default ChatPage
