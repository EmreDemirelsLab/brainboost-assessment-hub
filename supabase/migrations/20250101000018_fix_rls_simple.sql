-- ================================================================
-- BASİT VE SAĞLAM RLS POLİTİKALARI - SUPERVISOR SORUNU ÇÖZÜMÜ
-- ================================================================

-- Önce mevcut tüm politikaları sil
DROP POLICY IF EXISTS "users_select_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_policy" ON "public"."users";  
DROP POLICY IF EXISTS "users_update_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_policy" ON "public"."users";

-- ============== YENİ BASİT POLİTİKALAR ==============

-- 1. SELECT - Herkes kendi verilerini + üst roller herkesi görebilir
CREATE POLICY "users_select_simple" ON "public"."users" 
FOR SELECT USING (
    -- Kendi verilerini görebilir
    auth_user_id = auth.uid()
    OR
    -- Admin/temsilci/beyin_antrenoru herkesi görebilir  
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (
            u.roles ? 'admin' 
            OR u.roles ? 'temsilci' 
            OR u.roles ? 'beyin_antrenoru'
            OR u.roles ? 'trainer'
        )
    )
    OR
    -- Supervisor kendi öğrencilerini görebilir
    supervisor_id = (
        SELECT u.id FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid()
    )
);

-- 2. INSERT - Herkes kendi kaydını + üst roller başkalarını ekleyebilir
CREATE POLICY "users_insert_simple" ON "public"."users" 
FOR INSERT WITH CHECK (
    -- Kendi kaydını oluşturabilir
    auth_user_id = auth.uid()
    OR
    -- Admin/temsilci/beyin_antrenoru başkalarını ekleyebilir
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (
            u.roles ? 'admin' 
            OR u.roles ? 'temsilci' 
            OR u.roles ? 'beyin_antrenoru'
            OR u.roles ? 'trainer'
        )
    )
);

-- 3. UPDATE - Kendi verilerini + admin herkesinkini güncelleyebilir
CREATE POLICY "users_update_simple" ON "public"."users" 
FOR UPDATE USING (
    -- Kendi verilerini güncelleyebilir
    auth_user_id = auth.uid()
    OR
    -- Admin/temsilci herkesi güncelleyebilir
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (u.roles ? 'admin' OR u.roles ? 'temsilci')
    )
    OR
    -- Beyin antrenörü kendi öğrencilerini güncelleyebilir
    (
        supervisor_id = (
            SELECT u.id FROM "public"."users" u 
            WHERE u.auth_user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM "public"."users" u 
            WHERE u.auth_user_id = auth.uid() 
            AND (u.roles ? 'beyin_antrenoru' OR u.roles ? 'trainer')
        )
    )
);

-- 4. DELETE - Sadece adminler silebilir
CREATE POLICY "users_delete_simple" ON "public"."users" 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND u.roles ? 'admin'
    )
);

-- ============== TEST VERILERI TEMIZLEME ==============
-- Test kullanıcılarını temizle
DELETE FROM "public"."users" WHERE email IN ('antrenor@test.com', 'ogrenci@test.com');

COMMENT ON POLICY "users_select_simple" ON "public"."users" IS 'Basit SELECT: Kendi verilerini + üst roller herkesi + supervisor öğrencilerini';
COMMENT ON POLICY "users_insert_simple" ON "public"."users" IS 'Basit INSERT: Kendi kaydını + üst roller başkalarını ekleyebilir';
COMMENT ON POLICY "users_update_simple" ON "public"."users" IS 'Basit UPDATE: Kendi verilerini + admin herkesi + supervisor öğrencilerini';
COMMENT ON POLICY "users_delete_simple" ON "public"."users" IS 'Basit DELETE: Sadece adminler silebilir';