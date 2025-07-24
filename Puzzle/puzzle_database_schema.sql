-- Puzzle Testi Veritabanı Yapısı
-- ================================

-- 1. Ham veri tablosu - Her parça için bir kayıt
CREATE TABLE IF NOT EXISTS puzzle_ham_veri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    puzzle_tipi VARCHAR(50) NOT NULL, -- 'dort_parcali_tek_renk_kare', 'alti_parcali_cift_renk' vs.
    puzzle_no INTEGER NOT NULL, -- Aynı tipte birden fazla puzzle varsa sıra numarası
    parca_no INTEGER NOT NULL, -- Parça sıra numarası
    dogru_mu BOOLEAN NOT NULL,
    tepki_suresi_ms INTEGER, -- Parça için harcanan süre
    parca_gosterilme_suresi_ms INTEGER DEFAULT 15000, -- Maksimum 15 saniye
    beklenen_pozisyon VARCHAR(20), -- Doğru pozisyon (x,y koordinatı veya alan adı)
    verilen_pozisyon VARCHAR(20), -- Kullanıcının verdiği pozisyon
    puzzle_tamamlandi BOOLEAN DEFAULT FALSE, -- Bu parça ile puzzle tamamlandı mı?
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 2. Puzzle test sonuçları tablosu
CREATE TABLE IF NOT EXISTS puzzle_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    
    -- 4 Parçalı Puzzleler (5 adet toplam)
    dort_parcali_dogru_sayisi INTEGER DEFAULT 0,
    dort_parcali_toplam_parca INTEGER DEFAULT 20, -- 5 puzzle × 4 parça
    dort_parcali_dogruluk_yuzdesi FLOAT DEFAULT 0,
    dort_parcali_ortalama_sure FLOAT DEFAULT 0,
    dort_parcali_toplam_sure FLOAT DEFAULT 0,
    
    -- 6 Parçalı Puzzle (1 adet)
    alti_parcali_dogru_sayisi INTEGER DEFAULT 0,
    alti_parcali_toplam_parca INTEGER DEFAULT 6,
    alti_parcali_dogruluk_yuzdesi FLOAT DEFAULT 0,
    alti_parcali_sure FLOAT DEFAULT 0,
    
    -- 9 Parçalı Puzzleler (2 adet toplam)
    dokuz_parcali_dogru_sayisi INTEGER DEFAULT 0,
    dokuz_parcali_toplam_parca INTEGER DEFAULT 18, -- 2 puzzle × 9 parça
    dokuz_parcali_dogruluk_yuzdesi FLOAT DEFAULT 0,
    dokuz_parcali_ortalama_sure FLOAT DEFAULT 0,
    dokuz_parcali_toplam_sure FLOAT DEFAULT 0,
    
    -- 16 Parçalı Puzzle (1 adet)
    onalti_parcali_dogru_sayisi INTEGER DEFAULT 0,
    onalti_parcali_toplam_parca INTEGER DEFAULT 16,
    onalti_parcali_dogruluk_yuzdesi FLOAT DEFAULT 0,
    onalti_parcali_sure FLOAT DEFAULT 0,
    
    -- Genel Metrikler
    toplam_dogru_sayisi INTEGER DEFAULT 0,
    toplam_parca_sayisi INTEGER DEFAULT 60, -- Tüm parçalar
    genel_dogruluk_yuzdesi FLOAT DEFAULT 0,
    ortalama_tepki_suresi FLOAT DEFAULT 0, -- Sadece doğru cevaplar için
    toplam_test_suresi FLOAT DEFAULT 0,
    
    -- Tamamlanamayan bölüm bilgisi
    tamamlanamayan_puzzle_tipi VARCHAR(50),
    tamamlanamayan_puzzle_no INTEGER,
    tamamlanamayan_parca_no INTEGER,
    
    -- Bilgi işleme hızı skoru
    bilgi_isleme_hizi_skoru FLOAT DEFAULT 0,
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 3. Puzzle beceri skorları tablosu
CREATE TABLE IF NOT EXISTS puzzle_beceri_skorlari (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    
    -- 6 Bilişsel Beceri Skoru (0-100 arası)
    secici_dikkat_skoru FLOAT CHECK (secici_dikkat_skoru >= 0 AND secici_dikkat_skoru <= 100),
    kisa_sureli_gorsel_hafiza_skoru FLOAT CHECK (kisa_sureli_gorsel_hafiza_skoru >= 0 AND kisa_sureli_gorsel_hafiza_skoru <= 100),
    surdurulebilir_dikkat_skoru FLOAT CHECK (surdurulebilir_dikkat_skoru >= 0 AND surdurulebilir_dikkat_skoru <= 100),
    gorsel_ayrim_manipulasyon_skoru FLOAT CHECK (gorsel_ayrim_manipulasyon_skoru >= 0 AND gorsel_ayrim_manipulasyon_skoru <= 100),
    tepkime_hizi_skoru FLOAT CHECK (tepkime_hizi_skoru >= 0 AND tepkime_hizi_skoru <= 100),
    islem_hizi_skoru FLOAT CHECK (islem_hizi_skoru >= 0 AND islem_hizi_skoru <= 100),
    
    -- Genel performans
    genel_performans_skoru FLOAT CHECK (genel_performans_skoru >= 0 AND genel_performans_skoru <= 100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id),
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id)
);

