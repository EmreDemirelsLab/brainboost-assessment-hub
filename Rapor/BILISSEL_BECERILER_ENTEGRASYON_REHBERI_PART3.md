# 📊 BİLİŞSEL BECERİLER TESTİ VERİTABANI ENTEGRASYONU - PART 3

## 📁 MEVCUT PROJEYİ GENİŞLETME - KLASÖR YAPISI

### Mevcut Proje Yapısı Genişletilecek:

```
Bilişsel Beceriler Testi/
├── 📁 src/
│   ├── 📁 components/ (mevcut korunacak)
│   ├── 📁 pages/ (mevcut korunacak)
│   ├── 📁 contexts/ (mevcut korunacak)
│   ├── 📁 hooks/ (mevcut korunacak)
│   ├── 📁 integrations/
│   │   └── 📁 supabase/
│   │       ├── client.ts (mevcut)
│   │       ├── types.ts (mevcut - genişletilecek)
│   │       └── 📁 database/ ⭐ YENİ EKLENECEK
│   │           ├── 📁 migrations/
│   │           │   ├── 001_kullanicilar.sql
│   │           │   ├── 002_test_oturumlari.sql
│   │           │   ├── 003_test_sonuclari.sql
│   │           │   ├── 004_soru_cevaplari.sql
│   │           │   ├── 005_test_detay_tablolari.sql
│   │           │   ├── 006_bilissel_skorlar.sql
│   │           │   └── 007_rls_policies.sql
│   │           │
│   │           ├── 📁 functions/
│   │           │   ├── hesapla_bilissel_skorlar.sql
│   │           │   ├── hesapla_test_istatistikleri.sql
│   │           │   └── guncelle_performans_seviyeleri.sql
│   │           │
│   │           └── 📁 views/
│   │               ├── kullanici_test_ozeti.sql
│   │               ├── test_performans_raporu.sql
│   │               └── bilissel_skorlar_ozeti.sql
│   │
│   ├── 📁 services/ ⭐ YENİ EKLENECEK
│   │   ├── testService.ts
│   │   ├── userService.ts
│   │   ├── scoreService.ts
│   │   ├── reportService.ts
│   │   └── databaseService.ts
│   │
│   ├── 📁 types/ (mevcut genişletilecek)
│   │   ├── auth.ts (mevcut)
│   │   ├── 📁 database/ ⭐ YENİ EKLENECEK
│   │   │   ├── kullanici.ts
│   │   │   ├── test-oturumu.ts
│   │   │   ├── test-sonuc.ts
│   │   │   ├── soru-cevap.ts
│   │   │   ├── test-detaylari.ts
│   │   │   └── bilissel-skorlar.ts
│   │   │
│   │   └── 📁 api/ ⭐ YENİ EKLENECEK
│   │       ├── test-api.ts
│   │       ├── user-api.ts
│   │       └── score-api.ts
│   │
│   ├── 📁 utils/ ⭐ YENİ EKLENECEK
│   │   ├── testCalculations.ts
│   │   ├── scoreCalculations.ts
│   │   ├── dataValidation.ts
│   │   └── reportGenerators.ts
│   │
│   └── 📁 lib/ (mevcut genişletilecek)
│       ├── utils.ts (mevcut)
│       └── 📁 database/ ⭐ YENİ EKLENECEK
│           ├── queries.ts
│           ├── mutations.ts
│           └── subscriptions.ts
│
├── 📁 supabase/ (mevcut genişletilecek)
│   ├── config.toml (mevcut)
│   ├── 📁 migrations/ (mevcut genişletilecek)
│   │   ├── [mevcut migration dosyaları]
│   │   ├── 20250101000000_create_kullanicilar.sql ⭐ YENİ
│   │   ├── 20250101000001_create_test_oturumlari.sql ⭐ YENİ
│   │   ├── 20250101000002_create_test_sonuclari.sql ⭐ YENİ
│   │   ├── 20250101000003_create_soru_cevaplari.sql ⭐ YENİ
│   │   ├── 20250101000004_create_test_detay_tablolari.sql ⭐ YENİ
│   │   ├── 20250101000005_create_bilissel_skorlar.sql ⭐ YENİ
│   │   └── 20250101000006_create_rls_policies.sql ⭐ YENİ
│   │
│   └── 📁 seed/ ⭐ YENİ EKLENECEK
│       ├── test-istatistikleri.sql
│       └── ornek-kullanicilar.sql
│
└── 📁 public/ (mevcut korunacak)
    └── 📁 cognitive-tests/ (mevcut korunacak)
        ├── 📁 dikkat/
        ├── 📁 akil-mantik/
        ├── 📁 hafiza/
        ├── 📁 puzzle/
        └── 📁 stroop/
```

