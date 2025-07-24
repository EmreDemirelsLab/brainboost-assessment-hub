# HAFIZA TESTİ VERİ TABANI DOKÜMANTASYONU

## 1. GENEL BAKIŞ

Hafıza testi, işitsel ve görsel hafıza kapasitesini değerlendiren nöropsikolojik bir testtir. Test 4 setten oluşur:

### Test Yapısı:
- **4 Set**: Her set bir işitsel ve bir görsel bilgi içerir
- **20 Toplam Soru**: Her set için 5 soru (4 × 5 = 20)
- **6 Saniye Süre**: Her soru için maksimum 6 saniye
- **5 Beceri Türü**: Farklı hafıza türlerini değerlendirir

### Test Setleri:
1. **Set 1**: Serçe ve Bahçe
   - İşitsel: "2 serçe çatıya yuva yapmış"
   - Görsel: Bahçe resmi

2. **Set 2**: Uçurtma ve Kütüphane
   - İşitsel: "Ayşe mavi uçurtmasını parkta uçurdu"
   - Görsel: Kütüphane resmi

3. **Set 3**: Öğretmen ve Kamp
   - İşitsel: "Türkçe öğretmeni 30 öğrenciye ders anlattı"
   - Görsel: Kamp resmi

4. **Set 4**: Deniz ve Yelken
   - İşitsel: "Denizde yüzen 4 çocuktan, sadece birinin kırmızı kolluğu vardı"
   - Görsel: Yelken resmi

## 2. VERİ TABANI YAPISI

### 2.1 hafiza_ham_veri Tablosu
Her soru için detaylı veri saklar.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| soru_no | INTEGER | Soru numarası (1-20) |
| set_no | INTEGER | Set numarası (1-4) |
| soru_tipi | VARCHAR(50) | 'text' veya 'image' |
| beceri_tipi | VARCHAR(100) | Hafıza beceri türü |
| soru_metni | TEXT | Soru metni |
| secenekler | JSONB | 5 seçenek (A-E) |
| dogru_cevap | INTEGER | Doğru cevap (0-4: A-E) |
| verilen_cevap | INTEGER | Verilen cevap (0-4 veya NULL) |
| dogru_mu | BOOLEAN | Cevap doğru mu? |
| tepki_suresi_ms | INTEGER | Cevaplama süresi |
| zaman_asimi | BOOLEAN | 6 saniye doldu mu? |
| tarih | TIMESTAMP | Kayıt zamanı |

### 2.2 hafiza_sonuclari Tablosu
Test sonuçlarının set bazında özeti.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| **Set 1 Sonuçları** | | |
| set1_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| set1_toplam_soru | INTEGER | Toplam soru sayısı (5) |
| set1_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| set1_ortalama_sure | FLOAT | Ortalama tepki süresi |
| set1_toplam_sure | FLOAT | Set toplam süresi |
| **Set 2 Sonuçları** | | |
| set2_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| set2_toplam_soru | INTEGER | Toplam soru sayısı (5) |
| set2_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| set2_ortalama_sure | FLOAT | Ortalama tepki süresi |
| set2_toplam_sure | FLOAT | Set toplam süresi |
| **Set 3 Sonuçları** | | |
| set3_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| set3_toplam_soru | INTEGER | Toplam soru sayısı (5) |
| set3_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| set3_ortalama_sure | FLOAT | Ortalama tepki süresi |
| set3_toplam_sure | FLOAT | Set toplam süresi |
| **Set 4 Sonuçları** | | |
| set4_dogru_sayisi | INTEGER | Doğru cevap sayısı |
| set4_toplam_soru | INTEGER | Toplam soru sayısı (5) |
| set4_dogruluk_yuzdesi | FLOAT | Doğruluk yüzdesi |
| set4_ortalama_sure | FLOAT | Ortalama tepki süresi |
| set4_toplam_sure | FLOAT | Set toplam süresi |
| **Genel Metrikler** | | |
| toplam_dogru_sayisi | INTEGER | Toplam doğru cevap |
| toplam_soru_sayisi | INTEGER | Toplam soru sayısı (20) |
| genel_dogruluk_yuzdesi | FLOAT | Genel doğruluk yüzdesi |
| ortalama_tepki_suresi | FLOAT | Ortalama tepki süresi |
| toplam_test_suresi | FLOAT | Toplam test süresi |
| **Zaman Aşımı Analizi** | | |
| zaman_asimi_sayisi | INTEGER | Zaman aşımına uğrayan soru sayısı |
| zaman_asimi_orani | FLOAT | Zaman aşımı yüzdesi |
| hiz_skoru | FLOAT | İşlem hızı skoru (0-100) |
| **Tamamlanamayan Soru** | | |
| tamamlanamayan_soru_no | INTEGER | Tamamlanamayan soru no |
| tamamlanamayan_set_no | INTEGER | Tamamlanamayan set no |

