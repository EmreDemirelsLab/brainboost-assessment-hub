# STROOP TESTİ VERİ TABANI DOKÜMANTASYONU

## 1. GENEL BAKIŞ

Stroop testi, bilişsel kontrol ve dikkat süreçlerini değerlendiren nöropsikolojik bir testtir. Test 3 aşamadan oluşur:

### Test Aşamaları:
1. **Basit Tepki Süresi (BTS)** - 1. Aşama
   - Kelime okuma
   - 12 tepki beklenir

2. **Karmaşık Tepki Süresi (KTS)** - 2. Aşama  
   - Renk-kelime eşleştirme
   - 24 tepki beklenir

3. **Stroop Tepki Süresi (STS)** - 3. Aşama
   - Çelişkili uyaran (interferans)
   - 24 tepki beklenir

**Toplam:** 60 tepki, süreye dayalı değerlendirme

## 2. VERİ TABANI YAPISI

### 2.1 stroop_ham_veri Tablosu
Her tepki için detaylı veri saklar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| uyaran_suresi_ms | INTEGER | Uyaranın ekranda kalma süresi |
| tepki_var_mi | BOOLEAN | Kullanıcı tepki verdi mi? |
| tepki_zamani_ms | INTEGER | Tepki süresi (ms) |
| dogru_mu | BOOLEAN | Tepki doğru mu? |
| asama_no | INTEGER | Hangi aşama (1/2/3) |
| kelime_gosterilen | TEXT | Gösterilen kelime |
| renk_gosterilen | TEXT | Gösterilen renk |
| beklenen_tepki | TEXT | Beklenen tepki |
| verilen_tepki | TEXT | Kullanıcının verdiği tepki |
| tarih | TIMESTAMP | Kayıt zamanı |

### 2.2 stroop_sonuclari Tablosu
Test sonuçlarının aşama bazında özeti.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| **1. Aşama (BTS)** | | |
| bts_ort_sure | FLOAT | Ortalama tepki süresi |
| bts_dogruluk | FLOAT | Doğruluk yüzdesi |
| bts_hata | INTEGER | Hata sayısı |
| bts_toplam_tepki | INTEGER | Toplam tepki sayısı (12) |
| **2. Aşama (KTS)** | | |
| kts_ort_sure | FLOAT | Ortalama tepki süresi |
| kts_dogruluk | FLOAT | Doğruluk yüzdesi |
| kts_hata | INTEGER | Hata sayısı |
| kts_toplam_tepki | INTEGER | Toplam tepki sayısı (24) |
| **3. Aşama (STS)** | | |
| sts_ort_sure | FLOAT | Ortalama tepki süresi |
| sts_dogruluk | FLOAT | Doğruluk yüzdesi |
| sts_hata | INTEGER | Hata sayısı |
| sts_toplam_tepki | INTEGER | Toplam tepki sayısı (24) |
| **İnterferans Analizi** | | |
| interferans_fark | FLOAT | STS - BTS farkı (ms) |
| interferans_orani | FLOAT | İnterferans yüzdesi |
| **Süre ve Dürtüsellik** | | |
| bolum1_sure_sn | FLOAT | 1. bölüm süresi (saniye) |
| bolum2_sure_sn | FLOAT | 2. bölüm süresi (saniye) |
| bolum3_sure_sn | FLOAT | 3. bölüm süresi (saniye) |
| toplam_sure_sn | FLOAT | Toplam test süresi |
| durtussellik_var | BOOLEAN | Dürtüsellik tespit edildi mi? |
| durtussellik_aciklama | TEXT | Dürtüsellik açıklaması |

### 2.3 stroop_beceri_skorlari Tablosu
7 bilişsel beceri skoru (0-100 arası).

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| test_id | INTEGER | Test ID |
| kullanici_id | INTEGER | Kullanıcı ID |
| islem_hizi_skoru | FLOAT | İşlem hızı skoru |
| tepkime_hizi_skoru | FLOAT | Tepkime hızı skoru |
| surdurulebilir_dikkat_skoru | FLOAT | Sürdürülebilir dikkat skoru |
| secici_dikkat_skoru | FLOAT | Seçici dikkat skoru |
| kisa_sureli_gorsel_hafiza_skoru | FLOAT | Kısa süreli görsel hafıza skoru |
| durtussellik_skoru | FLOAT | Dürtüsellik skoru (ters skorlama) |
| bilissel_esneklik_skoru | FLOAT | Bilişsel esneklik skoru |
| genel_performans_skoru | FLOAT | Genel performans ortalaması |

