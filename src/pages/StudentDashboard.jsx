import React from 'react'
import { Link } from 'react-router-dom'
import { StudentLayout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight, Heart, BarChart3, MessagesSquare, Smile, BookOpen } from 'lucide-react'

const features = [
  {
    path: '/assessment',
    title: 'Mental Health Assessment',
    desc: 'Complete a short assessment to understand your current stress and wellness levels.',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    path: '/mood-tracker',
    title: 'Mood Tracker',
    desc: 'Check in with yourself daily and watch your mood over time.',
    icon: Smile,
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    path: '/chat',
    title: 'Chat Support',
    desc: 'Talk to MindMate for encouragement, coping tips, and emotional support.',
    icon: MessagesSquare,
    color: 'bg-green-100 text-green-700',
  },
  {
    path: '/coping-strategies',
    title: 'Coping Strategies',
    desc: 'Explore simple tools to help you manage stress, anxiety, and overwhelm.',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-700',
  },
]

const StudentDashboard = () => {
  const { user } = useAuth()
  const userName = user?.user_metadata?.name || user?.email || 'Student'

  return (
    <StudentLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">    
            <Heart className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome!</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Hi, {userName} 👋
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Your mental health matters. Explore the tools below to check in with yourself and find support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group rounded-3xl border border-border/60 bg-background p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            ⚕️ This system is for support purposes only and is not a substitute for professional mental health services.
            If you are in crisis, please contact your guidance counselor or <span className="text-red-600 font-bold">(National Center for Mental Health (NCMH) Crisis Hotline 1553)</span>.
          </p>
        </div>
      </div>
    </StudentLayout>
  )
}

export default StudentDashboard
