-- ================================================================
-- ULTRA BASİT RLS FIX - HİÇ RECURSİVE YOK
-- ================================================================
-- Bu SQL'i HEMEN Supabase Dashboard'da çalıştır!

-- ADIM 1: TÜM POLİTİKALARI SİL
DROP POLICY IF EXISTS "users_select_final" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_final" ON "public"."users";
DROP POLICY IF EXISTS "users_update_final" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_final" ON "public"."users";
DROP POLICY IF EXISTS "users_select_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_update_temp" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_temp" ON "public"."users";

-- ADIM 2: ULTRA BASİT POLİTİKA (HİÇ SUBQUERY YOK)
CREATE POLICY "users_select_ultra_simple" ON "public"."users" 
FOR SELECT USING (
    -- Herkes kendi kaydını görebilir
    auth_user_id = auth.uid()
    OR
    -- Service role her şeyi görebilir
    current_setting('role') = 'service_role'
    OR
    -- GEÇİCİ: Tüm authenticated kullanıcılar tüm kayıtları görebilir
    auth.uid() IS NOT NULL
);

-- ADIM 3: INSERT (ULTRA BASİT)
CREATE POLICY "users_insert_ultra_simple" ON "public"."users" 
FOR INSERT WITH CHECK (
    auth_user_id = auth.uid()
    OR
    current_setting('role') = 'service_role'
    OR
    auth.uid() IS NOT NULL
);

-- ADIM 4: UPDATE (ULTRA BASİT)
CREATE POLICY "users_update_ultra_simple" ON "public"."users" 
FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR
    current_setting('role') = 'service_role'
    OR
    auth.uid() IS NOT NULL
);

-- ADIM 5: DELETE (SADECE SERVICE ROLE)
CREATE POLICY "users_delete_ultra_simple" ON "public"."users" 
FOR DELETE USING (
    current_setting('role') = 'service_role'
);

-- ADIM 6: IMMEDIATE TEST
SELECT 'ULTRA SIMPLE RLS ACTIVE' as status, count(*) as total_users FROM "public"."users";

-- ADIM 7: POLICY CHECK
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'users';

COMMENT ON POLICY "users_select_ultra_simple" ON "public"."users" IS 'ULTRA SIMPLE: No recursion, authenticated users see all';
COMMENT ON POLICY "users_insert_ultra_simple" ON "public"."users" IS 'ULTRA SIMPLE: Authenticated users can insert';
COMMENT ON POLICY "users_update_ultra_simple" ON "public"."users" IS 'ULTRA SIMPLE: Authenticated users can update';
COMMENT ON POLICY "users_delete_ultra_simple" ON "public"."users" IS 'ULTRA SIMPLE: Only service role can delete';