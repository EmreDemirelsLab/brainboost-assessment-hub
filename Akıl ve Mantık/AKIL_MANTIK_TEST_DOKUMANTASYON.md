# AKIL VE MANTIK TESTİ VERİ TABANI DOKÜMANTASYONU

## 1. GENEL BAKIŞ

Akıl ve Mantık testi, görsel örüntü tanıma ve mantıksal akıl yürütme becerilerini değerlendiren nöropsikolojik bir testtir. Test 5 bölümden oluşur:

### Test Bölümleri:
1. **Dörtlü Yatay Format** - 8 soru
   - 4 elemanlı yatay dizilim örüntüleri
   - Zorluk seviyesi: 2

2. **Dörtlü Kare Format** - 6 soru
   - 4 elemanlı kare dizilim örüntüleri
   - Zorluk seviyesi: 3

3. **Altılı Kare Format** - 3 soru
   - 6 elemanlı kare dizilim örüntüleri
   - Zorluk seviyesi: 4

4. **L Format** - 3 soru
   - L şeklinde dizilim örüntüleri
   - Zorluk seviyesi: 4

5. **Dokuzlu Format** - 3 soru
   - 9 elemanlı karmaşık örüntüler
   - Zorluk seviyesi: 5

**Toplam:** 23 soru, 5 dakika süre limiti, A-B-C-D-E seçenekli

## 2. VERİ TABANI YAPISI

### 2.1 akil_mantik_ham_veri Tablosu
Her soru için detaylı veri saklar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| soru_no | INTEGER | Soru numarası (1-23) |
| kategori | VARCHAR(100) | Kategori adı |
| bolum_no | INTEGER | Bölüm numarası (1-5) |
| zorluk_seviyesi | INTEGER | Zorluk seviyesi (1-5) |
| gosterilen_soru_resmi | TEXT | Soru resmi yolu |
| secenekler | JSONB | 5 seçenek resim yolları |
| dogru_cevap | INTEGER | Doğru cevap (0-4: A-E) |
| verilen_cevap | INTEGER | Verilen cevap (0-4 veya NULL) |
| dogru_mu | BOOLEAN | Cevap doğru mu? |
| tepki_suresi_ms | INTEGER | Cevaplama süresi |
| soru_gosterilme_suresi_ms | INTEGER | Maksimum 30 saniye |
| tarih | TIMESTAMP | Kayıt zamanı |

### 2.2 akil_mantik_sonuclari Tablosu
Test sonuçlarının bölüm bazında özeti.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| **Bölüm 1 - Dörtlü Yatay** | | |
| bolum1_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| bolum1_toplam_soru | INTEGER | Toplam soru sayısı (8) |
| bolum1_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| bolum1_ortalama_sure | FLOAT | Ortalama tepki süresi |
| bolum1_toplam_sure | FLOAT | Bölüm toplam süresi |
| **Bölüm 2 - Dörtlü Kare** | | |
| bolum2_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| bolum2_toplam_soru | INTEGER | Toplam soru sayısı (6) |
| bolum2_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| bolum2_ortalama_sure | FLOAT | Ortalama tepki süresi |
| bolum2_toplam_sure | FLOAT | Bölüm toplam süresi |
| **Bölüm 3 - Altılı Kare** | | |
| bolum3_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| bolum3_toplam_soru | INTEGER | Toplam soru sayısı (3) |
| bolum3_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| bolum3_ortalama_sure | FLOAT | Ortalama tepki süresi |
| bolum3_toplam_sure | FLOAT | Bölüm toplam süresi |
| **Bölüm 4 - L Format** | | |
| bolum4_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| bolum4_toplam_soru | INTEGER | Toplam soru sayısı (3) |
| bolum4_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| bolum4_ortalama_sure | FLOAT | Ortalama tepki süresi |
| bolum4_toplam_sure | FLOAT | Bölüm toplam süresi |
| **Bölüm 5 - Dokuzlu Format** | | |
| bolum5_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| bolum5_toplam_soru | INTEGER | Toplam soru sayısı (3) |
| bolum5_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| bolum5_ortalama_sure | FLOAT | Ortalama tepki süresi |
| bolum5_toplam_sure | FLOAT | Bölüm toplam süresi |
| **Genel Metrikler** | | |
| toplam_dogru_sayisi | INTEGER | Toplam doğru cevap |
| toplam_soru_sayisi | INTEGER | Toplam soru sayısı (23) |
| genel_dogruluk_yuzdesi | FLOAT | Genel doğruluk yüzdesi |
| ortalama_tepki_suresi | FLOAT | Ortalama tepki süresi |
| toplam_test_suresi | FLOAT | Toplam test süresi |
| **Zorluk Seviyesi Performansı** | | |
| kolay_sorular_dogru | INTEGER | Kolay sorular doğru (1-2) |
| orta_sorular_dogru | INTEGER | Orta sorular doğru (3) |
| zor_sorular_dogru | INTEGER | Zor sorular doğru (4-5) |
| **Tamamlanamayan Soru** | | |
| tamamlanamayan_soru_no | INTEGER | Tamamlanamayan soru no |
| tamamlanamayan_kategori | VARCHAR(100) | Tamamlanamayan kategori |

