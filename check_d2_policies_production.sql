-- PRODUCTION: D2 Test RLS Policies Kontrolü

-- 1. D2 test tablosunda RLS aktif mi?
\echo '=== D2 Test Tablosu RLS Durumu ==='
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'd2_test_results';

-- 2. D2 test tablosu için tanımlı policies
\echo ''
\echo '=== D2 Test RLS Policies ==='
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'd2_test_results';

-- 3. Users tablosunda auth_user_id alanı var mı?
\echo ''
\echo '=== Users Tablosu Yapısı ==='
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('id', 'auth_user_id', 'email', 'first_name', 'last_name', 'roles')
ORDER BY column_name;

-- 4. Test kullanıcısı için mapping kontrolü
\echo ''
\echo '=== Emre Kullanıcısı Bilgileri ==='
SELECT id, auth_user_id, email, first_name, last_name, roles
FROM users 
WHERE email = 'emre@forbrainacademy.com';

-- 5. D2 test tablosu var mı?
\echo ''
\echo '=== D2 Test Tablosu Varlığı ==='
SELECT COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'd2_test_results';