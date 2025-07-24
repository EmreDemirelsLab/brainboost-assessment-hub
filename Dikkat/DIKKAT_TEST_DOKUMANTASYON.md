# DIKKAT TESTİ VERİ TABANI DOKÜMANTASYONU

## 1. GENEL BAKIŞ

Dikkat testi, görsel dikkat kapasitesini ve seçici dikkat becerilerini değerlendiren nöropsikolojik bir testtir.

### Test Yapısı:
- **Örnek Test**: 5 soru (30 saniye)
- **Ana Test**: 44 soru (180 saniye / 3 dakika)
- **Toplam**: 49 soru
- **Test Tipi**: Görsel arama ve hedef bulma
- **6 Beceri Türü**: Farklı dikkat türlerini değerlendirir

### Test Kategorileri:
1. **Tek Harf**: o, t, e, s, m (Zorluk: 1)
2. **Tek Rakam**: 5, 3, 1, 4, 6, 9 (Zorluk: 1)
3. **İki Harf**: ke, at, na, ık, hi, ro (Zorluk: 2)
4. **İki Rakam**: 56, 45, 68, 74, 62, 72 (Zorluk: 2)
5. **Üç Karakter**: k16, yku, cau, mlh, ç17, sbm (Zorluk: 3)
6. **Karışık Format**: 4g4, v52, mmh, ısh (Zorluk: 4)

### Örnek Test Soruları:
1. `['o', 'k', 'o', 'm', 't', 'y']` → Hedef: `'o'`
2. `['56', '79', '27', '60', '23', '56']` → Hedef: `'56'`
3. `['ke', 'me', 'em', 'ke', 'en', 'mn']` → Hedef: `'ke'`
4. `['5', '8', '3', '9', '2', '5']` → Hedef: `'5'`
5. `['6k1', 'k61', 'k16', '61k', 'k16', '16k']` → Hedef: `'k16'`

## 2. VERİ TABANI YAPISI

### 2.1 dikkat_ham_veri Tablosu
Her soru için detaylı veri saklar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| soru_no | INTEGER | Soru numarası (1-49) |
| test_tipi | VARCHAR(20) | 'practice' veya 'main' |
| soru_elementi | JSONB | Gösterilen elementler dizisi |
| hedef_element | VARCHAR(10) | Aranan hedef element |
| verilen_cevap | VARCHAR(10) | Seçilen element (veya NULL) |
| dogru_mu | BOOLEAN | Cevap doğru mu? |
| tepki_suresi_ms | INTEGER | Cevaplama süresi |
| soru_gosterilme_zamani | TIMESTAMP | Soru gösterilme zamanı |
| tarih | TIMESTAMP | Kayıt zamanı |

### 2.2 dikkat_sonuclari Tablosu
Test sonuçlarının kapsamlı özeti.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| **Örnek Test Sonuçları** | | |
| ornek_dogru_sayisi | INTEGER | Örnek test doğru sayısı |
| ornek_toplam_soru | INTEGER | Örnek test toplam soru (5) |
| ornek_dogruluk_yuzdesi | FLOAT | Örnek test doğruluk yüzdesi |
| ornek_gecti | BOOLEAN | 3/5 doğru geçme kriteri |
| ornek_deneme_sayisi | INTEGER | Deneme sayısı |
| ornek_ortalama_tepki_suresi | FLOAT | Örnek test ortalama tepki süresi |
| **Ana Test Sonuçları** | | |
| ana_test_dogru_sayisi | INTEGER | Ana test doğru sayısı |
| ana_test_toplam_soru | INTEGER | Ana test toplam soru (44) |
| ana_test_dogruluk_yuzdesi | FLOAT | Ana test doğruluk yüzdesi |
| ana_test_ortalama_tepki_suresi | FLOAT | Ana test ortalama tepki süresi |
| ana_test_toplam_suresi | FLOAT | Ana test toplam süresi (180 sn max) |
| ana_test_tamamlandi | BOOLEAN | Ana test tamamlandı mı? |
| **Genel Metrikler** | | |
| toplam_dogru_sayisi | INTEGER | Toplam doğru cevap |
| toplam_soru_sayisi | INTEGER | Toplam soru sayısı (49) |
| genel_dogruluk_yuzdesi | FLOAT | Genel doğruluk yüzdesi |
| genel_ortalama_tepki_suresi | FLOAT | Genel ortalama tepki süresi |
| **Performans Analizi** | | |
| hizli_tepki_sayisi | INTEGER | < 1000ms tepki sayısı |
| yavas_tepki_sayisi | INTEGER | > 3000ms tepki sayısı |
| ortalama_hiz_skoru | FLOAT | İşlem hızı skoru (0-100) |
| **Dikkat Türleri Analizi** | | |
| tek_karakter_dogru | INTEGER | Tek harf/rakam doğru sayısı |
| cift_karakter_dogru | INTEGER | İki harf/rakam doğru sayısı |
| uc_karakter_dogru | INTEGER | Üç karakter doğru sayısı |
| **Hata Analizi** | | |
| yanlis_secim_sayisi | INTEGER | Yanlış seçim sayısı |
| cevapsiz_sayisi | INTEGER | Cevapsız soru sayısı |

