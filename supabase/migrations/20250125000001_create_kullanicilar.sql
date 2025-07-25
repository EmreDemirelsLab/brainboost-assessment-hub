-- Kullanıcılar ana tablosu
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
CREATE INDEX idx_kullanici_profilleri_kullanici_id ON kullanici_profilleri(kullanici_id); 