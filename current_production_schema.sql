

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'trainer',
    'representative',
    'user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_d2_test_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Konsantrasyon performansı yüzdesi hesapla
    IF NEW.correct_selections > 0 THEN
        NEW.concentration_performance_percentage := ROUND(
            (NEW.correct_selections::DECIMAL / (NEW.correct_selections + NEW.commission_errors)::DECIMAL) * 100, 2
        );
    END IF;
    
    -- İşlem hızı hesapla (dakika başına işlenen madde)
    IF NEW.test_duration_seconds > 0 THEN
        NEW.processing_speed := ROUND(
            (NEW.total_items_processed::DECIMAL / (NEW.test_duration_seconds::DECIMAL / 60)), 2
        );
    END IF;
    
    -- Dikkat kararlılığı hesapla (dalgalanma oranı düşükse stabilite yüksek)
    NEW.attention_stability := ROUND(
        CASE 
            WHEN NEW.fluctuation_rate = 0 THEN 100
            ELSE GREATEST(0, 100 - (NEW.fluctuation_rate * 5))
        END, 2
    );
    
    -- Toplam skor (konsantrasyon performansını kullan)
    NEW.total_score := NEW.concentration_performance;
    
    -- Güncelleme zamanı
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_d2_test_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_memory_test_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Doğruluk oranı hesapla
    IF NEW.total_questions > 0 THEN
        NEW.accuracy_percentage := ROUND((NEW.correct_answers::DECIMAL / NEW.total_questions::DECIMAL) * 100, 2);
    END IF;
    
    -- Set doğruluk oranları hesapla
    IF (NEW.set1_correct + NEW.set1_wrong + NEW.set1_missed) > 0 THEN
        NEW.set1_accuracy := ROUND((NEW.set1_correct::DECIMAL / (NEW.set1_correct + NEW.set1_wrong + NEW.set1_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set2_correct + NEW.set2_wrong + NEW.set2_missed) > 0 THEN
        NEW.set2_accuracy := ROUND((NEW.set2_correct::DECIMAL / (NEW.set2_correct + NEW.set2_wrong + NEW.set2_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set3_correct + NEW.set3_wrong + NEW.set3_missed) > 0 THEN
        NEW.set3_accuracy := ROUND((NEW.set3_correct::DECIMAL / (NEW.set3_correct + NEW.set3_wrong + NEW.set3_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set4_correct + NEW.set4_wrong + NEW.set4_missed) > 0 THEN
        NEW.set4_accuracy := ROUND((NEW.set4_correct::DECIMAL / (NEW.set4_correct + NEW.set4_wrong + NEW.set4_missed)::DECIMAL) * 100, 2);
    END IF;
    
    -- Beceri doğruluk oranları hesapla
    IF NEW.skill_kisa_sureli_isitsel_total > 0 THEN
        NEW.skill_kisa_sureli_isitsel_accuracy := ROUND((NEW.skill_kisa_sureli_isitsel_correct::DECIMAL / NEW.skill_kisa_sureli_isitsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_kisa_sureli_gorsel_total > 0 THEN
        NEW.skill_kisa_sureli_gorsel_accuracy := ROUND((NEW.skill_kisa_sureli_gorsel_correct::DECIMAL / NEW.skill_kisa_sureli_gorsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_uzun_sureli_isitsel_total > 0 THEN
        NEW.skill_uzun_sureli_isitsel_accuracy := ROUND((NEW.skill_uzun_sureli_isitsel_correct::DECIMAL / NEW.skill_uzun_sureli_isitsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_uzun_sureli_gorsel_total > 0 THEN
        NEW.skill_uzun_sureli_gorsel_accuracy := ROUND((NEW.skill_uzun_sureli_gorsel_correct::DECIMAL / NEW.skill_uzun_sureli_gorsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_isler_hafiza_total > 0 THEN
        NEW.skill_isler_hafiza_accuracy := ROUND((NEW.skill_isler_hafiza_correct::DECIMAL / NEW.skill_isler_hafiza_total::DECIMAL) * 100, 2);
    END IF;
    
    -- Ortalama tepki süresi hesapla
    IF NEW.total_questions > 0 AND NEW.total_response_time > 0 THEN
        NEW.average_response_time := ROUND(NEW.total_response_time / NEW.total_questions, 3);
    END IF;
    
    -- Örnek test başarı oranı
    IF NEW.example_attempts > 0 THEN
        NEW.example_success_rate := ROUND((NEW.example_correct_count::DECIMAL / (NEW.example_attempts * 4)::DECIMAL) * 100, 2);
    END IF;
    
    -- Kalan sorular hesapla
    IF NEW.last_answered_question IS NOT NULL THEN
        NEW.remaining_questions := 20 - NEW.last_answered_question;
        NEW.remaining_time_seconds := NEW.remaining_questions * 6; -- Her soru 6 saniye
    END IF;
    
    -- Güncelleme zamanı
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_memory_test_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_with_demographics"("p_auth_user_id" "uuid", "p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_phone" "text" DEFAULT NULL::"text", "p_roles" "jsonb" DEFAULT '["kullanici"]'::"jsonb", "p_supervisor_id" "uuid" DEFAULT NULL::"uuid", "p_demographic_info" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    phone,
    roles,
    supervisor_id,
    demographic_info
  ) VALUES (
    p_auth_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    p_roles,
    p_supervisor_id,
    p_demographic_info
  ) RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;


ALTER FUNCTION "public"."create_user_with_demographics"("p_auth_user_id" "uuid", "p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_roles" "jsonb", "p_supervisor_id" "uuid", "p_demographic_info" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_subordinates"("supervisor_uuid" "uuid") RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "email" "text", "roles" "jsonb", "supervisor_id" "uuid", "level" integer)
    LANGUAGE "sql" STABLE
    AS $$
  WITH RECURSIVE subordinates AS (
    -- Base case: direct subordinates
    SELECT 
      u.id, 
      u.first_name, 
      u.last_name, 
      u.email,
      u.roles, 
      u.supervisor_id,
      1 as level
    FROM users u 
    WHERE u.supervisor_id = supervisor_uuid
    
    UNION ALL
    
    -- Recursive case: subordinates of subordinates
    SELECT 
      u.id, 
      u.first_name, 
      u.last_name, 
      u.email,
      u.roles, 
      u.supervisor_id,
      s.level + 1
    FROM users u
    INNER JOIN subordinates s ON u.supervisor_id = s.id
    WHERE s.level < 10 -- Prevent infinite recursion
  )
  SELECT * FROM subordinates ORDER BY level, first_name;
$$;


ALTER FUNCTION "public"."get_all_subordinates"("supervisor_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_role"("user_roles" "jsonb", "required_role" "text") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT user_roles ? required_role;
$$;


ALTER FUNCTION "public"."user_has_role"("user_roles" "jsonb", "required_role" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attention_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "conducted_by" "uuid" NOT NULL,
    "test_start_time" timestamp with time zone NOT NULL,
    "test_end_time" timestamp with time zone,
    "test_duration_seconds" integer DEFAULT 0,
    "completion_status" "text" DEFAULT 'completed'::"text",
    "total_questions_attempted" integer DEFAULT 0,
    "total_correct_answers" integer DEFAULT 0,
    "accuracy_percentage" numeric(6,2) DEFAULT 0,
    "speed_score" numeric(6,2) DEFAULT 0,
    "average_reaction_time" integer DEFAULT 0,
    "section1_correct" integer DEFAULT 0,
    "section1_total" integer DEFAULT 13,
    "section1_accuracy" numeric(6,2) DEFAULT 0,
    "section2_correct" integer DEFAULT 0,
    "section2_total" integer DEFAULT 17,
    "section2_accuracy" numeric(6,2) DEFAULT 0,
    "section3_correct" integer DEFAULT 0,
    "section3_total" integer DEFAULT 20,
    "section3_accuracy" numeric(6,2) DEFAULT 0,
    "number_questions_correct" integer DEFAULT 0,
    "number_questions_total" integer DEFAULT 0,
    "number_questions_accuracy" numeric(6,2) DEFAULT 0,
    "letter_questions_correct" integer DEFAULT 0,
    "letter_questions_total" integer DEFAULT 0,
    "letter_questions_accuracy" numeric(6,2) DEFAULT 0,
    "mixed_questions_correct" integer DEFAULT 0,
    "mixed_questions_total" integer DEFAULT 0,
    "mixed_questions_accuracy" numeric(6,2) DEFAULT 0,
    "detailed_answers" "jsonb",
    "wrong_answers" "jsonb",
    "reaction_times" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."attention_test_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."burdon_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "conducted_by" "uuid" NOT NULL,
    "test_start_time" timestamp with time zone NOT NULL,
    "test_end_time" timestamp with time zone,
    "test_duration_seconds" integer DEFAULT 0,
    "completion_status" "text" DEFAULT 'completed'::"text",
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
    "detailed_results" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."burdon_test_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."burdon_test_results" IS 'Burdon attention test results for International Tests section';



CREATE TABLE IF NOT EXISTS "public"."d2_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "conducted_by" "uuid" NOT NULL,
    "test_start_time" timestamp with time zone NOT NULL,
    "test_end_time" timestamp with time zone,
    "test_duration_seconds" integer DEFAULT 0,
    "completion_status" "text" DEFAULT 'completed'::"text",
    "total_items_processed" integer DEFAULT 0,
    "correct_selections" integer DEFAULT 0,
    "commission_errors" integer DEFAULT 0,
    "omission_errors" integer DEFAULT 0,
    "total_errors" integer DEFAULT 0,
    "concentration_performance" integer DEFAULT 0,
    "total_net_performance" integer DEFAULT 0,
    "fluctuation_rate" integer DEFAULT 0,
    "total_score" integer DEFAULT 0,
    "processing_speed" numeric(5,2) DEFAULT 0.00,
    "attention_stability" numeric(5,2) DEFAULT 0.00,
    "line_results" "jsonb" DEFAULT '[]'::"jsonb",
    "detailed_results" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."d2_test_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."d2_test_results" IS 'D2 Dikkat Testi Sonuçları - Konsantrasyon ve Dikkat Performansı';



COMMENT ON COLUMN "public"."d2_test_results"."total_items_processed" IS 'TN_val: Toplam işlenen madde sayısı';



COMMENT ON COLUMN "public"."d2_test_results"."correct_selections" IS 'D: Doğru seçimler';



COMMENT ON COLUMN "public"."d2_test_results"."commission_errors" IS 'E1: Yanlış işaretleme hataları';



COMMENT ON COLUMN "public"."d2_test_results"."omission_errors" IS 'E2: Atlama hataları';



COMMENT ON COLUMN "public"."d2_test_results"."concentration_performance" IS 'CP: Konsantrasyon performansı';



COMMENT ON COLUMN "public"."d2_test_results"."fluctuation_rate" IS 'FR: Dalgalanma oranı';



CREATE TABLE IF NOT EXISTS "public"."memory_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "conducted_by" "uuid" NOT NULL,
    "test_start_time" timestamp with time zone NOT NULL,
    "test_end_time" timestamp with time zone,
    "test_duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completion_status" character varying(50) DEFAULT 'completed'::character varying,
    "notes" "text",
    "total_questions" integer DEFAULT 20 NOT NULL,
    "correct_answers" integer DEFAULT 0 NOT NULL,
    "wrong_answers" integer DEFAULT 0 NOT NULL,
    "missed_answers" integer DEFAULT 0 NOT NULL,
    "accuracy_percentage" numeric(5,2),
    "speed_score" numeric(5,2),
    "total_response_time" numeric(8,3),
    "average_response_time" numeric(6,3),
    "last_answered_question" integer,
    "remaining_questions" integer,
    "remaining_time_seconds" integer,
    "set1_correct" integer DEFAULT 0,
    "set1_wrong" integer DEFAULT 0,
    "set1_missed" integer DEFAULT 0,
    "set1_accuracy" numeric(5,2),
    "set1_completion_time_seconds" integer,
    "set2_correct" integer DEFAULT 0,
    "set2_wrong" integer DEFAULT 0,
    "set2_missed" integer DEFAULT 0,
    "set2_accuracy" numeric(5,2),
    "set2_completion_time_seconds" integer,
    "set3_correct" integer DEFAULT 0,
    "set3_wrong" integer DEFAULT 0,
    "set3_missed" integer DEFAULT 0,
    "set3_accuracy" numeric(5,2),
    "set3_completion_time_seconds" integer,
    "set4_correct" integer DEFAULT 0,
    "set4_wrong" integer DEFAULT 0,
    "set4_missed" integer DEFAULT 0,
    "set4_accuracy" numeric(5,2),
    "set4_completion_time_seconds" integer,
    "skill_kisa_sureli_isitsel_correct" integer DEFAULT 0,
    "skill_kisa_sureli_isitsel_total" integer DEFAULT 0,
    "skill_kisa_sureli_isitsel_accuracy" numeric(5,2),
    "skill_kisa_sureli_gorsel_correct" integer DEFAULT 0,
    "skill_kisa_sureli_gorsel_total" integer DEFAULT 0,
    "skill_kisa_sureli_gorsel_accuracy" numeric(5,2),
    "skill_uzun_sureli_isitsel_correct" integer DEFAULT 0,
    "skill_uzun_sureli_isitsel_total" integer DEFAULT 0,
    "skill_uzun_sureli_isitsel_accuracy" numeric(5,2),
    "skill_uzun_sureli_gorsel_correct" integer DEFAULT 0,
    "skill_uzun_sureli_gorsel_total" integer DEFAULT 0,
    "skill_uzun_sureli_gorsel_accuracy" numeric(5,2),
    "skill_isler_hafiza_correct" integer DEFAULT 0,
    "skill_isler_hafiza_total" integer DEFAULT 0,
    "skill_isler_hafiza_accuracy" numeric(5,2),
    "example_attempts" integer DEFAULT 0,
    "example_correct_count" integer DEFAULT 0,
    "example_success_rate" numeric(5,2),
    "detailed_answers" "jsonb",
    "set_analysis" "jsonb",
    "skill_breakdown" "jsonb",
    "question_response_times" "jsonb",
    "wrong_answer_choices" "jsonb",
    "browser_info" character varying(500),
    "device_info" character varying(500),
    "ip_address" "inet",
    CONSTRAINT "memory_test_results_completion_status_check" CHECK ((("completion_status")::"text" = ANY ((ARRAY['completed'::character varying, 'incomplete'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."memory_test_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."memory_test_results" IS 'Hafıza Testi Sonuçları - Gibson Hafıza Testi verileri';



COMMENT ON COLUMN "public"."memory_test_results"."total_questions" IS 'Toplam soru sayısı (20)';



COMMENT ON COLUMN "public"."memory_test_results"."set1_correct" IS '1. Set doğru cevap sayısı (Soru 1-5)';



COMMENT ON COLUMN "public"."memory_test_results"."skill_kisa_sureli_isitsel_correct" IS 'Kısa Süreli İşitsel beceri doğru sayısı';



CREATE TABLE IF NOT EXISTS "public"."stroop_test_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "conducted_by" "uuid" NOT NULL,
    "test_start_time" timestamp with time zone NOT NULL,
    "test_end_time" timestamp with time zone,
    "test_duration_seconds" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completion_status" character varying(50) DEFAULT 'completed'::character varying,
    "notes" "text",
    "stage1_total_words" integer DEFAULT 12 NOT NULL,
    "stage1_correct_count" integer DEFAULT 0,
    "stage1_total_time_ms" integer DEFAULT 0,
    "stage1_average_time_ms" numeric(8,2) DEFAULT 0,
    "stage1_accuracy" numeric(5,2) DEFAULT 0,
    "stage2_total_words" integer DEFAULT 23 NOT NULL,
    "stage2_correct_count" integer DEFAULT 0,
    "stage2_total_time_ms" integer DEFAULT 0,
    "stage2_average_time_ms" numeric(8,2) DEFAULT 0,
    "stage2_accuracy" numeric(5,2) DEFAULT 0,
    "stage2_impulsivity" numeric(5,2) DEFAULT 0,
    "stage3_total_words" integer DEFAULT 40 NOT NULL,
    "stage3_correct_count" integer DEFAULT 0,
    "stage3_total_time_ms" integer DEFAULT 0,
    "stage3_average_time_ms" numeric(8,2) DEFAULT 0,
    "stage3_accuracy" numeric(5,2) DEFAULT 0,
    "stage3_impulsivity" numeric(5,2) DEFAULT 0,
    "interference_effect_time" numeric(8,2) DEFAULT 0,
    "interference_effect_percentage" numeric(5,2) DEFAULT 0,
    "total_correct_responses" integer DEFAULT 0,
    "total_words_all_stages" integer DEFAULT 75 NOT NULL,
    "overall_accuracy" numeric(5,2) DEFAULT 0,
    "average_response_time_ms" numeric(8,2) DEFAULT 0,
    "detailed_responses" "jsonb",
    "stage_analysis" "jsonb",
    "color_word_combinations" "jsonb",
    "response_time_distribution" "jsonb",
    "error_analysis" "jsonb",
    "browser_info" character varying(500),
    "device_info" character varying(500),
    "ip_address" "inet",
    CONSTRAINT "stroop_test_results_completion_status_check" CHECK ((("completion_status")::"text" = ANY ((ARRAY['completed'::character varying, 'incomplete'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."stroop_test_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."stroop_test_results" IS 'Stroop Testi Sonuçları - 3 aşamalı Stroop test verileri';



COMMENT ON COLUMN "public"."stroop_test_results"."stage1_correct_count" IS 'Aşama 1: Basit tepki - tepki verdiği kelime sayısı';



COMMENT ON COLUMN "public"."stroop_test_results"."stage1_average_time_ms" IS 'Aşama 1: Ortalama tepki süresi (sadece tepki verilen kelimeler)';



COMMENT ON COLUMN "public"."stroop_test_results"."stage1_accuracy" IS 'Aşama 1: Tepki verme oranı (doğru/yanlış kavramı yok)';



COMMENT ON COLUMN "public"."stroop_test_results"."stage2_correct_count" IS 'Aşama 2: Kongruen tepki - doğru tepki sayısı';



COMMENT ON COLUMN "public"."stroop_test_results"."stage2_impulsivity" IS 'Aşama 2: Dürtüsellik skoru (<600ms hızlı yanlış tepkiler)';



COMMENT ON COLUMN "public"."stroop_test_results"."stage3_correct_count" IS 'Aşama 3: Stroop tepki - doğru tepki sayısı';



COMMENT ON COLUMN "public"."stroop_test_results"."stage3_impulsivity" IS 'Aşama 3: Dürtüsellik skoru (<800ms hızlı yanlış tepkiler)';



COMMENT ON COLUMN "public"."stroop_test_results"."interference_effect_time" IS 'İnterferans etkisi: Stage3 - Stage2 ortalama süre farkı (ms)';



COMMENT ON COLUMN "public"."stroop_test_results"."interference_effect_percentage" IS 'İnterferans etkisi yüzdesi: ((Stage3-Stage2)/Stage2)*100';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "roles" "jsonb" DEFAULT '["user"]'::"jsonb",
    "supervisor_id" "uuid",
    "demographic_info" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "check_admin_no_supervisor" CHECK ((NOT (("roles" ? 'admin'::"text") AND ("supervisor_id" IS NOT NULL)))),
    CONSTRAINT "check_kullanici_supervisor" CHECK ((NOT (("roles" ? 'kullanici'::"text") AND ("supervisor_id" IS NULL))))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Unified user table - students are users with kullanici role and demographic_info';



COMMENT ON COLUMN "public"."users"."roles" IS 'User roles: admin, temsilci, beyin_antrenoru, kullanici';



COMMENT ON COLUMN "public"."users"."supervisor_id" IS 'Hierarchical relationship - who this user reports to';



COMMENT ON COLUMN "public"."users"."demographic_info" IS 'JSONB field containing student demographic information';



ALTER TABLE ONLY "public"."attention_test_results"
    ADD CONSTRAINT "attention_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."burdon_test_results"
    ADD CONSTRAINT "burdon_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d2_test_results"
    ADD CONSTRAINT "d2_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_test_results"
    ADD CONSTRAINT "memory_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stroop_test_results"
    ADD CONSTRAINT "stroop_test_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_attention_accuracy" ON "public"."attention_test_results" USING "btree" ("accuracy_percentage");



CREATE INDEX "idx_attention_conducted_auth_user" ON "public"."attention_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_attention_conducted_by" ON "public"."attention_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_attention_detailed_answers" ON "public"."attention_test_results" USING "gin" ("detailed_answers");



CREATE INDEX "idx_attention_speed" ON "public"."attention_test_results" USING "btree" ("speed_score");



CREATE INDEX "idx_attention_student_auth_user" ON "public"."attention_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_attention_student_id" ON "public"."attention_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_attention_test_date" ON "public"."attention_test_results" USING "btree" ("test_start_time");



CREATE INDEX "idx_burdon_conducted_by" ON "public"."burdon_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_burdon_detailed_results" ON "public"."burdon_test_results" USING "gin" ("detailed_results");



CREATE INDEX "idx_burdon_student_id" ON "public"."burdon_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_burdon_test_date" ON "public"."burdon_test_results" USING "btree" ("test_start_time");



CREATE INDEX "idx_d2_test_completion_status" ON "public"."d2_test_results" USING "btree" ("completion_status");



CREATE INDEX "idx_d2_test_conducted_by" ON "public"."d2_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_d2_test_results_conducted_by" ON "public"."d2_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_d2_test_results_created_at" ON "public"."d2_test_results" USING "btree" ("created_at");



CREATE INDEX "idx_d2_test_results_student_id" ON "public"."d2_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_d2_test_start_time" ON "public"."d2_test_results" USING "btree" ("test_start_time");



CREATE INDEX "idx_d2_test_student_id" ON "public"."d2_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_memory_test_completion_status" ON "public"."memory_test_results" USING "btree" ("completion_status");



CREATE INDEX "idx_memory_test_conducted_by" ON "public"."memory_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_memory_test_start_time" ON "public"."memory_test_results" USING "btree" ("test_start_time");



CREATE INDEX "idx_memory_test_student_id" ON "public"."memory_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_stroop_completion_status" ON "public"."stroop_test_results" USING "btree" ("completion_status");



CREATE INDEX "idx_stroop_conducted_by" ON "public"."stroop_test_results" USING "btree" ("conducted_by");



CREATE INDEX "idx_stroop_created_at" ON "public"."stroop_test_results" USING "btree" ("created_at");



CREATE INDEX "idx_stroop_detailed_responses" ON "public"."stroop_test_results" USING "gin" ("detailed_responses");



CREATE INDEX "idx_stroop_stage_analysis" ON "public"."stroop_test_results" USING "gin" ("stage_analysis");



CREATE INDEX "idx_stroop_student_id" ON "public"."stroop_test_results" USING "btree" ("student_id");



CREATE INDEX "idx_stroop_test_start_time" ON "public"."stroop_test_results" USING "btree" ("test_start_time");



CREATE INDEX "idx_users_demographic_info" ON "public"."users" USING "gin" ("demographic_info");



CREATE INDEX "idx_users_roles" ON "public"."users" USING "gin" ("roles");



CREATE INDEX "idx_users_supervisor_id" ON "public"."users" USING "btree" ("supervisor_id");



CREATE OR REPLACE TRIGGER "trigger_calculate_d2_test_metrics" BEFORE INSERT OR UPDATE ON "public"."d2_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_d2_test_metrics"();



CREATE OR REPLACE TRIGGER "trigger_calculate_memory_test_metrics" BEFORE INSERT OR UPDATE ON "public"."memory_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_memory_test_metrics"();



CREATE OR REPLACE TRIGGER "update_attention_test_results_updated_at" BEFORE UPDATE ON "public"."attention_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_burdon_test_results_updated_at" BEFORE UPDATE ON "public"."burdon_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_d2_test_results_updated_at" BEFORE UPDATE ON "public"."d2_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stroop_test_results_updated_at" BEFORE UPDATE ON "public"."stroop_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."attention_test_results"
    ADD CONSTRAINT "attention_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attention_test_results"
    ADD CONSTRAINT "attention_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burdon_test_results"
    ADD CONSTRAINT "burdon_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."burdon_test_results"
    ADD CONSTRAINT "burdon_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d2_test_results"
    ADD CONSTRAINT "d2_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d2_test_results"
    ADD CONSTRAINT "d2_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."memory_test_results"
    ADD CONSTRAINT "memory_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."memory_test_results"
    ADD CONSTRAINT "memory_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stroop_test_results"
    ADD CONSTRAINT "stroop_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stroop_test_results"
    ADD CONSTRAINT "stroop_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Allow insert access" ON "public"."users" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow own deletes" ON "public"."users" FOR DELETE TO "authenticated" USING (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Allow own updates" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth_user_id" = "auth"."uid"())) WITH CHECK (("auth_user_id" = "auth"."uid"()));



CREATE POLICY "Allow read access" ON "public"."users" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."attention_test_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "attention_test_results_delete_policy" ON "public"."attention_test_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



CREATE POLICY "attention_test_results_insert_policy" ON "public"."attention_test_results" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "attention_test_results"."student_id") AND ("u"."roles" ? 'kullanici'::"text"))))));



COMMENT ON POLICY "attention_test_results_insert_policy" ON "public"."attention_test_results" IS 'Yeni rol sistemi için INSERT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri kaydedebilir';



CREATE POLICY "attention_test_results_select_policy" ON "public"."attention_test_results" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "attention_test_results"."student_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "supervisor"
  WHERE (("supervisor"."auth_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."users" "student_user"
          WHERE (("student_user"."id" = "attention_test_results"."student_id") AND ("student_user"."supervisor_id" = "supervisor"."id")))))))));



COMMENT ON POLICY "attention_test_results_select_policy" ON "public"."attention_test_results" IS 'Yeni users yapısı ve rol sistemi (admin, temsilci, beyin_antrenoru, kullanici) için SELECT yetkisi';



CREATE POLICY "attention_test_results_update_policy" ON "public"."attention_test_results" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



ALTER TABLE "public"."burdon_test_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "burdon_test_results_delete_policy" ON "public"."burdon_test_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



CREATE POLICY "burdon_test_results_insert_policy" ON "public"."burdon_test_results" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "burdon_test_results"."student_id") AND ("u"."roles" ? 'kullanici'::"text"))))));



COMMENT ON POLICY "burdon_test_results_insert_policy" ON "public"."burdon_test_results" IS 'Dikkat testi ile uyumlu INSERT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri kaydedebilir';



CREATE POLICY "burdon_test_results_select_policy" ON "public"."burdon_test_results" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "burdon_test_results"."student_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "supervisor"
  WHERE (("supervisor"."auth_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."users" "student_user"
          WHERE (("student_user"."id" = "burdon_test_results"."student_id") AND ("student_user"."supervisor_id" = "supervisor"."id")))))))));



COMMENT ON POLICY "burdon_test_results_select_policy" ON "public"."burdon_test_results" IS 'Dikkat testi ile uyumlu SELECT yetkisi - kullanıcılar kendi testlerini, yöneticiler tüm testleri görebilir';



CREATE POLICY "burdon_test_results_update_policy" ON "public"."burdon_test_results" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



ALTER TABLE "public"."d2_test_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "d2_test_results_delete_policy" ON "public"."d2_test_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



CREATE POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "d2_test_results"."student_id") AND ("u"."roles" ? 'kullanici'::"text"))))));



