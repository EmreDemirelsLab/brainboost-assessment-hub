-- ================================================================
-- BURDON TEST RESULTS - FINAL CLEAN MIGRATION
-- Son sağlam Burdon test tablosu ve RLS politikaları
-- ================================================================

-- Eski Burdon tablosunu kaldır (varsa)
DROP TABLE IF EXISTS "public"."burdon_test_results" CASCADE;

-- ============== BURDON TEST RESULTS TABLOSU ==============
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
    
    -- Ana test sonuçları
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

-- ============== BURDON TABLOYA SAHIPLIK ==============
ALTER TABLE "public"."burdon_test_results" OWNER TO "postgres";

-- ============== BURDON RLS ENABLE ==============
ALTER TABLE "public"."burdon_test_results" ENABLE ROW LEVEL SECURITY;

-- ============== BURDON RLS POLICIES (ULTRA SIMPLE) ==============
-- Authenticated kullanıcılar herşeyi yapabilir (Frontend'de filtering)

CREATE POLICY "burdon_select_all_authenticated" ON "public"."burdon_test_results"
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_insert_all_authenticated" ON "public"."burdon_test_results"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_update_all_authenticated" ON "public"."burdon_test_results"
FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "burdon_delete_all_authenticated" ON "public"."burdon_test_results"
FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============== BURDON INDEXES ==============
-- Performance için indexler

CREATE INDEX "idx_burdon_student_id" ON "public"."burdon_test_results" ("student_id");
CREATE INDEX "idx_burdon_conducted_by" ON "public"."burdon_test_results" ("conducted_by");
CREATE INDEX "idx_burdon_created_at" ON "public"."burdon_test_results" ("created_at");
CREATE INDEX "idx_burdon_detailed_results" ON "public"."burdon_test_results" USING gin ("detailed_results");

-- ============== BURDON UPDATED_AT TRIGGER ==============
-- updated_at otomatik güncelleme

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

-- ============== POLICY COMMENTS ==============
COMMENT ON POLICY "burdon_select_all_authenticated" ON "public"."burdon_test_results" 
IS 'Ultra simple RLS: Authenticated users can select all Burdon results';

COMMENT ON POLICY "burdon_insert_all_authenticated" ON "public"."burdon_test_results" 
IS 'Ultra simple RLS: Authenticated users can insert Burdon results';

COMMENT ON POLICY "burdon_update_all_authenticated" ON "public"."burdon_test_results" 
IS 'Ultra simple RLS: Authenticated users can update Burdon results';

COMMENT ON POLICY "burdon_delete_all_authenticated" ON "public"."burdon_test_results" 
IS 'Ultra simple RLS: Authenticated users can delete Burdon results';

-- ============== TABLE COMMENT ==============
COMMENT ON TABLE "public"."burdon_test_results" 
IS 'Burdon Konsantrasyon Testi sonuçları - Final clean version';