### 2.3 akil_mantik_beceri_skorlari Tablosu
6 bilişsel beceri skoru (0-100 arası).

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| test_id | INTEGER | Test ID |
| kullanici_id | INTEGER | Kullanıcı ID |
| gorsel_algi_ayirim_skoru | FLOAT | Görsel algı ve ayırım becerisi |
| uzamsal_iliskiler_skoru | FLOAT | Uzamsal ilişkiler becerisi |
| mantiksal_akil_yurutme_skoru | FLOAT | Mantıksal akıl yürütme becerisi |
| problem_cozme_skoru | FLOAT | Problem çözme becerisi |
| oruntu_tanima_skoru | FLOAT | Örüntü tanıma becerisi |
| sekil_zemin_ayirimi_skoru | FLOAT | Şekil-zemin ayırımı becerisi |
| genel_performans_skoru | FLOAT | Genel performans ortalaması |

### 2.4 akil_mantik_kategoriler Tablosu (Referans)
Kategori bilgileri.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kategori_adi | VARCHAR(100) | Kategori adı |
| bolum_no | INTEGER | Bölüm numarası |
| aciklama | TEXT | Kategori açıklaması |
| soru_sayisi | INTEGER | Soru sayısı |
| zorluk_seviyesi | INTEGER | Zorluk seviyesi |
| max_sure_saniye | INTEGER | Maksimum süre |

## 3. HESAPLAMA FORMÜLLERİ

### 3.1 Temel Metrikler

```
Bölüm Doğruluk Yüzdesi = (Bölüm_Doğru_Sayısı / Bölüm_Toplam_Soru) × 100
Ortalama Tepki Süresi = Σ(Doğru_Cevap_Süreleri) / Doğru_Cevap_Sayısı
Genel Doğruluk = (Toplam_Doğru / 23) × 100
```

### 3.2 Zorluk Seviyesi Performansı

```
Kolay Sorular (Zorluk 1-2): 8 soru (Bölüm 1)
Orta Sorular (Zorluk 3): 6 soru (Bölüm 2)
Zor Sorular (Zorluk 4-5): 9 soru (Bölüm 3,4,5)
```

### 3.3 Beceri Skorları Hesaplama

1. **Görsel Algı ve Ayırım Becerisi**: Dörtlü formatlar performansı
   ```
   (Bölüm1_Doğruluk + Bölüm2_Doğruluk) / 2
   ```

2. **Uzamsal İlişkiler Becerisi**: Kare ve L formatlar
   ```
   (Bölüm2_Doğruluk + Bölüm4_Doğruluk) / 2
   ```

3. **Mantıksal Akıl Yürütme Becerisi**: Zor sorular performansı
   ```
   (Zor_Sorular_Doğru / 9) × 100
   ```

4. **Problem Çözme Becerisi**: Doğruluk + hız kombinasyonu
   ```
   (Genel_Doğruluk × 0.7) + (Hız_Skoru × 0.3)
   Hız_Skoru = (30000 - Ortalama_Tepki_Süresi) / 200
   ```

5. **Örüntü Tanıma Becerisi**: Tüm bölümlerin ortalaması
   ```
   (Bölüm1_Doğruluk + Bölüm2_Doğruluk + Bölüm3_Doğruluk + 
    Bölüm4_Doğruluk + Bölüm5_Doğruluk) / 5
   ```

