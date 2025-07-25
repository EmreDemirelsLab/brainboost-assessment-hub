-- KALICI ÇÖZÜM: Unified User System
-- Mevcut users tablosunu yeni sistemle entegre et

-- 1. Önce mevcut kullanicilar tablosunu sil (boş olduğu için güvenli)
DROP TABLE IF EXISTS kullanici_profilleri CASCADE;
DROP TABLE IF EXISTS kullanicilar CASCADE;

-- 2. Mevcut users tablosunu kullanicilar olarak yeniden adlandır
ALTER TABLE users RENAME TO kullanicilar;

-- 3. Kullanicilar tablosuna eksik kolonları ekle
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS kullanici_kodu VARCHAR(100);
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS ad_soyad VARCHAR(255);

-- 4. Mevcut verileri güncelle
UPDATE kullanicilar 
SET 
  kullanici_kodu = COALESCE(email, id::text),
  ad_soyad = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE kullanici_kodu IS NULL OR ad_soyad IS NULL;

-- 5. Email kolonunu eposta olarak yeniden adlandır
ALTER TABLE kullanicilar RENAME COLUMN email TO eposta;

-- 6. Gerekli indeksleri oluştur
CREATE INDEX IF NOT EXISTS idx_kullanicilar_eposta ON kullanicilar(eposta);
CREATE INDEX IF NOT EXISTS idx_kullanicilar_kullanici_kodu ON kullanicilar(kullanici_kodu);

-- 7. Kullanici profilleri tablosunu yeniden oluştur
CREATE TABLE kullanici_profilleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    yas INTEGER,
    cinsiyet VARCHAR(10) CHECK (cinsiyet IN ('erkek', 'kadin', 'diger')),
    egitim_seviyesi VARCHAR(100),
    meslek VARCHAR(255),
    ek_bilgiler JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kullanici_profilleri_kullanici_id ON kullanici_profilleri(kullanici_id);

-- 8. Foreign key constraint'leri yeniden ekle
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE;

ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE; 