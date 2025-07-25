-- KALICI ÇÖZÜM: Tutarlı Tablo Sistemi
-- Tüm tabloları İngilizce standardında yeniden düzenle

-- 1. Mevcut test tablolarını koru, user sistemini düzelt

-- 2. kullanicilar tablosunu users'a geri döndür ve düzelt
DROP TABLE IF EXISTS kullanici_profilleri CASCADE;
ALTER TABLE kullanicilar RENAME TO users;

-- 3. users tablosuna eksik kolonları ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kullanici_kodu VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_soyad VARCHAR(255);

-- 4. Mevcut email kolonunu düzelt (eğer eposta olarak rename edilmişse)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'eposta') THEN
        ALTER TABLE users RENAME COLUMN eposta TO email;
    END IF;
END $$;

-- 5. Eksik kolonları ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 6. Mevcut verileri güncelle
UPDATE users 
SET 
  kullanici_kodu = COALESCE(email, id::text),
  ad_soyad = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
  auth_user_id = id -- Geçici olarak id'yi auth_user_id olarak set et
WHERE kullanici_kodu IS NULL OR ad_soyad IS NULL OR auth_user_id IS NULL;

-- 7. Test tablolarındaki foreign key'leri users tablosuna bağla
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey;
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_user_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey;
ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_user_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 8. Gerekli indeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_kullanici_kodu ON users(kullanici_kodu);

-- 9. User profilleri tablosunu yeniden oluştur
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    education_level VARCHAR(100),
    profession VARCHAR(255),
    additional_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id); 