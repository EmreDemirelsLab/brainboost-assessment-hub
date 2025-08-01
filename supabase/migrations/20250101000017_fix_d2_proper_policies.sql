-- 🔧 D2 TEST PROPER RLS POLICIES
-- Geçici policy'yi kaldır ve Burdon test benzeri doğru policy'leri ekle

-- Önce geçici policy'yi kaldır
DROP POLICY IF EXISTS "Temporary d2 test insert for debug" ON "public"."d2_test_results";

-- Mevcut policy'leri de kontrol et ve kaldır
DROP POLICY IF EXISTS "d2_test_results_select_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_insert_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_update_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_delete_policy" ON "public"."d2_test_results";

-- RLS'i aktif et (eğer değilse)
ALTER TABLE "public"."d2_test_results" ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY: Burdon test ile aynı mantık
CREATE POLICY "d2_test_results_select_policy" ON "public"."d2_test_results"
FOR SELECT USING (
    -- Yöneticiler tüm testleri görebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Kullanıcılar sadece kendi testlerini görebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id))
);

-- 2. INSERT POLICY: Burdon test ile aynı mantık  
CREATE POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" 
FOR INSERT WITH CHECK (
    -- Yöneticiler test ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Kullanıcılar kendi testlerini ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.id = student_id AND u.roles ? 'kullanici'))
);

-- 3. UPDATE POLICY: Sadece adminler güncelleyebilir
CREATE POLICY "d2_test_results_update_policy" ON "public"."d2_test_results" 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- 4. DELETE POLICY: Sadece adminler silebilir  
CREATE POLICY "d2_test_results_delete_policy" ON "public"."d2_test_results" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- Policy açıklamaları
COMMENT ON POLICY "d2_test_results_select_policy" ON "public"."d2_test_results" 
IS 'Burdon testi ile uyumlu SELECT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri görebilir';

COMMENT ON POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" 
IS 'Burdon testi ile uyumlu INSERT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri kaydedebilir';

COMMENT ON POLICY "d2_test_results_update_policy" ON "public"."d2_test_results" 
IS 'Sadece admin rolü güncelleme yapabilir';

COMMENT ON POLICY "d2_test_results_delete_policy" ON "public"."d2_test_results" 
IS 'Sadece admin rolü silme yapabilir';