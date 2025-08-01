-- ================================================================
-- KOMPLE HİYERAŞİK RLS SİSTEMİ - TÜM TEST TABLOLARI
-- Final version - Tüm test tabloları için güvenli RLS
-- ================================================================

-- ============== 1. HELPER FUNCTIONS ==============

-- Mevcut kullanıcının users tablosundaki ID'sini al
CREATE OR REPLACE FUNCTION get_current_user_id() 
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT id FROM public.users WHERE auth_user_id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut kullanıcının en yüksek rolünü al
CREATE OR REPLACE FUNCTION get_current_user_role() 
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN roles::jsonb ? 'admin' THEN 'admin'
        WHEN roles::jsonb ? 'temsilci' THEN 'temsilci'
        WHEN roles::jsonb ? 'beyin_antrenoru' THEN 'beyin_antrenoru'
        WHEN roles::jsonb ? 'kullanici' THEN 'kullanici'
        ELSE 'kullanici'
      END
    FROM public.users WHERE auth_user_id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN RETURN 'kullanici';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının belirli bir kullanıcıyı görebilir mi kontrol et
CREATE OR REPLACE FUNCTION can_user_access_user(target_user_id uuid) 
RETURNS boolean AS $$
DECLARE
  user_role text;
  current_id uuid;
BEGIN
  user_role := get_current_user_role();
  current_id := get_current_user_id();
  
  -- Null kontrolleri
  IF current_id IS NULL OR target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Kendi verisini herkes görebilir
  IF current_id = target_user_id THEN
    RETURN true;
  END IF;
  
  CASE user_role
    -- ADMIN: Herkesi görebilir
    WHEN 'admin' THEN RETURN true;
    
    -- TEMSİLCİ: Altındaki tüm hiyerarşiyi görebilir
    WHEN 'temsilci' THEN 
      RETURN target_user_id IN (
        SELECT (get_all_subordinates(current_id)).id
      );
    
    -- BEYİN ANTRENÖRÜ: Sadece direkt altındakileri görebilir
    WHEN 'beyin_antrenoru' THEN 
      RETURN target_user_id IN (
        SELECT id FROM public.users WHERE supervisor_id = current_id
      );
    
    -- KULLANICI: Sadece kendini görebilir (zaten yukarıda kontrol edildi)
    WHEN 'kullanici' THEN RETURN false;
    
    ELSE RETURN false;
  END CASE;
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============== 2. USERS TABLOSU RLS POLİCİES ==============

-- Eski policies'leri temizle
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_hierarchy_select" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_delete_policy" ON public.users;

-- Güvenli hiyerarşik SELECT policy
CREATE POLICY "users_hierarchy_select" ON public.users FOR SELECT USING (
  can_user_access_user(id)
);

-- INSERT policy - sadece admin, temsilci ve beyin_antrenoru kullanıcı ekleyebilir
CREATE POLICY "users_hierarchy_insert" ON public.users FOR INSERT WITH CHECK (
  get_current_user_role() IN ('admin', 'temsilci', 'beyin_antrenoru')
);

-- UPDATE policy - sadece admin herkesi, diğerleri sadece altındakileri güncelleyebilir
CREATE POLICY "users_hierarchy_update" ON public.users FOR UPDATE USING (
  can_user_access_user(id)
) WITH CHECK (
  can_user_access_user(id)
);

-- DELETE policy - sadece admin
CREATE POLICY "users_hierarchy_delete" ON public.users FOR DELETE USING (
  get_current_user_role() = 'admin'
);

-- ============== 3. ATTENTION TEST RESULTS RLS ==============

DROP POLICY IF EXISTS "attention_select_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_insert_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_update_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_delete_all_authenticated" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_select" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_insert" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_update" ON public.attention_test_results;
DROP POLICY IF EXISTS "attention_hierarchy_delete" ON public.attention_test_results;