### 2.3 dikkat_beceri_skorlari Tablosu
6 bilişsel beceri skoru (0-100 arası).

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| test_id | INTEGER | Test ID |
| kullanici_id | INTEGER | Kullanıcı ID |
| secici_dikkat_skoru | FLOAT | Seçici dikkat becerisi |
| surdurulebilir_dikkat_skoru | FLOAT | Sürdürülebilir dikkat becerisi |
| bolunmus_dikkat_skoru | FLOAT | Bölünmüş dikkat becerisi |
| gorsel_tarama_hizi_skoru | FLOAT | Görsel tarama hızı |
| tepkime_hizi_skoru | FLOAT | Tepkime hızı |
| dikkati_yonlendirme_skoru | FLOAT | Dikkati yönlendirme becerisi |
| genel_performans_skoru | FLOAT | Genel performans ortalaması |

### 2.4 dikkat_soru_kategorileri Tablosu (Referans)
Soru kategorileri bilgileri.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kategori_adi | VARCHAR(50) | Kategori adı |
| aciklama | TEXT | Kategori açıklaması |
| ornek_hedef | VARCHAR(10) | Örnek hedef element |
| zorluk_seviyesi | INTEGER | Zorluk seviyesi (1-5) |

### 2.5 dikkat_ornek_detay Tablosu (Opsiyonel)
Örnek test detayları.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| deneme_no | INTEGER | Deneme numarası |
| ornek_dogru_sayisi | INTEGER | Örnek doğru sayısı |
| ornek_sure_saniye | FLOAT | Örnek test süresi |
| ornek_gecti | BOOLEAN | Geçti mi? |
| tekrar_gerekli | BOOLEAN | Tekrar gerekli mi? |

## 3. HESAPLAMA FORMÜLLERİ

### 3.1 Temel Metrikler

```
Örnek Test Doğruluk = (Örnek_Doğru_Sayısı / 5) × 100
Ana Test Doğruluk = (Ana_Test_Doğru_Sayısı / 44) × 100
Genel Doğruluk = (Toplam_Doğru / 49) × 100
Ortalama Tepki Süresi = Σ(Tepki_Süreleri) / Toplam_Soru_Sayısı
```

### 3.2 Hız Skoru Hesaplama

```
Hız Skoru = max(0, min(100, (5000 - Ortalama_Tepki_Süresi) / 50))
# 5 saniye maksimum, daha hızlı = daha yüksek puan
# 0-100 arası normalize edilir
```

### 3.3 Beceri Skorları Hesaplama

1. **Seçici Dikkat**: Hedef elementleri doğru seçme yetisi
   ```
   Seçici_Dikkat_Skoru = Genel_Doğruluk_Yüzdesi
   ```

2. **Sürdürülebilir Dikkat**: Ana testteki performans istikrarı
   ```
   Sürdürülebilir_Dikkat_Skoru = Ana_Test_Doğruluk_Yüzdesi
   ```

3. **Bölünmüş Dikkat**: Farklı element türlerindeki performans
   ```
   Bölünmüş_Dikkat_Skoru = ((Tek_Karakter_Doğru + İki_Karakter_Doğru + Üç_Karakter_Doğru) / Toplam_Soru) × 100
   ```

4. **Görsel Tarama Hızı**: Hız skoruna dayalı
   ```
   Görsel_Tarama_Hızı_Skoru = Ortalama_Hız_Skoru
   ```

5. **Tepkime Hızı**: Hızlı tepki oranı
   ```
   Tepkime_Hızı_Skoru = (Hızlı_Tepki_Sayısı / Toplam_Soru) × 100
   ```

