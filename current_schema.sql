

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'trainer',
    'representative',
    'user'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


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



CREATE INDEX "idx_users_demographic_info" ON "public"."users" USING "gin" ("demographic_info");



CREATE INDEX "idx_users_roles" ON "public"."users" USING "gin" ("roles");



CREATE INDEX "idx_users_supervisor_id" ON "public"."users" USING "btree" ("supervisor_id");



CREATE OR REPLACE TRIGGER "update_attention_test_results_updated_at" BEFORE UPDATE ON "public"."attention_test_results" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."attention_test_results"
    ADD CONSTRAINT "attention_test_results_conducted_by_fkey" FOREIGN KEY ("conducted_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attention_test_results"
    ADD CONSTRAINT "attention_test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



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



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



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
