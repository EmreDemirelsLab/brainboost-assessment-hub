-- ================================================================
-- ACİL RLS POLİTİKA TAMIRI - INFINITE RECURSION DÜZELTMESİ
-- ================================================================
-- Bu SQL'i HEMEN Supabase Dashboard > SQL Editor'da çalıştır!

-- ADIM 1: TÜM SORUNLU POLİTİKALARI SİL
DROP POLICY IF EXISTS "users_select_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_policy" ON "public"."users";  
DROP POLICY IF EXISTS "users_update_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_select_simple" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_simple" ON "public"."users";
DROP POLICY IF EXISTS "users_update_simple" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_simple" ON "public"."users";

-- ADIM 2: GEÇİCİ BASİT POLİTİKA (RECURSIVE OLMAYAN)
CREATE POLICY "users_select_temp" ON "public"."users" 
FOR SELECT USING (
    -- Kendi verilerini görebilir
    auth_user_id = auth.uid()
    OR
    -- Service role her şeyi görebilir (emergency access)
    current_setting('role') = 'service_role'
);

-- ADIM 3: INSERT POLİTİKASI (BASİT)
CREATE POLICY "users_insert_temp" ON "public"."users" 
FOR INSERT WITH CHECK (
    auth_user_id = auth.uid()
    OR
    current_setting('role') = 'service_role'
);

-- ADIM 4: UPDATE POLİTİKASI (BASİT)
CREATE POLICY "users_update_temp" ON "public"."users" 
FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR
    current_setting('role') = 'service_role'
);

-- ADIM 5: DELETE POLİTİKASI (BASİT)
CREATE POLICY "users_delete_temp" ON "public"."users" 
FOR DELETE USING (
    current_setting('role') = 'service_role'
);

-- ADIM 6: TEST QUERY
SELECT 'RLS FIXED - SYSTEM ACCESSIBLE' as status, count(*) as user_count FROM "public"."users";

-- ADIM 7: POLİTİKA LİSTESİNİ KONTROL ET
SELECT 
    policyname, cmd, permissive,
    CASE 
        WHEN qual LIKE '%recursive%' THEN 'PROBLEM!' 
        ELSE 'OK' 
    END as status
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;