## 🔧 TYPESCRIPT TİPLERİ

### 1. Database Tipleri (src/types/database/)

#### kullanici.ts
```typescript
export interface Kullanici {
  id: string;
  kullanici_kodu?: string;
  eposta: string;
  ad_soyad?: string;
  created_at: string;
  updated_at: string;
}

export interface KullaniciProfili {
  id: string;
  kullanici_id: string;
  yas?: number;
  cinsiyet?: 'erkek' | 'kadin' | 'diger';
  egitim_seviyesi?: string;
  meslek?: string;
  ek_bilgiler?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KullaniciWithProfile extends Kullanici {
  kullanici_profilleri?: KullaniciProfili;
}
```

#### test-oturumu.ts
```typescript
export interface TestOturumu {
  id: string;
  kullanici_id: string;
  oturum_uuid: string;
  durum: 'baslatildi' | 'devam_ediyor' | 'tamamlandi' | 'terk_edildi';
  mevcut_test_indeksi: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  toplam_sure_saniye: number;
  genel_skor: number;
  performans_seviyesi?: 'dusuk' | 'orta' | 'yuksek';
  tarayici_bilgisi?: string;
  cihaz_bilgisi?: string;
  ip_adresi?: string;
  created_at: string;
  updated_at: string;
}

export interface TestOturumuWithResults extends TestOturumu {
  test_sonuclari?: TestSonuc[];
  bilissel_beceri_skorlari?: BilisselBeceriSkorlari;
}
```

#### test-sonuc.ts
```typescript
export type TestTuru = 'dikkat' | 'akil_mantik' | 'hafiza' | 'puzzle' | 'stroop';
export type TestDurum = 'baslanmadi' | 'devam_ediyor' | 'tamamlandi' | 'basarisiz' | 'zaman_asimi';

export interface TestSonuc {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  test_turu: TestTuru;
  durum: TestDurum;
  tamamlanma_yuzdesi: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  test_suresi_saniye: number;
  toplam_soru_sayisi: number;
  cevaplanan_soru_sayisi: number;
  dogru_cevap_sayisi: number;
  yanlis_cevap_sayisi: number;
  atlanan_soru_sayisi: number;
  dogruluk_skoru: number;
  hiz_skoru: number;
  genel_test_skoru: number;
  ortalama_tepki_suresi_ms: number;
  en_hizli_tepki_ms: number;
  en_yavas_tepki_ms: number;
  ham_veri?: Record<string, any>;
  performans_analizi?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TestSonucWithDetails extends TestSonuc {
  soru_cevaplari?: SoruCevap[];
  dikkat_testi_detaylari?: DikkatTestiDetaylari;
  akil_mantik_testi_detaylari?: AkilMantikTestiDetaylari;
  hafiza_testi_detaylari?: HafizaTestiDetaylari;
  puzzle_testi_detaylari?: PuzzleTestiDetaylari;
  stroop_testi_detaylari?: StroopTestiDetaylari;
}
```

#### soru-cevap.ts
```typescript
export interface SoruCevap {
  id: string;
  test_sonuc_id: string;
  oturum_id: string;
  kullanici_id: string;
  soru_numarasi: number;
  soru_turu?: string;
  bolum_adi?: string;
  bolum_numarasi?: number;
  kullanici_cevabi?: string;
  dogru_cevap?: string;
  dogru_mu: boolean;
  tepki_suresi_ms: number;
  soru_baslangic_zamani?: string;
  soru_bitis_zamani?: string;
  ek_veriler?: Record<string, any>;
  created_at: string;
}

export interface SoruCevapAnalizi {
  soru_numarasi: number;
  dogru_mu: boolean;
  tepki_suresi_ms: number;
  zorluk_seviyesi?: 'kolay' | 'orta' | 'zor';
  hata_tipi?: string;
}
```