### 2.3 hafiza_beceri_skorlari Tablosu
5 bilişsel beceri skoru (0-100 arası).

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| test_id | INTEGER | Test ID |
| kullanici_id | INTEGER | Kullanıcı ID |
| kisa_sureli_isitsel_hafiza_skoru | FLOAT | Kısa süreli işitsel hafıza |
| kisa_sureli_gorsel_hafiza_skoru | FLOAT | Kısa süreli görsel hafıza |
| uzun_sureli_isitsel_hafiza_skoru | FLOAT | Uzun süreli işitsel hafıza |
| uzun_sureli_gorsel_hafiza_skoru | FLOAT | Uzun süreli görsel hafıza |
| isler_hafiza_skoru | FLOAT | İşler hafıza |
| genel_performans_skoru | FLOAT | Genel performans ortalaması |

### 2.4 hafiza_setler Tablosu (Referans)
Set bilgileri.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| set_no | INTEGER | Set numarası |
| set_adi | VARCHAR(100) | Set adı |
| aciklama | TEXT | Set açıklaması |
| soru_sayisi | INTEGER | Soru sayısı (5) |
| audio_dosyasi | VARCHAR(255) | Ses dosyası adı |
| audio_metni | TEXT | Ses metni |
| gorsel_dosyasi | VARCHAR(255) | Görsel ses dosyası |
| gorsel_metni | TEXT | Görsel metni |

### 2.5 hafiza_ornek_sonuclari Tablosu (Opsiyonel)
Örnek test sonuçları.

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary key |
| kullanici_id | INTEGER | Kullanıcı ID |
| test_id | INTEGER | Test ID |
| ornek_dogru_sayisi | INTEGER | Örnek doğru sayısı |
| ornek_toplam_soru | INTEGER | Örnek toplam soru (4) |
| ornek_dogruluk_yuzdesi | FLOAT | Örnek doğruluk yüzdesi |
| ornek_gecti | BOOLEAN | %75 ve üzeri geçer |
| deneme_sayisi | INTEGER | Deneme sayısı |

## 3. HESAPLAMA FORMÜLLERİ

### 3.1 Temel Metrikler

```
Set Doğruluk Yüzdesi = (Set_Doğru_Sayısı / 5) × 100
Ortalama Tepki Süresi = Σ(Doğru_Cevap_Süreleri) / Doğru_Cevap_Sayısı
Genel Doğruluk = (Toplam_Doğru / 20) × 100
Zaman Aşımı Oranı = (Zaman_Aşımı_Sayısı / 20) × 100
```

### 3.2 Hız Skoru Hesaplama

```
Hız Skoru = (6000 - Ortalama_Tepki_Süresi) / 60
# 6 saniye maksimum, daha hızlı = daha yüksek puan
# 0-100 arası normalize edilir
```

### 3.3 Beceri Skorları Hesaplama

Beceri türleri ve hesaplama yöntemleri:

1. **Kısa Süreli İşitsel Hafıza**: Yeni duyulan bilgilerin doğru hatırlanması
   ```
   (Kısa_Süreli_İşitsel_Doğru / Kısa_Süreli_İşitsel_Toplam) × 100
   ```

2. **Kısa Süreli Görsel Hafıza**: Yeni görülen bilgilerin doğru hatırlanması
   ```
   (Kısa_Süreli_Görsel_Doğru / Kısa_Süreli_Görsel_Toplam) × 100
   ```

3. **Uzun Süreli İşitsel Hafıza**: Önceki setlerden işitsel bilgilerin hatırlanması
   ```
   (Uzun_Süreli_İşitsel_Doğru / Uzun_Süreli_İşitsel_Toplam) × 100
   ```

4. **Uzun Süreli Görsel Hafıza**: Önceki setlerden görsel bilgilerin hatırlanması
   ```
   (Uzun_Süreli_Görsel_Doğru / Uzun_Süreli_Görsel_Toplam) × 100
   ```

5. **İşler Hafıza**: Bilgileri işleyerek yeni çıkarımlar yapma
   ```
   (İşler_Hafıza_Doğru / İşler_Hafıza_Toplam) × 100
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
POST /api/hafiza/test/basla
Body: {
    "kullanici_id": 123
}
Response: {
    "success": true,
    "test_id": 456,
    "message": "Hafıza testi başlatıldı",
    "setler": { ... },
    "toplam_soru": 20,
    "soru_basina_sure_saniye": 6
}
```

