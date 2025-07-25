-- 1. Dikkat Testi Detayları
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
); 