COMMENT ON POLICY "d2_test_results_insert_policy" ON "public"."d2_test_results" IS 'Dikkat testi ile uyumlu INSERT yetkisi - rol sistemi desteği';



CREATE POLICY "d2_test_results_select_policy" ON "public"."d2_test_results" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "d2_test_results"."student_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "supervisor"
  WHERE (("supervisor"."auth_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."users" "student_user"
          WHERE (("student_user"."id" = "d2_test_results"."student_id") AND ("student_user"."supervisor_id" = "supervisor"."id")))))))));



COMMENT ON POLICY "d2_test_results_select_policy" ON "public"."d2_test_results" IS 'Dikkat testi ile uyumlu SELECT yetkisi - rol sistemi (admin, temsilci, beyin_antrenoru, kullanici)';



CREATE POLICY "d2_test_results_update_policy" ON "public"."d2_test_results" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



ALTER TABLE "public"."memory_test_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "memory_test_results_delete_policy" ON "public"."memory_test_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



CREATE POLICY "memory_test_results_insert_policy" ON "public"."memory_test_results" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "memory_test_results"."student_id") AND ("u"."roles" ? 'kullanici'::"text")))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



COMMENT ON POLICY "memory_test_results_insert_policy" ON "public"."memory_test_results" IS 'Dikkat testi ile uyumlu INSERT yetkisi - conducted_by kontrolü eklendi';



