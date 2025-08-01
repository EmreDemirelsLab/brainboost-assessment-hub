-- ================================================================
-- TEST VERİSİ KONTROL - BU ÖĞRENCİ İÇİN VERİ VAR MI?
-- ================================================================

-- Student ID: 80d94221-7833-464a-9df8-75c5a4c1c3e6

-- 1. Bu öğrenci için BURDON test verisi var mı? (RLS bypass ile)
SELECT 
  'BURDON_DATA_CHECK' as check_type,
  COUNT(*) as total_records,
  MIN(created_at) as first_test,
  MAX(created_at) as last_test
FROM burdon_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6';

-- 2. Bu öğrenci için DİĞER testler var mı?
SELECT 
  'ALL_TESTS_SUMMARY' as check_type,
  'attention' as test_type,
  COUNT(*) as records
FROM attention_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6'

UNION ALL

SELECT 
  'ALL_TESTS_SUMMARY' as check_type,
  'memory' as test_type,
  COUNT(*) as records
FROM memory_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6'

UNION ALL

SELECT 
  'ALL_TESTS_SUMMARY' as check_type,
  'd2' as test_type,
  COUNT(*) as records
FROM d2_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6';

-- 3. Bu öğrencinin bilgileri doğru mu?
SELECT 
  'STUDENT_VERIFICATION' as check_type,
  id,
  first_name,
  last_name,
  email,
  roles,
  supervisor_id,
  created_at
FROM users 
WHERE id = '80d94221-7833-464a-9df8-75c5a4c1c3e6';

-- 4. Bu öğrenci için en son yapılan 5 test (tüm test türleri)
(SELECT 
  'RECENT_TESTS' as check_type,
  'burdon' as test_type,
  created_at,
  student_id,
  conducted_by
FROM burdon_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6'
ORDER BY created_at DESC LIMIT 5)

UNION ALL

(SELECT 
  'RECENT_TESTS' as check_type,
  'attention' as test_type,
  created_at,
  student_id,
  conducted_by
FROM attention_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6'
ORDER BY created_at DESC LIMIT 5)

ORDER BY created_at DESC;

-- 5. TOPLAM test sayıları (tüm öğrenciler için)
SELECT 
  'TOTAL_TEST_COUNTS' as check_type,
  'burdon' as test_type,
  COUNT(*) as total_records,
  COUNT(DISTINCT student_id) as unique_students
FROM burdon_test_results

UNION ALL

SELECT 
  'TOTAL_TEST_COUNTS' as check_type,
  'attention' as test_type,
  COUNT(*) as total_records,
  COUNT(DISTINCT student_id) as unique_students
FROM attention_test_results;