-- ================================================================
-- HELPER FUNCTIONS KONTROL
-- ================================================================

-- Helper functions var mı kontrol et
SELECT 
  'HELPER_FUNCTIONS' as check_type,
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_current_user_role', 'can_user_access_user')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- get_all_subordinates function var mı kontrol et
SELECT 
  'SUBORDINATES_FUNCTION' as check_type,
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'get_all_subordinates'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test için örnek kullanım (eğer functions varsa)
SELECT 
  'FUNCTION_TEST' as check_type,
  'Testing helper functions' as info;