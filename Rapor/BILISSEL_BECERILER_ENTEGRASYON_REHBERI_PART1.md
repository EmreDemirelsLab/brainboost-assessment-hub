# 📊 BİLİŞSEL BECERİLER TESTİ VERİTABANI ENTEGRASYONU - DETAYLI UYGULAMA REHBERİ (PART 1)

## 🎯 PROJE ÖZET

Bu proje, 5 farklı bilişsel beceri testini (Dikkat, Akıl-Mantık, Hafıza, Puzzle, Stroop) tek bir sistemde birleştirerek kullanıcıların bilişsel performanslarını ölçen ve 6 ana bilişsel beceri skoru hesaplayan bir web uygulamasıdır.

### Mevcut Durum:
- React + TypeScript + Supabase
- 5 adet HTML test dosyası (dikkat.html, akil-mantik.html, hafiza.html, puzzle.html, stroop.html)
- Testler bağımsız çalışıyor ve veri topluyor
- Mevcut klasör yapısı korunacak

### Hedef:
- Tüm test verilerini Supabase'de merkezi olarak saklamak
- 6 ana bilişsel beceri skoru hesaplamak
- Detaylı raporlama sistemi kurmak
- Kullanıcı yönetimi eklemek

## 📋 VERİTABANI TABLO YAPISI

### 1. KULLANICI YÖNETİMİ

```sql
-- Kullanıcılar ana tablosu
CREATE TABLE kullanicilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_kodu VARCHAR(100) UNIQUE,
    eposta VARCHAR(255) NOT NULL UNIQUE,
    ad_soyad VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;

-- Kullanıcı profil bilgileri
CREATE TABLE kullanici_profilleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    yas INTEGER,
    cinsiyet VARCHAR(10) CHECK (cinsiyet IN ('erkek', 'kadin', 'diger')),
    egitim_seviyesi VARCHAR(100),
    meslek VARCHAR(255),
    ek_bilgiler JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kullanici_profilleri ENABLE ROW LEVEL SECURITY;
```

### 2. TEST OTURUMLARI

```sql
-- Test oturumları - tüm 5 testi kapsayan ana oturum
CREATE TABLE test_oturumlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    oturum_uuid VARCHAR(36) UNIQUE NOT NULL,
    
    -- Oturum durumu
    durum VARCHAR(20) DEFAULT 'baslatildi' CHECK (durum IN ('baslatildi', 'devam_ediyor', 'tamamlandi', 'terk_edildi')),
    mevcut_test_indeksi INTEGER DEFAULT 0, -- Hangi testte (0-4)
    
    -- Zaman bilgileri
    baslangic_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bitis_tarihi TIMESTAMP WITH TIME ZONE NULL,
    toplam_sure_saniye INTEGER DEFAULT 0,
    
    -- Genel sonuçlar
    genel_skor DECIMAL(5,2) DEFAULT 0,
    performans_seviyesi VARCHAR(20) CHECK (performans_seviyesi IN ('dusuk', 'orta', 'yuksek')),
    
    -- Meta veriler
    tarayici_bilgisi TEXT,
    cihaz_bilgisi TEXT,
    ip_adresi INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE test_oturumlari ENABLE ROW LEVEL SECURITY;

-- İndeksler
CREATE INDEX idx_test_oturumlari_kullanici ON test_oturumlari(kullanici_id);
CREATE INDEX idx_test_oturumlari_durum ON test_oturumlari(durum);
CREATE INDEX idx_test_oturumlari_baslangic ON test_oturumlari(baslangic_tarihi);
```

### 3. GENEL TEST SONUÇLARI

```sql
-- Her test türü için genel sonuçlar
CREATE TABLE test_sonuclari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    test_turu VARCHAR(20) NOT NULL CHECK (test_turu IN ('dikkat', 'akil_mantik', 'hafiza', 'puzzle', 'stroop')),
    
    -- Test durumu
    durum VARCHAR(20) DEFAULT 'baslanmadi' CHECK (durum IN ('baslanmadi', 'devam_ediyor', 'tamamlandi', 'basarisiz', 'zaman_asimi')),
    tamamlanma_yuzdesi DECIMAL(5,2) DEFAULT 0,
    
    -- Zaman bilgileri
    baslangic_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bitis_tarihi TIMESTAMP WITH TIME ZONE NULL,
    test_suresi_saniye INTEGER DEFAULT 0,
    
    -- Temel performans metrikleri
    toplam_soru_sayisi INTEGER DEFAULT 0,
    cevaplanan_soru_sayisi INTEGER DEFAULT 0,
    dogru_cevap_sayisi INTEGER DEFAULT 0,
    yanlis_cevap_sayisi INTEGER DEFAULT 0,
    atlanan_soru_sayisi INTEGER DEFAULT 0,
    
    -- Skorlar (0-100 arası normalize edilmiş)
    dogruluk_skoru DECIMAL(5,2) DEFAULT 0,
    hiz_skoru DECIMAL(5,2) DEFAULT 0,
    genel_test_skoru DECIMAL(5,2) DEFAULT 0,
    
    -- Ortalama tepki süreleri
    ortalama_tepki_suresi_ms INTEGER DEFAULT 0,
    en_hizli_tepki_ms INTEGER DEFAULT 0,
    en_yavas_tepki_ms INTEGER DEFAULT 0,
    
    -- Ham veri (JSON - test özel verileri için)
    ham_veri JSONB,
    
    -- Analiz sonuçları
    performans_analizi JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE test_sonuclari ENABLE ROW LEVEL SECURITY;

-- Unique constraint
ALTER TABLE test_sonuclari ADD CONSTRAINT unique_oturum_test UNIQUE (oturum_id, test_turu);

-- İndeksler
CREATE INDEX idx_test_sonuclari_test_turu ON test_sonuclari(test_turu);
CREATE INDEX idx_test_sonuclari_kullanici ON test_sonuclari(kullanici_id, test_turu);
CREATE INDEX idx_test_sonuclari_bitis ON test_sonuclari(bitis_tarihi);
``` 