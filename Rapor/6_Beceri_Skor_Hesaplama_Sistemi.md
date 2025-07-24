# 📊 6 ANA BİLİŞSEL BECERİ SKORUNUN HESAPLAMA SİSTEMİ

## 🎯 1. GENEL SKOR MİMARİSİ

### Skorlama Prensibi:
```
Test Ham Verileri → Beceri Alt Puanları → Ana Skor Kategorileri → Normalize Edilmiş Yüzdelik
```

### 6 Ana Skor Kategorisi:
1. **Dikkat ve Odaklanma Beceri Skoru**
2. **Hafıza Becerisi Skoru**  
3. **İşleme Hızı Skoru**
4. **Görsel İşleme Skoru**
5. **Akıl ve Mantık Yürütme Skoru**
6. **Bilişsel Esneklik Skoru**

---

## ⚡ 2. TEST BAZLI KATKILAR (Excel BECERİ TABLOSU'ndan)

### A) DİKKAT VE ODAKLANMA SKORU = 100%
```sql
Katkı Kaynakları:
- Dikkat Testi: %60 (Ana kaynak)
  - Seçici Dikkat: %25
  - Sürdürülebilir Dikkat: %25
  - Bölünmüş Dikkat: %10
- Stroop Testi: %25 (Inhibisyon kontrolü)
- Puzzle Testi: %15 (Konsantrasyon)

Hesaplama Formülü:
Dikkat_Skoru = (Dikkat_Test_Puanı × 0.60) + (Stroop_Puanı × 0.25) + (Puzzle_Puanı × 0.15)
```

### B) HAFIZA BECERİSİ SKORU = 100%
```sql
Katkı Kaynakları:
- Hafıza Testi: %80 (Ana kaynak)
  - Kısa Süreli Hafıza: %40
  - Uzun Süreli Hafıza: %40
- Puzzle Testi: %20 (Çalışma hafızası)

Hesaplama Formülü:
Hafiza_Skoru = (Hafiza_Test_Puanı × 0.80) + (Puzzle_Puanı × 0.20)
```

### C) İŞLEME HIZI SKORU = 100%
```sql
Katkı Kaynakları:
- Dikkat Testi: %40 (Reaksiyon zamanları)
- Stroop Testi: %35 (Hız + Doğruluk)
- Akıl-Mantık Testi: %25 (Problem çözme hızı)

Hesaplama Formülü:
Isleme_Hizi = (Dikkat_Hız_Puanı × 0.40) + (Stroop_Hız_Puanı × 0.35) + (AkilMantik_Hız_Puanı × 0.25)
```

### D) GÖRSEL İŞLEME SKORU = 100%
```sql
Katkı Kaynakları:
- Puzzle Testi: %50 (Ana kaynak - Görsel-uzamsal işleme)
- Akıl-Mantık Testi: %30 (Görsel örüntü tanıma)
- Hafıza Testi: %20 (Görsel hafıza)

Hesaplama Formülü:
Gorsel_Isleme = (Puzzle_Puanı × 0.50) + (AkilMantik_Gorsel_Puanı × 0.30) + (Hafiza_Gorsel_Puanı × 0.20)
```

### E) AKIL VE MANTIK YÜRÜTME SKORU = 100%
```sql
Katkı Kaynakları:
- Akıl-Mantık Testi: %75 (Ana kaynak)
  - Analitik Düşünme: %40
  - Soyut Düşünme: %35
- Puzzle Testi: %25 (Problem çözme)

Hesaplama Formülü:
AkilMantik_Skoru = (AkilMantik_Test_Puanı × 0.75) + (Puzzle_Problem_Puanı × 0.25)
```

### F) BİLİŞSEL ESNEKLİK SKORU = 100%
```sql
Katkı Kaynakları:
- Stroop Testi: %40 (Çelişki yönetimi)
- Puzzle Testi: %35 (Alternatif çözüm arayışı)
- Akıl-Mantık Testi: %25 (Zihinsel set değişimi)

Hesaplama Formülü:
Bilissel_Esneklik = (Stroop_Esneklik_Puanı × 0.40) + (Puzzle_Esneklik_Puanı × 0.35) + (AkilMantik_Esneklik_Puanı × 0.25)
```

---

## 📈 3. NORMALİZASYON VE STANDART SKOR SİSTEMİ

### A) Ham Puanların Normalize Edilmesi:
```sql
-- Her test için yaş gruplarına göre norm değerleri
Norm_Degerleri:
- yas_grubu (18-25, 26-35, 36-45, 46-55, 55+)
- test_adi
- ortalama_puan
- standart_sapma
- yuzdelik_dilimler (P10, P25, P50, P75, P90)

-- Z-Skor hesaplama:
Z_Skor = (Ham_Puan - Yas_Grubu_Ortalamasi) / Standart_Sapma

-- Yüzdelik dilime çevirme:
Yuzdelik = NORM_DIST(Z_Skor) × 100
```

