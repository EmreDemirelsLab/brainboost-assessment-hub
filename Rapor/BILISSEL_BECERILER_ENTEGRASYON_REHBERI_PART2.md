# 📊 BİLİŞSEL BECERİLER TESTİ VERİTABANI ENTEGRASYONU - PART 2

## 4. DETAYLI SORU CEVAPLARI

```sql
-- Her sorunun detaylı cevap verisi
CREATE TABLE soru_cevaplari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    
    -- Soru bilgileri
    soru_numarasi INTEGER NOT NULL,
    soru_turu VARCHAR(50), -- 's', 'h', 's_h', 'pattern', 'memory', etc.
    bolum_adi VARCHAR(100), -- '1. BÖLÜM', 'Dörtlü Yatay Format', etc.
    bolum_numarasi INTEGER,
    
    -- Cevap bilgileri
    kullanici_cevabi TEXT,
    dogru_cevap TEXT,
    dogru_mu BOOLEAN DEFAULT FALSE,
    
    -- Zaman metrikleri
    tepki_suresi_ms INTEGER DEFAULT 0,
    soru_baslangic_zamani TIMESTAMP WITH TIME ZONE,
    soru_bitis_zamani TIMESTAMP WITH TIME ZONE,
    
    -- Ek veriler (test tipine göre değişken)
    ek_veriler JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE soru_cevaplari ENABLE ROW LEVEL SECURITY;

-- İndeksler
CREATE INDEX idx_soru_cevaplari_test_sonuc ON soru_cevaplari(test_sonuc_id);
CREATE INDEX idx_soru_cevaplari_soru_turu ON soru_cevaplari(soru_turu);
CREATE INDEX idx_soru_cevaplari_bolum ON soru_cevaplari(bolum_numarasi);
CREATE INDEX idx_soru_cevaplari_tepki_suresi ON soru_cevaplari(tepki_suresi_ms);
```

## 5. TEST TİPİ ÖZEL TABLOLAR

### 5.1 DİKKAT TESTİ DETAYLARI

```sql
-- DİKKAT TESTİ ÖZEL VERİLERİ
CREATE TABLE dikkat_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    
    -- Bölüm bazlı sonuçlar (3 bölüm)
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
    
    -- Soru türü bazlı performans
    sayi_sorulari_dogru INTEGER DEFAULT 0,
    sayi_sorulari_yanlis INTEGER DEFAULT 0,
    harf_sorulari_dogru INTEGER DEFAULT 0,
    harf_sorulari_yanlis INTEGER DEFAULT 0,
    karma_sorular_dogru INTEGER DEFAULT 0,
    karma_sorular_yanlis INTEGER DEFAULT 0,
    
    -- Örnek test sonuçları
    ornek_test_skoru INTEGER DEFAULT 0,
    ornek_test_denemeleri INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE dikkat_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

### 5.2 AKIL-MANTIK TESTİ DETAYLARI

```sql
-- AKIL-MANTIK TESTİ ÖZEL VERİLERİ
CREATE TABLE akil_mantik_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    
    -- Bölüm bazlı sonuçlar (5 bölüm)
    dortlu_yatay_skoru INTEGER DEFAULT 0, -- Dörtlü Yatay Format
    dortlu_kare_skoru INTEGER DEFAULT 0, -- Dörtlü Kare Format
    altili_kare_skoru INTEGER DEFAULT 0, -- Altılı Kare Format
    l_format_skoru INTEGER DEFAULT 0, -- L Format
    dokuzlu_format_skoru INTEGER DEFAULT 0, -- Dokuzlu Format
    
    -- Dürtüsellik analizi
    durtuselluk_skoru DECIMAL(5,2) DEFAULT 0,
    hizli_yanlis_cevaplar INTEGER DEFAULT 0,
    cok_hizli_yanlis_cevaplar INTEGER DEFAULT 0,
    durtuselluk_uyarisi BOOLEAN DEFAULT FALSE,
    
    -- Örnek test
    ornek_denemeleri INTEGER DEFAULT 0,
    ornek_dogru_sayisi INTEGER DEFAULT 0,
    son_soru_numarasi INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE akil_mantik_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

### 5.3 HAFIZA TESTİ DETAYLARI

