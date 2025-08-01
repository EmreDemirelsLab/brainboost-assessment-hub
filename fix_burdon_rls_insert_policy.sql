-- ================================================================
-- BURDON RLS INSERT POLICY DÜZELTMESİ
-- Öğrenci kendi testini kaydedebilmeli (supervisor tarafından yapılmış olsa bile)
-- ================================================================

-- Eski INSERT policy'yi kaldır
DROP POLICY IF EXISTS "burdon_hierarchy_insert" ON public.burdon_test_results;

-- Yeni, doğru INSERT policy ekle
CREATE POLICY "burdon_hierarchy_insert" ON public.burdon_test_results FOR INSERT WITH CHECK (
  -- SENARYO 1: Öğrenci kendi test sonucunu kaydediyor 
  -- (conducted_by supervisor olabilir, ama test sonucu öğrencinin)
  student_id = get_current_user_id() OR
  
  -- SENARYO 2: Test yapan kişi (supervisor/admin) öğrencinin testini kaydediyor
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

-- Aynı mantık için diğer test tabloları da düzeltilmeli
DROP POLICY IF EXISTS "d2_hierarchy_insert" ON public.d2_test_results;
CREATE POLICY "d2_hierarchy_insert" ON public.d2_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

DROP POLICY IF EXISTS "attention_hierarchy_insert" ON public.attention_test_results;
CREATE POLICY "attention_hierarchy_insert" ON public.attention_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

DROP POLICY IF EXISTS "memory_hierarchy_insert" ON public.memory_test_results;
CREATE POLICY "memory_hierarchy_insert" ON public.memory_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

-- Stroop tablosu varsa onu da düzelt
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stroop_test_results'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_insert" ON public.stroop_test_results';
    EXECUTE 'CREATE POLICY "stroop_hierarchy_insert" ON public.stroop_test_results FOR INSERT WITH CHECK (student_id = get_current_user_id() OR (conducted_by = get_current_user_id() AND can_user_access_user(student_id)))';
  END IF;
END $$;

-- Schema cache reload
NOTIFY pgrst, 'reload schema';