-- Akıl Mantık Testi Veritabanı Yapısı
-- ====================================

-- 1. Ham veri tablosu - Her soru için bir kayıt
CREATE TABLE IF NOT EXISTS akil_mantik_ham_veri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    soru_no INTEGER NOT NULL,
    kategori VARCHAR(100) NOT NULL, -- 'Dörtlü Yatay Format', 'Dörtlü Kare Format' vs.
    bolum_no INTEGER NOT NULL, -- 1-5 arası bölüm numarası
    zorluk_seviyesi INTEGER DEFAULT 1, -- 1-5 arası zorluk
    gosterilen_soru_resmi TEXT, -- Soru resmi yolu
    secenekler JSONB, -- 5 seçenek: A, B, C, D, E (resim yolları)
    dogru_cevap INTEGER NOT NULL, -- 0-4 arası (A=0, B=1, C=2, D=3, E=4)
    verilen_cevap INTEGER, -- 0-4 arası veya NULL (cevapsız)
    dogru_mu BOOLEAN NOT NULL,
    tepki_suresi_ms INTEGER, -- Cevaplama süresi
    soru_gosterilme_suresi_ms INTEGER DEFAULT 30000, -- Maksimum 30 saniye
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 2. Akıl Mantık test sonuçları tablosu
CREATE TABLE IF NOT EXISTS akil_mantik_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    
    -- Bölüm bazında sonuçlar
    bolum1_dogru_sayisi INTEGER DEFAULT 0, -- Dörtlü Yatay (8 soru)
    bolum1_toplam_soru INTEGER DEFAULT 8,
    bolum1_dogruluk_yuzdesi FLOAT DEFAULT 0,
    bolum1_ortalama_sure FLOAT DEFAULT 0,
    bolum1_toplam_sure FLOAT DEFAULT 0,
    
    bolum2_dogru_sayisi INTEGER DEFAULT 0, -- Dörtlü Kare (6 soru)
    bolum2_toplam_soru INTEGER DEFAULT 6,
    bolum2_dogruluk_yuzdesi FLOAT DEFAULT 0,
    bolum2_ortalama_sure FLOAT DEFAULT 0,
    bolum2_toplam_sure FLOAT DEFAULT 0,
    
    bolum3_dogru_sayisi INTEGER DEFAULT 0, -- Altılı Kare (3 soru)
    bolum3_toplam_soru INTEGER DEFAULT 3,
    bolum3_dogruluk_yuzdesi FLOAT DEFAULT 0,
    bolum3_ortalama_sure FLOAT DEFAULT 0,
    bolum3_toplam_sure FLOAT DEFAULT 0,
    
    bolum4_dogru_sayisi INTEGER DEFAULT 0, -- L Format (3 soru)
    bolum4_toplam_soru INTEGER DEFAULT 3,
    bolum4_dogruluk_yuzdesi FLOAT DEFAULT 0,
    bolum4_ortalama_sure FLOAT DEFAULT 0,
    bolum4_toplam_sure FLOAT DEFAULT 0,
    
    bolum5_dogru_sayisi INTEGER DEFAULT 0, -- Dokuzlu Format (3 soru)
    bolum5_toplam_soru INTEGER DEFAULT 3,
    bolum5_dogruluk_yuzdesi FLOAT DEFAULT 0,
    bolum5_ortalama_sure FLOAT DEFAULT 0,
    bolum5_toplam_sure FLOAT DEFAULT 0,
    
    -- Genel metrikler
    toplam_dogru_sayisi INTEGER DEFAULT 0,
    toplam_soru_sayisi INTEGER DEFAULT 23,
    genel_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ortalama_tepki_suresi FLOAT DEFAULT 0, -- Sadece doğru cevaplar için
    toplam_test_suresi FLOAT DEFAULT 0,
    
    -- Zorluk seviyesi performansı
    kolay_sorular_dogru INTEGER DEFAULT 0, -- Zorluk 1-2
    orta_sorular_dogru INTEGER DEFAULT 0, -- Zorluk 3
    zor_sorular_dogru INTEGER DEFAULT 0, -- Zorluk 4-5
    
    -- Tamamlanamayan soru bilgisi
    tamamlanamayan_soru_no INTEGER,
    tamamlanamayan_kategori VARCHAR(100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 3. Akıl Mantık beceri skorları tablosu
CREATE TABLE IF NOT EXISTS akil_mantik_beceri_skorlari (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    
    -- 6 Bilişsel Beceri Skoru (0-100 arası)
    gorsel_algi_ayirim_skoru FLOAT CHECK (gorsel_algi_ayirim_skoru >= 0 AND gorsel_algi_ayirim_skoru <= 100),
    uzamsal_iliskiler_skoru FLOAT CHECK (uzamsal_iliskiler_skoru >= 0 AND uzamsal_iliskiler_skoru <= 100),
    mantiksal_akil_yurutme_skoru FLOAT CHECK (mantiksal_akil_yurutme_skoru >= 0 AND mantiksal_akil_yurutme_skoru <= 100),
    problem_cozme_skoru FLOAT CHECK (problem_cozme_skoru >= 0 AND problem_cozme_skoru <= 100),
    oruntu_tanima_skoru FLOAT CHECK (oruntu_tanima_skoru >= 0 AND oruntu_tanima_skoru <= 100),
    sekil_zemin_ayirimi_skoru FLOAT CHECK (sekil_zemin_ayirimi_skoru >= 0 AND sekil_zemin_ayirimi_skoru <= 100),
    
    -- Genel performans
    genel_performans_skoru FLOAT CHECK (genel_performans_skoru >= 0 AND genel_performans_skoru <= 100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id),
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id)
);

