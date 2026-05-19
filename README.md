# MindMate – AI-Powered Mental Health Support System for Students

A comprehensive web application providing mental health support, assessment, mood tracking, and crisis detection for students, with a separate admin portal for guidance counselors.

## Features

### Student Portal

✅ **Mental Health Assessment**
- 21-question assessment with 0-3 scale scoring
- Real-time stress level classification (Low, Mild, Moderate, High)
- Personalized recommendations based on results
- Consent system for data sharing with counselors

✅ **Mood Tracking**
- Daily mood logging with emoji-based scale
- Optional notes section
- 30-day mood history visualization with charts
- Trend analysis

✅ **AI Chatbot Assistant**
- Supportive conversation interface
- Crisis detection system
- Automatic emergency resource suggestions
- Message history

✅ **Coping Strategies**
- Evidence-based techniques by stress level
- Breathing exercises (4-7-8, Box, Belly)
- Journaling prompts
- Physical activities
- Mindfulness & relaxation techniques

### Admin/Guidance Counselor Portal

✅ **Dashboard**
- Real-time statistics
- Stress level distribution charts
- Student assessment overview

✅ **Assessment Management**
- Searchable assessment table
- Filter by stress level and date
- Student information (respecting consent)
- Export capabilities

✅ **Risk Monitoring**
- High-risk case detection
- Crisis keyword flagging
- Emergency resource information
- Response protocol guidelines

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time
- **Hosting**: Vercel/Netlify (Frontend)

## Installation

### 1. Clone and Install Dependencies

```bash
cd mindmate
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your Project URL and Anon Key

#### Create Database Tables

Connect to your Supabase database and run the following SQL:

```sql
-- Users table (extends Supabase auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  consent_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  stress_level VARCHAR(50) NOT NULL CHECK (stress_level IN ('Low', 'Mild', 'Moderate', 'High')),
  consent_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking table
CREATE TABLE public.mood_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot logs table
CREATE TABLE public.chatbot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  risk_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data, admins can see all
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Assessments - users see their own, admins see all with consent
CREATE POLICY "Users can view their own assessments" ON public.assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view consented assessments" ON public.assessments
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' AND consent_status = TRUE);

CREATE POLICY "Users can insert their assessments" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mood tracking - users see their own
CREATE POLICY "Users can view their own moods" ON public.mood_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their moods" ON public.mood_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chatbot logs - users see their own, admins see flagged ones
CREATE POLICY "Users can view their own chat logs" ON public.chatbot_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view flagged messages" ON public.chatbot_logs
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' AND risk_flag = TRUE);

CREATE POLICY "Users can insert chat logs" ON public.chatbot_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at);
CREATE INDEX idx_mood_tracking_user_id ON public.mood_tracking(user_id);
CREATE INDEX idx_mood_tracking_created_at ON public.mood_tracking(created_at);
CREATE INDEX idx_chatbot_logs_user_id ON public.chatbot_logs(user_id);
CREATE INDEX idx_chatbot_logs_risk_flag ON public.chatbot_logs(risk_flag);
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Demo Accounts

In the Supabase dashboard, create two test users:

```
Student Account:
- Email: student@demo.com
- Password: password123
- Role: student

Admin Account:
- Email: admin@demo.com
- Password: password123
- Role: admin
```

### 5. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Project Structure

```
mindmate/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── AssessmentPage.jsx
│   │   ├── AssessmentResultPage.jsx
│   │   ├── MoodTrackerPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── CopingStrategiesPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminAssessmentsPage.jsx
│   │   └── AdminRiskMonitoringPage.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   ├── assessmentUtils.js
│   │   ├── authUtils.js
│   │   ├── databaseUtils.js
│   │   └── chatbotUtils.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── supabaseClient.js
├── .env
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Key Features Implementation

### Assessment Scoring

- **Questions**: 21 items
- **Scale**: 0-3 points per question
- **Max Score**: 63 points
- **Classification**:
  - Low: 0-25%
  - Mild: 26-50%
  - Moderate: 51-75%
  - High: 76-100%

### Crisis Detection

Keywords triggering high-risk flag:
- "want to die"
- "want to end my life"
- "ayoko na mabuhay" (Tagalog)
- "kill myself"
- "harm myself"
- "suicide"

### Role-Based Access Control

- **Students**: Can only access student portal
- **Admins**: Can only access admin portal
- **Consent System**: Controls visibility of student names in assessments

## Security Features

✅ Supabase Row Level Security (RLS)
✅ Role-based access control
✅ Consent system for data sharing
✅ Encrypted sensitive data
✅ Secure authentication with Supabase Auth
✅ No student names shown without consent

## Crisis Support Resources

**National (USA)**:
- Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

**International**:
- International Association for Suicide Prevention
- Contact your local emergency services: 911 (USA), 999 (UK), 112 (EU)

## Important Disclaimer

⚠️ **This system is for educational and support purposes only and is NOT a substitute for professional mental health services.**

If you or someone you know is in crisis, please contact:
- Local emergency services
- National crisis hotlines
- Professional mental health providers
- School guidance counselors
- Trusted adults

## Future Enhancements

- [ ] Integration with professional therapists
- [ ] Video/voice call support
- [ ] Group therapy sessions
- [ ] Parent/guardian access
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Appointment scheduling system
- [ ] Resource library with articles/videos
- [ ] Peer support groups

## Contributing

This is a student project. For improvements or bug fixes, please submit a pull request.

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please contact the development team or submit an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active Development
#   m i n d m a t e  
 