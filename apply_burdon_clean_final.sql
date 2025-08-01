-- ================================================================
-- BURDON PRODUCTION CLEAN MIGRATION - APPLY NOW!
-- Bu kodu Supabase Dashboard SQL Editor'da çalıştır
-- ================================================================

-- 1. ESKİ TABLOYU TAMAMEN KALDIR
DROP TABLE IF EXISTS "public"."burdon_test_results" CASCADE;

-- 2. YENİ SAĞLAM TABLOYU OLUŞTUR (SADECE HTML'DEN GELEN FIELDS)
CREATE TABLE "public"."burdon_test_results" (
    -- Primary key ve relations
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "student_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "conducted_by" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    
    -- Test zamanlaması
    "test_start_time" timestamptz NOT NULL,
    "test_end_time" timestamptz,
    "test_duration_seconds" integer DEFAULT 0,
    "completion_status" text DEFAULT 'completed' CHECK (completion_status IN ('completed', 'auto_completed', 'incomplete')),
    "notes" text,
    
    -- Ana test sonuçları (HTML'den gelen)
    "total_correct" integer DEFAULT 0,
    "total_wrong" integer DEFAULT 0,
    "total_missed" integer DEFAULT 0,
    "total_score" integer DEFAULT 0,
    "attention_ratio" numeric(5,2) DEFAULT 0.00,
    
    -- Section 1 sonuçları
    "section1_correct" integer DEFAULT 0,
    "section1_wrong" integer DEFAULT 0,
    "section1_missed" integer DEFAULT 0,
    "section1_score" integer DEFAULT 0,
    
    -- Section 2 sonuçları
    "section2_correct" integer DEFAULT 0,
    "section2_wrong" integer DEFAULT 0,
    "section2_missed" integer DEFAULT 0,
    "section2_score" integer DEFAULT 0,
    
    -- Section 3 sonuçları
    "section3_correct" integer DEFAULT 0,
    "section3_wrong" integer DEFAULT 0,
    "section3_missed" integer DEFAULT 0,
    "section3_score" integer DEFAULT 0,
    
    -- Detaylı veriler (JSON)
    "detailed_results" jsonb DEFAULT '{}'::jsonb,
    
    -- Timestamps
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- 3. TABLOYA SAHİPLİK
ALTER TABLE "public"."burdon_test_results" OWNER TO "postgres";

-- 4. RLS AKTİF ET
ALTER TABLE "public"."burdon_test_results" ENABLE ROW LEVEL SECURITY;

-- 5. ULTRA SIMPLE RLS POLİTİKALARI
CREATE POLICY "burdon_select_all_authenticated" ON "public"."burdon_test_results"
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_insert_all_authenticated" ON "public"."burdon_test_results"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_update_all_authenticated" ON "public"."burdon_test_results"
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_delete_all_authenticated" ON "public"."burdon_test_results"
FOR DELETE USING (auth.uid() IS NOT NULL);

-- 6. PERFORMANCE İNDEXLERİ
CREATE INDEX "idx_burdon_student_id" ON "public"."burdon_test_results" ("student_id");
CREATE INDEX "idx_burdon_conducted_by" ON "public"."burdon_test_results" ("conducted_by");
CREATE INDEX "idx_burdon_created_at" ON "public"."burdon_test_results" ("created_at");
CREATE INDEX "idx_burdon_detailed_results" ON "public"."burdon_test_results" USING gin ("detailed_results");

-- 7. UPDATED_AT TRİGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_burdon_test_results_updated_at 
    BEFORE UPDATE ON "public"."burdon_test_results" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. SCHEMA CACHE YENİLE
NOTIFY pgrst, 'reload schema';

-- 9. KONTROL ET
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'burdon_test_results' 
ORDER BY ordinal_position;

-- 10. TOPLAM SÜTUN SAYISI
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_name = 'burdon_test_results';