6. **Dikkati Yönlendirme**: Hata oranının tersi
   ```
   Dikkati_Yönlendirme_Skoru = max(0, 100 - ((Yanlış_Seçim + Cevapsız) / Toplam_Soru × 100))
   ```

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
POST /api/dikkat/test/basla
Body: {
    "kullanici_id": 123
}
Response: {
    "success": true,
    "test_id": 456,
    "message": "Dikkat testi başlatıldı",
    "ornek_soru_sayisi": 5,
    "ana_test_soru_sayisi": 44,
    "toplam_soru": 49,
    "ornek_test_suresi_saniye": 30,
    "ana_test_suresi_saniye": 180
}
```

#### Soru Cevabı Kaydetme
```
POST /api/dikkat/soru/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "soru_no": 1,
    "test_tipi": "practice",
    "soru_elementi": ["o", "k", "o", "m", "t", "y"],
    "hedef_element": "o",
    "verilen_cevap": "o",
    "tepki_suresi_ms": 1250
}
Response: {
    "success": true,
    "message": "Soru cevabı kaydedildi",
    "dogru_mu": true,
    "kategori": "Tek Harf",
    "zorluk_seviyesi": 1
}
```

#### Örnek Test Sonucu Kaydetme
```
POST /api/dikkat/ornek/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "ornek_dogru_sayisi": 4,
    "ornek_sure_saniye": 25.5,
    "deneme_sayisi": 1
}
Response: {
    "success": true,
    "message": "Örnek test sonucu kaydedildi",
    "ornek_gecti": true,
    "ornek_dogruluk_yuzdesi": 80.0,
    "tekrar_gerekli": false
}
```

#### Test Tamamlama
```
POST /api/dikkat/test/tamamla
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "ana_test_suresi": 165.3
}
Response: {
    "success": true,
    "message": "Test tamamlandı ve sonuçlar hesaplandı",
    "sonuclar": { ... }
}
```

#### Test Sonucu Görüntüleme
```
GET /api/dikkat/sonuc/456
Response: {
    "success": true,
    "sonuc": {
        "genel_dogruluk_yuzdesi": 87.8,
        "toplam_dogru_sayisi": 43,
        "ana_test_toplam_suresi": 165.3,
        "genel_ortalama_tepki_suresi": 1850.2,
        "ortalama_hiz_skoru": 63.0,
        "ornek_gecti": true,
        "ana_test_tamamlandi": true,
        "secici_dikkat_skoru": 87.8,
        "surdurulebilir_dikkat_skoru": 88.6,
        "tepkime_hizi_skoru": 75.5,
        "genel_performans_skoru": 78.9,
        ...
    }
}
```

#### Kullanıcının Tüm Testleri
```
GET /api/dikkat/kullanici/123/testler
Response: {
    "success": true,
    "testler": [
        {
            "test_id": 456,
            "tarih": "2024-01-15T10:30:00Z",
            "genel_dogruluk_yuzdesi": 87.8,
            "toplam_dogru_sayisi": 43,
            "ana_test_toplam_suresi": 165.3,
            "ortalama_hiz_skoru": 63.0,
            "ornek_gecti": true,
            "genel_performans_skoru": 78.9
        }
    ]
}
```

#### Soru Listesi
```
GET /api/dikkat/sorular
Response: {
    "success": true,
    "sorular": {
        "practiceQuestions": [
            {
                "question": ["o", "k", "o", "m", "t", "y"],
                "target": "o"
            },
            ...
        ],
        "mainQuestions": [
            {
                "question": ["5", "6", "2", "1", "5", "8"],
                "target": "5"
            },
            ...
        ]
    }
}
```

#### Soru Kategorileri
```
GET /api/dikkat/kategoriler
Response: {
    "success": true,
    "kategoriler": [
        {
            "id": 1,
            "kategori_adi": "Tek Harf",
            "aciklama": "Tek harf arama (a, b, c, vs.)",
            "ornek_hedef": "o",
            "zorluk_seviyesi": 1
        },
        ...
    ]
}
```

#### Ham Veri Analizi
```
GET /api/dikkat/analiz/456
Response: {
    "success": true,
    "analiz": [
        {
            "test_tipi": "practice",
            "hedef_element": "o",
            "toplam_soru": 1,
            "dogru_sayisi": 1,
            "cevapsiz": 0,
            "ort_dogru_sure": 1250.0,
            "ort_tepki_sure": 1250.0,
            "min_tepki_sure": 1250,
            "max_tepki_sure": 1250
        },
        ...
    ]
}
```

#### Örnek Test Detayları
```
GET /api/dikkat/ornek-detay/456
Response: {
    "success": true,
    "ornek_detaylar": [
        {
            "id": 1,
            "deneme_no": 1,
            "ornek_dogru_sayisi": 4,
            "ornek_sure_saniye": 25.5,
            "ornek_gecti": true,
            "tekrar_gerekli": false,
            "tarih": "2024-01-15T10:30:00Z"
        }
    ]
}
```

## 5. FRONTEND ENTEGRASYONU

### 5.1 Frontend'in Göndermesi Gereken Veriler

**Her soru için:**
- Test ID ve kullanıcı ID
- Soru numarası (1-49)
- Test tipi ('practice' veya 'main')
- Gösterilen elementler dizisi
- Hedef element
- Verilen cevap (veya NULL)
- Tepki süresi (ms)

**Örnek test için:**
- Örnek doğru sayısı
- Örnek test süresi
- Deneme sayısı

**Test sonunda:**
- Ana test toplam süresi

### 5.2 Örnek Veri Akışı

```javascript
// 1. Test başlat
const response = await fetch('/api/dikkat/test/basla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullanici_id: 123 })
});
const { test_id } = await response.json();

