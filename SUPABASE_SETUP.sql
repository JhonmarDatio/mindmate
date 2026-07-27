-- ============================================================
-- MINDMATE — SUPABASE DATABASE SETUP
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ============================================================
-- 1. PROFILES TABLE
--    Extends Supabase auth.users with role + name + consent
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'counselor', 'superadmin')),
  consent_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, consent_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    FALSE
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. ASSESSMENTS TABLE
--    Stores each student's stress assessment submission
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score          INTEGER NOT NULL DEFAULT 0,
  percentage     INTEGER NOT NULL DEFAULT 0,
  stress_level   TEXT NOT NULL DEFAULT 'Low'
                   CHECK (stress_level IN ('Low', 'Mild', 'Moderate', 'High')),
  consent_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);


-- ============================================================
-- 3. MOOD TRACKING TABLE
--    Stores daily mood logs per student
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_tracking (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score  INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mood_user_id ON public.mood_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_created_at ON public.mood_tracking(created_at DESC);


-- ============================================================
-- 4. CHATBOT LOGS TABLE
--    Stores every chat message + AI response + risk flag
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chatbot_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  response   TEXT NOT NULL,
  risk_flag  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_id ON public.chatbot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_risk_flag ON public.chatbot_logs(risk_flag) WHERE risk_flag = TRUE;


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
--    Protects data so users can only see their own records
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_logs  ENABLE ROW LEVEL SECURITY;


-- ── PROFILES ──────────────────────────────────────────────
-- Users can read/update only their own profile
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Counselors and superadmins can read all profiles
CREATE POLICY "profiles: staff read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('counselor', 'superadmin')
    )
  );

-- Superadmin can update any profile (for role changes)
CREATE POLICY "profiles: superadmin update all"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );

-- Superadmin can delete profiles
CREATE POLICY "profiles: superadmin delete"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'superadmin'
    )
  );


-- ── ASSESSMENTS ───────────────────────────────────────────
-- Students can insert and read their own assessments
CREATE POLICY "assessments: own insert"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments: own read"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Counselors and superadmins can read consented assessments only
CREATE POLICY "assessments: staff read consented"
  ON public.assessments FOR SELECT
  USING (
    consent_status = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('counselor', 'superadmin')
    )
  );


-- ── MOOD TRACKING ─────────────────────────────────────────
-- Students can insert and read their own mood logs
CREATE POLICY "mood: own insert"
  ON public.mood_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood: own read"
  ON public.mood_tracking FOR SELECT
  USING (auth.uid() = user_id);


-- ── CHATBOT LOGS ──────────────────────────────────────────
-- Students can insert and read their own chat logs
CREATE POLICY "chat: own insert"
  ON public.chatbot_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat: own read"
  ON public.chatbot_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Counselors and superadmins can read flagged (risk) messages only
CREATE POLICY "chat: staff read risk"
  ON public.chatbot_logs FOR SELECT
  USING (
    risk_flag = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('counselor', 'superadmin')
    )
  );


-- ============================================================
-- 6. HELPER VIEW — counselor dashboard stats
--    Safe aggregated view, no raw PII exposed
--    Using SECURITY INVOKER (not DEFINER) for proper RLS enforcement
-- ============================================================
DROP VIEW IF EXISTS public.dashboard_stats;

CREATE OR REPLACE VIEW public.dashboard_stats
WITH (security_invoker = true)
AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student')                          AS total_students,
  (SELECT COUNT(*) FROM public.assessments)                                               AS total_assessments,
  (SELECT COUNT(*) FROM public.assessments WHERE stress_level = 'Low')                   AS low_count,
  (SELECT COUNT(*) FROM public.assessments WHERE stress_level = 'Mild')                  AS mild_count,
  (SELECT COUNT(*) FROM public.assessments WHERE stress_level = 'Moderate')              AS moderate_count,
  (SELECT COUNT(*) FROM public.assessments WHERE stress_level = 'High')                  AS high_count,
  (SELECT COUNT(*) FROM public.chatbot_logs WHERE risk_flag = TRUE)                      AS risk_chat_count;


-- ============================================================
-- DONE ✅
-- Tables created: profiles, assessments, mood_tracking, chatbot_logs
-- RLS policies applied to all tables
-- Auto-profile trigger installed
-- ============================================================