### B) Ağırlıklı Skor Hesaplama:
```sql
CREATE VIEW BeceriSkorlari AS
SELECT 
    kullanici_id,
    oturum_id,
    
    -- 1. Dikkat ve Odaklanma
    ROUND(
        (dikkat_normalize_puan * 0.60) + 
        (stroop_normalize_puan * 0.25) + 
        (puzzle_konsantrasyon_puan * 0.15), 2
    ) AS dikkat_odaklanma_skoru,
    
    -- 2. Hafıza Becerisi
    ROUND(
        (hafiza_normalize_puan * 0.80) + 
        (puzzle_hafiza_puan * 0.20), 2
    ) AS hafiza_skoru,
    
    -- 3. İşleme Hızı
    ROUND(
        (dikkat_hiz_puan * 0.40) + 
        (stroop_hiz_puan * 0.35) + 
        (akil_mantik_hiz_puan * 0.25), 2
    ) AS isleme_hizi_skoru,
    
    -- 4. Görsel İşleme
    ROUND(
        (puzzle_gorsel_puan * 0.50) + 
        (akil_mantik_gorsel_puan * 0.30) + 
        (hafiza_gorsel_puan * 0.20), 2
    ) AS gorsel_isleme_skoru,
    
    -- 5. Akıl ve Mantık Yürütme
    ROUND(
        (akil_mantik_normalize_puan * 0.75) + 
        (puzzle_problem_puan * 0.25), 2
    ) AS akil_mantik_skoru,
    
    -- 6. Bilişsel Esneklik
    ROUND(
        (stroop_esneklik_puan * 0.40) + 
        (puzzle_esneklik_puan * 0.35) + 
        (akil_mantik_esneklik_puan * 0.25), 2
    ) AS bilissel_esneklik_skoru
    
FROM BeceriPuanlari;
```

---

## 🔬 4. KALİTE KONTROL VE GÜVENİLİRLİK

### A) Veri Doğrulama Kuralları:
```sql
-- Test süresi kontrolü
CHECK (test_suresi BETWEEN min_sure AND max_sure)

-- Skor geçerlilik kontrolü  
CHECK (ham_skor >= 0 AND ham_skor <= maksimum_skor)

-- Tutarlılık kontrolü
CHECK (dogru_cevap_sayisi <= toplam_soru_sayisi)

-- Outlier tespiti (Z-skor > 3.5)
CHECK (ABS((ham_skor - ortalama) / standart_sapma) <= 3.5)
```

### B) Güvenilirlik Metrikleri:
```sql
CREATE TABLE GuvenilirlikMetrikleri (
    test_adi VARCHAR(50),
    cronbach_alpha DECIMAL(4,3),  -- İç tutarlılık
    test_retest_korelasyonu DECIMAL(4,3),  -- Kararlılık
    yapisal_gecerlilik DECIMAL(4,3),  -- Yapı geçerliliği
    guncelleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 5. RAPOR ÇIKTILARİ

### A) Bireysel Skor Raporu:
```sql
-- Her kullanıcı için 6 ana skor
SELECT 
    k.kullanici_kodu,
    bs.dikkat_odaklanma_skoru,
    bs.hafiza_skoru,
    bs.isleme_hizi_skoru,
    bs.gorsel_isleme_skoru,
    bs.akil_mantik_skoru,
    bs.bilissel_esneklik_skoru,
    -- Genel bilişsel skor (tüm skorların ortalaması)
    ROUND((bs.dikkat_odaklanma_skoru + bs.hafiza_skoru + 
           bs.isleme_hizi_skoru + bs.gorsel_isleme_skoru + 
           bs.akil_mantik_skoru + bs.bilissel_esneklik_skoru) / 6, 2) AS genel_bilissel_skor
FROM Kullanici k
JOIN BeceriSkorlari bs ON k.kullanici_id = bs.kullanici_id;
```

### B) Karşılaştırmalı Analiz:
```sql
-- Yaş grubu karşılaştırması
-- Eğitim seviyesi karşılaştırması  
-- Zaman içindeki değişim analizi
-- Korelasyon matrisi
```

---

## ⚙️ 6. SİSTEM ÖZELLİKLERİ

### A) Esneklik:
- **Formül Değiştirilebilirlik**: Ağırlık yüzdeleri kolayca güncellenebilir
- **Norm Güncellemeleri**: Yaş grubu normları periyodik güncellenebilir
- **Test Ekleme**: Yeni testler sistem bozulmadan eklenebilir

### B) Şeffaflık:
- **Hesaplama İzlenebilirliği**: Her skorun nasıl hesaplandığı görülebilir
- **Sürüm Kontrolü**: Formül değişiklikleri tarihçesi tutulur
- **Kalite Raporları**: Güvenilirlik metrikleri sürekli izlenir

### C) Performans:
- **İndekslenmiş Tablolar**: Hızlı sorgular için optimizasyon
- **Görünüm (View) Kullanımı**: Karmaşık hesaplamalar otomatik
- **Cache Mekanizması**: Sık kullanılan hesaplamalar önbelleklenir

---

## 🎯 7. UYGULAMA STRATEJİSİ

### Aşama 1: Temel Altyapı
1. Ham veri tablolarını oluştur
2. Norm değerlerini hesapla ve kaydet
3. Temel hesaplama fonksiyonlarını yaz

### Aşama 2: Skor Hesaplama
1. Her test için alt skorları hesapla
2. 6 ana skor kategorisini hesapla
3. Kalite kontrol mekanizmalarını aktive et

### Aşama 3: Test ve Optimizasyon
1. Güvenilirlik testleri yap
2. Performans optimizasyonu
3. Rapor şablonlarını oluştur

Bu sistem, bilimsel standartlara uygun, esnek ve sürdürülebilir bir skorlama altyapısı sağlar. 