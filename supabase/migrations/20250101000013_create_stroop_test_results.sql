-- ================================================================
-- STROOP TEST RESULTS TABLE MIGRATION
-- Stroop Testi Sonuçları Tablosu
-- Dikkat ve Hafıza testleri ile tutarlı yapı
-- ================================================================

-- Stroop test results tablosunu oluştur
CREATE TABLE IF NOT EXISTS "public"."stroop_test_results" (
    -- Temel kimlik ve ilişki alanları
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "student_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "conducted_by" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    
    -- Zaman bilgileri
    "test_start_time" timestamptz NOT NULL,
    "test_end_time" timestamptz,
    "test_duration_seconds" integer DEFAULT 0,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    
    -- Test durumu
    "completion_status" varchar(50) DEFAULT 'completed' CHECK (completion_status IN ('completed', 'incomplete', 'failed')),
    "notes" text,
    
    -- ============== AŞAMA 1: BASIT TEPKİ SÜRESİ (BTS) ==============
    -- 12 kelime - sadece tepki süresi ölçümü
    "stage1_total_words" integer DEFAULT 12 NOT NULL,
    "stage1_correct_count" integer DEFAULT 0, -- Tepki verdiği kelime sayısı
    "stage1_total_time_ms" integer DEFAULT 0, -- Aşama toplam süresi (ms)
    "stage1_average_time_ms" numeric(8,2) DEFAULT 0, -- Ortalama tepki süresi (ms)
    "stage1_accuracy" numeric(5,2) DEFAULT 0, -- Tepki verme oranı (%)
    
    -- ============== AŞAMA 2: KONGRUEN TEPKİ (KTS) ==============  
    -- 23 kelime - renk ile kelime eşleşiyorsa basma
    "stage2_total_words" integer DEFAULT 23 NOT NULL,
    "stage2_correct_count" integer DEFAULT 0, -- Doğru tepki sayısı
    "stage2_total_time_ms" integer DEFAULT 0, -- Aşama toplam süresi (ms)
    "stage2_average_time_ms" numeric(8,2) DEFAULT 0, -- Ortalama tepki süresi (ms)
    "stage2_accuracy" numeric(5,2) DEFAULT 0, -- Doğruluk oranı (%)
    "stage2_impulsivity" numeric(5,2) DEFAULT 0, -- Dürtüsellik skoru (%)
    
    -- ============== AŞAMA 3: STROOP TEPKİ (STS) ==============
    -- 40 kelime - renk ile kelime eşleşmiyorsa basma  
    "stage3_total_words" integer DEFAULT 40 NOT NULL,
    "stage3_correct_count" integer DEFAULT 0, -- Doğru tepki sayısı
    "stage3_total_time_ms" integer DEFAULT 0, -- Aşama toplam süresi (ms)
    "stage3_average_time_ms" numeric(8,2) DEFAULT 0, -- Ortalama tepki süresi (ms)
    "stage3_accuracy" numeric(5,2) DEFAULT 0, -- Doğruluk oranı (%)
    "stage3_impulsivity" numeric(5,2) DEFAULT 0, -- Dürtüsellik skoru (%)
    
    -- ============== İNTERFERANS ETKİSİ HESAPLAMALARI ==============
    -- Stroop etkisi: 3. aşama - 2. aşama farkı
    "interference_effect_time" numeric(8,2) DEFAULT 0, -- Zaman farkı (ms)
    "interference_effect_percentage" numeric(5,2) DEFAULT 0, -- Yüzde farkı (%)
    
    -- ============== GENEL TEST METRİKLERİ ==============
    "total_correct_responses" integer DEFAULT 0, -- Toplam doğru tepki (2. ve 3. aşama)
    "total_words_all_stages" integer DEFAULT 75 NOT NULL, -- 12+23+40 = 75
    "overall_accuracy" numeric(5,2) DEFAULT 0, -- Genel doğruluk oranı (%)
    "average_response_time_ms" numeric(8,2) DEFAULT 0, -- Genel ortalama tepki süresi
    
    -- ============== JSONB DETAY VERİLERİ ==============
    -- Stroop testine özgü detaylı veriler
    "detailed_responses" jsonb, -- Her kelime için detaylı tepki verileri
    "stage_analysis" jsonb, -- Aşama bazlı analiz verileri
    "color_word_combinations" jsonb, -- Renk-kelime kombinasyonları ve performans
    "response_time_distribution" jsonb, -- Tepki süresi dağılımı
    "error_analysis" jsonb, -- Hata türleri ve analizi
    
    -- ============== TEKNİK VERİLER ==============
    "browser_info" varchar(500),
    "device_info" varchar(500), 
    "ip_address" inet
);

