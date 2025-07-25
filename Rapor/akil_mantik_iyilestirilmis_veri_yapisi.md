# AKIL MANTIK TESTİ - İYİLEŞTİRİLMİŞ VERİ YAPISI

## 🎯 YAPILAN İYİLEŞTİRMELER

### ✅ 1. Bölüm İsimlerinin Eklenmesi
**Önceki Yapı:**
```javascript
sectionResults: {
    1: { correct: 0, total: 8, time: 0 }
}
```

**Yeni Yapı:**
```javascript
sectionResults: {
    1: { 
        name: "Dörtlü Yatay Format",
        correct: 0, 
        total: 8, 
        time: 0,
        accuracy_percentage: 0,
        avg_response_time_per_question: 0,
        responses: []
    }
}
```

### ✅ 2. Bölüm Bazlı Yüzdelik Hesaplamaları
Her bölüm için otomatik hesaplanan:
- **accuracy_percentage:** Doğruluk yüzdesi (correct/total * 100)
- **avg_response_time_per_question:** Bölümdeki ortalama tepki süresi

### ✅ 3. İstatistiksel Veriler (Min/Max Tepki Süreleri)
```javascript
detailed_statistics: {
    // Genel istatistikler
    total_responses: number,
    fastest_response: seconds,
    slowest_response: seconds,
    median_response_time: seconds,
    
    // Doğru cevap istatistikleri
    fastest_correct_response: seconds,
    slowest_correct_response: seconds,
    avg_correct_response_time: seconds,
    
    // Yanlış cevap istatistikleri
    fastest_wrong_response: seconds,
    slowest_wrong_response: seconds,
    avg_wrong_response_time: seconds,
    
    // Ham veri
    questions_attempted: number,
    questions_skipped: number,
    correct_count: number,
    wrong_count: number
}
```

### ✅ 4. Gelişmiş Dürtüsellik Analizi
```javascript
impulsivity_analysis: {
    fast_wrong_answers: number,
    very_fast_wrong_answers: number,
    fast_response_threshold: 2, // saniye
    very_fast_response_threshold: 1, // saniye
    impulsivity_score: percentage,
    warning_triggered: boolean,
    severe_warning: boolean,
    fast_wrong_details: [
        {
            questionNo: number,
            section: number,
            responseTime: seconds,
            selectedAnswer: number,
            correctAnswer: number
        }
    ]
}
```

---

## 📊 GÜNCEL VERİ YAPISI - TAM LİSTE

### A) Genel Test Verileri
```javascript
{
    testType: 'Akil_Mantik_Testi',
    learnworlds_user_id: string,
    learnworlds_user_email: string,
    learnworlds_user_name: string,
    course_id: string,
    lesson_id: string,
    
    // Test zamanları
    test_start_time: timestamp,
    test_end_time: timestamp,
    test_elapsed_time_seconds: number,
    
    // Genel sonuçlar
    total_questions: 23,
    answered_questions: number,
    correct_answers: number,
    wrong_answers: number,
    unanswered_questions: number,
    success_rate: percentage
}
```

### B) İşlem Hızı Verileri
```javascript
{
    speed_score: percentage, // ((300 - totalTime) / 300) * 100
    avg_response_time: seconds,
    total_response_time: seconds
}
```

### C) Bölüm Bazlı Sonuçlar (İyileştirilmiş)
```javascript
section_results: {
    1: { 
        name: "Dörtlü Yatay Format",
        correct: number, 
        total: 8, 
        time: seconds,
        accuracy_percentage: percentage,
        avg_response_time_per_question: seconds,
        responses: [responseTime1, responseTime2, ...]
    },
    2: { 
        name: "Dörtlü Kare Format",
        correct: number, 
        total: 6, 
        time: seconds,
        accuracy_percentage: percentage,
        avg_response_time_per_question: seconds,
        responses: [responseTime1, responseTime2, ...]
    },
    3: { 
        name: "Altılı Kare Format",
        correct: number, 
        total: 3, 
        time: seconds,
        accuracy_percentage: percentage,
        avg_response_time_per_question: seconds,
        responses: [responseTime1, responseTime2, ...]
    },
    4: { 
        name: "L Format",
        correct: number, 
        total: 3, 
        time: seconds,
        accuracy_percentage: percentage,
        avg_response_time_per_question: seconds,
        responses: [responseTime1, responseTime2, ...]
    },
    5: { 
        name: "Dokuzlu Format",
        correct: number, 
        total: 3, 
        time: seconds,
        accuracy_percentage: percentage,
        avg_response_time_per_question: seconds,
        responses: [responseTime1, responseTime2, ...]
    }
}
```

