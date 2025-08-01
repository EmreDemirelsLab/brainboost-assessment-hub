-- ================================================================
-- GEÇİCİ OLARAK RLS'İ DEVRE DIŞI BIRAK (SADECE TEST İÇİN)
-- ================================================================

-- Burdon test results RLS'i geçici kapat
ALTER TABLE burdon_test_results DISABLE ROW LEVEL SECURITY;

-- Test sonrasında tekrar aç
-- ALTER TABLE burdon_test_results ENABLE ROW LEVEL SECURITY;