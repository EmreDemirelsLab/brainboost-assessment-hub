-- D2 Test Final Policy Check

-- 1. D2 test policy'leri kontrolü
\echo '=== D2 TEST FINAL POLICIES ===';
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN policyname LIKE '%select%' THEN 'SELECT'
        WHEN policyname LIKE '%insert%' THEN 'INSERT' 
        WHEN policyname LIKE '%update%' THEN 'UPDATE'
        WHEN policyname LIKE '%delete%' THEN 'DELETE'
        ELSE 'OTHER'
    END as operation
FROM pg_policies 
WHERE tablename = 'd2_test_results' 
ORDER BY policyname;

-- 2. RLS aktif mi?
\echo '';
\echo '=== D2 TEST RLS STATUS ===';
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'd2_test_results';

-- 3. Geçici policy var mı?
\echo '';
\echo '=== TEMPORARY POLICY CHECK ===';
SELECT COUNT(*) as temp_policy_count
FROM pg_policies 
WHERE tablename = 'd2_test_results' 
AND policyname LIKE '%emporary%';

\echo '';
\echo '=== DOĞRU KURULDU MU? ===';
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ 4 POLICY KURULDU (SELECT, INSERT, UPDATE, DELETE)'
        ELSE '❌ EKSİK POLICY: ' || COUNT(*)::text || '/4'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'd2_test_results'
AND policyname NOT LIKE '%emporary%';