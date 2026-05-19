-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CREATE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  consent_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INT CHECK (score BETWEEN 0 AND 63),
  percentage INT CHECK (percentage BETWEEN 0 AND 100),
  stress_level TEXT CHECK (stress_level IN ('Low', 'Mild', 'Moderate', 'High')),
  consent_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chatbot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  risk_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP OLD POLICIES (IMPORTANT PARA Iwas Error)
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin access to users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "User view own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admin view consented assessments" ON public.assessments;
DROP POLICY IF EXISTS "User insert own assessment" ON public.assessments;

DROP POLICY IF EXISTS "User view own moods" ON public.mood_tracking;
DROP POLICY IF EXISTS "User insert own mood" ON public.mood_tracking;

DROP POLICY IF EXISTS "User view own chat" ON public.chatbot_logs;
DROP POLICY IF EXISTS "Admin view risk flags" ON public.chatbot_logs;
DROP POLICY IF EXISTS "User insert own chat" ON public.chatbot_logs;

-- ============================================
-- CREATE POLICIES
-- ============================================

-- USERS
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admin access to users"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ASSESSMENTS
CREATE POLICY "User view own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin view consented assessments"
ON public.assessments FOR SELECT
USING (
  consent_status = TRUE AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "User insert own assessment"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- MOOD
CREATE POLICY "User view own moods"
ON public.mood_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "User insert own mood"
ON public.mood_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- CHATBOT
CREATE POLICY "User view own chat"
ON public.chatbot_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin view risk flags"
ON public.chatbot_logs FOR SELECT
USING (
  risk_flag = TRUE AND
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "User insert own chat"
ON public.chatbot_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mood_user_id ON public.mood_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON public.chatbot_logs(user_id);

-- ============================================
-- VERIFY
-- ============================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';