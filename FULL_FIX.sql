-- ============================================================
-- FULL FIX — Run this entire script in Supabase SQL Editor
-- ============================================================


-- ============================================================
-- PART 1: FIX RLS POLICIES (removes recursive queries = mabilis na)
-- ============================================================

DROP POLICY IF EXISTS "profiles: staff read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: superadmin update all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: superadmin delete" ON public.profiles;

-- No more recursive subqueries — reads role from JWT token directly
CREATE POLICY "profiles: staff read all"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
  );

CREATE POLICY "profiles: superadmin update all"
  ON public.profiles FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

CREATE POLICY "profiles: superadmin delete"
  ON public.profiles FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

-- Fix assessments policy
DROP POLICY IF EXISTS "assessments: staff read consented" ON public.assessments;
CREATE POLICY "assessments: staff read consented"
  ON public.assessments FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      consent_status = TRUE
      AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
    )
  );

-- Fix chatbot policy
DROP POLICY IF EXISTS "chat: staff read risk" ON public.chatbot_logs;
CREATE POLICY "chat: staff read risk"
  ON public.chatbot_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      risk_flag = TRUE
      AND (auth.jwt() -> 'user_metadata' ->> 'role') IN ('counselor', 'superadmin')
    )
  );


-- ============================================================
-- PART 2: CREATE MISSING PROFILES
-- ============================================================

INSERT INTO public.profiles (id, email, name, role, consent_status)
SELECT 
  id,
  email,
  COALESCE(NULLIF(raw_user_meta_data->>'name', ''), split_part(email, '@', 1)),
  COALESCE(NULLIF(raw_user_meta_data->>'role', ''), 'student'),
  false
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name  = CASE WHEN profiles.name = '' THEN EXCLUDED.name ELSE profiles.name END;


-- ============================================================
-- PART 3: SET CORRECT ROLES FOR TEST ACCOUNTS
-- ============================================================

UPDATE public.profiles SET role = 'superadmin' WHERE email = 'admin@test.com';
UPDATE public.profiles SET role = 'counselor'  WHERE email = 'counselor@test.com';
UPDATE public.profiles SET role = 'student'    WHERE email = 'student@test.com';


-- ============================================================
-- PART 4: SYNC ROLES BACK TO AUTH USER METADATA
-- (This is critical — JWT token reads from raw_user_meta_data)
-- ============================================================

UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role, 'name', p.name)
FROM public.profiles p
WHERE auth.users.id = p.id;


-- ============================================================
-- VERIFY — Check results
-- ============================================================

SELECT 
  u.email,
  u.raw_user_meta_data->>'role' AS jwt_role,
  p.role AS profile_role,
  p.name
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
ORDER BY p.role;
