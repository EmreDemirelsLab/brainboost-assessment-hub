-- 6 ana bilişsel beceri skoru tablosu
CREATE TABLE bilissel_beceri_skorlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    secici_dikkat_skoru DECIMAL(5,2) DEFAULT 0,
    calisma_hafizasi_skoru DECIMAL(5,2) DEFAULT 0,
    bilissel_esneklik_skoru DECIMAL(5,2) DEFAULT 0,
    islem_hizi_skoru DECIMAL(5,2) DEFAULT 0,
    gorsel_uzamsal_skoru DECIMAL(5,2) DEFAULT 0,
    mantiksal_akil_skoru DECIMAL(5,2) DEFAULT 0,
    genel_bilissel_endeks DECIMAL(5,2) DEFAULT 0,
    bilissel_yas_karsiligi INTEGER DEFAULT 0,
    performans_seviyesi VARCHAR(20) DEFAULT 'orta' CHECK (performans_seviyesi IN ('dusuk', 'orta_alti', 'orta', 'orta_ustu', 'yuksek')),
    hesaplama_tarihi TIMESTAMPTZ DEFAULT NOW(),
    guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint - her oturum için tek skor kaydı
ALTER TABLE bilissel_beceri_skorlari ADD CONSTRAINT unique_oturum_skorlar UNIQUE (oturum_id);

-- İndeksler
CREATE INDEX idx_bilissel_skorlar_kullanici ON bilissel_beceri_skorlari(kullanici_id);
CREATE INDEX idx_bilissel_skorlar_genel_endeks ON bilissel_beceri_skorlari(genel_bilissel_endeks);
CREATE INDEX idx_bilissel_skorlar_hesaplama ON bilissel_beceri_skorlari(hesaplama_tarihi); 