CREATE POLICY "attention_hierarchy_select" ON public.attention_test_results FOR SELECT USING (
  can_user_access_user(student_id)
);

CREATE POLICY "attention_hierarchy_insert" ON public.attention_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

CREATE POLICY "attention_hierarchy_update" ON public.attention_test_results FOR UPDATE USING (
  can_user_access_user(student_id)
) WITH CHECK (
  can_user_access_user(student_id)
);

CREATE POLICY "attention_hierarchy_delete" ON public.attention_test_results FOR DELETE USING (
  get_current_user_role() = 'admin' OR 
  (can_user_access_user(student_id) AND conducted_by = get_current_user_id())
);

-- ============== 4. BURDON TEST RESULTS RLS ==============

DROP POLICY IF EXISTS "burdon_select_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_insert_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_update_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_delete_all_authenticated" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_select" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_insert" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_update" ON public.burdon_test_results;
DROP POLICY IF EXISTS "burdon_hierarchy_delete" ON public.burdon_test_results;

CREATE POLICY "burdon_hierarchy_select" ON public.burdon_test_results FOR SELECT USING (
  can_user_access_user(student_id)
);

CREATE POLICY "burdon_hierarchy_insert" ON public.burdon_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

CREATE POLICY "burdon_hierarchy_update" ON public.burdon_test_results FOR UPDATE USING (
  can_user_access_user(student_id)
) WITH CHECK (
  can_user_access_user(student_id)
);

CREATE POLICY "burdon_hierarchy_delete" ON public.burdon_test_results FOR DELETE USING (
  get_current_user_role() = 'admin' OR 
  (can_user_access_user(student_id) AND conducted_by = get_current_user_id())
);

-- ============== 5. D2 TEST RESULTS RLS ==============

DROP POLICY IF EXISTS "d2_select_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_insert_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_update_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_delete_all_authenticated" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_select" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_insert" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_update" ON public.d2_test_results;
DROP POLICY IF EXISTS "d2_hierarchy_delete" ON public.d2_test_results;

CREATE POLICY "d2_hierarchy_select" ON public.d2_test_results FOR SELECT USING (
  can_user_access_user(student_id)
);

CREATE POLICY "d2_hierarchy_insert" ON public.d2_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

CREATE POLICY "d2_hierarchy_update" ON public.d2_test_results FOR UPDATE USING (
  can_user_access_user(student_id)
) WITH CHECK (
  can_user_access_user(student_id)
);

CREATE POLICY "d2_hierarchy_delete" ON public.d2_test_results FOR DELETE USING (
  get_current_user_role() = 'admin' OR 
  (can_user_access_user(student_id) AND conducted_by = get_current_user_id())
);

-- ============== 6. MEMORY TEST RESULTS RLS ==============

DROP POLICY IF EXISTS "memory_select_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_insert_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_update_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_delete_all_authenticated" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_select" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_insert" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_update" ON public.memory_test_results;
DROP POLICY IF EXISTS "memory_hierarchy_delete" ON public.memory_test_results;

CREATE POLICY "memory_hierarchy_select" ON public.memory_test_results FOR SELECT USING (
  can_user_access_user(student_id)
);

CREATE POLICY "memory_hierarchy_insert" ON public.memory_test_results FOR INSERT WITH CHECK (
  student_id = get_current_user_id() OR
  (conducted_by = get_current_user_id() AND can_user_access_user(student_id))
);

CREATE POLICY "memory_hierarchy_update" ON public.memory_test_results FOR UPDATE USING (
  can_user_access_user(student_id)
) WITH CHECK (
  can_user_access_user(student_id)
);

CREATE POLICY "memory_hierarchy_delete" ON public.memory_test_results FOR DELETE USING (
  get_current_user_role() = 'admin' OR 
  (can_user_access_user(student_id) AND conducted_by = get_current_user_id())
);

-- ============== 7. STROOP TEST RESULTS RLS (EĞER VARSA) ==============

