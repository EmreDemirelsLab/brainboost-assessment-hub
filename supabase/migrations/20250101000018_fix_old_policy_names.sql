-- ================================================================
-- ESKİ POLICY İSİMLERİNİ TEMIZLE VE STANDARDIZE ET
-- Sadece 4 rol: admin, temsilci, beyin_antrenoru, kullanici
-- ================================================================

-- D2 Test Results için eski policy'leri temizle
DROP POLICY IF EXISTS "Trainers can view their students' d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Trainers can insert d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Trainers can update d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Users can view their own d2 test results" ON "public"."d2_test_results";

-- Memory Test Results için eski policy'leri temizle
DROP POLICY IF EXISTS "Trainers can insert memory test results" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "Trainers can update memory test results" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "Trainers can view their students' memory test results" ON "public"."memory_test_results";

-- Standardize edilmiş policy'ler zaten mevcut migration'larda tanımlı
-- Bu migration sadece eski isimleri temizliyor

-- Users tablosu default rolünü güncelle (eski kayıtlar için)
UPDATE "public"."users" 
SET roles = '["kullanici"]'::jsonb 
WHERE roles IS NULL OR roles = '["user"]'::jsonb OR roles = '[]'::jsonb;

-- Comment ekle
COMMENT ON TABLE "public"."users" IS 'Kullanıcı tablosu - Roller: admin, temsilci, beyin_antrenoru, kullanici';

SELECT 'Eski policy isimleri temizlendi ve roller standardize edildi' as status;