#### Soru Cevabı Kaydetme
```
POST /api/hafiza/soru/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "soru_no": 1,
    "set_no": 1,
    "soru_tipi": "text",
    "beceri_tipi": "Kısa Süreli İşitsel",
    "soru_metni": "Çatıya yuva yapan hayvan hangisidir?",
    "secenekler": ["Martı", "Güvercin", "Serçe", "Leylek", "Karga"],
    "dogru_cevap": 2,
    "verilen_cevap": 2,
    "tepki_suresi_ms": 3500,
    "zaman_asimi": false
}
Response: {
    "success": true,
    "message": "Soru cevabı kaydedildi",
    "dogru_mu": true
}
```

#### Örnek Test Sonucu Kaydetme
```
POST /api/hafiza/ornek/kaydet
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "ornek_dogru_sayisi": 3,
    "deneme_sayisi": 1
}
Response: {
    "success": true,
    "message": "Örnek test sonucu kaydedildi",
    "ornek_gecti": true,
    "ornek_dogruluk_yuzdesi": 75.0
}
```

#### Test Tamamlama
```
POST /api/hafiza/test/tamamla
Body: {
    "test_id": 456,
    "kullanici_id": 123,
    "toplam_test_suresi": 180.5
}
Response: {
    "success": true,
    "message": "Test tamamlandı ve sonuçlar hesaplandı",
    "sonuclar": { ... }
}
```

#### Test Sonucu Görüntüleme
```
GET /api/hafiza/sonuc/456
Response: {
    "success": true,
    "sonuc": {
        "genel_dogruluk_yuzdesi": 85.0,
        "toplam_dogru_sayisi": 17,
        "ortalama_tepki_suresi": 3200.5,
        "hiz_skoru": 73.3,
        "zaman_asimi_orani": 10.0,
        "kisa_sureli_isitsel_hafiza_skoru": 90.0,
        "uzun_sureli_gorsel_hafiza_skoru": 75.0,
        "genel_performans_skoru": 82.4,
        ...
    }
}
```

#### Kullanıcının Tüm Testleri
```
GET /api/hafiza/kullanici/123/testler
Response: {
    "success": true,
    "testler": [
        {
            "test_id": 456,
            "tarih": "2024-01-15T10:30:00Z",
            "genel_dogruluk_yuzdesi": 85.0,
            "toplam_dogru_sayisi": 17,
            "hiz_skoru": 73.3,
            "genel_performans_skoru": 82.4
        }
    ]
}
```

#### Setleri Getirme
```
GET /api/hafiza/setler
Response: {
    "success": true,
    "setler": {
        "1": {
            "set_adi": "Set 1",
            "aciklama": "Serçe ve Bahçe",
            "audio_dosyasi": "set1_ses.mp3",
            "audio_metni": "2 serçe çatıya yuva yapmış",
            "gorsel_resmi": "bahce.png"
        },
        ...
    }
}
```

#### Soru Listesi
```
GET /api/hafiza/sorular
Response: {
    "success": true,
    "sorular": [
        [
            {
                "soru_no": 1,
                "question": "Çatıya yuva yapan hayvan hangisidir?",
                "options": ["Martı", "Güvercin", "Serçe", "Leylek", "Karga"],
                "correct": 2,
                "type": "text",
                "setNo": 1,
                "skillType": "Kısa Süreli İşitsel"
            },
            ...
        ],
        ...
    ]
}
```

#### Ham Veri Analizi
```
GET /api/hafiza/analiz/456
Response: {
    "success": true,
    "analiz": [
        {
            "set_no": 1,
            "beceri_tipi": "Kısa Süreli İşitsel",
            "toplam_soru": 2,
            "dogru_sayisi": 2,
            "cevapsiz": 0,
            "zaman_asimi": 0,
            "ort_dogru_sure": 3200.5,
            "ort_tepki_sure": 3200.5
        },
        ...
    ]
}
```

## 5. FRONTEND ENTEGRASYONU

### 5.1 Frontend'in Göndermesi Gereken Veriler

**Her soru için:**
- Test ID ve kullanıcı ID
- Soru numarası (1-20)
- Set numarası (1-4)
- Soru tipi ('text' veya 'image')
- Beceri tipi (5 farklı hafıza türü)
- Soru metni
- 5 seçenek (A-E)
- Doğru cevap indeksi
- Verilen cevap indeksi (veya NULL)
- Tepki süresi (ms)
- Zaman aşımı durumu

