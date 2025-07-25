# 📊 BİLİŞSEL BECERİLER TESTİ VERİTABANI ENTEGRASYONU - PART 5 (FINAL)

## 🚀 UYGULAMA ADIMLARI

### 1. SUPABASE MİGRATİON DOSYALARI

#### supabase/migrations/20250101000000_create_kullanicilar.sql
```sql
-- Kullanıcılar ve profil tabloları
CREATE TABLE kullanicilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_kodu VARCHAR(100) UNIQUE,
    eposta VARCHAR(255) NOT NULL UNIQUE,
    ad_soyad VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- RLS aktif et
ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kullanici_profilleri ENABLE ROW LEVEL SECURITY;

-- Temel policies
CREATE POLICY "Kullanıcılar kendi verilerini görebilir" ON kullanicilar
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON kullanici_profilleri
    FOR SELECT USING (auth.uid()::text = kullanici_id::text);
```

#### supabase/migrations/20250101000001_create_test_oturumlari.sql
```sql
-- Test oturumları tablosu
CREATE TABLE test_oturumlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    oturum_uuid VARCHAR(36) UNIQUE NOT NULL,
    durum VARCHAR(20) DEFAULT 'baslatildi' CHECK (durum IN ('baslatildi', 'devam_ediyor', 'tamamlandi', 'terk_edildi')),
    mevcut_test_indeksi INTEGER DEFAULT 0,
    baslangic_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bitis_tarihi TIMESTAMP WITH TIME ZONE NULL,
    toplam_sure_saniye INTEGER DEFAULT 0,
    genel_skor DECIMAL(5,2) DEFAULT 0,
    performans_seviyesi VARCHAR(20) CHECK (performans_seviyesi IN ('dusuk', 'orta', 'yuksek')),
    tarayici_bilgisi TEXT,
    cihaz_bilgisi TEXT,
    ip_adresi INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS ve indeksler
ALTER TABLE test_oturumlari ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_test_oturumlari_kullanici ON test_oturumlari(kullanici_id);
CREATE INDEX idx_test_oturumlari_durum ON test_oturumlari(durum);
CREATE INDEX idx_test_oturumlari_baslangic ON test_oturumlari(baslangic_tarihi);

-- Policy
CREATE POLICY "Kullanıcılar kendi oturumlarını görebilir" ON test_oturumlari
    FOR ALL USING (auth.uid()::text = kullanici_id::text);
```

#### supabase/migrations/20250101000002_create_test_sonuclari.sql
```sql
-- Test sonuçları tablosu
CREATE TABLE test_sonuclari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oturum_id UUID NOT NULL REFERENCES test_oturumlari(id) ON DELETE CASCADE,
    kullanici_id UUID NOT NULL REFERENCES kullanicilar(id) ON DELETE CASCADE,
    test_turu VARCHAR(20) NOT NULL CHECK (test_turu IN ('dikkat', 'akil_mantik', 'hafiza', 'puzzle', 'stroop')),
    durum VARCHAR(20) DEFAULT 'baslanmadi' CHECK (durum IN ('baslanmadi', 'devam_ediyor', 'tamamlandi', 'basarisiz', 'zaman_asimi')),
    tamamlanma_yuzdesi DECIMAL(5,2) DEFAULT 0,
    baslangic_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bitis_tarihi TIMESTAMP WITH TIME ZONE NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints ve indeksler
ALTER TABLE test_sonuclari ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sonuclari ADD CONSTRAINT unique_oturum_test UNIQUE (oturum_id, test_turu);

CREATE INDEX idx_test_sonuclari_test_turu ON test_sonuclari(test_turu);
CREATE INDEX idx_test_sonuclari_kullanici ON test_sonuclari(kullanici_id, test_turu);
CREATE INDEX idx_test_sonuclari_bitis ON test_sonuclari(bitis_tarihi);

-- Policy
CREATE POLICY "Kullanıcılar kendi test sonuçlarını görebilir" ON test_sonuclari
    FOR ALL USING (auth.uid()::text = kullanici_id::text);
```

#### supabase/migrations/20250101000003_create_soru_cevaplari.sql
```sql
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
    soru_baslangic_zamani TIMESTAMP WITH TIME ZONE,
    soru_bitis_zamani TIMESTAMP WITH TIME ZONE,
    ek_veriler JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS ve indeksler
ALTER TABLE soru_cevaplari ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_soru_cevaplari_test_sonuc ON soru_cevaplari(test_sonuc_id);
CREATE INDEX idx_soru_cevaplari_soru_turu ON soru_cevaplari(soru_turu);
CREATE INDEX idx_soru_cevaplari_bolum ON soru_cevaplari(bolum_numarasi);
CREATE INDEX idx_soru_cevaplari_tepki_suresi ON soru_cevaplari(tepki_suresi_ms);

-- Policy
CREATE POLICY "Kullanıcılar kendi soru cevaplarını görebilir" ON soru_cevaplari
    FOR ALL USING (auth.uid()::text = kullanici_id::text);
```

#### supabase/migrations/20250101000004_create_test_detay_tablolari.sql
```sql
-- Test detay tabloları (5 adet)

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS aktif et
ALTER TABLE dikkat_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE akil_mantik_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafiza_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE stroop_testi_detaylari ENABLE ROW LEVEL SECURITY;
```

#### supabase/migrations/20250101000005_create_bilissel_skorlar.sql
```sql
-- Bilişsel beceri skorları tablosu
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
    hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraints ve indeksler
ALTER TABLE bilissel_beceri_skorlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilissel_beceri_skorlari ADD CONSTRAINT unique_oturum_skorlar UNIQUE (oturum_id);

CREATE INDEX idx_bilissel_skorlar_kullanici ON bilissel_beceri_skorlari(kullanici_id);
CREATE INDEX idx_bilissel_skorlar_genel_endeks ON bilissel_beceri_skorlari(genel_bilissel_endeks);
CREATE INDEX idx_bilissel_skorlar_hesaplama ON bilissel_beceri_skorlari(hesaplama_tarihi);

-- Policy
CREATE POLICY "Kullanıcılar kendi bilişsel skorlarını görebilir" ON bilissel_beceri_skorlari
    FOR ALL USING (auth.uid()::text = kullanici_id::text);
```

### 2. REACT HOOK'LARI

#### src/hooks/useTestSession.ts
```typescript
import { useState, useEffect } from 'react';
import { TestService } from '@/services/testService';
import { ScoreService } from '@/services/scoreService';
import { TestOturumu, BilisselBeceriSkorlari } from '@/types/database';

export const useTestSession = (kullaniciId: string) => {
  const [session, setSession] = useState<TestOturumu | null>(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<BilisselBeceriSkorlari | null>(null);
  
  const testService = new TestService();
  const scoreService = new ScoreService();
  
  // Test oturumu başlat
  const startSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await testService.createTestSession(kullaniciId);
      if (!error && data) {
        setSession(data);
        // Global erişim için window'a kaydet
        window.currentSession = data;
        return { data, error: null };
      }
      return { data: null, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Test oturumunu tamamla
  const completeSession = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Oturum durumunu güncelle
      await testService.updateTestSession(session.id, {
        durum: 'tamamlandi',
        bitis_tarihi: new Date().toISOString()
      });
      
      // Bilişsel skorları hesapla
      const { data: skorlar, error } = await scoreService.calculateCognitiveScores(session.id);
      if (!error && skorlar) {
        setScores(skorlar);
      }
      
      return { success: true, scores: skorlar };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Test geçmişini getir
  const getTestHistory = async () => {
    const { data, error } = await testService.getUserTestHistory(kullaniciId);
    return { data, error };
  };
  
  return {
    session,
    scores,
    loading,
    startSession,
    completeSession,
    getTestHistory
  };
};
```

### 3. UYGULAMA ADIMLARI SIRASI