-- Stroop tablosu varsa policy ekle
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stroop_test_results'
  ) THEN
    -- Eski policies'leri temizle
    EXECUTE 'DROP POLICY IF EXISTS "stroop_select_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_insert_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_update_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_delete_all_authenticated" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_select" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_insert" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_update" ON public.stroop_test_results';
    EXECUTE 'DROP POLICY IF EXISTS "stroop_hierarchy_delete" ON public.stroop_test_results';
    
    -- Yeni policies ekle
    EXECUTE 'CREATE POLICY "stroop_hierarchy_select" ON public.stroop_test_results FOR SELECT USING (can_user_access_user(student_id))';
    EXECUTE 'CREATE POLICY "stroop_hierarchy_insert" ON public.stroop_test_results FOR INSERT WITH CHECK (student_id = get_current_user_id() OR (conducted_by = get_current_user_id() AND can_user_access_user(student_id)))';
    EXECUTE 'CREATE POLICY "stroop_hierarchy_update" ON public.stroop_test_results FOR UPDATE USING (can_user_access_user(student_id)) WITH CHECK (can_user_access_user(student_id))';
    EXECUTE 'CREATE POLICY "stroop_hierarchy_delete" ON public.stroop_test_results FOR DELETE USING (get_current_user_role() = ''admin'' OR (can_user_access_user(student_id) AND conducted_by = get_current_user_id()))';
  END IF;
END $$;

-- ============== 8. PERFORMANCE İNDEXLERİ ==============

-- Users tablosu için indexler
CREATE INDEX IF NOT EXISTS idx_users_supervisor_hierarchy ON public.users(supervisor_id, id);
CREATE INDEX IF NOT EXISTS idx_users_roles_gin ON public.users USING gin(roles);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

-- Test results tabloları için indexler
CREATE INDEX IF NOT EXISTS idx_attention_student_hierarchy ON public.attention_test_results(student_id, conducted_by);
CREATE INDEX IF NOT EXISTS idx_attention_created_at ON public.attention_test_results(created_at);

CREATE INDEX IF NOT EXISTS idx_burdon_student_hierarchy ON public.burdon_test_results(student_id, conducted_by);
CREATE INDEX IF NOT EXISTS idx_burdon_created_at ON public.burdon_test_results(created_at);

CREATE INDEX IF NOT EXISTS idx_d2_student_hierarchy ON public.d2_test_results(student_id, conducted_by);
CREATE INDEX IF NOT EXISTS idx_d2_created_at ON public.d2_test_results(created_at);

CREATE INDEX IF NOT EXISTS idx_memory_student_hierarchy ON public.memory_test_results(student_id, conducted_by);
CREATE INDEX IF NOT EXISTS idx_memory_created_at ON public.memory_test_results(created_at);

-- Stroop indexi (eğer table varsa)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stroop_test_results'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_stroop_student_hierarchy ON public.stroop_test_results(student_id, conducted_by)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_stroop_created_at ON public.stroop_test_results(created_at)';
  END IF;
END $$;

-- ============== 9. SCHEMA CACHE RELOAD ==============
NOTIFY pgrst, 'reload schema';

-- ============== 10. VERİFIKASYON SORGUSU ==============
SELECT 
  'RLS_FUNCTIONS' as check_type, 
  COUNT(*) as total_functions 
FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_current_user_role', 'can_user_access_user')

UNION ALL

SELECT 
  'RLS_POLICIES' as check_type, 
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%hierarchy%'

UNION ALL

SELECT
  'TEST_TABLES' as check_type,
  COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%test_results'

UNION ALL

SELECT
  'ACTIVE_RLS_TABLES' as check_type,
  COUNT(*) as total_rls_tables
FROM pg_tables t
WHERE t.schemaname = 'public' 
  AND EXISTS (
    SELECT 1 FROM pg_class c 
    WHERE c.relname = t.tablename 
      AND c.relrowsecurity = true
  );