-- Stroop Testi Veritabanı Yapısı
-- ================================

-- 1. Ham veri tablosu - Her tepki için bir kayıt
CREATE TABLE IF NOT EXISTS stroop_ham_veri (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    uyaran_suresi_ms INTEGER,
    tepki_var_mi BOOLEAN,
    tepki_zamani_ms INTEGER,
    dogru_mu BOOLEAN,
    asama_no INTEGER CHECK (asama_no IN (1, 2, 3)),
    kelime_gosterilen TEXT,
    renk_gosterilen TEXT,
    beklenen_tepki TEXT,
    verilen_tepki TEXT,
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 2. Stroop test sonuçları tablosu - Her test için özet
CREATE TABLE IF NOT EXISTS stroop_sonuclari (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    
    -- 1. Aşama (BTS) sonuçları
    bts_ort_sure FLOAT,
    bts_dogruluk FLOAT,
    bts_hata INTEGER,
    bts_toplam_tepki INTEGER DEFAULT 12,
    
    -- 2. Aşama (KTS) sonuçları
    kts_ort_sure FLOAT,
    kts_dogruluk FLOAT,
    kts_hata INTEGER,
    kts_toplam_tepki INTEGER,
    
    -- 3. Aşama (STS) sonuçları
    sts_ort_sure FLOAT,
    sts_dogruluk FLOAT,
    sts_hata INTEGER,
    sts_toplam_tepki INTEGER,
    
    -- İnterferans hesapları
    interferans_fark FLOAT,
    interferans_orani FLOAT,
    
    -- Süre bilgileri (saniye)
    bolum1_sure_sn FLOAT,
    bolum2_sure_sn FLOAT,
    bolum3_sure_sn FLOAT,
    toplam_sure_sn FLOAT,
    
    -- Dürtüsellik analizi
    durtussellik_var BOOLEAN,
    durtussellik_aciklama TEXT,
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id),
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id)
);

-- 3. Stroop beceri skorları tablosu
CREATE TABLE IF NOT EXISTS stroop_beceri_skorlari (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    
    -- 7 Bilişsel Beceri Skoru (0-100 arası)
    islem_hizi_skoru FLOAT CHECK (islem_hizi_skoru >= 0 AND islem_hizi_skoru <= 100),
    tepkime_hizi_skoru FLOAT CHECK (tepkime_hizi_skoru >= 0 AND tepkime_hizi_skoru <= 100),
    surdurulebilir_dikkat_skoru FLOAT CHECK (surdurulebilir_dikkat_skoru >= 0 AND surdurulebilir_dikkat_skoru <= 100),
    secici_dikkat_skoru FLOAT CHECK (secici_dikkat_skoru >= 0 AND secici_dikkat_skoru <= 100),
    kisa_sureli_gorsel_hafiza_skoru FLOAT CHECK (kisa_sureli_gorsel_hafiza_skoru >= 0 AND kisa_sureli_gorsel_hafiza_skoru <= 100),
    durtussellik_skoru FLOAT CHECK (durtussellik_skoru >= 0 AND durtussellik_skoru <= 100),
    bilissel_esneklik_skoru FLOAT CHECK (bilissel_esneklik_skoru >= 0 AND bilissel_esneklik_skoru <= 100),
    
    -- Genel performans
    genel_performans_skoru FLOAT CHECK (genel_performans_skoru >= 0 AND genel_performans_skoru <= 100),
    
    tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES TestGecmisi(id),
    FOREIGN KEY (kullanici_id) REFERENCES Kullanici(id)
);

-- İndeksler performans için
CREATE INDEX idx_stroop_ham_veri_test_id ON stroop_ham_veri(test_id);
CREATE INDEX idx_stroop_ham_veri_kullanici_id ON stroop_ham_veri(kullanici_id);
CREATE INDEX idx_stroop_ham_veri_asama_no ON stroop_ham_veri(asama_no);

CREATE INDEX idx_stroop_sonuclari_test_id ON stroop_sonuclari(test_id);
CREATE INDEX idx_stroop_sonuclari_kullanici_id ON stroop_sonuclari(kullanici_id);

CREATE INDEX idx_stroop_beceri_skorlari_test_id ON stroop_beceri_skorlari(test_id);
CREATE INDEX idx_stroop_beceri_skorlari_kullanici_id ON stroop_beceri_skorlari(kullanici_id); 