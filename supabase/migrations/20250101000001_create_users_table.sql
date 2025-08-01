-- ================================================================
-- USERS TABLE MIGRATION - EN ÖNCELİKLİ
-- Tüm test tablolarının bağımlı olduğu ana users tablosu
-- ================================================================

-- Users tablosunu oluştur
CREATE TABLE IF NOT EXISTS "public"."users" (
    -- Temel kimlik alanları
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "auth_user_id" uuid UNIQUE REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    
    -- Kişisel bilgiler
    "email" varchar(255) UNIQUE NOT NULL,
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "phone" varchar(20),
    "avatar_url" text,
    
    -- Durum bilgileri
    "is_active" boolean DEFAULT true NOT NULL,
    "roles" jsonb DEFAULT '["kullanici"]'::jsonb NOT NULL,
    
    -- Hiyerarşi (supervisor-student ilişkisi)
    "supervisor_id" uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
    
    -- Demografik bilgiler (isteğe bağlı)
    "demographic_info" jsonb,
    
    -- Zaman bilgileri
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- ============== İNDEKSLER ==============
-- Performans için gerekli indexler
CREATE INDEX "idx_users_auth_user_id" ON "public"."users" USING btree ("auth_user_id");
CREATE INDEX "idx_users_email" ON "public"."users" USING btree ("email");
CREATE INDEX "idx_users_supervisor_id" ON "public"."users" USING btree ("supervisor_id");
CREATE INDEX "idx_users_is_active" ON "public"."users" USING btree ("is_active");
CREATE INDEX "idx_users_created_at" ON "public"."users" USING btree ("created_at");

-- JSONB alanları için GIN index
CREATE INDEX "idx_users_roles" ON "public"."users" USING gin ("roles");
CREATE INDEX "idx_users_demographic_info" ON "public"."users" USING gin ("demographic_info");

-- ============== TRİGGERLER ==============
-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at otomatik güncelleme triggeri
CREATE OR REPLACE TRIGGER "update_users_updated_at" 
    BEFORE UPDATE ON "public"."users" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- ============== RLS (ROW LEVEL SECURITY) POLİCİLERİ ==============
-- Users tablosu için güvenlik politikaları
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Kullanıcılar kendi verilerini ve alt kullanıcılarını görebilir
CREATE POLICY "users_select_policy" ON "public"."users" 
FOR SELECT USING (
    -- Kendi verilerini görebilir
    (auth_user_id = auth.uid())
    OR
    -- Admin/temsilci/beyin_antrenoru tüm kullanıcıları görebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Supervisor kendi öğrencilerini görebilir
    (supervisor_id IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

-- INSERT policy: Admin/temsilci/beyin_antrenoru yeni kullanıcı ekleyebilir
CREATE POLICY "users_insert_policy" ON "public"."users" 
FOR INSERT WITH CHECK (
    -- Admin/temsilci/beyin_antrenoru kullanıcı ekleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND (u.roles ? 'admin' OR u.roles ? 'temsilci' OR u.roles ? 'beyin_antrenoru')))
    OR
    -- Kendi kaydını oluşturabilir (signup)
    (auth_user_id = auth.uid())
);

-- UPDATE policy: Kullanıcılar kendi verilerini, adminler herkesinkini güncelleyebilir
CREATE POLICY "users_update_policy" ON "public"."users" 
FOR UPDATE USING (
    -- Kendi verilerini güncelleyebilir
    (auth_user_id = auth.uid())
    OR
    -- Admin tüm kullanıcıları güncelleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin'))
);

-- DELETE policy: Sadece adminler silebilir
CREATE POLICY "users_delete_policy" ON "public"."users" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- ============== İZINLER ==============
-- Tüm rollere tam izin ver
GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated"; 
GRANT ALL ON TABLE "public"."users" TO "service_role";

-- ============== COMMENT EKLEMELERI ==============  
COMMENT ON TABLE "public"."users" IS 'Ana kullanıcı tablosu - tüm test tablolarının bağımlı olduğu tablo';
COMMENT ON COLUMN "public"."users"."roles" IS 'Kullanıcı rolleri: admin, temsilci, beyin_antrenoru, kullanici';
COMMENT ON COLUMN "public"."users"."supervisor_id" IS 'Üst kullanıcı ID - hiyerarşik yapı için';
COMMENT ON COLUMN "public"."users"."demographic_info" IS 'Demografik bilgiler (yaş, cinsiyet, eğitim vb.)';