# 🧠 Bilişsel Test Skorlama Formülleri ve Hesaplama Yöntemleri

Bu dokümantasyon, ForTest Bilişsel Beceriler Testi'nde kullanılan skorlama formüllerini ve hesaplama yöntemlerini detaylı olarak açıklamaktadır.

## 📊 Genel Bilgiler

- **Aggregator Konumu:** `akil-mantik.html` ve `CognitiveAssessmentTest.tsx`
- **Hedef Tablo:** `cognitive_test_result`
- **Kaynak Tablolar:** 5 ayrı test sonuç tablosu
- **Hesaplama Zamanı:** Son test (Akıl-Mantık) tamamlandıktan sonra

---

## 🎯 Bilişsel Skor Hesaplamaları

### 1. 🎯 **Dikkat Skoru** (`dikkat_skoru`)

**Kaynak Tablo:** `attention_test_results`  
**Kaynak Field:** `accuracy_percentage`

```javascript
dikkat_skoru = Math.round((attResult.data.accuracy_percentage || 0) * 100) / 100
```

**Açıklama:**
- Dikkat testindeki doğruluk yüzdesini direkt olarak kullanır
- 0-100 arası değer alır
- Örnek: `accuracy_percentage: 26` → `dikkat_skoru: 26.00`

---

### 2. 🧠 **Hafıza Skoru** (`hafiza_skoru`)

**Kaynak Tablo:** `memory_test_results`  
**Kaynak Field:** `accuracy_percentage`

```javascript
hafiza_skoru = Math.round((memResult.data.accuracy_percentage || 0) * 100) / 100
```

**Açıklama:**
- Hafıza testindeki genel doğruluk yüzdesini kullanır
- Gibson Hafıza Testi sonuçlarından hesaplanır
- 0-100 arası değer alır
- Örnek: `accuracy_percentage: 35` → `hafiza_skoru: 35.00`

---

### 3. ⚡ **İşleme Hızı Skoru** (`isleme_hizi_skoru`)

**Kaynak Tablo:** `stroop_test_results`  
**Kaynak Field:** `average_response_time_ms`

```javascript
isleme_hizi_skoru = Math.round(((100 - (strResult.data.average_response_time_ms || 1000) / 10) || 0) * 100) / 100
```

**Açıklama:**
- Stroop testindeki ortalama tepki süresini ters çevirir (hız = 1/zaman)
- Formül: `100 - (ortalama_ms / 10)`
- Daha hızlı tepki = daha yüksek skor
- Örnek: `average_response_time_ms: 522` → `100 - 522/10 = 47.8` → `isleme_hizi_skoru: 47.80`

---

### 4. 👁️ **Görsel İşleme Skoru** (`gorsel_isleme_skoru`)

**Kaynak Tablo:** `puzzle_test_results`  
**Kaynak Field:** `four_piece_score`, `six_piece_score`

```javascript
gorsel_isleme_skoru = Math.round(((pzlResult.data.four_piece_score || 0) + (pzlResult.data.six_piece_score || 0)) / 2 * 100) / 100
```

**Açıklama:**
- 4 parça ve 6 parça puzzle skorlarının ortalamasını alır
- Her iki puzzle türünden elde edilen performansı birleştirir
- Örnek: `four_piece_score: 50`, `six_piece_score: -5` → `(50 + (-5)) / 2 = 22.5` → `gorsel_isleme_skoru: 22.50`

---

### 5. 🧩 **Akıl Mantık Yürütme Skoru** (`akil_mantik_yurutme_skoru`)

**Kaynak Tablo:** `akil_mantik_test_results`  
**Kaynak Field:** `success_rate`

```javascript
akil_mantik_yurutme_skoru = Math.round((logicResult.data.success_rate || 0) * 100) / 100
```

**Açıklama:**
- Akıl-mantık testindeki başarı oranını direkt kullanır
- Mantıksal düşünme ve problem çözme becerisini ölçer
- 0-100 arası değer alır
- Örnek: `success_rate: 30` → `akil_mantik_yurutme_skoru: 30.00`

---

### 6. 🔄 **Bilişsel Esneklik Skoru** (`bilissel_esneklik_skoru`)

