-- ZORLA DÜZELT: Foreign Key Constraint Sorunu
-- test_oturumlari tablosundaki kullanicilar referansını users'a çevir

-- 1. Önce constraint'i kesinlikle kaldır
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey CASCADE;

-- 2. Eğer kullanicilar tablosu varsa users'a rename et
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kullanicilar') THEN
        -- kullanicilar tablosu varsa users'a rename et
        ALTER TABLE kullanicilar RENAME TO users_temp;
        
        -- Eğer users tablosu da varsa, kullanicilar'daki verileri users'a merge et
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
            -- users_temp'teki verileri users'a kopyala (duplicate'ları ignore et)
            INSERT INTO users (id, email, first_name, last_name, auth_user_id, kullanici_kodu, ad_soyad, phone, avatar_url, is_active, created_at, updated_at)
            SELECT id, email, first_name, last_name, auth_user_id, kullanici_kodu, ad_soyad, phone, avatar_url, is_active, created_at, updated_at
            FROM users_temp
            ON CONFLICT (id) DO NOTHING;
            
            -- users_temp'i sil
            DROP TABLE users_temp CASCADE;
        ELSE
            -- users tablosu yoksa users_temp'i users'a rename et
            ALTER TABLE users_temp RENAME TO users;
        END IF;
    END IF;
END $$;

-- 3. Şimdi constraint'i users tablosuna bağla
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Diğer tabloları da düzelt
ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey CASCADE;
ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE; 