**Örnek test için:**
- Örnek doğru sayısı
- Deneme sayısı

**Test sonunda:**
- Toplam test süresi

### 5.2 Örnek Veri Akışı

```javascript
// 1. Test başlat
const response = await fetch('/api/hafiza/test/basla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kullanici_id: 123 })
});
const { test_id } = await response.json();

// 2. Her soru için kaydet
await fetch('/api/hafiza/soru/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        soru_no: 1,
        set_no: 1,
        soru_tipi: 'text',
        beceri_tipi: 'Kısa Süreli İşitsel',
        soru_metni: 'Çatıya yuva yapan hayvan hangisidir?',
        secenekler: ['Martı', 'Güvercin', 'Serçe', 'Leylek', 'Karga'],
        dogru_cevap: 2, // C seçeneği
        verilen_cevap: 2, // Kullanıcı C'yi seçti
        tepki_suresi_ms: 3500,
        zaman_asimi: false
    })
});

// 3. Örnek test sonucu kaydet
await fetch('/api/hafiza/ornek/kaydet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        test_id,
        kullanici_id: 123,
        ornek_dogru_sayisi: 3,
        deneme_sayisi: 1
    })
});

// 4. Test tamamla
const sonuclar = await fetch('/api/hafiza/test/tamamla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        test_id, 
        kullanici_id: 123,
        toplam_test_suresi: 180.5 
    })
});
```

## 6. ÖNEMLİ NOTLAR

1. **Soru Sırası**: 20 soru belirli sırada sunulmalıdır
2. **Seçenek İndeksleri**: A=0, B=1, C=2, D=3, E=4
3. **Süre Limiti**: Soru başına maksimum 6 saniye
4. **Set Yapısı**: 4 set, her set 5 soru
5. **Beceri Skorları**: 0-100 arası normalize edilir
6. **Zaman Aşımı**: 6 saniye dolduğunda otomatik işaretlenir
7. **Örnek Test**: %75 başarı gerekli, aksi halde tekrar

## 7. VERİTABANI KURULUMU

```sql
-- hafiza_database_schema.sql dosyasını çalıştır
psql -U postgres -d bilisseltest -f hafiza_database_schema.sql
```

## 8. SUNUCU ÇALIŞTIRMA

```bash
# Geliştirme modu
npm run dev

# Prodüksiyon modu  
npm start
```

Sunucu `http://localhost:3005` adresinde çalışacaktır.

## 9. ÖRNEK VERİ AKIŞI

```
1. Kullanıcı testi başlatır → test_id alır
2. Örnek test: 4 soru → sonuç kaydedilir
3. Ana test başlar
4. Set 1: Ses + Görsel → 5 soru
5. Set 2: Ses + Görsel → 5 soru
6. Set 3: Ses + Görsel → 5 soru
7. Set 4: Ses + Görsel → 5 soru
8. Test tamamlanır → hesaplamalar yapılır
9. 5 bilişsel beceri skoru üretilir
10. Sonuçlar görüntülenir
```

## 10. BECERİ TÜRLERİ VE SORU DAĞILIMI

### Kısa Süreli İşitsel Hafıza (4 soru)
- Set 1, Soru 1: Serçe sorusu
- Set 1, Soru 4: Çatı sorusu
- Set 2, Soru 6: Park sorusu
- Set 3, Soru 11: Öğretmen sorusu

### Kısa Süreli Görsel Hafıza (4 soru)
- Set 1, Soru 2: Bahçe çocuk sorusu
- Set 1, Soru 3: Bahçe çiçek sorusu (görsel)
- Set 3, Soru 14: Kamp köpek sorusu (görsel)
- Set 4, Soru 16: Yelken renk sorusu

### Uzun Süreli İşitsel Hafıza (4 soru)
- Set 2, Soru 9: Serçe sayısı sorusu
- Set 3, Soru 15: Uçurtma kim sorusu
- Set 4, Soru 17: Öğrenci sayısı sorusu

### Uzun Süreli Görsel Hafıza (4 soru)
- Set 2, Soru 8: Hortum rengi sorusu
- Set 3, Soru 12: Koltuk sorusu (görsel)
- Set 4, Soru 19: Top sorusu (görsel)

### İşler Hafıza (4 soru)
- Set 1, Soru 5: Bahçede olmayan sorusu
- Set 2, Soru 10: Kütüphanede olmayan sorusu
- Set 3, Soru 13: Kampta olmayan sorusu
- Set 4, Soru 18: Rakam toplama sorusu
- Set 4, Soru 20: Çıkarım sorusu 