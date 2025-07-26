-- Kullanicilar tablosunu kaldır ve tüm tabloları users tablosuna entegre et

-- 1. Önce mevcut foreign key constraint'leri kaldır
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey;
ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey;
ALTER TABLE soru_cevaplari DROP CONSTRAINT IF EXISTS soru_cevaplari_kullanici_id_fkey;
ALTER TABLE dikkat_testi_detaylari DROP CONSTRAINT IF EXISTS dikkat_testi_detaylari_kullanici_id_fkey;
ALTER TABLE hafiza_testi_detaylari DROP CONSTRAINT IF EXISTS hafiza_testi_detaylari_kullanici_id_fkey;
ALTER TABLE akil_mantik_testi_detaylari DROP CONSTRAINT IF EXISTS akil_mantik_testi_detaylari_kullanici_id_fkey;
ALTER TABLE puzzle_testi_detaylari DROP CONSTRAINT IF EXISTS puzzle_testi_detaylari_kullanici_id_fkey;
ALTER TABLE stroop_testi_detaylari DROP CONSTRAINT IF EXISTS stroop_testi_detaylari_kullanici_id_fkey;
ALTER TABLE bilissel_beceri_skorlari DROP CONSTRAINT IF EXISTS bilissel_beceri_skorlari_kullanici_id_fkey;
ALTER TABLE kullanici_profilleri DROP CONSTRAINT IF EXISTS kullanici_profilleri_kullanici_id_fkey;

-- 2. Kullanicilar tablosundan users tablosuna veri transferi (eğer kullanicilar tablosu varsa)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kullanicilar') THEN
        -- Kullanicilar tablosundaki verileri users tablosuna aktar
        INSERT INTO users (email, first_name, last_name, kullanici_kodu, ad_soyad)
        SELECT 
            COALESCE(eposta, 'unknown@example.com') as email,
            COALESCE(split_part(ad_soyad, ' ', 1), 'Unknown') as first_name,
            COALESCE(split_part(ad_soyad, ' ', 2), '') as last_name,
            kullanici_kodu,
            ad_soyad
        FROM kullanicilar 
        WHERE NOT EXISTS (
            SELECT 1 FROM users WHERE users.email = kullanicilar.eposta
        );
        
        -- Kullanicilar tablosunu kaldır
        DROP TABLE kullanicilar CASCADE;
    END IF;
END $$;

-- 3. Tüm tablolara users tablosuna foreign key constraint'leri ekle
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE soru_cevaplari 
ADD CONSTRAINT soru_cevaplari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE dikkat_testi_detaylari 
ADD CONSTRAINT dikkat_testi_detaylari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE hafiza_testi_detaylari 
ADD CONSTRAINT hafiza_testi_detaylari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE akil_mantik_testi_detaylari 
ADD CONSTRAINT akil_mantik_testi_detaylari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE puzzle_testi_detaylari 
ADD CONSTRAINT puzzle_testi_detaylari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stroop_testi_detaylari 
ADD CONSTRAINT stroop_testi_detaylari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bilissel_beceri_skorlari 
ADD CONSTRAINT bilissel_beceri_skorlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE kullanici_profilleri 
ADD CONSTRAINT kullanici_profilleri_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Eksik indexleri ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_test_oturumlari_kullanici_id ON test_oturumlari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_test_sonuclari_kullanici_id ON test_sonuclari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_soru_cevaplari_kullanici_id ON soru_cevaplari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_dikkat_testi_detaylari_kullanici_id ON dikkat_testi_detaylari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_hafiza_testi_detaylari_kullanici_id ON hafiza_testi_detaylari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_akil_mantik_testi_detaylari_kullanici_id ON akil_mantik_testi_detaylari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_testi_detaylari_kullanici_id ON puzzle_testi_detaylari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_stroop_testi_detaylari_kullanici_id ON stroop_testi_detaylari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_bilissel_beceri_skorlari_kullanici_id ON bilissel_beceri_skorlari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_kullanici_profilleri_kullanici_id ON kullanici_profilleri(kullanici_id);

-- 5. Doğrulama sorgusu
SELECT 'Migration completed successfully' as status;