#### test-detaylari.ts
```typescript
// Dikkat Testi Detayları
export interface DikkatTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  bolum1_dogru: number;
  bolum1_yanlis: number;
  bolum1_sure_ms: number;
  bolum1_dogruluk: number;
  bolum2_dogru: number;
  bolum2_yanlis: number;
  bolum2_sure_ms: number;
  bolum2_dogruluk: number;
  bolum3_dogru: number;
  bolum3_yanlis: number;
  bolum3_sure_ms: number;
  bolum3_dogruluk: number;
  sayi_sorulari_dogru: number;
  sayi_sorulari_yanlis: number;
  harf_sorulari_dogru: number;
  harf_sorulari_yanlis: number;
  karma_sorular_dogru: number;
  karma_sorular_yanlis: number;
  ornek_test_skoru: number;
  ornek_test_denemeleri: number;
  created_at: string;
}

// Akıl-Mantık Testi Detayları
export interface AkilMantikTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  dortlu_yatay_skoru: number;
  dortlu_kare_skoru: number;
  altili_kare_skoru: number;
  l_format_skoru: number;
  dokuzlu_format_skoru: number;
  durtuselluk_skoru: number;
  hizli_yanlis_cevaplar: number;
  cok_hizli_yanlis_cevaplar: number;
  durtuselluk_uyarisi: boolean;
  ornek_denemeleri: number;
  ornek_dogru_sayisi: number;
  son_soru_numarasi: number;
  created_at: string;
}

// Hafıza Testi Detayları
export interface HafizaTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  anlik_hatirlama_skoru: number;
  geciktirilmis_hatirlama_skoru: number;
  tanima_skoru: number;
  yanlis_pozitifler: number;
  yanlis_negatifler: number;
  gorsel_hafiza_skoru: number;
  kelime_hafiza_skoru: number;
  created_at: string;
}

// Puzzle Testi Detayları
export interface PuzzleTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  uzamsal_dogruluk: number;
  oruntu_tanima_skoru: number;
  tamamlama_verimliligi: number;
  parca_tamamlama_hizi: number;
  rotasyon_dogrulugu: number;
  created_at: string;
}

// Stroop Testi Detayları
export interface StroopTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  uyumlu_dogruluk: number;
  uyumsuz_dogruluk: number;
  stroop_etkisi_ms: number;
  bilissel_esneklik_skoru: number;
  mudahale_kontrolu_skoru: number;
  adaptasyon_hizi: number;
  created_at: string;
}
```

#### bilissel-skorlar.ts
```typescript
export interface BilisselBeceriSkorlari {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  secici_dikkat_skoru: number;
  calisma_hafizasi_skoru: number;
  bilissel_esneklik_skoru: number;
  islem_hizi_skoru: number;
  gorsel_uzamsal_skoru: number;
  mantiksal_akil_skoru: number;
  genel_bilissel_endeks: number;
  bilissel_yas_karsiligi: number;
  performans_seviyesi: 'dusuk' | 'orta_alti' | 'orta' | 'orta_ustu' | 'yuksek';
  hesaplama_tarihi: string;
  guncelleme_tarihi: string;
  created_at: string;
  updated_at: string;
}

export interface BilisselSkorAnalizi {
  guclu_alanlar: string[];
  gelistirilmesi_gereken_alanlar: string[];
  yas_grubu_karsilastirmasi: {
    yas_grubu: string;
    ortalama_skor: number;
    kullanici_skor: number;
    yuzdelik_dilim: number;
  };
  oneri_listesi: string[];
}

export interface BilisselSkorlarWithAnalysis extends BilisselBeceriSkorlari {
  analiz?: BilisselSkorAnalizi;
  test_sonuclari?: TestSonuc[];
}
``` 