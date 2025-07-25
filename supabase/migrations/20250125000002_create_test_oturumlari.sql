-- Test oturumları tablosu
CREATE TABLE test_oturumlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    oturum_uuid VARCHAR(36) UNIQUE NOT NULL,
    durum VARCHAR(20) DEFAULT 'baslatildi' CHECK (durum IN ('baslatildi', 'devam_ediyor', 'tamamlandi', 'terk_edildi')),
    mevcut_test_indeksi INTEGER DEFAULT 0,
    baslangic_tarihi TIMESTAMPTZ DEFAULT NOW(),
    bitis_tarihi TIMESTAMPTZ NULL,
    toplam_sure_saniye INTEGER DEFAULT 0,
    genel_skor DECIMAL(5,2) DEFAULT 0,
    performans_seviyesi VARCHAR(20) CHECK (performans_seviyesi IN ('dusuk', 'orta', 'yuksek')),
    tarayici_bilgisi TEXT,
    cihaz_bilgisi TEXT,
    ip_adresi INET,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_test_oturumlari_kullanici ON test_oturumlari(kullanici_id);
CREATE INDEX idx_test_oturumlari_durum ON test_oturumlari(durum);
CREATE INDEX idx_test_oturumlari_baslangic ON test_oturumlari(baslangic_tarihi); 