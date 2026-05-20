import React, { useState } from 'react'
import { StudentLayout } from '../components/Layout'
import { getCopingStrategies } from '../utils/assessmentUtils'
import { Wind, BookOpen, Heart, Users } from 'lucide-react'

const CopingStrategiesPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('Low')

  const strategies = {
    Low: getCopingStrategies('Low'),
    Mild: getCopingStrategies('Mild'),
    Moderate: getCopingStrategies('Moderate'),
    High: getCopingStrategies('High'),
  }

  const categories = [
    {
      title: 'Breathing Exercises',
      icon: Wind,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      items: [
        { title: '4-7-8 Breathing', desc: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times.' },
        { title: 'Box Breathing', desc: 'Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec. Repeat 5 cycles.' },
        { title: 'Belly Breathing', desc: 'Place hand on stomach. Breathe deeply through nose, feel belly rise. Exhale slowly through mouth.' }
      ]
    },
    {
      title: 'Journaling Prompts',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        { title: 'Gratitude Journal', desc: 'Write 3 things you are grateful for today, no matter how small.' },
        { title: 'Emotion Check-in', desc: 'Describe how you feel right now in 3 sentences. What triggered this feeling?' },
        { title: 'Letter to Yourself', desc: 'Write a kind, encouraging letter to your future self.' }
      ]
    },
    {
      title: 'Physical Activities',
      icon: Heart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      items: [
        { title: '5-Minute Stretch', desc: 'Stretch your neck, shoulders, arms, and legs. Hold each stretch for 15 seconds.' },
        { title: 'Walk & Observe', desc: 'Take a 10-minute walk. Notice 5 things you see, 4 you hear, 3 you feel.' },
        { title: 'Dance Break', desc: 'Put on your favorite song and dance freely for 3 minutes.' }
      ]
    },
    {
      title: 'Social Support',
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        { title: 'Reach Out', desc: 'Send a message to a friend or family member you trust. You don’t have to be alone.' },
        { title: 'Study Buddy', desc: 'Find a classmate to study with. Shared effort reduces stress.' },
        { title: 'Talk to Someone', desc: 'Visit your guidance counselor. They are trained to help and want to support you.' }
      ]
    }
  ]

  return (
    <StudentLayout pageTitle="Coping Strategies">
      {/* MAIN CONTAINER: Ginagawa nitong centered at malinis ang buong scrollable canvas */}
      <div className="min-h-screen bg-slate-50/40 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl flex flex-col">

          {/* PAGE TITLE HEADER */}
          <div className="mb-6 flex flex-col items-start">
            <div className="flex items-center gap-2.5 text-slate-800 text-2xl font-bold">
              <BookOpen className="w-6 h-6 text-teal-700 stroke-[2.5]" />
              <h2 className="tracking-tight">Coping Strategies</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1 font-medium">Practical techniques to help you manage stress and improve well-being.</p>
          </div>

          {/* PILL TAB CONTROLS (Naka-center at flat ang modern look) */}
          <div className="bg-gray-200/60 p-1 rounded-xl flex gap-1 w-full max-w-xl mb-8 border border-gray-300/20 self-center">
            {['Low', 'Mild', 'Moderate', 'High'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
                  ${selectedLevel === level
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* SECTION 1: RECOMMENDED COPING STRATEGIES (Direktang nakalutang sa flat canvas gaya ng mockup mo) */}
          <div className="mb-14 w-full">
            <div className="flex items-center gap-2 text-teal-800 font-bold mb-4 text-xs tracking-wide uppercase">
              <BookOpen className="w-4 h-4 text-teal-600 stroke-[2.5]" />
              <h3>Recommended Coping Strategies</h3>
            </div>

            {/* List entries na may malalambot na gray backgrounds */}
            <div className="space-y-3">
              {strategies[selectedLevel].map((strategy, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 bg-gray-100/60 border border-gray-200/20 rounded-xl px-5 py-4"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-[13px] font-medium leading-relaxed">
                    {strategy.title || strategy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: TECHNIQUES BY CATEGORY */}
          <div className="w-full">
            <h3 className="text-md font-bold text-slate-900 tracking-tight mb-5">Techniques by Category</h3>
            
            {/* 2-Column Grid para sa malalaking malilinis na panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon
                return (
                  <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                    
                    {/* Category Box Title Header */}
                    <div className="flex items-center gap-3 mb-5 pb-2.5 border-b border-gray-50">
                      <div className={`p-2 rounded-xl ${cat.bg}`}>
                        <IconComponent className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm tracking-wide">{cat.title}</h4>
                    </div>

                    {/* Sub-item light grey sub-panels inside the main block card */}
                    <div className="space-y-3 flex-1">
                      {cat.items.map((item, i) => (
                        <div key={i} className="bg-gray-50/80 border border-gray-100/40 rounded-xl p-4">
                          <h5 className="font-bold text-slate-800 text-xs mb-1">
                            {item.title}
                          </h5>
                          <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  )
}

export default CopingStrategiesPage