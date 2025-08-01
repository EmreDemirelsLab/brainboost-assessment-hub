-- ================================================================
-- TÜM KALAN POLİCİES'LERİ DETAYLI KONTROL
-- ================================================================

-- 1. Tüm kalan policies'leri tablo bazında grup halde göster
SELECT 
  'POLICIES_BY_TABLE' as check_type,
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ' ORDER BY policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
  AND (
    tablename = 'users' OR
    tablename LIKE '%test_results' OR
    tablename LIKE '%test%' OR
    tablename LIKE '%memory%' OR
    tablename LIKE '%attention%' OR
    tablename LIKE '%burdon%' OR
    tablename LIKE '%d2%'
  )
GROUP BY tablename
ORDER BY policy_count DESC;

-- 2. Tüm RLS aktif tabloları göster
SELECT 
  'RLS_ENABLED_TABLES' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true
ORDER BY tablename;

-- 3. Tüm policies'leri detaylı listele
SELECT 
  'ALL_POLICIES_DETAIL' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd as command_type,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
  AND (
    tablename = 'users' OR
    tablename LIKE '%test_results' OR
    tablename LIKE '%test%'
  )
ORDER BY tablename, policyname;