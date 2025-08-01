-- ================================================================
-- TÜM TEST TABLOLARI RLS ULTRA SIMPLE FIX
-- Infinite recursion'u önlemek için tüm tablolarda ultra simple RLS
-- ================================================================

-- ============== BURDON TEST RESULTS ==============
-- Eski burdon tablosunu kaldır, yeni clean version oluştur
DROP TABLE IF EXISTS "public"."burdon_test_results" CASCADE;

CREATE TABLE "public"."burdon_test_results" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "student_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "conducted_by" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "test_start_time" timestamptz NOT NULL,
    "test_end_time" timestamptz,
    "test_duration_seconds" integer DEFAULT 0,
    "completion_status" text DEFAULT 'completed' CHECK (completion_status IN ('completed', 'auto_completed', 'incomplete')),
    "notes" text,
    "total_correct" integer DEFAULT 0,
    "total_wrong" integer DEFAULT 0,
    "total_missed" integer DEFAULT 0,
    "total_score" integer DEFAULT 0,
    "attention_ratio" numeric(5,2) DEFAULT 0.00,
    "section1_correct" integer DEFAULT 0,
    "section1_wrong" integer DEFAULT 0,
    "section1_missed" integer DEFAULT 0,
    "section1_score" integer DEFAULT 0,
    "section2_correct" integer DEFAULT 0,
    "section2_wrong" integer DEFAULT 0,
    "section2_missed" integer DEFAULT 0,
    "section2_score" integer DEFAULT 0,
    "section3_correct" integer DEFAULT 0,
    "section3_wrong" integer DEFAULT 0,
    "section3_missed" integer DEFAULT 0,
    "section3_score" integer DEFAULT 0,
    "detailed_results" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE "public"."burdon_test_results" OWNER TO "postgres";
ALTER TABLE "public"."burdon_test_results" ENABLE ROW LEVEL SECURITY;

-- ============== D2 TEST RESULTS RLS FIX ==============
-- Eski karmaşık policies'leri kaldır
DROP POLICY IF EXISTS "d2_test_results_select_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_insert_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_update_policy" ON "public"."d2_test_results";
DROP POLICY IF EXISTS "d2_test_results_delete_policy" ON "public"."d2_test_results";

-- ============== ATTENTION TEST RESULTS RLS FIX ==============
-- Eski karmaşık policies'leri kaldır
DROP POLICY IF EXISTS "attention_test_results_select_policy" ON "public"."attention_test_results";
DROP POLICY IF EXISTS "attention_test_results_insert_policy" ON "public"."attention_test_results";
DROP POLICY IF EXISTS "attention_test_results_update_policy" ON "public"."attention_test_results";
DROP POLICY IF EXISTS "attention_test_results_delete_policy" ON "public"."attention_test_results";

-- ============== MEMORY TEST RESULTS RLS FIX ==============
-- Eski karmaşık policies'leri kaldır
DROP POLICY IF EXISTS "memory_test_results_select_policy" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "memory_test_results_insert_policy" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "memory_test_results_update_policy" ON "public"."memory_test_results";
DROP POLICY IF EXISTS "memory_test_results_delete_policy" ON "public"."memory_test_results";

-- ============== STROOP TEST RESULTS RLS FIX ==============
-- Eski karmaşık policies'leri kaldır
DROP POLICY IF EXISTS "stroop_test_results_select_policy" ON "public"."stroop_test_results";
DROP POLICY IF EXISTS "stroop_test_results_insert_policy" ON "public"."stroop_test_results";
DROP POLICY IF EXISTS "stroop_test_results_update_policy" ON "public"."stroop_test_results";
DROP POLICY IF EXISTS "stroop_test_results_delete_policy" ON "public"."stroop_test_results";

-- ============== ULTRA SIMPLE POLICIES FOR ALL TABLES ==============

-- BURDON TEST RESULTS
CREATE POLICY "burdon_select_all_authenticated" ON "public"."burdon_test_results" FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "burdon_insert_all_authenticated" ON "public"."burdon_test_results" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "burdon_update_all_authenticated" ON "public"."burdon_test_results" FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "burdon_delete_all_authenticated" ON "public"."burdon_test_results" FOR DELETE USING (auth.uid() IS NOT NULL);

-- D2 TEST RESULTS
CREATE POLICY "d2_select_all_authenticated" ON "public"."d2_test_results" FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "d2_insert_all_authenticated" ON "public"."d2_test_results" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "d2_update_all_authenticated" ON "public"."d2_test_results" FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "d2_delete_all_authenticated" ON "public"."d2_test_results" FOR DELETE USING (auth.uid() IS NOT NULL);

-- ATTENTION TEST RESULTS
CREATE POLICY "attention_select_all_authenticated" ON "public"."attention_test_results" FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "attention_insert_all_authenticated" ON "public"."attention_test_results" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "attention_update_all_authenticated" ON "public"."attention_test_results" FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "attention_delete_all_authenticated" ON "public"."attention_test_results" FOR DELETE USING (auth.uid() IS NOT NULL);

-- MEMORY TEST RESULTS
CREATE POLICY "memory_select_all_authenticated" ON "public"."memory_test_results" FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "memory_insert_all_authenticated" ON "public"."memory_test_results" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "memory_update_all_authenticated" ON "public"."memory_test_results" FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "memory_delete_all_authenticated" ON "public"."memory_test_results" FOR DELETE USING (auth.uid() IS NOT NULL);

-- STROOP TEST RESULTS
CREATE POLICY "stroop_select_all_authenticated" ON "public"."stroop_test_results" FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stroop_insert_all_authenticated" ON "public"."stroop_test_results" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "stroop_update_all_authenticated" ON "public"."stroop_test_results" FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "stroop_delete_all_authenticated" ON "public"."stroop_test_results" FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============== BURDON INDEXES ==============
CREATE INDEX "idx_burdon_student_id" ON "public"."burdon_test_results" ("student_id");
CREATE INDEX "idx_burdon_conducted_by" ON "public"."burdon_test_results" ("conducted_by");
CREATE INDEX "idx_burdon_created_at" ON "public"."burdon_test_results" ("created_at");
CREATE INDEX "idx_burdon_detailed_results" ON "public"."burdon_test_results" USING gin ("detailed_results");

-- ============== UPDATED_AT TRIGGER FOR BURDON ==============
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_burdon_test_results_updated_at 
    BEFORE UPDATE ON "public"."burdon_test_results" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============== SCHEMA CACHE RELOAD ==============
NOTIFY pgrst, 'reload schema';

-- ============== FINAL CHECK ==============
SELECT 'burdon_test_results' as table_name, COUNT(*) as total_columns 
FROM information_schema.columns WHERE table_name = 'burdon_test_results'
UNION ALL
SELECT 'RLS_POLICIES' as table_name, COUNT(*) as total_policies
FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%_all_authenticated';