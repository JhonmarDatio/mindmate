import React, { useState, useEffect } from 'react'
import { Bot } from 'lucide-react'

const LoadingSpinner = () => {
  const [textIndex, setTextIndex] = useState(0)

  // Mga nakakaaliw at nakaka-relax na loading messages habang naghihintay sila
  const loadingPhrases = [
    "Hang on tight, we're loading up...",
    "Just a moment while we map your mind...",
    "Good things take a little time! ✨",
    "Ready for your adventure?",
    "Let the quest begin! 🚀",
    "Calming the servers down... 🍃"
  ]

  // Nagpapalit-palit ang text kada 2.5 segundo para hindi nakatunganga ang user
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % loadingPhrases.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 relative overflow-hidden">
      
      {/* Background Decorative Floating Bubbles (Gives a dreamy/calm vibe) */}
      <div className="absolute w-64 h-64 bg-teal-200/20 rounded-full -top-10 -left-10 blur-3xl animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-blue-200/20 rounded-full -bottom-12 -right-12 blur-3xl animate-pulse delay-700"></div>

      <div className="flex flex-col items-center gap-6 z-10 p-6 text-center max-w-sm">
        
        {/* Animated Robot & Spinner Container */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          
          {/* Outer Rotating Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-teal-200 animate-[spin_8s_linear_infinite]"></div>
          
          {/* Inner Fast Spinner Arc */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600 border-r-teal-500/40 animate-spin"></div>
          
          {/* Center Bouncing/Floating Robot Mascot Icon */}
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 animate-bounce">
            <Bot className="w-8 h-8 stroke-[1.8]" />
          </div>

          {/* Little Sparkles Particle Animation using CSS */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
          <span className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-300"></span>
        </div>

        {/* Dynamic Text Section */}
        <div className="space-y-1.5 min-h-[50px]">
          <p className="text-teal-800 font-bold text-base tracking-wide transition-all duration-500 ease-in-out">
            {loadingPhrases[textIndex]}
          </p>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest animate-pulse">
            MindMate is preparing
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoadingSpinner