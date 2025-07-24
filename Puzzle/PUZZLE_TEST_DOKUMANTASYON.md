# PUZZLE (GÖRSEL İŞLEME) TESTİ VERİ TABANI DOKÜMANTASYONU

## 1. GENEL BAKIŞ

Puzzle testi, görsel işleme ve uzamsal yetenekleri değerlendiren nöropsikolojik bir testtir. Test 9 farklı puzzle tipinden oluşur:

### Puzzle Tipleri ve Zorluk Seviyeleri:
1. **4 Parçalı Puzzleler (5 adet):**
   - Tek renk kare
   - Tek renk yuvarlak
   - Tek renk üçgen
   - Çift renk bir
   - Çift renk iki

2. **6 Parçalı Puzzle (1 adet):**
   - Çift renk

3. **9 Parçalı Puzzleler (2 adet):**
   - Tek renk
   - Çok renk

4. **16 Parçalı Puzzle (1 adet):**
   - Tek renk

**Toplam:** 60 parça, her parça için maksimum 15 saniye süre

## 2. VERİ TABANI YAPISI

### 2.1 puzzle_ham_veri Tablosu
Her parça tepkisi için detaylı veri saklar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| puzzle_tipi | VARCHAR(50) | Puzzle tipi (ör: 'dort_parcali_tek_renk_kare') |
| puzzle_no | INTEGER | Aynı tipte birden fazla puzzle varsa sıra numarası |
| parca_no | INTEGER | Parça sıra numarası |
| dogru_mu | BOOLEAN | Parça doğru yerleştirildi mi? |
| tepki_suresi_ms | INTEGER | Parça için harcanan süre (ms) |
| parca_gosterilme_suresi_ms | INTEGER | Maksimum 15000ms |
| beklenen_pozisyon | VARCHAR(20) | Doğru pozisyon |
| verilen_pozisyon | VARCHAR(20) | Kullanıcının verdiği pozisyon |
| puzzle_tamamlandi | BOOLEAN | Bu parça ile puzzle tamamlandı mı? |
| tarih | TIMESTAMP | Kayıt zamanı |

### 2.2 puzzle_sonuclari Tablosu
Test sonuçlarının kategorik özeti.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| **4 Parçalı Puzzleler** | | |
| dort_parcali_dogru_sayisi | INTEGER | Doğru yerleştirilen parça sayısı |
| dort_parcali_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| dort_parcali_ortalama_sure | FLOAT | Ortalama tepki süresi |
| dort_parcali_toplam_sure | FLOAT | Toplam süre |
| **6 Parçalı Puzzle** | | |
| alti_parcali_dogru_sayisi | INTEGER | Doğru yerleştirilen parça sayısı |
| alti_parcali_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| alti_parcali_sure | FLOAT | Toplam süre |
| **9 Parçalı Puzzleler** | | |
| dokuz_parcali_dogru_sayisi | INTEGER | Doğru yerleştirilen parça sayısı |
| dokuz_parcali_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| dokuz_parcali_ortalama_sure | FLOAT | Ortalama tepki süresi |
| dokuz_parcali_toplam_sure | FLOAT | Toplam süre |
| **16 Parçalı Puzzle** | | |
| onalti_parcali_dogru_sayisi | INTEGER | Doğru yerleştirilen parça sayısı |
| onalti_parcali_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| onalti_parcali_sure | FLOAT | Toplam süre |
| **Genel Metrikler** | | |
| toplam_dogru_sayisi | INTEGER | Tüm doğru parçalar (60 üzerinden) |
| genel_dogruluk_yuzdesi | FLOAT | Genel doğruluk yüzdesi |
| ortalama_tepki_suresi | FLOAT | Doğru cevaplar için ortalama süre |
| toplam_test_suresi | FLOAT | Tüm test süresi |
| bilgi_isleme_hizi_skoru | FLOAT | Bilgi işleme hızı skoru |

### 2.3 puzzle_beceri_skorlari Tablosu
6 bilişsel beceri skoru (0-100 arası).

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| test_id | INTEGER | Test ID |
| kullanici_id | INTEGER | Kullanıcı ID |
| secici_dikkat_skoru | FLOAT | Seçici dikkat skoru |
| kisa_sureli_gorsel_hafiza_skoru | FLOAT | Kısa süreli görsel hafıza skoru |
| surdurulebilir_dikkat_skoru | FLOAT | Sürdürülebilir dikkat skoru |
| gorsel_ayrim_manipulasyon_skoru | FLOAT | Görsel ayrım/manipülasyon skoru |
| tepkime_hizi_skoru | FLOAT | Tepkime hızı skoru |
| islem_hizi_skoru | FLOAT | İşlem hızı skoru |
| genel_performans_skoru | FLOAT | Genel performans ortalaması |

## 3. HESAPLAMA FORMÜLLERİ

### 3.1 Doğruluk Hesaplamaları

```
4 Parçalı: (Doğru Parça / 20) × 100    # 5 puzzle × 4 parça
6 Parçalı: (Doğru Parça / 6) × 100     # 1 puzzle × 6 parça  
9 Parçalı: (Doğru Parça / 18) × 100    # 2 puzzle × 9 parça
16 Parçalı: (Doğru Parça / 16) × 100   # 1 puzzle × 16 parça
GENEL: (Toplam Doğru / 60) × 100
```

### 3.2 Bilgi İşleme Hızı

```
Bilgi İşleme Hızı = 100 - ((Ortalama Süre / 15000) × 100)
# 15000ms = maksimum süre (15 saniye)
```

### 3.3 Beceri Skorları Hesaplama

1. **Seçici Dikkat**: Karmaşık puzzlelerdeki performans
   ```
   (9 Parçalı Doğruluk + 16 Parçalı Doğruluk) / 2
   ```

2. **Kısa Süreli Görsel Hafıza**: Parça pozisyonlarını hatırlama
   ```
   Genel Doğruluk Yüzdesi
   ```

3. **Sürdürülebilir Dikkat**: Test boyunca performans tutarlılığı
   ```
   100 - |4 Parçalı Doğruluk - 16 Parçalı Doğruluk|
   ```

4. **Görsel Ayrım/Manipülasyon**: Farklı şekil/renk kombinasyonları
   ```
   (6 Parçalı Doğruluk + 9 Parçalı Doğruluk) / 2
   ```

5. **Tepkime Hızı**: Ortalama tepki süresine göre
   ```
   (15000 - Ortalama Tepki Süresi) / 140
   # 15000ms = 0 puan, 1000ms = 100 puan
   ```

6. **İşlem Hızı**: Bilgi işleme hızı skoruna eşit

## 4. NODE.JS API KULLANIMI

### 4.1 Kurulum

```bash
# Bağımlılıkları yükle
npm install express pg cors

# Geliştirme için
npm install --save-dev nodemon
```

### 4.2 API Endpoint'leri

#### Test Başlatma
```
POST /api/puzzle/test/basla
Body: {
    "kullanici_id": 123
}
Response: {
    "success": true,
    "test_id": 456,
    "message": "Puzzle testi başlatıldı",
    "puzzle_tipleri": ["dort_parcali_tek_renk_kare", ...]
}
```

#### Parça Tepkisi Kaydetme
```
POST /api/puzzle/parca/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "puzzle_tipi": "dort_parcali_tek_renk_kare",
    "puzzle_no": 1,
    "parca_no": 1,
    "dogru_mu": true,
    "tepki_suresi_ms": 3500,
    "beklenen_pozisyon": "A1",
    "verilen_pozisyon": "A1",
    "puzzle_tamamlandi": false
}
```

#### Test Tamamlama
```
POST /api/puzzle/test/tamamla
Body: {
    "test_id": 456,
    "kullanici_id": 123
}
Response: {
    "success": true,
    "message": "Test tamamlandı ve sonuçlar hesaplandı",
    "sonuclar": { ... }
}
```

#### Sonuçları Görüntüleme
```
GET /api/puzzle/sonuc/456
Response: {
    "success": true,
    "sonuc": {
        "genel_dogruluk_yuzdesi": 85.5,
        "bilgi_isleme_hizi_skoru": 78.2,
        "secici_dikkat_skoru": 82.1,
        ...
    }
}
```

#### Kullanıcının Tüm Testleri
```
GET /api/puzzle/kullanici/123/testler
Response: {
    "success": true,
    "testler": [
        {
            "test_id": 456,
            "tarih": "2024-01-15T10:30:00Z",
            "genel_dogruluk_yuzdesi": 85.5,
            "toplam_test_suresi": 450000,
            "genel_performans_skoru": 78.8
        }
    ]
}
```

#### Puzzle Tiplerini Getirme
```
GET /api/puzzle/tipler
Response: {
    "success": true,
    "puzzle_tipleri": {
        "dort_parcali_tek_renk_kare": {
            "parca_sayisi": 4,
            "kategori": "4_parcali"
        },
        ...
    }
}
```

## 5. FRONTEND ENTEGRASYONU

### 5.1 Frontend'in Göndermesi Gereken Veriler

**Her parça için:**
- Puzzle tipi
- Puzzle numarası  
- Parça numarası
- Doğru mu (boolean)
- Tepki süresi (ms)
- Beklenen pozisyon
- Verilen pozisyon
- Puzzle tamamlandı mı

### 5.2 Örnek Veri Akışı

```javascript
// 1. Test başlat
const response = await fetch('/api/puzzle/test/basla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullanici_id: 123 })
});
const { test_id } = await response.json();

// 2. Her parça için tepki kaydet
await fetch('/api/puzzle/parca/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        puzzle_tipi: 'dort_parcali_tek_renk_kare',
        puzzle_no: 1,
        parca_no: 1,
        dogru_mu: true,
        tepki_suresi_ms: 3500,
        beklenen_pozisyon: 'A1',
        verilen_pozisyon: 'A1',
        puzzle_tamamlandi: false
    })
});

// 3. Test tamamla
const sonuclar = await fetch('/api/puzzle/test/tamamla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_id, kullanici_id: 123 })
});
```

## 6. ÖNEMLİ NOTLAR

1. **Süre Sınırı**: Her parça için maksimum 15 saniye
2. **Doğruluk Hesabı**: Sadece doğru yerleştirilen parçalar hesaplanır
3. **Kategorik Değerlendirme**: Farklı zorluk seviyelerine göre ayrı değerlendirme
4. **Beceri Skorları**: 6 farklı bilişsel beceri 0-100 arası normalize edilir
5. **Performans Takibi**: Test boyunca tutarlılık ve gelişim izlenir

## 7. VERİTABANI KURULUMU

```sql
-- puzzle_database_schema.sql dosyasını çalıştır
psql -U postgres -d bilisseltest -f puzzle_database_schema.sql
```

## 8. SUNUCU ÇALIŞTIRMA

```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu  
npm start
```

Sunucu `http://localhost:3002` adresinde çalışacaktır. 