**Kaynak Tablolar:** `stroop_test_results`, `puzzle_test_results`  
**Kaynak Field:** `accuracy_percentage`, `cognitive_flexibility_score`

```javascript
bilissel_esneklik_skoru = Math.round(((strResult.data.accuracy_percentage || 0) + (pzlResult.data.cognitive_flexibility_score || 0)) / 2 * 100) / 100
```

**Açıklama:**
- Stroop testi doğruluk yüzdesi ile puzzle bilişsel esneklik skorunun ortalaması
- Dikkat değiştirme ve adaptasyon becerisini ölçer
- İki farklı testten gelen esneklik verilerini birleştirir
- Örnek: `stroop accuracy: 26`, `puzzle flexibility: 39` → `(26 + 39) / 2 = 32.5` → `bilissel_esneklik_skoru: 32.50`

---

## 🔧 Teknik Detaylar

### Aggregator Çalışma Mantığı

1. **Tetikleme:** Son test (akil-mantik.html) tamamlandığında
2. **Veri Okuma:** 5 tablodan session_id ile son kayıtları çeker
3. **Hesaplama:** Yukarıdaki formüllerle skorları hesaplar
4. **Kayıt:** `cognitive_test_result` tablosuna tek kayıt olarak yazar
5. **Temizlik:** localStorage session verilerini temizler

### Hata Yönetimi

```javascript
// Her field için fallback değer
field_value || 0  // Field yoksa 0 kullan

// Matematiksel hata koruması
Math.round(value * 100) / 100  // 2 ondalık hassasiyet
```

### Session Bilgileri

```javascript
const cognitiveResult = {
  session_id: sessionId,           // Test oturumu ID
  student_id: studentId,           // Öğrenci ID
  conducted_by: conductedBy,       // Test yapan kişi ID
  test_start_time: startTime,      // Test başlangıç zamanı
  test_end_time: endTime,          // Test bitiş zamanı
  duration_seconds: duration,      // Toplam test süresi
  ...scores,                       // Hesaplanan skorlar
  alt_test_ozetleri: {            // Ham test verileri
    attention: attResult.data,
    memory: memResult.data,
    stroop: strResult.data,
    puzzle: pzlResult.data,
    logic: logicResult.data
  }
};
```

---

## 📈 Skor Yorumlama Rehberi

### Skor Aralıkları (Genel)
- **0-25:** Düşük performans
- **26-50:** Orta-düşük performans  
- **51-75:** Orta-yüksek performans
- **76-100:** Yüksek performans

### Test Spesifik Notlar

**Dikkat & Hafıza:** Doğruluk yüzdesi bazlı, direkt performans göstergesi

**İşleme Hızı:** Ters hesaplama (düşük ms = yüksek skor), hız odaklı

**Görsel İşleme:** Puzzle performansı, negatif skorlar mümkün

**Akıl Mantık:** Problem çözme başarısı, mantıksal düşünme

**Bilişsel Esneklik:** Adaptasyon becerisi, iki test ortalaması

---

## 🔄 Güncelleme Geçmişi

- **v1.0:** İlk aggregator implementasyonu
- **v1.1:** Column ismi uyumsuzlukları düzeltildi (`duration_seconds`, `alt_test_ozetleri`)
- **v1.2:** Field ismi uyumsuzlukları düzeltildi (tüm skorlar için doğru field isimleri)
- **v1.3:** Memory field ismi düzeltildi (`accuracy_percentage`)

---

## 🚨 Önemli Notlar

1. **Field İsimleri:** Database schema ile tam uyumlu olmalı
2. **Null Kontrol:** Her field için `|| 0` fallback kullanılmalı  
3. **Precision:** `Math.round(value * 100) / 100` ile 2 ondalık
4. **Session Integrity:** Tüm testler aynı session_id ile kayıtlı olmalı
5. **Error Handling:** Aggregator hataları loglanmalı ve graceful fail olmalı

---

*Bu dokümantasyon ForTest Bilişsel Beceriler Testi v2.0 için hazırlanmıştır.*
*Son güncelleme: 2025-08-06*
