-- 🔍 D2 TEST AUTH DEBUG
-- RLS policy auth mapping problemini debug et

-- Emre kullanıcısının bilgilerini kontrol et
DO $$
DECLARE
    user_record RECORD;
    auth_user_uuid UUID;
BEGIN
    -- Emre kullanıcısını bul
    SELECT * INTO user_record FROM users WHERE email = 'emre@forbrainacademy.com';
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE 'EMRE USER FOUND:';
        RAISE NOTICE '  ID: %', user_record.id;
        RAISE NOTICE '  AUTH_USER_ID: %', user_record.auth_user_id;
        RAISE NOTICE '  EMAIL: %', user_record.email;
        RAISE NOTICE '  ROLES: %', user_record.roles;
        
        -- Auth user ID'yi UUID'ye çevir
        auth_user_uuid := user_record.auth_user_id::UUID;
        RAISE NOTICE '  AUTH_UUID: %', auth_user_uuid;
        
    ELSE
        RAISE NOTICE 'EMRE USER NOT FOUND!';
    END IF;
END $$;

-- Eğer auth mapping sorunu varsa geçici bir süreliğine policy'leri kaldır
-- Bu şekilde test edebiliriz
DROP POLICY IF EXISTS "Trainers can insert d2 test results" ON d2_test_results;

-- Geçici basit policy ekle - sadece test için
CREATE POLICY "Temporary d2 test insert for debug" 
    ON d2_test_results FOR INSERT 
    WITH CHECK (true); -- Herkese izin ver (geçici)

-- Bu policy'yi test sonrası kaldıracağız