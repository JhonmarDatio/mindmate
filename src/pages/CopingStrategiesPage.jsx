import React, { useState } from 'react'
import { StudentLayout } from '../components/Layout'
import { getCopingStrategies } from '../utils/assessmentUtils'
import { Wind, BookOpen, FeatherIcon, Clock } from 'lucide-react'

const CopingStrategiesPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('Moderate')

  const strategies = {
    Low: getCopingStrategies('Low'),
    Mild: getCopingStrategies('Mild'),
    Moderate: getCopingStrategies('Moderate'),
    High: getCopingStrategies('High'),
  }

  const techniquesByCategory = {
    'Breathing Exercises': [
      {
        title: '4-7-8 Breathing',
        description: 'Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 4 times.',
        duration: '5 minutes',
        emoji: '🌬️',
      },
      {
        title: 'Box Breathing',
        description: 'Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec. Repeat 5 cycles.',
        duration: '5 minutes',
        emoji: '📦',
      },
      {
        title: 'Belly Breathing',
        description: 'Breathe deeply through your nose, feeling your belly expand. Breathe out slowly.',
        duration: '5 minutes',
        emoji: '🫁',
      },
    ],
    'Journaling Prompts': [
      {
        title: 'Gratitude Journal',
        description: 'Write 3 things you are grateful for today, no matter how small.',
        duration: '10 minutes',
        emoji: '📝',
      },
      {
        title: 'Emotion Check-in',
        description: 'Describe how you feel right now in 3 sentences. What triggered this feeling?',
        duration: '5 minutes',
        emoji: '💭',
      },
      {
        title: 'Letter to Yourself',
        description: 'Write a kind, encouraging letter to your future self about your challenges.',
        duration: '15 minutes',
        emoji: '💌',
      },
    ],
    'Physical Activities': [
      {
        title: 'Stretching',
        description: 'Gently stretch your body for 5-10 minutes. Focus on neck, shoulders, and back.',
        duration: '10 minutes',
        emoji: '🤸',
      },
      {
        title: 'Walking',
        description: 'Take a 15-30 minute walk outdoors. Notice your surroundings and breathe fresh air.',
        duration: '30 minutes',
        emoji: '🚶',
      },
      {
        title: 'Exercise',
        description: 'Engage in your favorite physical activity - running, dancing, yoga, or sports.',
        duration: '30 minutes',
        emoji: '🏃',
      },
    ],
    'Mindfulness & Relaxation': [
      {
        title: '5-4-3-2-1 Grounding',
        description:
          'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
        duration: '5 minutes',
        emoji: '🌍',
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Tense and release each muscle group from toes to head.',
        duration: '15 minutes',
        emoji: '😌',
      },
      {
        title: 'Meditation',
        description: 'Sit quietly and focus on your breath or a guided meditation app.',
        duration: '10 minutes',
        emoji: '🧘',
      },
    ],
  }

  return (
    <StudentLayout pageTitle="Coping Strategies & Wellness Techniques">
      {/* Stress Level Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Strategies by Stress Level</h2>
        <div className="flex flex-wrap gap-3">
          {['Low', 'Mild', 'Moderate', 'High'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedLevel === level
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {level} Stress
            </button>
          ))}
        </div>
      </div>

      {/* Selected Level Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {strategies[selectedLevel].map((strategy, idx) => (
          <div key={idx} className="card">
            <div className="flex gap-3">
              <span className="text-3xl flex-shrink-0">{strategy.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900">{strategy.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{strategy.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Techniques by Category */}
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Techniques by Category</h2>

      <div className="space-y-8">
        {/* Breathing Exercises */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Wind className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Breathing Exercises</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {techniquesByCategory['Breathing Exercises'].map((tech, idx) => (
              <TechniqueCard key={idx} technique={tech} />
            ))}
          </div>
        </div>

        {/* Journaling Prompts */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Journaling Prompts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {techniquesByCategory['Journaling Prompts'].map((tech, idx) => (
              <TechniqueCard key={idx} technique={tech} />
            ))}
          </div>
        </div>

        {/* Physical Activities */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🏃</span>
            <h3 className="text-xl font-bold text-gray-900">Physical Activities</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {techniquesByCategory['Physical Activities'].map((tech, idx) => (
              <TechniqueCard key={idx} technique={tech} />
            ))}
          </div>
        </div>

        {/* Mindfulness & Relaxation */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🧘</span>
            <h3 className="text-xl font-bold text-gray-900">Mindfulness & Relaxation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {techniquesByCategory['Mindfulness & Relaxation'].map((tech, idx) => (
              <TechniqueCard key={idx} technique={tech} />
            ))}
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="mt-12 card border-2 border-teal-200 bg-teal-50">
        <h3 className="text-xl font-bold text-teal-900 mb-4">Tips for Success</h3>
        <ul className="space-y-3 text-teal-900">
          <li className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>
              <strong>Start small:</strong> Begin with techniques that appeal to you and gradually explore others.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>
              <strong>Practice regularly:</strong> Coping skills work best when practiced consistently, not just during
              crisis.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>
              <strong>Find what works for you:</strong> Different techniques help different people. Experiment and see
              what resonates.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>
              <strong>Use a combination:</strong> Combining multiple techniques often provides better results than
              using one alone.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <span>
              <strong>Seek professional help:</strong> These techniques complement but don't replace professional
              mental health support.
            </span>
          </li>
        </ul>
      </div>
    </StudentLayout>
  )
}

const TechniqueCard = ({ technique }) => {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div
      className="card cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0">{technique.emoji}</span>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{technique.title}</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {technique.duration}
          </p>
        </div>
      </div>
      {expanded && <p className="text-gray-700 text-sm mt-3 pt-3 border-t">{technique.description}</p>}
      <p className="text-xs text-teal-600 mt-2 font-medium">{expanded ? 'Click to hide' : 'Click to expand'}</p>
    </div>
  )
}

export default CopingStrategiesPage
