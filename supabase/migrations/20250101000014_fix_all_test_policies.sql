-- ================================================================
-- TÜM TEST TABLOLARI RLS POLICIES DÜZELTME
-- Dikkat testi ile tam uyumlu politikalar
-- ================================================================

-- ============== BURDON TEST RESULTS ==============
-- Burdon test için ayrı final migration var: 20250102000001_burdon_final_clean.sql

-- ============== D2 TEST RESULTS RLS POLICIES FIX ==============
-- D2 test için mevcut policy'leri kaldır ve dikkat testi ile uyumlu yenilerini ekle

-- RLS aktif et (zaten aktif olabilir ama güvenlik için)
ALTER TABLE "public"."d2_test_results" ENABLE ROW LEVEL SECURITY;

-- Mevcut D2 policy'lerini kaldır
DROP POLICY IF EXISTS "Users can view their own d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Trainers can view their students' d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Trainers can insert d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "Trainers can update d2 test results" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_select_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_insert_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_update_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_delete_policy" ON "public"."d2_test_results";

-- Dikkat testi ile aynı policy'leri oluştur
CREATE POLICY "d2_test_results_select_policy" ON "public"."d2_test_results" 
FOR SELECT USING (
    -- Kendi test sonuçlarını görebilir (student olarak)
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id))
    OR
    -- Yöneticiler tüm testleri görebilir  
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Süpervizörler kendi öğrencilerinin testlerini görebilir
    (EXISTS (SELECT 1 FROM "public"."users" supervisor WHERE supervisor.auth_user_id = auth.uid() AND 
             EXISTS (SELECT 1 FROM "public"."users" student_user WHERE student_user.id = student_id AND student_user.supervisor_id = supervisor.id)))
);

CREATE POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" 
FOR INSERT WITH CHECK (
    -- Yöneticiler test ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Kullanıcılar kendi testlerini ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id AND u.roles ? 'kullanici'))
);

CREATE POLICY "d2_test_results_update_policy" ON "public"."d2_test_results" 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

CREATE POLICY "d2_test_results_delete_policy" ON "public"."d2_test_results" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- ============== MEMORY TEST RESULTS RLS POLICIES FIX ==============
-- Memory test için farklı olan conducted_by logic'ini düzelt

-- RLS aktif et (zaten aktif olabilir ama güvenlik için)
ALTER TABLE "public"."memory_test_results" ENABLE ROW LEVEL SECURITY;

-- Memory test için mevcut policy'leri kontrol et ve gerekirse düzelt
-- Memory test'te conducted_by = auth.uid() kullanılıyor, diğerlerinde users.id
-- Bu tutarsızlığı düzeltelim

-- Mevcut memory test policy'lerini kaldır (varsa)
DROP POLICY IF EXISTS "Trainers can insert memory test results" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "Trainers can update memory test results" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "Trainers can view their students' memory test results" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "Users can view their own memory test results" ON "public"."memory_test_results";

-- Dikkat testi ile uyumlu policy'ler oluştur
CREATE POLICY "memory_test_results_select_policy" ON "public"."memory_test_results" 
FOR SELECT USING (
    -- Kendi test sonuçlarını görebilir (student olarak)
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id))
    OR
    -- Yöneticiler tüm testleri görebilir  
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Süpervizörler kendi öğrencilerinin testlerini görebilir
    (EXISTS (SELECT 1 FROM "public"."users" supervisor WHERE supervisor.auth_user_id = auth.uid() AND 
             EXISTS (SELECT 1 FROM "public"."users" student_user WHERE student_user.id = student_id AND student_user.supervisor_id = supervisor.id)))
    OR
    -- Test yapan kişi kendi yaptığı testleri görebilir (conducted_by users.id referansı)
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

CREATE POLICY "memory_test_results_insert_policy" ON "public"."memory_test_results" 
FOR INSERT WITH CHECK (
    -- Yöneticiler test ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Kullanıcılar kendi testlerini ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id AND u.roles ? 'kullanici'))
    OR
    -- Conducted_by kontrolü - test yapan kişi doğru mu?
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

CREATE POLICY "memory_test_results_update_policy" ON "public"."memory_test_results" 
FOR UPDATE USING (
    -- Admin güncelleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin'))
    OR
    -- Test yapan kişi güncelleyebilir
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

CREATE POLICY "memory_test_results_delete_policy" ON "public"."memory_test_results" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- ============== COMMENT EKLEMELERI ==============
-- Policy açıklamaları

COMMENT ON POLICY "burdon_test_results_select_policy" ON "public"."burdon_test_results" 
    IS 'Dikkat testi ile uyumlu SELECT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri görebilir';

COMMENT ON POLICY "burdon_test_results_insert_policy" ON "public"."burdon_test_results" 
    IS 'Dikkat testi ile uyumlu INSERT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri kaydedebilir';

COMMENT ON POLICY "d2_test_results_select_policy" ON "public"."d2_test_results" 
    IS 'Dikkat testi ile uyumlu SELECT yetkisi - rol sistemi (admin, temsilci, beyin_antrenoru, kullanici)';

COMMENT ON POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" 
    IS 'Dikkat testi ile uyumlu INSERT yetkisi - rol sistemi desteği';

COMMENT ON POLICY "memory_test_results_select_policy" ON "public"."memory_test_results" 
    IS 'Dikkat testi ile uyumlu SELECT yetkisi - conducted_by mapping düzeltildi';

COMMENT ON POLICY "memory_test_results_insert_policy" ON "public"."memory_test_results" 
    IS 'Dikkat testi ile uyumlu INSERT yetkisi - conducted_by kontrolü eklendi';