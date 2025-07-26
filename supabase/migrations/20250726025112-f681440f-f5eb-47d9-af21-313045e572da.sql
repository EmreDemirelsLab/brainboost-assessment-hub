-- Burdon testi ve gereksiz tabloları kaldır

-- 1. Burdon test results tablosunu kaldır
DROP TABLE IF EXISTS burdon_test_results CASCADE;

-- 2. Students tablosunu kaldır (Burdon testi ile ilişkili)
DROP TABLE IF EXISTS students CASCADE;

-- 3. Audit logs tablosunu da kaldır (gereksiz)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- 4. Doğrulama
SELECT 'Gereksiz tablolar kaldırıldı' as status;