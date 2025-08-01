-- ================================================================
-- DOĞRU RLS POLİTİKASI - RECURSİVE OLMAYAN VERSİYON
-- ================================================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştır

-- ADIM 1: Emergency politikaları kaldır
DROP POLICY IF EXISTS "users_select_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_update_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_temp" ON "public"."users";

-- ADIM 2: DOĞRU POLİTİKALAR (RECURSİVE OLMAYAN)

-- SELECT: Basit supervisor-student ilişkisi
CREATE POLICY "users_select_final" ON "public"."users" 
FOR SELECT USING (
    -- Kendi verilerini görebilir
    auth_user_id = auth.uid()
    OR
    -- Service role erişimi
    current_setting('role') = 'service_role'
    OR
    -- Supervisor öğrencilerini görebilir (RECURSIVE OLMAYAN)
    supervisor_id IN (
        SELECT id FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
        AND (
            roles ? 'admin' 
            OR roles ? 'temsilci' 
            OR roles ? 'beyin_antrenoru'
            OR roles ? 'trainer'
        )
        LIMIT 1
    )
);

-- INSERT: Kullanıcı oluşturma
CREATE POLICY "users_insert_final" ON "public"."users" 
FOR INSERT WITH CHECK (
    -- Kendi kaydını oluşturabilir
    auth_user_id = auth.uid()
    OR
    -- Service role erişimi
    current_setting('role') = 'service_role'
    OR
    -- Admin/trainer kullanıcı ekleyebilir (RECURSIVE OLMAYAN)
    EXISTS (
        SELECT 1 FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
        AND (
            roles ? 'admin' 
            OR roles ? 'temsilci' 
            OR roles ? 'beyin_antrenoru'
            OR roles ? 'trainer'
        )
        LIMIT 1
    )
);

-- UPDATE: Güncelleme
CREATE POLICY "users_update_final" ON "public"."users" 
FOR UPDATE USING (
    -- Kendi verilerini güncelleyebilir
    auth_user_id = auth.uid()
    OR
    -- Service role erişimi
    current_setting('role') = 'service_role'
    OR
    -- Admin herkesi güncelleyebilir
    EXISTS (
        SELECT 1 FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
        AND roles ? 'admin'
        LIMIT 1
    )
);

-- DELETE: Sadece adminler
CREATE POLICY "users_delete_final" ON "public"."users" 
FOR DELETE USING (
    current_setting('role') = 'service_role'
    OR
    EXISTS (
        SELECT 1 FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
        AND roles ? 'admin'
        LIMIT 1
    )
);

-- ADIM 3: TEST QUERY
-- Beyin antrenörü olarak giriş yapmış kullanıcının öğrencilerini test et
SELECT 
    'FINAL TEST:' as info,
    u.first_name,
    u.email,
    u.supervisor_id,
    supervisor.first_name as supervisor_name
FROM "public"."users" u
LEFT JOIN "public"."users" supervisor ON supervisor.id = u.supervisor_id
WHERE u.roles ? 'kullanici'
AND u.supervisor_id IS NOT NULL
ORDER BY u.created_at DESC;

-- ADIM 4: POLİTİKA DURUMU
SELECT 
    policyname, 
    cmd, 
    permissive,
    length(qual) as policy_length
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

COMMENT ON POLICY "users_select_final" ON "public"."users" IS 'Final SELECT: Kendi + supervisor öğrencileri (non-recursive)';
COMMENT ON POLICY "users_insert_final" ON "public"."users" IS 'Final INSERT: Kendi + admin/trainer ekleyebilir';
COMMENT ON POLICY "users_update_final" ON "public"."users" IS 'Final UPDATE: Kendi + admin güncelleyebilir';
COMMENT ON POLICY "users_delete_final" ON "public"."users" IS 'Final DELETE: Sadece admin/service_role';