CREATE POLICY "memory_test_results_select_policy" ON "public"."memory_test_results" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "memory_test_results"."student_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "supervisor"
  WHERE (("supervisor"."auth_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."users" "student_user"
          WHERE (("student_user"."id" = "memory_test_results"."student_id") AND ("student_user"."supervisor_id" = "supervisor"."id"))))))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



COMMENT ON POLICY "memory_test_results_select_policy" ON "public"."memory_test_results" IS 'Dikkat testi ile uyumlu SELECT yetkisi - conducted_by mapping düzeltildi';



CREATE POLICY "memory_test_results_update_policy" ON "public"."memory_test_results" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



ALTER TABLE "public"."stroop_test_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "stroop_test_results_delete_policy" ON "public"."stroop_test_results" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))));



CREATE POLICY "stroop_test_results_insert_policy" ON "public"."stroop_test_results" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "stroop_test_results"."student_id") AND ("u"."roles" ? 'kullanici'::"text")))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "stroop_test_results_select_policy" ON "public"."stroop_test_results" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."id" = "stroop_test_results"."student_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND (("u"."roles" ? 'admin'::"text") OR ("u"."roles" ? 'temsilci'::"text") OR ("u"."roles" ? 'beyin_antrenoru'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."users" "supervisor"
  WHERE (("supervisor"."auth_user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
           FROM "public"."users" "student_user"
          WHERE (("student_user"."id" = "stroop_test_results"."student_id") AND ("student_user"."supervisor_id" = "supervisor"."id"))))))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