// 2. Her soru için kaydet
await fetch('/api/dikkat/soru/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        soru_no: 1,
        test_tipi: 'practice',
        soru_elementi: ['o', 'k', 'o', 'm', 't', 'y'],
        hedef_element: 'o',
        verilen_cevap: 'o', // Kullanıcının seçimi
        tepki_suresi_ms: 1250
    })
});

// 3. Örnek test sonucu kaydet
await fetch('/api/dikkat/ornek/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        ornek_dogru_sayisi: 4,
        ornek_sure_saniye: 25.5,
        deneme_sayisi: 1
    })
});

// 4. Test tamamla
const sonuclar = await fetch('/api/dikkat/test/tamamla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        test_id, 
        kullanici_id: 123,
        ana_test_suresi: 165.3 
    })
});
```

## 6. ÖNEMLİ NOTLAR

1. **Soru Sırası**: 49 soru belirli sırada sunulmalıdır (5 örnek + 44 ana test)
2. **Test Tipleri**: 'practice' (örnek) ve 'main' (ana test)
3. **Süre Limitleri**: Örnek test 30 saniye, ana test 180 saniye
4. **Geçme Kriteri**: Örnek testte 3/5 doğru gerekli
5. **Element Kategorileri**: 6 farklı kategori, 4 zorluk seviyesi
6. **Beceri Skorları**: 0-100 arası normalize edilir
7. **Hız Analizi**: < 1000ms hızlı, > 3000ms yavaş tepki

## 7. VERİTABANI KURULUMU

```sql
-- dikkat_database_schema.sql dosyasını çalıştır
psql -U postgres -d bilisseltest -f dikkat_database_schema.sql
```

## 8. SUNUCU ÇALIŞTIRMA

```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu  
npm start
```

Sunucu `http://localhost:3006` adresinde çalışacaktır.

## 9. ÖRNEK VERİ AKIŞI

```
1. Kullanıcı testi başlatır → test_id alır
2. Örnek test: 5 soru (30 saniye) → sonuç kaydedilir
3. Geçme kontrolü: 3/5 doğru gerekli
4. Başarısızsa tekrar, başarılıysa ana teste geç
5. Ana test: 44 soru (180 saniye)
6. Test tamamlanır → hesaplamalar yapılır
7. 6 bilişsel beceri skoru üretilir
8. Sonuçlar görüntülenir
```

## 10. BECERİ TÜRLERİ VE DEĞERLENDİRME

### Seçici Dikkat
- **Tanım**: Hedef uyaranları diğerlerinden ayırt etme
- **Hesaplama**: Genel doğruluk yüzdesi
- **Değerlendirme**: Yüksek skor = İyi seçici dikkat

### Sürdürülebilir Dikkat  
- **Tanım**: Uzun süre dikkat sürdürme
- **Hesaplama**: Ana test doğruluk yüzdesi
- **Değerlendirme**: Yüksek skor = İyi sürdürülebilir dikkat

### Bölünmüş Dikkat
- **Tanım**: Farklı uyaran türlerini işleme
- **Hesaplama**: Kategori bazında performans
- **Değerlendirme**: Yüksek skor = İyi bölünmüş dikkat

### Görsel Tarama Hızı
- **Tanım**: Görsel alanı hızlı tarama
- **Hesaplama**: Tepki süresi tabanlı hız skoru
- **Değerlendirme**: Yüksek skor = Hızlı tarama

### Tepkime Hızı
- **Tanım**: Hızlı motor tepki verme
- **Hesaplama**: < 1000ms tepki oranı
- **Değerlendirme**: Yüksek skor = Hızlı tepkime

### Dikkati Yönlendirme
- **Tanım**: Dikkati kontrol etme ve yönlendirme
- **Hesaplama**: Hata oranının tersi
- **Değerlendirme**: Yüksek skor = İyi dikkat kontrolü 