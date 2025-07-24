-- Hafıza Testi Veritabanı Yapısı
-- ================================

-- 1. Ham veri tablosu - Her soru için bir kayıt
CREATE TABLE IF NOT EXISTS hafiza_ham_veri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    soru_no INTEGER NOT NULL, -- 1-20 arası
    set_no INTEGER NOT NULL, -- 1-4 arası set numarası
    soru_tipi VARCHAR(50) NOT NULL, -- 'text' veya 'image'
    beceri_tipi VARCHAR(100) NOT NULL, -- 'Kısa Süreli İşitsel', 'Kısa Süreli Görsel' vs.
    soru_metni TEXT NOT NULL,
    secenekler JSONB NOT NULL, -- 5 seçenek
    dogru_cevap INTEGER NOT NULL, -- 0-4 arası (A=0, B=1, C=2, D=3, E=4)
    verilen_cevap INTEGER, -- 0-4 arası veya NULL (cevapsız/zaman aşımı)
    dogru_mu BOOLEAN NOT NULL,
    tepki_suresi_ms INTEGER, -- Cevaplama süresi
    zaman_asimi BOOLEAN DEFAULT FALSE, -- 6 saniye doldu mu?
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 2. Hafıza test sonuçları tablosu
CREATE TABLE IF NOT EXISTS hafiza_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    
    -- Set bazında sonuçlar
    set1_dogru_sayisi INTEGER DEFAULT 0, -- Set 1 (5 soru)
    set1_toplam_soru INTEGER DEFAULT 5,
    set1_dogruluk_yuzdesi FLOAT DEFAULT 0,
    set1_ortalama_sure FLOAT DEFAULT 0,
    set1_toplam_sure FLOAT DEFAULT 0,
    
    set2_dogru_sayisi INTEGER DEFAULT 0, -- Set 2 (5 soru)
    set2_toplam_soru INTEGER DEFAULT 5,
    set2_dogruluk_yuzdesi FLOAT DEFAULT 0,
    set2_ortalama_sure FLOAT DEFAULT 0,
    set2_toplam_sure FLOAT DEFAULT 0,
    
    set3_dogru_sayisi INTEGER DEFAULT 0, -- Set 3 (5 soru)
    set3_toplam_soru INTEGER DEFAULT 5,
    set3_dogruluk_yuzdesi FLOAT DEFAULT 0,
    set3_ortalama_sure FLOAT DEFAULT 0,
    set3_toplam_sure FLOAT DEFAULT 0,
    
    set4_dogru_sayisi INTEGER DEFAULT 0, -- Set 4 (5 soru)
    set4_toplam_soru INTEGER DEFAULT 5,
    set4_dogruluk_yuzdesi FLOAT DEFAULT 0,
    set4_ortalama_sure FLOAT DEFAULT 0,
    set4_toplam_sure FLOAT DEFAULT 0,
    
    -- Genel metrikler
    toplam_dogru_sayisi INTEGER DEFAULT 0,
    toplam_soru_sayisi INTEGER DEFAULT 20,
    genel_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ortalama_tepki_suresi FLOAT DEFAULT 0, -- Sadece doğru cevaplar için
    toplam_test_suresi FLOAT DEFAULT 0,
    
    -- Zaman aşımı analizi
    zaman_asimi_sayisi INTEGER DEFAULT 0,
    zaman_asimi_orani FLOAT DEFAULT 0,
    
    -- Hız skoru (işlem hızı)
    hiz_skoru FLOAT DEFAULT 0, -- 0-100 arası
    
    -- Tamamlanamayan soru bilgisi
    tamamlanamayan_soru_no INTEGER,
    tamamlanamayan_set_no INTEGER,
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 3. Hafıza beceri skorları tablosu
CREATE TABLE IF NOT EXISTS hafiza_beceri_skorlari (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    
    -- 5 Bilişsel Beceri Skoru (0-100 arası)
    kisa_sureli_isitsel_hafiza_skoru FLOAT CHECK (kisa_sureli_isitsel_hafiza_skoru >= 0 AND kisa_sureli_isitsel_hafiza_skoru <= 100),
    kisa_sureli_gorsel_hafiza_skoru FLOAT CHECK (kisa_sureli_gorsel_hafiza_skoru >= 0 AND kisa_sureli_gorsel_hafiza_skoru <= 100),
    uzun_sureli_isitsel_hafiza_skoru FLOAT CHECK (uzun_sureli_isitsel_hafiza_skoru >= 0 AND uzun_sureli_isitsel_hafiza_skoru <= 100),
    uzun_sureli_gorsel_hafiza_skoru FLOAT CHECK (uzun_sureli_gorsel_hafiza_skoru >= 0 AND uzun_sureli_gorsel_hafiza_skoru <= 100),
    isler_hafiza_skoru FLOAT CHECK (isler_hafiza_skoru >= 0 AND isler_hafiza_skoru <= 100),
    
    -- Genel performans
    genel_performans_skoru FLOAT CHECK (genel_performans_skoru >= 0 AND genel_performans_skoru <= 100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id),
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id)
);

