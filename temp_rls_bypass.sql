-- ================================================================
-- GEÇİCİ RLS BYPASS - SADECE TEST İÇİN
-- ================================================================

-- Tüm test tabloları için RLS'i geçici kapat
ALTER TABLE burdon_test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE d2_test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE attention_test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE memory_test_results DISABLE ROW LEVEL SECURITY;

-- TESTLER BİTTİKTEN SONRA TEKRAR AÇ:
-- ALTER TABLE burdon_test_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE d2_test_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attention_test_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE memory_test_results ENABLE ROW LEVEL SECURITY;