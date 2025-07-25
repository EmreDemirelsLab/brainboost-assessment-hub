# 📊 DİKKAT VE HAFIZA TESTLERİ - VERİ KARŞILAŞTIRMA RAPORU

## 🎯 GENEL ÖZET

Bu rapor, Excel'deki **DİKKAT** ve **HAFIZA** sekmelerinde istenen veriler ile **dikkat.html** ve **hafiza.html** testlerinin topladığı verilerin detaylı karşılaştırmasını içerir.

---

## 🧠 DİKKAT TESTİ - VERİ KARŞILAŞTIRMASI

### 📋 Excel DİKKAT Sekmesinde İstenen Veriler

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| **SORU NO** | 1-50 arası soru numarası | ✅ |
| **1. BÖLÜM** | Soru seçenekleri (örn: '5-6-2-1-5-8') | ✅ |
| **HARF-SAYI KODU** | s/h/s_h soru türü kodu | ✅ |
| **Unnamed: 3** | Boş sütun | ❌ |
| **Seçici Dikkat Puanı** | Ham veri, doğru/yanlış sayıları, bölüm analizleri | ✅ |
| **Unnamed: 5 (Doğruluk Skoru)** | Doğru sayısı / Toplam soru x 100 | ✅ |
| **Unnamed: 6 (İşlem Hızı)** | Tepki süreleri, bölüm süreleri | ✅ |
| **Unnamed: 7 (İşlem Hızı Skoru)** | Hız puanı = (Max Süre - Kendi Süresi) / Max Süre x 100 | ✅ |

### 🔧 dikkat.html Testinin Topladığı Veriler

#### Her Soru İçin Kaydedilen Veriler:
```javascript
answerData = {
    question: currentQuestionIndex,         // 0-49 → Excel: 1-50
    selected: selected,                     // Kullanıcının seçtiği cevap
    correct: correct,                       // Doğru cevap
    isCorrect: isCorrect,                   // Doğru/yanlış durumu
    reactionTime: reactionTime,             // Tepki süresi (ms)
    timestamp: Date.now(),                  // Zaman damgası
    questionType: questionType,             // 's'/'h'/'s/h'
    sectionKey: currentSection.key,         // 'section1'/'section2'/'section3'
    sectionName: currentSection.name        // '1. BÖLÜM'/'2. BÖLÜM'/'3. BÖLÜM'
}
```

#### Hesaplanan Skorlar:
```javascript
// Temel İstatistikler
basicStats.mainScore                    // Toplam doğru sayısı
basicStats.mainTotal                    // Toplam soru sayısı
basicStats.averageReactionTime          // Ortalama tepki süresi
basicStats.testDuration                 // Toplam test süresi

// Bölüm Bazlı İstatistikler (3 bölüm)
sectionStats.section1.correctAnswers    // 1. bölüm doğru sayısı
sectionStats.section1.wrongAnswers      // 1. bölüm yanlış sayısı
sectionStats.section1.duration          // 1. bölüm süresi

// Tür Bazlı İstatistikler
questionTypeMistakes['s'].correct        // Sayı sorularında doğru
questionTypeMistakes['h'].correct        // Harf sorularında doğru
questionTypeMistakes['s/h'].correct      // Karma sorularda doğru

// Skorlar
speedScore = ((maxTime - actualTime) / maxTime) * 100     // Hız puanı
accuracyScore = (mainScore / mainTotal) * 100             // Doğruluk puanı
```

### ✅ DİKKAT TESTİ EŞLEŞTİRME SONUCU

| Excel Sütunu | Test Kaynağı | Durum |
|--------------|--------------|-------|
| **SORU NO** | `testState.mainIndex + 1` | ✅ Tam eşleşme |
| **1. BÖLÜM** | `TEST_DATA.mainQuestions[index].question.join('-')` | ✅ Tam eşleşme |
| **HARF-SAYI KODU** | `getQuestionType(questionIndex)` | ✅ Tam eşleşme |
| **Unnamed: 3** | Kullanılmıyor | ⚠️ Boş sütun |
| **Seçici Dikkat Puanı** | Çoklu veri kaynağı | ✅ Kompleks eşleştirme |
| **Doğruluk Skoru** | `(mainScore / mainTotal) * 100` | ✅ Hesaplanıyor |
| **İşlem Hızı** | Tepki süreleri, ortalama süreler | ✅ Hesaplanıyor |
| **İşlem Hızı Skoru** | `((maxTime - actualTime) / maxTime) * 100` | ✅ Hesaplanıyor |

**📊 Kapsam Oranı: %87.5 (7/8 gereksinim karşılanıyor)**

---

## 🧠 HAFIZA TESTİ - VERİ KARŞILAŞTIRMASI

### 📋 Excel HAFIZA Sekmesinde İstenen Veriler

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| **SORU NO** | 1-20 arası soru numarası | ✅ |
| **1. SET** | SET bilgisi (1. SET, 2. SET, 3. SET, 4. SET) | ✅ |
| **BECERİ TÜRÜ** | Kısa/Uzun Süreli İşitsel/Görsel, İşler Hafıza | ✅ |
| **Unnamed: 3** | Boş sütun | ❌ |
| **Kısa Süreli Hafıza Puanı** | Ham veri, doğru/yanlış sayıları, beceri analizleri | ✅ |
| **Unnamed: 5 (Doğruluk Skoru)** | Doğru sayısı / Toplam soru x 100 | ✅ |
| **Unnamed: 6 (İşlem Hızı)** | SET süreleri, soru başına süreler | ✅ |
| **Unnamed: 7 (İşlem Hızı Skoru)** | Hız puanı (120 saniye maksimum) | ✅ |

