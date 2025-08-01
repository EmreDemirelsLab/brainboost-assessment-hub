-- ================================================================
-- ATTENTION TEST RESULTS TABLE MIGRATION
-- Dikkat Testi Sonuçları Tablosu
-- ================================================================

-- Attention test results tablosunu oluştur
CREATE TABLE IF NOT EXISTS "public"."attention_test_results" (
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
    
    -- ============== DİKKAT TESTİ PERFORMANS METRİKLERİ ==============
    -- Genel performans
    "total_correct" integer DEFAULT 0,
    "total_wrong" integer DEFAULT 0,
    "total_missed" integer DEFAULT 0,
    "accuracy_percentage" numeric(5,2) DEFAULT 0,
    "average_response_time_ms" numeric(8,2) DEFAULT 0,
    
    -- Konsantrasyon metrikleri
    "attention_span_score" numeric(5,2) DEFAULT 0,
    "focus_stability" numeric(5,2) DEFAULT 0,
    "vigilance_score" numeric(5,2) DEFAULT 0,
    
    -- Tepki süresi analizi
    "fastest_response_ms" integer DEFAULT 0,
    "slowest_response_ms" integer DEFAULT 0,
    "response_time_variance" numeric(8,2) DEFAULT 0,
    
    -- Hata analizi
    "false_positive_count" integer DEFAULT 0,
    "false_negative_count" integer DEFAULT 0,
    "omission_errors" integer DEFAULT 0,
    "commission_errors" integer DEFAULT 0,
    
    -- Zaman bazlı performans
    "performance_decline_rate" numeric(5,2) DEFAULT 0,
    "fatigue_index" numeric(5,2) DEFAULT 0,
    
    -- ============== JSONB DETAY VERİLERİ ==============
    -- Her stimulus için detaylı tepki verileri
    "detailed_responses" jsonb,
    -- Zaman serisi analizi
    "time_series_analysis" jsonb,
    -- Performans trend verileri
    "performance_trends" jsonb,
    -- Hata pattern analizi
    "error_patterns" jsonb,
    
    -- ============== TEKNİK VERİLER ==============
    "browser_info" varchar(500),
    "device_info" varchar(500), 
    "ip_address" inet
);

-- ============== COMMENT EKLEMELERI ==============
COMMENT ON TABLE "public"."attention_test_results" IS 'Dikkat Testi Sonuçları - Konsantrasyon ve dikkat ölçümleri';

COMMENT ON COLUMN "public"."attention_test_results"."attention_span_score" IS 'Dikkat sürdürme yeteneği skoru';
COMMENT ON COLUMN "public"."attention_test_results"."focus_stability" IS 'Odaklanma kararlılığı ölçümü';
COMMENT ON COLUMN "public"."attention_test_results"."vigilance_score" IS 'Uyanıklık ve tetikte olma skoru';
COMMENT ON COLUMN "public"."attention_test_results"."false_positive_count" IS 'Yanlış pozitif tepki sayısı';
COMMENT ON COLUMN "public"."attention_test_results"."false_negative_count" IS 'Kaçırılan hedef sayısı';
COMMENT ON COLUMN "public"."attention_test_results"."omission_errors" IS 'Atlama hataları (eksik tepki)';
COMMENT ON COLUMN "public"."attention_test_results"."commission_errors" IS 'Komisyon hataları (yanlış tepki)';
COMMENT ON COLUMN "public"."attention_test_results"."performance_decline_rate" IS 'Test boyunca performans düşüş oranı';
COMMENT ON COLUMN "public"."attention_test_results"."fatigue_index" IS 'Yorgunluk endeksi (0-100)';

-- ============== İNDEKSLER ==============
-- Performans için gerekli indexler
CREATE INDEX "idx_attention_student_id" ON "public"."attention_test_results" USING btree ("student_id");
CREATE INDEX "idx_attention_conducted_by" ON "public"."attention_test_results" USING btree ("conducted_by");
CREATE INDEX "idx_attention_test_start_time" ON "public"."attention_test_results" USING btree ("test_start_time");
CREATE INDEX "idx_attention_completion_status" ON "public"."attention_test_results" USING btree ("completion_status");
CREATE INDEX "idx_attention_created_at" ON "public"."attention_test_results" USING btree ("created_at");

-- JSONB alanları için GIN indexler
CREATE INDEX "idx_attention_detailed_responses" ON "public"."attention_test_results" USING gin ("detailed_responses");
CREATE INDEX "idx_attention_time_series_analysis" ON "public"."attention_test_results" USING gin ("time_series_analysis");

-- ============== TRİGGERLER ==============
-- updated_at otomatik güncelleme triggeri
CREATE OR REPLACE TRIGGER "update_attention_test_results_updated_at" 
    BEFORE UPDATE ON "public"."attention_test_results" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- ============== RLS (ROW LEVEL SECURITY) POLİCİLERİ ==============
-- Güvenlik politikaları
ALTER TABLE "public"."attention_test_results" ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Kullanıcılar kendi testlerini, yöneticiler tüm testleri görebilir
CREATE POLICY "attention_test_results_select_policy" ON "public"."attention_test_results" 
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

-- INSERT policy: Yöneticiler ve kullanıcılar test ekleyebilir
CREATE POLICY "attention_test_results_insert_policy" ON "public"."attention_test_results" 
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

-- UPDATE policy: Test yapan kişi veya adminler güncelleyebilir
CREATE POLICY "attention_test_results_update_policy" ON "public"."attention_test_results" 
FOR UPDATE USING (
    -- Admin güncelleyebilir
    (EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin'))
    OR
    -- Test yapan kişi güncelleyebilir
    (conducted_by IN (SELECT u.id FROM "public"."users" u WHERE u.auth_user_id = auth.uid()))
);

-- DELETE policy: Sadece adminler silebilir  
CREATE POLICY "attention_test_results_delete_policy" ON "public"."attention_test_results" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" u WHERE u.auth_user_id = auth.uid() AND u.roles ? 'admin')
);

-- ============== İZINLER ==============
-- Tüm rollere tam izin ver
GRANT ALL ON TABLE "public"."attention_test_results" TO "anon";
GRANT ALL ON TABLE "public"."attention_test_results" TO "authenticated"; 
GRANT ALL ON TABLE "public"."attention_test_results" TO "service_role";