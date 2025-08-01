-- ================================================================
-- HİYERAŞİ DOĞRULAMA - BU KULLANICI BU ÖĞRENCİYİ GÖREBİLİR Mİ?
-- ================================================================

-- Test verileri (console'dan alınan)
-- User ID: 3b32b5b6-8b22-4ed2-860a-25a26651b6e6
-- Student ID: 80d94221-7833-464a-9df8-75c5a4c1c3e6

-- 1. Kullanıcı bilgilerini kontrol et
SELECT 
  'TRAINER_INFO' as info_type,
  id,
  first_name,
  last_name,
  roles,
  supervisor_id
FROM users 
WHERE id = '3b32b5b6-8b22-4ed2-860a-25a26651b6e6';

-- 2. Öğrenci bilgilerini kontrol et
SELECT 
  'STUDENT_INFO' as info_type,
  id,
  first_name,
  last_name,
  roles,
  supervisor_id
FROM users 
WHERE id = '80d94221-7833-464a-9df8-75c5a4c1c3e6';

-- 3. Bu öğrencinin supervisor'ü kim?
SELECT 
  'STUDENT_SUPERVISOR' as info_type,
  s.first_name as student_name,
  s.supervisor_id,
  t.first_name as supervisor_name,
  t.roles as supervisor_roles
FROM users s
LEFT JOIN users t ON s.supervisor_id = t.id
WHERE s.id = '80d94221-7833-464a-9df8-75c5a4c1c3e6';

-- 4. Bu öğrenci için burdon test var mı?
SELECT 
  'BURDON_TEST_COUNT' as info_type,
  COUNT(*) as total_tests,
  student_id,
  conducted_by
FROM burdon_test_results 
WHERE student_id = '80d94221-7833-464a-9df8-75c5a4c1c3e6'
GROUP BY student_id, conducted_by;

-- 5. can_user_access_user fonksiyonunu test et
-- NOT: Bu query'yi auth olmuş kullanıcı ile çalıştırmanız gerekiyor
-- SELECT can_user_access_user('80d94221-7833-464a-9df8-75c5a4c1c3e6');