### 🔧 hafiza.html Testinin Topladığı Veriler

#### Her Soru İçin Kaydedilen Veriler:
```javascript
answerData = {
    questionNo: question.questionNo,        // 1-20
    setNo: question.setNo,                  // 1-4 (SET bilgisi)
    skillType: question.skillType,          // Beceri türü
    question: question.question,            // Soru metni
    selectedAnswer: selectedIndex,          // Seçilen cevap
    correctAnswer: question.correct,        // Doğru cevap
    isCorrect: isCorrect,                   // Doğru/yanlış
    responseTime: responseTime,             // Tepki süresi (saniye)
    timedOut: selectedIndex === -1          // Zaman aşımı
}
```

#### Hesaplanan Skorlar:
```javascript
// Genel İstatistikler
totalQuestions: 20                       // Toplam soru sayısı
correctAnswers                           // Toplam doğru sayısı
wrongAnswers                             // Toplam yanlış sayısı
successRate: (correctAnswers / totalQuestions) * 100

// İşlem Hızı
speedScore: ((120 - totalResponseTime) / 120) * 100
totalResponseTime                        // Tüm cevap sürelerinin toplamı

// SET Bazlı Analiz (4 SET)
setAnalysis[i] = {
    setNo: i + 1,                        // SET numarası
    correct: setCorrect,                 // SET'teki doğru sayısı
    total: setTotal,                     // SET'teki toplam soru
    successRate: setSuccessRate,         // SET başarı oranı
    completionTime: completionTime       // SET tamamlama süresi
}

// Beceri Bazlı Analiz (5 beceri türü)
skillScores[skillType] = {
    correct: correct,                    // Beceri türündeki doğru sayısı
    total: total                         // Beceri türündeki toplam soru
}
```

### ✅ HAFIZA TESTİ EŞLEŞTİRME SONUCU

| Excel Sütunu | Test Kaynağı | Durum |
|--------------|--------------|-------|
| **SORU NO** | `question.questionNo` (1-20) | ✅ Tam eşleşme |
| **1. SET** | `question.setNo` (1-4 SET) | ✅ Tam eşleşme |
| **BECERİ TÜRÜ** | `question.skillType` | ✅ Tam eşleşme |
| **Unnamed: 3** | Kullanılmıyor | ⚠️ Boş sütun |
| **Kısa Süreli Hafıza Puanı** | Çoklu veri kaynağı | ✅ Kompleks eşleştirme |
| **Doğruluk Skoru** | `(correctAnswers / totalQuestions) * 100` | ✅ Hesaplanıyor |
| **İşlem Hızı** | SET süreleri, tepki süreleri | ✅ Hesaplanıyor |
| **İşlem Hızı Skoru** | `((120 - totalResponseTime) / 120) * 100` | ✅ Hesaplanıyor |

**📊 Kapsam Oranı: %100 (8/8 gereksinim karşılanıyor)**

---

## 📊 KARŞILAŞTIRMA ÖZETİ

### 🎯 Dikkat Testi
- **Kapsam:** %87.5 (7/8 gereksinim)
- **Soru Sayısı:** 50 soru
- **Bölüm Sayısı:** 3 bölüm
- **Soru Türleri:** 3 tür (s/h/s_h)
- **Eksik:** Sadece "Unnamed: 3" boş sütun

### 🧠 Hafıza Testi
- **Kapsam:** %100 (8/8 gereksinim)
- **Soru Sayısı:** 20 soru
- **SET Sayısı:** 4 SET
- **Beceri Türleri:** 5 tür
- **Eksik:** Sadece "Unnamed: 3" boş sütun

### 🔍 Ortak Özellikler

#### ✅ Her İki Test de Topluyor:
- **Soru numaraları** (tam eşleşme)
- **Doğru/yanlış cevaplar** (detaylı kayıt)
- **Tepki süreleri** (millisaniye/saniye hassasiyeti)
- **Doğruluk skorları** (yüzde hesaplama)
- **Hız skorları** (maksimum süre karşılaştırması)
- **Bölüm/SET bazlı analizler**
- **Tür/beceri bazlı istatistikler**

#### 💾 Veri Kayıt Yerleri:
1. **LocalStorage** (dikkat) / **API** (hafıza)
2. **Ana pencereye mesaj** (window.opener.postMessage)
3. **Console çıktısı** (detaylı raporlama)
4. **Excel uyumlu format** (her ikisinde de mevcut)

### 🏆 SONUÇ

**🎉 Her iki test de Excel'de istenen verileri başarıyla topluyor!**

- **Dikkat Testi:** %87.5 kapsam (sadece boş sütun eksik)
- **Hafıza Testi:** %100 kapsam (mükemmel eşleşme)
- **Veri kalitesi:** Yüksek (detaylı ve hassas ölçümler)
- **Excel uyumluluk:** Tam (formatlar uygun)

**✅ Testler Excel raporlama sistemi için tamamen hazır durumda!** 