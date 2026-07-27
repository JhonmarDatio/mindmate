-- ============================================================
-- FIX: Remove recursive RLS policies on profiles table
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the recursive policies that cause slow/hanging queries
DROP POLICY IF EXISTS "profiles: staff read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: superadmin update all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: superadmin delete" ON public.profiles;

-- Re-create staff read policy WITHOUT recursion
-- Uses auth.jwt() to read the role from the JWT token directly
-- This avoids querying the profiles table inside a profiles policy
CREATE POLICY "profiles: staff read all"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() ->> 'role') IN ('counselor', 'superadmin')
    OR
    -- fallback: check user_metadata in the JWT
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
  );

CREATE POLICY "profiles: superadmin update all"
  ON public.profiles FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'superadmin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

CREATE POLICY "profiles: superadmin delete"
  ON public.profiles FOR DELETE
  USING (
    (auth.jwt() ->> 'role') = 'superadmin'
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

-- Also fix the recursive subqueries in other tables' policies
-- assessments: staff read consented
DROP POLICY IF EXISTS "assessments: staff read consented" ON public.assessments;
CREATE POLICY "assessments: staff read consented"
  ON public.assessments FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      consent_status = TRUE
      AND (
        (auth.jwt() ->> 'role') IN ('counselor', 'superadmin')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
      )
    )
  );

-- chat: staff read risk
DROP POLICY IF EXISTS "chat: staff read risk" ON public.chatbot_logs;
CREATE POLICY "chat: staff read risk"
  ON public.chatbot_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      risk_flag = TRUE
      AND (
        (auth.jwt() ->> 'role') IN ('counselor', 'superadmin')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
      )
    )
  );

-- ============================================================
-- DONE ✅ — Recursive RLS policies replaced with JWT-based checks
-- ============================================================