CREATE POLICY "stroop_test_results_update_policy" ON "public"."stroop_test_results" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."auth_user_id" = "auth"."uid"()) AND ("u"."roles" ? 'admin'::"text")))) OR ("conducted_by" IN ( SELECT "u"."id"
   FROM "public"."users" "u"
  WHERE ("u"."auth_user_id" = "auth"."uid"())))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_d2_test_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_d2_test_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_d2_test_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_memory_test_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_memory_test_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_memory_test_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_with_demographics"("p_auth_user_id" "uuid", "p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_roles" "jsonb", "p_supervisor_id" "uuid", "p_demographic_info" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_with_demographics"("p_auth_user_id" "uuid", "p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_roles" "jsonb", "p_supervisor_id" "uuid", "p_demographic_info" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_with_demographics"("p_auth_user_id" "uuid", "p_email" "text", "p_first_name" "text", "p_last_name" "text", "p_phone" "text", "p_roles" "jsonb", "p_supervisor_id" "uuid", "p_demographic_info" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_subordinates"("supervisor_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_subordinates"("supervisor_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_subordinates"("supervisor_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("user_roles" "jsonb", "required_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_role"("user_roles" "jsonb", "required_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("user_roles" "jsonb", "required_role" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."attention_test_results" TO "anon";
GRANT ALL ON TABLE "public"."attention_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."attention_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."burdon_test_results" TO "anon";
GRANT ALL ON TABLE "public"."burdon_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."burdon_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."d2_test_results" TO "anon";
GRANT ALL ON TABLE "public"."d2_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."d2_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."memory_test_results" TO "anon";
GRANT ALL ON TABLE "public"."memory_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."stroop_test_results" TO "anon";
GRANT ALL ON TABLE "public"."stroop_test_results" TO "authenticated";
GRANT ALL ON TABLE "public"."stroop_test_results" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
