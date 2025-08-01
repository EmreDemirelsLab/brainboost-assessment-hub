-- ================================================================
-- TÜM RLS POLİCİES TEMİZLEME - ÖNCE BUNU ÇALIŞTIRIN
-- ================================================================

-- ============== 1. USERS TABLOSU POLİCİES TEMİZLEME ==============

-- Tüm mevcut users policies'lerini kaldır
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_hierarchy_select" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_hierarchy_insert" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_hierarchy_update" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_hierarchy_delete" ON public.users;

-- Eski isimlendirmeler de olabilir
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- ============== 2. ATTENTION TEST RESULTS POLİCİES TEMİZLEME ==============

DROP POLICY IF EXISTS "attention_select_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_insert_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_update_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_delete_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_select" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_insert" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_update" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_delete" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_test_results_select_policy" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_test_results_insert_policy" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_test_results_update_policy" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_test_results_delete_policy" ON public.attention_test_results;

-- ============== 3. BURDON TEST RESULTS POLİCİES TEMİZLEME ==============

DROP POLICY IF EXISTS "burdon_select_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_insert_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_update_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_delete_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_select" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_insert" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_update" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_delete" ON public.burdon_test_results;

-- ============== 4. D2 TEST RESULTS POLİCİES TEMİZLEME ==============

DROP POLICY IF EXISTS "d2_select_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_insert_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_update_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_delete_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_select" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_insert" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_update" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_delete" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_test_results_select_policy" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_test_results_insert_policy" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_test_results_update_policy" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_test_results_delete_policy" ON public.d2_test_results;

-- ============== 5. MEMORY TEST RESULTS POLİCİES TEMİZLEME ==============

DROP POLICY IF EXISTS "memory_select_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_insert_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_update_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_delete_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_select" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_insert" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_update" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_delete" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_test_results_select_policy" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_test_results_insert_policy" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_test_results_update_policy" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_test_results_delete_policy" ON public.memory_test_results;

-- ============== 6. STROOP TEST RESULTS POLİCİES TEMİZLEME ==============

-- Stroop tablosu varsa policies'leri temizle
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stroop_test_results'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "stroop_select_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_insert_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_update_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_delete_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_select" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_insert" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_update" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_delete" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_test_results_select_policy" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_test_results_insert_policy" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_test_results_update_policy" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_test_results_delete_policy" ON public.stroop_test_results';
  END IF;
END $$;

-- ============== 7. TEMİZLEME SONRASI KONTROL ==============

SELECT 
  'REMAINING_POLICIES' as check_type,
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (
    tablename = 'users' OR
    tablename LIKE '%test_results'
  )
ORDER BY tablename, policyname;

-- Schema cache reload
NOTIFY pgrst, 'reload schema';