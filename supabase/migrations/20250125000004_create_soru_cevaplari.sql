-- Soru cevapları tablosu
CREATE TABLE soru_cevaplari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    soru_numarasi INTEGER NOT NULL,
    soru_turu VARCHAR(50),
    bolum_adi VARCHAR(100),
    bolum_numarasi INTEGER,
    kullanici_cevabi TEXT,
    dogru_cevap TEXT,
    dogru_mu BOOLEAN DEFAULT FALSE,
    tepki_suresi_ms INTEGER DEFAULT 0,
    soru_baslangic_zamani TIMESTAMPTZ,
    soru_bitis_zamani TIMESTAMPTZ,
    ek_veriler JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_soru_cevaplari_test_sonuc ON soru_cevaplari(test_sonuc_id);
CREATE INDEX idx_soru_cevaplari_soru_turu ON soru_cevaplari(soru_turu);
CREATE INDEX idx_soru_cevaplari_bolum ON soru_cevaplari(bolum_numarasi);
CREATE INDEX idx_soru_cevaplari_tepki_suresi ON soru_cevaplari(tepki_suresi_ms); 