6. **Şekil-Zemin Ayırımı Becerisi**: Karmaşık formatlar
   ```
   (Bölüm3_Doğruluk + Bölüm5_Doğruluk) / 2
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
POST /api/akil-mantik/test/basla
Body: {
    "kullanici_id": 123
}
Response: {
    "success": true,
    "test_id": 456,
    "message": "Akıl Mantık testi başlatıldı",
    "kategoriler": { ... },
    "toplam_soru": 23,
    "max_sure_dakika": 5
}
```

#### Soru Cevabı Kaydetme
```
POST /api/akil-mantik/soru/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "soru_no": 1,
    "kategori": "Dörtlü Yatay Format",
    "bolum_no": 1,
    "zorluk_seviyesi": 2,
    "gosterilen_soru_resmi": "path/to/question.png",
    "secenekler": ["A.png", "B.png", "C.png", "D.png", "E.png"],
    "dogru_cevap": 1,
    "verilen_cevap": 1,
    "tepki_suresi_ms": 3500,
    "soru_gosterilme_suresi_ms": 30000
}
Response: {
    "success": true,
    "message": "Soru cevabı kaydedildi",
    "dogru_mu": true
}
```

#### Test Tamamlama
```
POST /api/akil-mantik/test/tamamla
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "toplam_test_suresi": 280.5
}
Response: {
    "success": true,
    "message": "Test tamamlandı ve sonuçlar hesaplandı",
    "sonuclar": { ... }
}
```

#### Test Sonucu Görüntüleme
```
GET /api/akil-mantik/sonuc/456
Response: {
    "success": true,
    "sonuc": {
        "genel_dogruluk_yuzdesi": 78.26,
        "toplam_dogru_sayisi": 18,
        "ortalama_tepki_suresi": 4200.5,
        "gorsel_algi_ayirim_skoru": 85.5,
        "mantiksal_akil_yurutme_skoru": 66.7,
        "genel_performans_skoru": 76.2,
        ...
    }
}
```

#### Kullanıcının Tüm Testleri
```
GET /api/akil-mantik/kullanici/123/testler
Response: {
    "success": true,
    "testler": [
        {
            "test_id": 456,
            "tarih": "2024-01-15T10:30:00Z",
            "genel_dogruluk_yuzdesi": 78.26,
            "toplam_dogru_sayisi": 18,
            "genel_performans_skoru": 76.2
        }
    ]
}
```

#### Kategorileri Getirme
```
GET /api/akil-mantik/kategoriler
Response: {
    "success": true,
    "kategoriler": {
        "1": {
            "ad": "Dörtlü Yatay Format",
            "aciklama": "4 elemanlı yatay dizilim örüntüleri",
            "soru_sayisi": 8,
            "zorluk_seviyesi": 2
        },
        ...
    }
}
```

#### Soru Listesi
```
GET /api/akil-mantik/sorular
Response: {
    "success": true,
    "sorular": [
        {
            "soru_no": 1,
            "folder": "ÖRÜNTÜLER /2-DÖRTLÜ YATAY/1",
            "dogru_cevap": 1,
            "bolum_no": 1,
            "kategori": "Dörtlü Yatay Format",
            "zorluk": 2
        },
        ...
    ]
}
```

#### Ham Veri Analizi
```
GET /api/akil-mantik/analiz/456
Response: {
    "success": true,
    "analiz": [
        {
            "bolum_no": 1,
            "kategori": "Dörtlü Yatay Format",
            "toplam_soru": 8,
            "dogru_sayisi": 7,
            "cevapsiz": 0,
            "ort_dogru_sure": 3200.5,
            "ort_tepki_sure": 3450.2,
            "ort_zorluk": 2.0
        },
        ...
    ]
}
```

## 5. FRONTEND ENTEGRASYONU

### 5.1 Frontend'in Göndermesi Gereken Veriler

**Her soru için:**
- Test ID ve kullanıcı ID
- Soru numarası (1-23)
- Kategori ve bölüm bilgisi
- Zorluk seviyesi
- Gösterilen soru resmi yolu
- 5 seçenek resim yolları (A-E)
- Doğru cevap indeksi
- Verilen cevap indeksi (veya NULL)
- Tepki süresi (ms)

**Test sonunda:**
- Toplam test süresi

### 5.2 Örnek Veri Akışı