```sql
-- HAFIZA TESTİ ÖZEL VERİLERİ  
CREATE TABLE hafiza_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    
    -- Hafıza performansı
    anlik_hatirlama_skoru INTEGER DEFAULT 0,
    geciktirilmis_hatirlama_skoru INTEGER DEFAULT 0,
    tanima_skoru INTEGER DEFAULT 0,
    
    -- Hata tipleri
    yanlis_pozitifler INTEGER DEFAULT 0,
    yanlis_negatifler INTEGER DEFAULT 0,
    
    -- Ek performans metrikleri
    gorsel_hafiza_skoru INTEGER DEFAULT 0,
    kelime_hafiza_skoru INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE hafiza_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

### 5.4 PUZZLE TESTİ DETAYLARI

```sql
-- PUZZLE TESTİ ÖZEL VERİLERİ
CREATE TABLE puzzle_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    
    -- Görsel-uzamsal performans
    uzamsal_dogruluk DECIMAL(5,2) DEFAULT 0,
    oruntu_tanima_skoru INTEGER DEFAULT 0,
    tamamlama_verimliligi DECIMAL(5,2) DEFAULT 0,
    
    -- Puzzle özel metrikleri
    parça_tamamlama_hizi DECIMAL(5,2) DEFAULT 0,
    rotasyon_dogruluğu DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE puzzle_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

### 5.5 STROOP TESTİ DETAYLARI

```sql
-- STROOP TESTİ ÖZEL VERİLERİ
CREATE TABLE stroop_testi_detaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_sonuc_id UUID NOT NULL REFERENCES test_sonuclari(id) ON DELETE CASCADE,
    
    -- Stroop performansı
    uyumlu_dogruluk DECIMAL(5,2) DEFAULT 0,
    uyumsuz_dogruluk DECIMAL(5,2) DEFAULT 0,
    stroop_etkisi_ms INTEGER DEFAULT 0,
    bilissel_esneklik_skoru DECIMAL(5,2) DEFAULT 0,
    
    -- Ek Stroop metrikleri
    mudahale_kontrolu_skoru DECIMAL(5,2) DEFAULT 0,
    adaptasyon_hizi DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stroop_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

## 6. BİLİŞSEL BECERİ SKORLARI

```sql
-- 6 ana bilişsel beceri skoru
CREATE TABLE bilissel_beceri_skorlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    
    -- 6 Ana Bilişsel Beceri Skoru (0-100 arası)
    secici_dikkat_skoru DECIMAL(5,2) DEFAULT 0,      -- Seçici Dikkat
    calisma_hafizasi_skoru DECIMAL(5,2) DEFAULT 0,   -- Çalışma Hafızası  
    bilissel_esneklik_skoru DECIMAL(5,2) DEFAULT 0,  -- Bilişsel Esneklik
    islem_hizi_skoru DECIMAL(5,2) DEFAULT 0,         -- İşlem Hızı
    gorsel_uzamsal_skoru DECIMAL(5,2) DEFAULT 0,     -- Görsel-Uzamsal İşleme
    mantiksal_akil_skoru DECIMAL(5,2) DEFAULT 0,     -- Mantıksal Akıl Yürütme
    
    -- Genel Bilişsel Performans Endeksi
    genel_bilissel_endeks DECIMAL(5,2) DEFAULT 0,
    bilissel_yas_karsiligi INTEGER DEFAULT 0,
    performans_seviyesi VARCHAR(20) DEFAULT 'orta' CHECK (performans_seviyesi IN ('dusuk', 'orta_alti', 'orta', 'orta_ustu', 'yuksek')),
    
    -- Hesaplama tarihi
    hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bilissel_beceri_skorlari ENABLE ROW LEVEL SECURITY;

-- Unique constraint - her oturum için tek skor kaydı
ALTER TABLE bilissel_beceri_skorlari ADD CONSTRAINT unique_oturum_skorlar UNIQUE (oturum_id);

-- İndeksler
CREATE INDEX idx_bilissel_skorlar_kullanici ON bilissel_beceri_skorlari(kullanici_id);
CREATE INDEX idx_bilissel_skorlar_genel_endeks ON bilissel_beceri_skorlari(genel_bilissel_endeks);
CREATE INDEX idx_bilissel_skorlar_hesaplama ON bilissel_beceri_skorlari(hesaplama_tarihi);
``` 