-- 4. Hafıza set bilgileri tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS hafiza_setler (
    id SERIAL PRIMARY KEY,
    set_no INTEGER UNIQUE NOT NULL,
    set_adi VARCHAR(100) NOT NULL,
    aciklama TEXT,
    soru_sayisi INTEGER DEFAULT 5,
    audio_dosyasi VARCHAR(255),
    audio_metni TEXT,
    gorsel_dosyasi VARCHAR(255),
    gorsel_metni TEXT
);

-- Set verilerini ekle
INSERT INTO hafiza_setler (set_no, set_adi, aciklama, audio_dosyasi, audio_metni, gorsel_dosyasi, gorsel_metni) VALUES
(1, 'Set 1', 'Serçe ve Bahçe', 'set1_ses.mp3', '2 serçe çatıya yuva yapmış', 'set1_gorsel.mp3', 'Bu bir bahçe resmidir.'),
(2, 'Set 2', 'Uçurtma ve Kütüphane', 'set2_ses.mp3', 'Ayşe mavi uçurtmasını parkta uçurdu', 'set2_gorsel.mp3', 'Bu bir kütüphane resmidir.'),
(3, 'Set 3', 'Öğretmen ve Kamp', 'set3_ses.mp3', 'Türkçe öğretmeni 30 öğrenciye ders anlattı', 'set3_gorsel.mp3', 'Bu bir kamp resmidir.'),
(4, 'Set 4', 'Deniz ve Yelken', 'set4_ses.mp3', 'Denizde yüzen 4 çocuktan, sadece birinin kırmızı kolluğu vardı', 'set4_gorsel.mp3', 'Bu bir yelken resmidir.')
ON CONFLICT (set_no) DO NOTHING;

-- 5. Örnek test sonuçları tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS hafiza_ornek_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    ornek_dogru_sayisi INTEGER DEFAULT 0,
    ornek_toplam_soru INTEGER DEFAULT 4,
    ornek_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ornek_gecti BOOLEAN DEFAULT FALSE, -- %75 ve üzeri geçer
    deneme_sayisi INTEGER DEFAULT 1,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- İndeksler performans için
CREATE INDEX idx_hafiza_ham_veri_test_id ON hafiza_ham_veri(test_id);
CREATE INDEX idx_hafiza_ham_veri_kullanici_id ON hafiza_ham_veri(kullanici_id);
CREATE INDEX idx_hafiza_ham_veri_set_no ON hafiza_ham_veri(set_no);
CREATE INDEX idx_hafiza_ham_veri_beceri_tipi ON hafiza_ham_veri(beceri_tipi);

CREATE INDEX idx_hafiza_sonuclari_test_id ON hafiza_sonuclari(test_id);
CREATE INDEX idx_hafiza_sonuclari_kullanici_id ON hafiza_sonuclari(kullanici_id);

CREATE INDEX idx_hafiza_beceri_skorlari_test_id ON hafiza_beceri_skorlari(test_id);
CREATE INDEX idx_hafiza_beceri_skorlari_kullanici_id ON hafiza_beceri_skorlari(kullanici_id); 