## 3. HESAPLAMA FORMÜLLERİ

### 3.1 Temel Metrikler

```
Ortalama Süre = Σ(Doğru_Tepki_Süreleri) / Doğru_Tepki_Sayısı
Doğruluk Yüzdesi = (Doğru_Tepki_Sayısı / Toplam_Tepki) × 100
Hata Sayısı = Toplam_Tepki - Doğru_Tepki_Sayısı
```

### 3.2 İnterferans Hesabı

```
İnterferans Farkı = STS_Ortalama_Süre - BTS_Ortalama_Süre
İnterferans Oranı = (İnterferans_Farkı / BTS_Ortalama_Süre) × 100
```

### 3.3 Dürtüsellik Tespiti

Dürtüsellik şu koşullarda tespit edilir:
- Ortalama tepki süresi < 400ms VE
- Hata oranı > %20

### 3.4 Beceri Skorları Hesaplama

1. **İşlem Hızı**: Toplam süreye göre
   ```
   (180 - Toplam_Süre_Saniye) / 1.2
   # 60sn = 100 puan, 180sn = 0 puan
   ```

2. **Tepkime Hızı**: Ortalama tepki süresine göre
   ```
   (1000 - Ortalama_Tepki_Süresi) / 7
   # 300ms = 100 puan, 1000ms = 0 puan
   ```

3. **Sürdürülebilir Dikkat**: Ortalama doğruluk yüzdesine eşit
   ```
   (BTS_Doğruluk + KTS_Doğruluk + STS_Doğruluk) / 3
   ```

4. **Seçici Dikkat**: STS doğruluk yüzdesine eşit

5. **Kısa Süreli Görsel Hafıza**: KTS doğruluk yüzdesine eşit

6. **Dürtüsellik**: Dürtüsellik yoksa 90 puan, varsa 30 puan

7. **Bilişsel Esneklik**: İnterferans oranına göre
   ```
   100 - |İnterferans_Oranı|
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
POST /api/stroop/test/basla
Body: {
    "kullanici_id": 123
}
Response: {
    "success": true,
    "test_id": 456,
    "message": "Stroop testi başlatıldı",
    "asamalar": { ... }
}
```

#### Tepki Kaydetme
```
POST /api/stroop/tepki/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "uyaran_suresi_ms": 2000,
    "tepki_var_mi": true,
    "tepki_zamani_ms": 650,
    "dogru_mu": true,
    "asama_no": 1,
    "kelime_gosterilen": "KIRMIZI",
    "renk_gosterilen": "kirmizi",
    "beklenen_tepki": "space",
    "verilen_tepki": "space"
}
```

#### Bölüm Süresi Güncelleme
```
POST /api/stroop/bolum/sure-guncelle
Body: {
    "test_id": 456,
    "bolum_no": 1,
    "sure_saniye": 30.5
}
```

#### Test Tamamlama
```
POST /api/stroop/test/tamamla
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "toplam_sure_sn": 128.5
}
Response: {
    "success": true,
    "message": "Test tamamlandı ve sonuçlar hesaplandı",
    "sonuclar": { ... }
}
```

#### Sonuçları Görüntüleme
```
GET /api/stroop/sonuc/456
Response: {
    "success": true,
    "sonuc": {
        "bts_ort_sure": 450.5,
        "bts_dogruluk": 91.67,
        "interferans_orani": 15.2,
        "islem_hizi_skoru": 85.5,
        ...
    }
}
```

#### Kullanıcının Tüm Testleri
```
GET /api/stroop/kullanici/123/testler
Response: {
    "success": true,
    "testler": [
        {
            "test_id": 456,
            "tarih": "2024-01-15T10:30:00Z",
            "bts_dogruluk": 91.67,
            "interferans_orani": 15.2,
            "genel_performans_skoru": 78.8
        }
    ]
}
```

