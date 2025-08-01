-- MANUAL USERS TABLE CREATION
-- Dashboard SQL Editor'a kopyala-yapıştır

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
    "roles" jsonb DEFAULT '["user"]'::jsonb NOT NULL,
    
    -- Hiyerarşi (supervisor-student ilişkisi)
    "supervisor_id" uuid REFERENCES "public"."users"("id") ON DELETE SET NULL,
    
    -- Demografik bilgiler (isteğe bağlı)
    "demographic_info" jsonb,
    
    -- Zaman bilgileri
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- İndexler
CREATE INDEX IF NOT EXISTS "idx_users_auth_user_id" ON "public"."users" USING btree ("auth_user_id");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "public"."users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_users_supervisor_id" ON "public"."users" USING btree ("supervisor_id");
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "public"."users" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "public"."users" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_roles" ON "public"."users" USING gin ("roles");
CREATE INDEX IF NOT EXISTS "idx_users_demographic_info" ON "public"."users" USING gin ("demographic_info");

-- Trigger fonksiyonu
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE OR REPLACE TRIGGER "update_users_updated_at" 
    BEFORE UPDATE ON "public"."users" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- RLS aktif et
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Basit policy'ler (recursive olmayan)
CREATE POLICY "users_select_policy" ON "public"."users" 
FOR SELECT USING (
    auth_user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

CREATE POLICY "users_insert_policy" ON "public"."users" 
FOR INSERT WITH CHECK (
    auth_user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- İzinler
GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated"; 
GRANT ALL ON TABLE "public"."users" TO "service_role";