-- ================================================================
-- RLS DEBUGGING VE TEST SORGUSU
-- ================================================================

-- Mevcut kullanıcının bilgilerini kontrol et
SELECT 
  'CURRENT_USER_INFO' as info_type,
  auth.uid() as auth_uid,
  get_current_user_id() as current_user_id,
  get_current_user_role() as current_user_role;

-- Mevcut kullanıcının görebildiği tüm kullanıcıları listele
SELECT 
  'ACCESSIBLE_USERS' as info_type,
  id,
  first_name,
  last_name,
  roles,
  supervisor_id,
  can_user_access_user(id) as can_access
FROM users 
WHERE can_user_access_user(id) = true
LIMIT 10;

-- Burdon test sonuçlarının sayısını kontrol et
SELECT 
  'BURDON_TEST_COUNT' as info_type,
  COUNT(*) as total_burdon_tests,
  COUNT(CASE WHEN can_user_access_user(student_id) THEN 1 END) as accessible_tests
FROM burdon_test_results;

-- Spesifik bir öğrencinin test sonuçlarını kontrol et (öğrenci ID'si ile değiştir)
-- SELECT * FROM burdon_test_results WHERE student_id = 'STUDENT_ID_HERE';

-- RLS policy'lerinin listesi
SELECT 
  'RLS_POLICIES' as info_type,
  schemaname,
  tablename,
  policyname,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%hierarchy%'
ORDER BY tablename, policyname;