-- Test sonuçları tablosu
CREATE TABLE test_sonuclari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    test_turu VARCHAR(20) NOT NULL CHECK (test_turu IN ('dikkat', 'akil_mantik', 'hafiza', 'puzzle', 'stroop')),
    durum VARCHAR(20) DEFAULT 'baslanmadi' CHECK (durum IN ('baslanmadi', 'devam_ediyor', 'tamamlandi', 'basarisiz', 'zaman_asimi')),
    tamamlanma_yuzdesi DECIMAL(5,2) DEFAULT 0,
    baslangic_tarihi TIMESTAMPTZ DEFAULT NOW(),
    bitis_tarihi TIMESTAMPTZ NULL,
    test_suresi_saniye INTEGER DEFAULT 0,
    toplam_soru_sayisi INTEGER DEFAULT 0,
    cevaplanan_soru_sayisi INTEGER DEFAULT 0,
    dogru_cevap_sayisi INTEGER DEFAULT 0,
    yanlis_cevap_sayisi INTEGER DEFAULT 0,
    atlanan_soru_sayisi INTEGER DEFAULT 0,
    dogruluk_skoru DECIMAL(5,2) DEFAULT 0,
    hiz_skoru DECIMAL(5,2) DEFAULT 0,
    genel_test_skoru DECIMAL(5,2) DEFAULT 0,
    ortalama_tepki_suresi_ms INTEGER DEFAULT 0,
    en_hizli_tepki_ms INTEGER DEFAULT 0,
    en_yavas_tepki_ms INTEGER DEFAULT 0,
    ham_veri JSONB,
    performans_analizi JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint
ALTER TABLE test_sonuclari ADD CONSTRAINT unique_oturum_test UNIQUE (oturum_id, test_turu);

-- İndeksler
CREATE INDEX idx_test_sonuclari_test_turu ON test_sonuclari(test_turu);
CREATE INDEX idx_test_sonuclari_kullanici ON test_sonuclari(kullanici_id, test_turu);
CREATE INDEX idx_test_sonuclari_bitis ON test_sonuclari(bitis_tarihi); 