-- Puzzle tipleri referans tablosu (opsiyonel)
CREATE TABLE IF NOT EXISTS puzzle_tipleri (
    id SERIAL PRIMARY KEY,
    tip_adi VARCHAR(50) UNIQUE NOT NULL,
    aciklama TEXT,
    parca_sayisi INTEGER NOT NULL,
    zorluk_seviyesi INTEGER DEFAULT 1, -- 1-5 arası
    max_sure_saniye INTEGER DEFAULT 15
);

-- Puzzle tiplerini ekle
INSERT INTO puzzle_tipleri (tip_adi, aciklama, parca_sayisi, zorluk_seviyesi) VALUES
('dort_parcali_tek_renk_kare', '4 Parçalı Tek Renk Kare', 4, 1),
('dort_parcali_tek_renk_yuvarlak', '4 Parçalı Tek Renk Yuvarlak', 4, 1),
('dort_parcali_tek_renk_ucgen', '4 Parçalı Tek Renk Üçgen', 4, 1),
('dort_parcali_cift_renk_bir', '4 Parçalı Çift Renk Bir', 4, 2),
('dort_parcali_cift_renk_iki', '4 Parçalı Çift Renk İki', 4, 2),
('alti_parcali_cift_renk', '6 Parçalı Çift Renk', 6, 3),
('dokuz_parcali_tek_renk', '9 Parçalı Tek Renk', 9, 4),
('dokuz_parcali_cok_renk', '9 Parçalı Çok Renk', 9, 4),
('onalti_parcali_tek_renk', '16 Parçalı Tek Renk', 16, 5)
ON CONFLICT (tip_adi) DO NOTHING;

-- İndeksler performans için
CREATE INDEX idx_puzzle_ham_veri_test_id ON puzzle_ham_veri(test_id);
CREATE INDEX idx_puzzle_ham_veri_kullanici_id ON puzzle_ham_veri(kullanici_id);
CREATE INDEX idx_puzzle_ham_veri_puzzle_tipi ON puzzle_ham_veri(puzzle_tipi);

CREATE INDEX idx_puzzle_sonuclari_test_id ON puzzle_sonuclari(test_id);
CREATE INDEX idx_puzzle_sonuclari_kullanici_id ON puzzle_sonuclari(kullanici_id);

CREATE INDEX idx_puzzle_beceri_skorlari_test_id ON puzzle_beceri_skorlari(test_id);
CREATE INDEX idx_puzzle_beceri_skorlari_kullanici_id ON puzzle_beceri_skorlari(kullanici_id); 