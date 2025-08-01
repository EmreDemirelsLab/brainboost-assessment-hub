-- ================================================================
-- SADECE HELPER FUNCTIONS EKLEMESİ
-- RLS Policies zaten kuruluysa sadece bunu çalıştır
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

-- ============== 2. DOĞRULAMA ==============

SELECT 
  'HELPER_FUNCTIONS_ADDED' as check_type,
  COUNT(*) as total_functions 
FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_current_user_role', 'can_user_access_user')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Schema cache reload
NOTIFY pgrst, 'reload schema';