#### Adım 1: Supabase Migration'ları Çalıştır
```bash
# Proje dizininde
cd "Bilişsel Beceriler Testi"

# Migration dosyalarını oluştur (yukarıdaki SQL'leri kullanarak)
# supabase/migrations/ klasörüne kaydet

# Migration'ları çalıştır
supabase db push

# TypeScript tiplerini oluştur
supabase gen types typescript --local > src/integrations/supabase/database-types.ts
```

#### Adım 2: TypeScript Tiplerini Ekle
```bash
# src/types/database/ klasörünü oluştur
mkdir -p src/types/database

# Tip dosyalarını oluştur (Part 3'teki tipleri kullanarak)
# kullanici.ts, test-oturumu.ts, test-sonuc.ts, vb.
```

#### Adım 3: Servis Katmanını Ekle
```bash
# src/services/ klasörünü oluştur
mkdir -p src/services

# Servis dosyalarını oluştur (Part 4'teki servisleri kullanarak)
# testService.ts, scoreService.ts, vb.
```

#### Adım 4: HTML Test Dosyalarını Güncelle
```javascript
// Her test HTML dosyasında (dikkat.html, akil-mantik.html, vb.)
// saveTestResults fonksiyonunu güncelle (Part 4'teki örnekleri kullan)

// Global script'i ekle (Part 4'teki script'i kullan)
```

#### Adım 5: React Hook'larını Ekle
```bash
# Hook dosyalarını oluştur
# src/hooks/useTestSession.ts (yukarıdaki örneği kullan)
```

#### Adım 6: Ana Uygulama Entegrasyonu
```typescript
// src/pages/TestExecution.tsx (örnek)
import { useTestSession } from '@/hooks/useTestSession';

export function TestExecution() {
  const { session, startSession, completeSession } = useTestSession(currentUser.id);
  
  const handleTestStart = async () => {
    const { data } = await startSession();
    if (data) {
      // Test HTML dosyasını aç
      window.open('/cognitive-tests/dikkat/dikkat.html', '_blank');
    }
  };
  
  // Test tamamlandığında mesaj dinle
  useEffect(() => {
    const handleTestComplete = async (event) => {
      if (event.data.type === 'test-complete') {
        await completeSession();
      }
    };
    
    window.addEventListener('message', handleTestComplete);
    return () => window.removeEventListener('message', handleTestComplete);
  }, []);
  
  return (
    <div>
      <button onClick={handleTestStart}>Testi Başlat</button>
    </div>
  );
}
```

### 4. TEST SENARYOSU

#### Tam Test Akışı:
1. Kullanıcı sisteme giriş yapar
2. Test oturumu başlatılır (`useTestSession.startSession()`)
3. Test HTML dosyası açılır (popup/iframe)
4. Test tamamlanır, veriler Supabase'e kaydedilir
5. Test HTML'i ana uygulamaya mesaj gönderir
6. Ana uygulama test oturumunu tamamlar ve skorları hesaplar
7. Kullanıcıya sonuçlar gösterilir

### 5. HATA YÖNETİMİ

#### Error Boundaries ve Try-Catch Blokları:
```typescript
// Tüm async fonksiyonlarda hata yakalama
try {
  const result = await testService.saveTestResult(data);
} catch (error) {
  console.error('Test kayıt hatası:', error);
  // Kullanıcıya bilgi ver ama test devam etsin
  showToast('Veriler kaydedilirken bir sorun oluştu, ancak test devam ediyor.');
}
```

## 🎯 SONUÇ

Bu rehber, mevcut bilişsel beceriler testi projenizi tamamen fonksiyonel bir veritabanı sistemiyle entegre etmek için gereken tüm adımları içerir. Uygulama tamamlandığında:

- ✅ 5 test türünün tüm verileri Supabase'de saklanacak
- ✅ 6 ana bilişsel beceri skoru otomatik hesaplanacak
- ✅ Detaylı raporlama mümkün olacak
- ✅ Kullanıcı geçmişi takip edilebilecek
- ✅ Mevcut test HTML dosyaları minimal değişiklikle çalışmaya devam edecek

**Toplam süre tahmini**: 2-3 hafta (tam zamanlı geliştirici için) 