-- ============== COMMENT EKLEMELERI ==============
COMMENT ON TABLE "public"."stroop_test_results" IS 'Stroop Testi Sonuçları - 3 aşamalı Stroop test verileri';

-- Aşama açıklamaları
COMMENT ON COLUMN "public"."stroop_test_results"."stage1_correct_count" IS 'Aşama 1: Basit tepki - tepki verdiği kelime sayısı';
COMMENT ON COLUMN "public"."stroop_test_results"."stage1_average_time_ms" IS 'Aşama 1: Ortalama tepki süresi (sadece tepki verilen kelimeler)';
COMMENT ON COLUMN "public"."stroop_test_results"."stage1_accuracy" IS 'Aşama 1: Tepki verme oranı (doğru/yanlış kavramı yok)';

COMMENT ON COLUMN "public"."stroop_test_results"."stage2_correct_count" IS 'Aşama 2: Kongruen tepki - doğru tepki sayısı';
COMMENT ON COLUMN "public"."stroop_test_results"."stage2_impulsivity" IS 'Aşama 2: Dürtüsellik skoru (<600ms hızlı yanlış tepkiler)';

COMMENT ON COLUMN "public"."stroop_test_results"."stage3_correct_count" IS 'Aşama 3: Stroop tepki - doğru tepki sayısı';
COMMENT ON COLUMN "public"."stroop_test_results"."stage3_impulsivity" IS 'Aşama 3: Dürtüsellik skoru (<800ms hızlı yanlış tepkiler)';

COMMENT ON COLUMN "public"."stroop_test_results"."interference_effect_time" IS 'İnterferans etkisi: Stage3 - Stage2 ortalama süre farkı (ms)';
COMMENT ON COLUMN "public"."stroop_test_results"."interference_effect_percentage" IS 'İnterferans etkisi yüzdesi: ((Stage3-Stage2)/Stage2)*100';

-- ============== İNDEKSLER ==============
-- Performans için gerekli indexler
CREATE INDEX "idx_stroop_student_id" ON "public"."stroop_test_results" USING btree ("student_id");
CREATE INDEX "idx_stroop_conducted_by" ON "public"."stroop_test_results" USING btree ("conducted_by");
CREATE INDEX "idx_stroop_test_start_time" ON "public"."stroop_test_results" USING btree ("test_start_time");
CREATE INDEX "idx_stroop_completion_status" ON "public"."stroop_test_results" USING btree ("completion_status");
CREATE INDEX "idx_stroop_created_at" ON "public"."stroop_test_results" USING btree ("created_at");

-- JSONB alanları için GIN indexler
CREATE INDEX "idx_stroop_detailed_responses" ON "public"."stroop_test_results" USING gin ("detailed_responses");
CREATE INDEX "idx_stroop_stage_analysis" ON "public"."stroop_test_results" USING gin ("stage_analysis");

-- ============== TRİGGERLER ==============
-- updated_at otomatik güncelleme triggeri
CREATE OR REPLACE TRIGGER "update_stroop_test_results_updated_at" 
    BEFORE UPDATE ON "public"."stroop_test_results" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- ============== RLS (ROW LEVEL SECURITY) POLİCİLERİ ==============
-- Diğer test tabloları ile tutarlı güvenlik politikaları
ALTER TABLE "public"."stroop_test_results" ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Kullanıcılar kendi testlerini, yöneticiler tüm testleri görebilir (attention testi ile tutarlı)
CREATE POLICY "stroop_test_results_select_policy" ON "public"."stroop_test_results" 
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
    -- Test yapan kişi kendi yaptığı testleri görebilir
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

-- INSERT policy: Yöneticiler ve kullanıcılar test ekleyebilir (attention testi ile tutarlı)
CREATE POLICY "stroop_test_results_insert_policy" ON "public"."stroop_test_results" 
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

-- UPDATE policy: Test yapan kişi veya adminler güncelleyebilir (attention testi ile tutarlı)
CREATE POLICY "stroop_test_results_update_policy" ON "public"."stroop_test_results" 
FOR UPDATE USING (
    -- Admin güncelleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin'))
    OR
    -- Test yapan kişi güncelleyebilir
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

-- DELETE policy: Sadece adminler silebilir  
CREATE POLICY "stroop_test_results_delete_policy" ON "public"."stroop_test_results" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- ============== İZINLER ==============
-- Tüm rollere tam izin ver
GRANT ALL ON TABLE "public"."stroop_test_results" TO "anon";
GRANT ALL ON TABLE "public"."stroop_test_results" TO "authenticated"; 
GRANT ALL ON TABLE "public"."stroop_test_results" TO "service_role";