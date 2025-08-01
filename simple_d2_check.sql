-- Simple D2 Policy Check (Production compatible)

SELECT 'D2 POLICIES:' as check_type, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'd2_test_results' 
ORDER BY policyname;

SELECT 'RLS STATUS:' as check_type, rowsecurity::text as status
FROM pg_tables  
WHERE tablename = 'd2_test_results';

SELECT 'POLICY COUNT:' as check_type, COUNT(*)::text as total_policies
FROM pg_policies 
WHERE tablename = 'd2_test_results';