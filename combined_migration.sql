-- Drop existing cognitive_assessment_results table to start fresh
DROP TABLE IF EXISTS cognitive_assessment_results; -- Kullanıcılar ana tablosu
CREATE TABLE kullanicilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_kodu VARCHAR(100) UNIQUE,
    eposta VARCHAR(255) NOT NULL UNIQUE,
    ad_soyad VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kullanıcı profil bilgileri
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

-- İndeksler
CREATE INDEX idx_kullanicilar_eposta ON kullanicilar(eposta);
CREATE INDEX idx_kullanici_profilleri_kullanici_id ON kullanici_profilleri(kullanici_id); -- Test oturumları tablosu
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
CREATE INDEX idx_test_oturumlari_baslangic ON test_oturumlari(baslangic_tarihi); -- Test sonuçları tablosu
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
CREATE INDEX idx_test_sonuclari_bitis ON test_sonuclari(bitis_tarihi); -- Soru cevapları tablosu
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
CREATE INDEX idx_soru_cevaplari_tepki_suresi ON soru_cevaplari(tepki_suresi_ms); -- 1. Dikkat Testi Detayları
CREATE TABLE dikkat_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    bolum1_dogru INTEGER DEFAULT 0,
    bolum1_yanlis INTEGER DEFAULT 0,
    bolum1_sure_ms INTEGER DEFAULT 0,
    bolum1_dogruluk DECIMAL(5,2) DEFAULT 0,
    bolum2_dogru INTEGER DEFAULT 0,
    bolum2_yanlis INTEGER DEFAULT 0,
    bolum2_sure_ms INTEGER DEFAULT 0,
    bolum2_dogruluk DECIMAL(5,2) DEFAULT 0,
    bolum3_dogru INTEGER DEFAULT 0,
    bolum3_yanlis INTEGER DEFAULT 0,
    bolum3_sure_ms INTEGER DEFAULT 0,
    bolum3_dogruluk DECIMAL(5,2) DEFAULT 0,
    sayi_sorulari_dogru INTEGER DEFAULT 0,
    sayi_sorulari_yanlis INTEGER DEFAULT 0,
    harf_sorulari_dogru INTEGER DEFAULT 0,
    harf_sorulari_yanlis INTEGER DEFAULT 0,
    karma_sorular_dogru INTEGER DEFAULT 0,
    karma_sorular_yanlis INTEGER DEFAULT 0,
    ornek_test_skoru INTEGER DEFAULT 0,
    ornek_test_denemeleri INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Akıl-Mantık Testi Detayları
CREATE TABLE akil_mantik_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    dortlu_yatay_skoru INTEGER DEFAULT 0,
    dortlu_kare_skoru INTEGER DEFAULT 0,
    altili_kare_skoru INTEGER DEFAULT 0,
    l_format_skoru INTEGER DEFAULT 0,
    dokuzlu_format_skoru INTEGER DEFAULT 0,
    durtuselluk_skoru DECIMAL(5,2) DEFAULT 0,
    hizli_yanlis_cevaplar INTEGER DEFAULT 0,
    cok_hizli_yanlis_cevaplar INTEGER DEFAULT 0,
    durtuselluk_uyarisi BOOLEAN DEFAULT FALSE,
    ornek_denemeleri INTEGER DEFAULT 0,
    ornek_dogru_sayisi INTEGER DEFAULT 0,
    son_soru_numarasi INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hafıza Testi Detayları
CREATE TABLE hafiza_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    anlik_hatirlama_skoru INTEGER DEFAULT 0,
    geciktirilmis_hatirlama_skoru INTEGER DEFAULT 0,
    tanima_skoru INTEGER DEFAULT 0,
    yanlis_pozitifler INTEGER DEFAULT 0,
    yanlis_negatifler INTEGER DEFAULT 0,
    gorsel_hafiza_skoru INTEGER DEFAULT 0,
    kelime_hafiza_skoru INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Puzzle Testi Detayları
CREATE TABLE puzzle_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    uzamsal_dogruluk DECIMAL(5,2) DEFAULT 0,
    oruntu_tanima_skoru INTEGER DEFAULT 0,
    tamamlama_verimliligi DECIMAL(5,2) DEFAULT 0,
    parca_tamamlama_hizi DECIMAL(5,2) DEFAULT 0,
    rotasyon_dogrulugu DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stroop Testi Detayları
CREATE TABLE stroop_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    uyumlu_dogruluk DECIMAL(5,2) DEFAULT 0,
    uyumsuz_dogruluk DECIMAL(5,2) DEFAULT 0,
    stroop_etkisi_ms INTEGER DEFAULT 0,
    bilissel_esneklik_skoru DECIMAL(5,2) DEFAULT 0,
    mudahale_kontrolu_skoru DECIMAL(5,2) DEFAULT 0,
    adaptasyon_hizi DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
); -- 6 ana bilişsel beceri skoru tablosu
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