-- 4. Akıl Mantık kategoriler referans tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS akil_mantik_kategoriler (
    id SERIAL PRIMARY KEY,
    kategori_adi VARCHAR(100) UNIQUE NOT NULL,
    bolum_no INTEGER NOT NULL,
    aciklama TEXT,
    soru_sayisi INTEGER NOT NULL,
    zorluk_seviyesi INTEGER DEFAULT 1, -- 1-5 arası
    max_sure_saniye INTEGER DEFAULT 30
);

-- Kategori verilerini ekle
INSERT INTO akil_mantik_kategoriler (kategori_adi, bolum_no, aciklama, soru_sayisi, zorluk_seviyesi) VALUES
('Dörtlü Yatay Format', 1, '4 elemanlı yatay dizilim örüntüleri', 8, 2),
('Dörtlü Kare Format', 2, '4 elemanlı kare dizilim örüntüleri', 6, 3),
('Altılı Kare Format', 3, '6 elemanlı kare dizilim örüntüleri', 3, 4),
('L Format', 4, 'L şeklinde dizilim örüntüleri', 3, 4),
('Dokuzlu Format', 5, '9 elemanlı karmaşık örüntüler', 3, 5)
ON CONFLICT (kategori_adi) DO NOTHING;

-- İndeksler performans için
CREATE INDEX idx_akil_mantik_ham_veri_test_id ON akil_mantik_ham_veri(test_id);
CREATE INDEX idx_akil_mantik_ham_veri_kullanici_id ON akil_mantik_ham_veri(kullanici_id);
CREATE INDEX idx_akil_mantik_ham_veri_bolum_no ON akil_mantik_ham_veri(bolum_no);
CREATE INDEX idx_akil_mantik_ham_veri_kategori ON akil_mantik_ham_veri(kategori);

CREATE INDEX idx_akil_mantik_sonuclari_test_id ON akil_mantik_sonuclari(test_id);
CREATE INDEX idx_akil_mantik_sonuclari_kullanici_id ON akil_mantik_sonuclari(kullanici_id);

CREATE INDEX idx_akil_mantik_beceri_skorlari_test_id ON akil_mantik_beceri_skorlari(test_id);
CREATE INDEX idx_akil_mantik_beceri_skorlari_kullanici_id ON akil_mantik_beceri_skorlari(kullanici_id); 