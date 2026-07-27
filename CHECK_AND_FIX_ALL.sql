-- ============================================================
-- STEP 1: Check what's in profiles table right now
-- ============================================================
SELECT id, email, name, role, consent_status FROM public.profiles;


-- ============================================================
-- STEP 2: Check which auth users have NO profile row
-- ============================================================
SELECT au.id, au.email, au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;


-- ============================================================
-- STEP 3: See all auth users and their metadata (roles)
-- ============================================================
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' AS name,
  raw_user_meta_data->>'role' AS role_in_metadata
FROM auth.users;