#### Aşamaları Getirme
```
GET /api/stroop/asamalar
Response: {
    "success": true,
    "asamalar": {
        "1": {
            "ad": "Basit Tepki Süresi (BTS)",
            "aciklama": "1. Aşama - Kelime okuma",
            "toplam_tepki": 12
        },
        ...
    }
}
```

#### Ham Veri Analizi
```
GET /api/stroop/analiz/456
Response: {
    "success": true,
    "analiz": [
        {
            "asama_no": 1,
            "toplam_tepki": 12,
            "dogru_tepki": 11,
            "tepkisiz": 0,
            "ort_dogru_sure": 425.5,
            "ort_tepki_sure": 445.2
        },
        ...
    ]
}
```

## 5. FRONTEND ENTEGRASYONU

### 5.1 Frontend'in Göndermesi Gereken Veriler

**Her tepki için:**
- Test ID ve kullanıcı ID
- Uyaran süresi (ms)
- Tepki var mı (boolean)
- Tepki zamanı (ms)
- Doğru mu (boolean)
- Aşama numarası (1/2/3)
- Gösterilen kelime ve renk
- Beklenen ve verilen tepki

**Bölüm sonunda:**
- Bölüm süresi (saniye)

**Test sonunda:**
- Toplam test süresi (saniye)

### 5.2 Örnek Veri Akışı

```javascript
// 1. Test başlat
const response = await fetch('/api/stroop/test/basla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullanici_id: 123 })
});
const { test_id } = await response.json();

// 2. Her tepki için kaydet
await fetch('/api/stroop/tepki/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        uyaran_suresi_ms: 2000,
        tepki_var_mi: true,
        tepki_zamani_ms: 650,
        dogru_mu: true,
        asama_no: 1,
        kelime_gosterilen: 'KIRMIZI',
        renk_gosterilen: 'kirmizi',
        beklenen_tepki: 'space',
        verilen_tepki: 'space'
    })
});

// 3. Bölüm bitiminde süre güncelle
await fetch('/api/stroop/bolum/sure-guncelle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        bolum_no: 1,
        sure_saniye: 30.5
    })
});

// 4. Test tamamla
const sonuclar = await fetch('/api/stroop/test/tamamla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        test_id, 
        kullanici_id: 123,
        toplam_sure_sn: 128.5 
    })
});
```

## 6. ÖNEMLİ NOTLAR

1. **Süre Hesabı**: Süreler sadece doğru tepkiler üzerinden hesaplanır
2. **Hata Tanımı**: Tepkisiz kalınan veya yanlış verilen her uyarı hata sayılır
3. **İnterferans Etkisi**: Bilişsel esnekliği gösterir
4. **Dürtüsellik**: Hem hız hem doğruluk üzerinden değerlendirilir
5. **Beceri Skorları**: 0-100 arası normalize edilir
6. **Aşama Sırası**: Mutlaka 1-2-3 sırasında yapılmalıdır

## 7. VERİTABANI KURULUMU

```sql
-- stroop_database_schema.sql dosyasını çalıştır
psql -U postgres -d bilisseltest -f stroop_database_schema.sql
```

## 8. SUNUCU ÇALIŞTIRMA

```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu  
npm start
```

Sunucu `http://localhost:3003` adresinde çalışacaktır.

## 9. ÖRNEK VERİ AKIŞI

```
1. Kullanıcı testi başlatır → test_id alır
2. 1. Aşama: 12 tepki → her tepki kaydedilir
3. 1. Bölüm süresi güncellenir
4. 2. Aşama: 24 tepki → her tepki kaydedilir  
5. 2. Bölüm süresi güncellenir
6. 3. Aşama: 24 tepki → her tepki kaydedilir
7. 3. Bölüm süresi güncellenir
8. Test tamamlanır → hesaplamalar yapılır
9. 7 bilişsel beceri skoru üretilir
10. Sonuçlar görüntülenir
``` 