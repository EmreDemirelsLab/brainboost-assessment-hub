-- Dikkat Testi Veritabanı Yapısı
-- ===============================

-- 1. Ham veri tablosu - Her soru için bir kayıt
CREATE TABLE IF NOT EXISTS dikkat_ham_veri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    soru_no INTEGER NOT NULL, -- 1-49 arası (örnek: 1-5, ana test: 6-49)
    test_tipi VARCHAR(20) NOT NULL, -- 'practice' veya 'main'
    soru_elementi JSONB NOT NULL, -- Gösterilen elementler dizisi
    hedef_element VARCHAR(10) NOT NULL, -- Aranan hedef element
    verilen_cevap VARCHAR(10), -- Seçilen element (veya NULL)
    dogru_mu BOOLEAN NOT NULL,
    tepki_suresi_ms INTEGER, -- Cevaplama süresi
    soru_gosterilme_zamani TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 2. Dikkat test sonuçları tablosu
CREATE TABLE IF NOT EXISTS dikkat_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    
    -- Örnek test sonuçları
    ornek_dogru_sayisi INTEGER DEFAULT 0,
    ornek_toplam_soru INTEGER DEFAULT 5,
    ornek_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ornek_gecti BOOLEAN DEFAULT FALSE, -- 3/5 doğru gerekli
    ornek_deneme_sayisi INTEGER DEFAULT 1,
    ornek_ortalama_tepki_suresi FLOAT DEFAULT 0,
    
    -- Ana test sonuçları
    ana_test_dogru_sayisi INTEGER DEFAULT 0,
    ana_test_toplam_soru INTEGER DEFAULT 44, -- 49 - 5 örnek
    ana_test_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ana_test_ortalama_tepki_suresi FLOAT DEFAULT 0,
    ana_test_toplam_suresi FLOAT DEFAULT 0, -- 180 saniye maksimum
    ana_test_tamamlandi BOOLEAN DEFAULT FALSE,
    
    -- Genel metrikler
    toplam_dogru_sayisi INTEGER DEFAULT 0,
    toplam_soru_sayisi INTEGER DEFAULT 49,
    genel_dogruluk_yuzdesi FLOAT DEFAULT 0,
    genel_ortalama_tepki_suresi FLOAT DEFAULT 0,
    
    -- Performans analizi
    hizli_tepki_sayisi INTEGER DEFAULT 0, -- < 1000ms
    yavas_tepki_sayisi INTEGER DEFAULT 0, -- > 3000ms
    ortalama_hiz_skoru FLOAT DEFAULT 0, -- 0-100 arası
    
    -- Dikkat türleri analizi
    tek_karakter_dogru INTEGER DEFAULT 0, -- Tek harf/rakam
    cift_karakter_dogru INTEGER DEFAULT 0, -- İki harf/rakam
    uc_karakter_dogru INTEGER DEFAULT 0, -- Üç karakter
    
    -- Hata analizi
    yanlis_secim_sayisi INTEGER DEFAULT 0,
    cevapsiz_sayisi INTEGER DEFAULT 0,
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 3. Dikkat beceri skorları tablosu
CREATE TABLE IF NOT EXISTS dikkat_beceri_skorlari (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    
    -- 6 Bilişsel Beceri Skoru (0-100 arası)
    secici_dikkat_skoru FLOAT CHECK (secici_dikkat_skoru >= 0 AND secici_dikkat_skoru <= 100),
    surdurulebilir_dikkat_skoru FLOAT CHECK (surdurulebilir_dikkat_skoru >= 0 AND surdurulebilir_dikkat_skoru <= 100),
    bolunmus_dikkat_skoru FLOAT CHECK (bolunmus_dikkat_skoru >= 0 AND bolunmus_dikkat_skoru <= 100),
    gorsel_tarama_hizi_skoru FLOAT CHECK (gorsel_tarama_hizi_skoru >= 0 AND gorsel_tarama_hizi_skoru <= 100),
    tepkime_hizi_skoru FLOAT CHECK (tepkime_hizi_skoru >= 0 AND tepkime_hizi_skoru <= 100),
    dikkati_yonlendirme_skoru FLOAT CHECK (dikkati_yonlendirme_skoru >= 0 AND dikkati_yonlendirme_skoru <= 100),
    
    -- Genel performans
    genel_performans_skoru FLOAT CHECK (genel_performans_skoru >= 0 AND genel_performans_skoru <= 100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id),
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id)
);

-- 4. Dikkat test kategorileri tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS dikkat_soru_kategorileri (
    id SERIAL PRIMARY KEY,
    kategori_adi VARCHAR(50) NOT NULL,
    aciklama TEXT,
    ornek_hedef VARCHAR(10),
    zorluk_seviyesi INTEGER DEFAULT 1 -- 1-5 arası
);

-- Kategori verilerini ekle
INSERT INTO dikkat_soru_kategorileri (kategori_adi, aciklama, ornek_hedef, zorluk_seviyesi) VALUES
('Tek Harf', 'Tek harf arama (a, b, c, vs.)', 'o', 1),
('Tek Rakam', 'Tek rakam arama (1, 2, 3, vs.)', '5', 1),
('İki Harf', 'İki harf kombinasyonu (ke, me, vs.)', 'ke', 2),
('İki Rakam', 'İki rakam kombinasyonu (56, 79, vs.)', '56', 2),
('Üç Karakter', 'Üç karakter kombinasyonu (6k1, v52, vs.)', 'k16', 3),
('Karışık Format', 'Harf-rakam karışık (4g4, 2v5, vs.)', '4g4', 4)
ON CONFLICT (kategori_adi) DO NOTHING;

-- 5. Örnek test sonuçları detay tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS dikkat_ornek_detay (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    deneme_no INTEGER NOT NULL,
    ornek_dogru_sayisi INTEGER DEFAULT 0,
    ornek_sure_saniye FLOAT DEFAULT 0,
    ornek_gecti BOOLEAN DEFAULT FALSE,
    tekrar_gerekli BOOLEAN DEFAULT FALSE,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- İndeksler performans için
CREATE INDEX idx_dikkat_ham_veri_test_id ON dikkat_ham_veri(test_id);
CREATE INDEX idx_dikkat_ham_veri_kullanici_id ON dikkat_ham_veri(kullanici_id);
CREATE INDEX idx_dikkat_ham_veri_test_tipi ON dikkat_ham_veri(test_tipi);
CREATE INDEX idx_dikkat_ham_veri_hedef_element ON dikkat_ham_veri(hedef_element);

CREATE INDEX idx_dikkat_sonuclari_test_id ON dikkat_sonuclari(test_id);
CREATE INDEX idx_dikkat_sonuclari_kullanici_id ON dikkat_sonuclari(kullanici_id);

CREATE INDEX idx_dikkat_beceri_skorlari_test_id ON dikkat_beceri_skorlari(test_id);
CREATE INDEX idx_dikkat_beceri_skorlari_kullanici_id ON dikkat_beceri_skorlari(kullanici_id); 