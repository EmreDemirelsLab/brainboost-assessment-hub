-- ================================================================
-- KALAN POLİCİES TEMİZLEME - 2. ADIM
-- ================================================================

-- Memory test results'ta kalan policy
DROP POLICY IF EXISTS "Users can view their own memory test results" ON public.memory_test_results;

-- Users tablosundaki ultra_simple policies
DROP POLICY IF EXISTS "users_delete_ultra_simple" ON public.users;
DROP POLICY IF EXISTS "users_insert_ultra_simple" ON public.users;
DROP POLICY IF EXISTS "users_select_ultra_simple" ON public.users;
DROP POLICY IF EXISTS "users_update_ultra_simple" ON public.users;

-- Diğer olası kalan policies (güvenlik için)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- Memory tablosunda olası diğer policies
DROP POLICY IF EXISTS "memory_users_select" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_users_insert" ON public.memory_test_results;
DROP POLICY IF EXISTS "Users can insert their own memory test results" ON public.memory_test_results;
DROP POLICY IF EXISTS "Users can update their own memory test results" ON public.memory_test_results;

-- Son kontrol
SELECT 
  'FINAL_CHECK' as check_type,
  COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (
    tablename = 'users' OR
    tablename LIKE '%test_results'
  );

-- Schema cache reload
NOTIFY pgrst, 'reload schema';