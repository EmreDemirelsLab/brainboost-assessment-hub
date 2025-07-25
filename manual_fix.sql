-- MANUEL SQL ÇÖZÜMÜ
-- Supabase Dashboard SQL Editor'da çalıştırın

-- 1. Mevcut constraint'leri kaldır
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey;
ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey;

-- 2. Tablo durumunu kontrol et
SELECT 'users tablosu' as tablo, count(*) as kayit_sayisi FROM users
UNION ALL
SELECT 'kullanicilar tablosu' as tablo, count(*) as kayit_sayisi FROM kullanicilar WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kullanicilar');

-- 3. Eğer kullanicilar tablosu varsa users'a rename et
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kullanicilar') THEN
        DROP TABLE IF EXISTS users CASCADE;
        ALTER TABLE kullanicilar RENAME TO users;
    END IF;
END $$;

-- 4. users tablosuna eksik kolonları ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kullanici_kodu VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_soyad VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 5. Mevcut verileri güncelle
UPDATE users 
SET 
  kullanici_kodu = COALESCE(email, id::text),
  ad_soyad = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
  auth_user_id = id
WHERE kullanici_kodu IS NULL OR ad_soyad IS NULL OR auth_user_id IS NULL;

-- 6. Foreign key'leri users tablosuna bağla
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Sonucu kontrol et
SELECT 'users tablosu' as tablo, count(*) as kayit_sayisi FROM users;
SELECT 'test_oturumlari constraints' as info, conname FROM pg_constraint WHERE conrelid = 'test_oturumlari'::regclass; 