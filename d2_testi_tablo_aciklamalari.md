# 📋 D2 Dikkat Testi - Tablo Field Açıklamaları

## 🎯 Genel Bilgi
D2 Testi, **Konsantrasyon ve Dikkat Performansını** ölçen standartlaştırılmış bir psikometrik testtir. Kullanıcılar belirli karakterleri tanımlayıp işaretler, sistem bu süreçte çeşitli performans metriklerini hesaplar.

---

## 🔑 1. TEMEL KİMLİK BİLGİLERİ

| Field | Türkçe Karşılığı | Nasıl Elde Edilir |
|-------|------------------|-------------------|
| `id` | Test Kayıt ID'si | Sistem tarafından otomatik UUID oluşturulur |
| `student_id` | Öğrenci ID'si | Testi alan kullanıcının `users` tablosundaki ID'si |
| `conducted_by` | Test Yapan Kişi | Testi yöneten kişinin (admin/trainer) ID'si |

---

## ⏱️ 2. ZAMAN BİLGİLERİ

| Field | Türkçe Karşılığı | Nasıl Elde Edilir |
|-------|------------------|-------------------|
| `test_start_time` | Test Başlama Zamanı | JavaScript `new Date()` ile test başladığında kaydedilir |
| `test_end_time` | Test Bitiş Zamanı | Test tamamlandığında/durdurulduğunda kaydedilir |
| `test_duration_seconds` | Test Süresi (Saniye) | `test_end_time - test_start_time` hesaplanır |
| `created_at` | Kayıt Oluşturma Zamanı | Veritabanı kayıt sırasında otomatik `NOW()` |
| `updated_at` | Son Güncelleme Zamanı | Her güncellemede trigger ile otomatik `NOW()` |

---

## 📋 3. TEST DURUMU

| Field | Türkçe Karşılığı | Nasıl Elde Edilir |
|-------|------------------|-------------------|
| `completion_status` | Tamamlanma Durumu | `completed`/`incomplete`/`failed` - Test sonucuna göre |
| `notes` | Notlar | Opsiyonel - Test sırasında özel durumlar için |

---

## 🎯 4. D2 TEST SPESİFİK METRİKLERİ (Ham Veriler)

| Field | Türkçe Karşılığı | D2 Kısaltması | Nasıl Elde Edilir |
|-------|------------------|---------------|-------------------|
| `total_items_processed` | Toplam İşlenen Madde | **TN** | Kullanıcının kontrol ettiği toplam karakter sayısı |
| `correct_selections` | Doğru Seçimler | **D** | Doğru tanımlanıp işaretlenen karakter sayısı |
| `commission_errors` | Yanlış İşaretleme Hataları | **E1** | Yanlış karakterleri işaretleme sayısı |
| `omission_errors` | Atlama Hataları | **E2** | İşaretlenmesi gereken ama atlanmış karakter sayısı |
| `total_errors` | Toplam Hata | **E** | `E1 + E2` toplamı |
| `concentration_performance` | Konsantrasyon Performansı | **CP** | `D - E1` (Doğru seçimler - Yanlış işaretlemeler) |
| `total_net_performance` | Net Performans | **TN-E** | `TN - E` (Toplam işlenen - Toplam hata) |
| `fluctuation_rate` | Dalgalanma Oranı | **FR** | Satırlar arası performans farkı (Bmax - Bmin) |

---

## 📊 5. HESAPLANAN PUANLAR (Trigger ile Otomatik)

| Field | Türkçe Karşılığı | Hesaplama Formülü |
|-------|------------------|-------------------|
| `total_score` | Genel Skor | `CP` değeri alınır |
| `processing_speed` | İşlem Hızı | `(total_items_processed / (test_duration_seconds / 60))` |
| `attention_stability` | Dikkat Kararlılığı | `100 - (fluctuation_rate * 5)` (min: 0, max: 100) |
| `concentration_performance_percentage` | Konsantrasyon Performansı (%) | `(correct_selections / (correct_selections + commission_errors)) * 100` |

---

## 📝 6. DETAYLI VERİLER (JSON Format)

| Field | Türkçe Karşılığı | İçerik |
|-------|------------------|--------|
| `line_results` | Satır Satır Sonuçlar | Her satırdaki performans verileri (JSON array) |
| `detailed_results` | Detaylı Test Verileri | Tüm test sürecinin ayrıntılı log'u |

**Örnek `line_results` formatı:**
```json
[
  {
    "line": 1,
    "correct": 12,
    "errors": 2,
    "time_spent": 45.2
  },
  {
    "line": 2, 
    "correct": 15,
    "errors": 1,
    "time_spent": 42.8
  }
]
```

---

## 🔧 7. SİSTEM BİLGİLERİ (Opsiyonel)

| Field | Türkçe Karşılığı | Nasıl Elde Edilir |
|-------|------------------|-------------------|
| `browser_info` | Tarayıcı Bilgisi | JavaScript `navigator.userAgent` |
| `device_info` | Cihaz Bilgisi | JavaScript `navigator.platform` + ekran çözünürlüğü |
| `ip_address` | IP Adresi | Supabase otomatik client IP tespiti |

---

## 🔄 OTOMATİK HESAPLAMA TRİGGER'I

D2 test tablosunda `calculate_d2_test_metrics()` trigger fonksiyonu bulunur:

### Çalışma Mantığı:
1. **INSERT/UPDATE** işlemlerinde otomatik çalışır
2. Ham verileri kullanarak hesaplanan puanları otomatik doldurur  
3. **Konsantrasyon performansı %** = Doğru seçimler / (Doğru + Yanlış işaretlemeler)
4. **İşlem hızı** = Dakika başına işlenen madde
5. **Dikkat kararlılığı** = Dalgalanma oranına göre 0-100 arası puan

### Trigger Kodu:
```sql
-- Konsantrasyon performansı yüzdesi
NEW.concentration_performance_percentage := ROUND(
    (NEW.correct_selections::DECIMAL / (NEW.correct_selections + NEW.commission_errors)::DECIMAL) * 100, 2
);

-- İşlem hızı (dakika başına)
NEW.processing_speed := ROUND(
    (NEW.total_items_processed::DECIMAL / (NEW.test_duration_seconds::DECIMAL / 60)), 2
);

-- Dikkat kararlılığı
NEW.attention_stability := ROUND(
    CASE 
        WHEN NEW.fluctuation_rate = 0 THEN 100
        ELSE GREATEST(0, 100 - (NEW.fluctuation_rate * 5))
    END, 2
);
```

---

## 📈 D2 TEST DEĞERLENDİRME KRİTERLERİ

### Yüksek Performans Göstergeleri:
- ✅ **Yüksek CP değeri** (Konsantrasyon Performansı)
- ✅ **Düşük E1 değeri** (Az yanlış işaretleme)  
- ✅ **Yüksek D değeri** (Çok doğru seçim)
- ✅ **Düşük FR değeri** (Stabil performans)

### Dikkat Problemleri Göstergeleri:
- ❌ **Yüksek E2 değeri** (Çok atlama - Dikkat eksikliği)
- ❌ **Yüksek E1 değeri** (Çok yanlış işaretleme - İmpulsivite)
- ❌ **Yüksek FR değeri** (Performans dalgalanması)
- ❌ **Düşük TN değeri** (Yavaş işlem hızı)

---

*Bu tablo yapısı Burdon Testi ile uyumlu ve modern Supabase RLS güvenlik politikalarına sahiptir.*