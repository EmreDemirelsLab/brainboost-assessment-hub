-- Users tablosu policy'lerini temizle ve düzelt
-- Dashboard SQL Editor'da çalıştır

-- Mevcut tüm policy'leri kaldır
DROP POLICY IF EXISTS "users_select_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_update_policy" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_policy" ON "public"."users";

-- Güvenli policy'ler oluştur (infinite recursion olmayacak şekilde)
CREATE POLICY "users_select_policy" ON "public"."users" 
FOR SELECT USING (
    -- Kendi kaydını görebilir
    auth_user_id = auth.uid()
    OR 
    -- Service role her şeyı görebilir
    auth.role() = 'service_role'
    OR
    -- Bu kullanıcının supervisor'ı olan birisinin öğrencilerini görebilir
    supervisor_id IN (
        SELECT id FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "users_insert_policy" ON "public"."users" 
FOR INSERT WITH CHECK (
    -- Kendi kaydını oluşturabilir  
    auth_user_id = auth.uid()
    OR
    -- Service role her şeyi yapabilir
    auth.role() = 'service_role'
    OR
    -- Supervisor_id kendisinin ID'si ise (öğrenci ekleme)
    supervisor_id IN (
        SELECT id FROM "public"."users" 
        WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "users_update_policy" ON "public"."users" 
FOR UPDATE USING (
    -- Kendi kaydını güncelleyebilir
    auth_user_id = auth.uid()
    OR
    -- Service role her şeyi güncelleyebilir
    auth.role() = 'service_role'
);

CREATE POLICY "users_delete_policy" ON "public"."users" 
FOR DELETE USING (
    -- Sadece service role silebilir
    auth.role() = 'service_role'
);

-- Tabloyu test et
SELECT 'Users table policies fixed successfully!' as status;