```javascript
// 1. Test başlat
const response = await fetch('/api/akil-mantik/test/basla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullanici_id: 123 })
});
const { test_id } = await response.json();

// 2. Her soru için kaydet
await fetch('/api/akil-mantik/soru/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        soru_no: 1,
        kategori: 'Dörtlü Yatay Format',
        bolum_no: 1,
        zorluk_seviyesi: 2,
        gosterilen_soru_resmi: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/1/soru.png',
        secenekler: ['1.png', '2.png', '3.png', '4.png', '5.png'],
        dogru_cevap: 1, // B seçeneği
        verilen_cevap: 1, // Kullanıcı B'yi seçti
        tepki_suresi_ms: 3500,
        soru_gosterilme_suresi_ms: 30000
    })
});

// 3. Test tamamla
const sonuclar = await fetch('/api/akil-mantik/test/tamamla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        test_id, 
        kullanici_id: 123,
        toplam_test_suresi: 280.5 
    })
});
```

## 6. ÖNEMLİ NOTLAR

1. **Soru Sırası**: 23 soru belirli sırada sunulmalıdır
2. **Seçenek İndeksleri**: A=0, B=1, C=2, D=3, E=4
3. **Süre Limiti**: Soru başına maksimum 30 saniye
4. **Bölüm Yapısı**: 5 bölüm, artan zorluk seviyesi
5. **Beceri Skorları**: 0-100 arası normalize edilir
6. **Cevapsız Sorular**: NULL değeri ile kaydedilir

## 7. VERİTABANI KURULUMU

```sql
-- akil_mantik_database_schema.sql dosyasını çalıştır
psql -U postgres -d bilisseltest -f akil_mantik_database_schema.sql
```

## 8. SUNUCU ÇALIŞTIRMA

```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu  
npm start
```

Sunucu `http://localhost:3004` adresinde çalışacaktır.

## 9. ÖRNEK VERİ AKIŞI

```
1. Kullanıcı testi başlatır → test_id alır
2. Bölüm 1: 8 soru (Dörtlü Yatay) → her soru kaydedilir
3. Bölüm 2: 6 soru (Dörtlü Kare) → her soru kaydedilir
4. Bölüm 3: 3 soru (Altılı Kare) → her soru kaydedilir
5. Bölüm 4: 3 soru (L Format) → her soru kaydedilir
6. Bölüm 5: 3 soru (Dokuzlu Format) → her soru kaydedilir
7. Test tamamlanır → hesaplamalar yapılır
8. 6 bilişsel beceri skoru üretilir
9. Sonuçlar görüntülenir
```

## 10. SORU KATEGORİLERİ VE DOĞRU CEVAPLAR

### Bölüm 1 - Dörtlü Yatay Format (8 soru)
- Soru 1: Doğru cevap B (indeks 1)
- Soru 2: Doğru cevap E (indeks 4)
- Soru 3: Doğru cevap D (indeks 3)
- Soru 4: Doğru cevap E (indeks 4)
- Soru 5: Doğru cevap D (indeks 3)
- Soru 6: Doğru cevap B (indeks 1)
- Soru 7: Doğru cevap C (indeks 2)
- Soru 8: Doğru cevap B (indeks 1)

### Bölüm 2 - Dörtlü Kare Format (6 soru)
- Soru 9: Doğru cevap D (indeks 3)
- Soru 10: Doğru cevap C (indeks 2)
- Soru 11: Doğru cevap D (indeks 3)
- Soru 12: Doğru cevap B (indeks 1)
- Soru 13: Doğru cevap C (indeks 2)
- Soru 14: Doğru cevap D (indeks 3)

### Bölüm 3 - Altılı Kare Format (3 soru)
- Soru 15: Doğru cevap F (indeks 5) - 6 seçenekli
- Soru 16: Doğru cevap A (indeks 0)
- Soru 17: Doğru cevap C (indeks 2)

### Bölüm 4 - L Format (3 soru)
- Soru 18: Doğru cevap E (indeks 4)
- Soru 19: Doğru cevap C (indeks 2)
- Soru 20: Doğru cevap C (indeks 2)

### Bölüm 5 - Dokuzlu Format (3 soru)
- Soru 21: Doğru cevap C (indeks 2)
- Soru 22: Doğru cevap D (indeks 3)
- Soru 23: Doğru cevap A (indeks 0) 