### D) Detaylı Cevap Verileri (Değişiklik Yok)
```javascript
detailed_answers: [
    {
        questionNo: number,
        section: number,
        selectedAnswer: number,
        correctAnswer: number,
        isCorrect: boolean,
        responseTime: seconds,
        timestamp: timestamp
    }
]
```

### E) Örnek Test Verileri (Değişiklik Yok)
```javascript
{
    example_attempts: number,
    example_correct_count: number
}
```

### F) Gelişmiş İstatistiksel Analiz (YENİ)
```javascript
detailed_statistics: {
    // Genel istatistikler
    total_responses: number,
    fastest_response: seconds,
    slowest_response: seconds,
    median_response_time: seconds,
    
    // Doğru cevap istatistikleri
    fastest_correct_response: seconds,
    slowest_correct_response: seconds,
    avg_correct_response_time: seconds,
    
    // Yanlış cevap istatistikleri
    fastest_wrong_response: seconds,
    slowest_wrong_response: seconds,
    avg_wrong_response_time: seconds,
    
    // Ham veri
    questions_attempted: number,
    questions_skipped: number,
    correct_count: number,
    wrong_count: number
}
```

### G) Gelişmiş Dürtüsellik Analizi (YENİ)
```javascript
impulsivity_analysis: {
    fast_wrong_answers: number,
    very_fast_wrong_answers: number,
    fast_response_threshold: 2, // saniye
    very_fast_response_threshold: 1, // saniye
    impulsivity_score: percentage,
    warning_triggered: boolean,
    severe_warning: boolean,
    fast_wrong_details: [
        {
            questionNo: number,
            section: number,
            responseTime: seconds,
            selectedAnswer: number,
            correctAnswer: number
        }
    ]
}
```

### H) Geriye Uyumluluk
```javascript
{
    impulsivity_warning: boolean, // Eski sistem için korundu
    last_question_reached: number
}
```

---

## 🔧 EXCEL İLE UYUMLULUK

### ✅ Excel'de İstenen Veriler → Kod Karşılığı

1. **"Doğru işaretlenen soru sayısı"** 
   → `correct_answers` + `section_results[x].correct`

2. **"Yanlış işaretlenen soru sayısı"** 
   → `wrong_answers` + `detailed_statistics.wrong_count`

3. **"Soru başına yanıtlama (tepki) süresi"** 
   → `detailed_answers[].responseTime` + `detailed_statistics.*_response_time`

4. **"Doğru Sayısı / Toplam Soru x 100"** 
   → `section_results[x].accuracy_percentage`

5. **"1. bölüm kaç saniyede bitti?"** 
   → `section_results[x].time`

6. **"Tüm bölüm 5 dakika (max süre: 300 saniye)"** 
   → `test_elapsed_time_seconds`

---

## 📈 AVANTAJLAR

### 🎯 Raporlama İçin:
- **Bölüm adları** artık açık şekilde görülüyor
- **Yüzdelik hesaplamalar** otomatik yapılıyor
- **Min/max değerler** performans analizi için mevcut
- **Medyan değerler** daha doğru ortalama analizi sağlıyor

### 🔍 Analiz İçin:
- **Dürtüsellik analizi** çok daha detaylı
- **Bölüm bazı performans** karşılaştırması kolay
- **Hız vs doğruluk** analizi mümkün
- **Öğrenme eğrisi** analizi için veri hazır

### 💾 Veri Kalitesi İçin:
- **Geriye uyumluluk** korundu
- **Veri bütünlüğü** artırıldı
- **Analiz derinliği** geliştirildi
- **Excel uyumluluğu** %100 korundu

---

## 🚀 SONUÇ

Akıl-Mantık testi artık:
- ✅ Excel'deki tüm veri gereksinimlerini karşılıyor
- ✅ Bölüm isimlerini açık şekilde kaydediyor
- ✅ Otomatik yüzdelik hesaplamaları yapıyor
- ✅ Detaylı istatistiksel analiz sağlıyor
- ✅ Gelişmiş dürtüsellik analizi sunuyor
- ✅ Geriye uyumluluğu koruyor

**Test artık Excel raporlama sistemine mükemmel uyumlu ve çok daha zengin veri sağlıyor!** 