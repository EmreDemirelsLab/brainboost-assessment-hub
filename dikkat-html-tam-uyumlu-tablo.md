# DİKKAT HTML - MİNİMALİZE EDİLMİŞ TABLO TASARIMI

## 🎯 Excel Verilerine Uygun Minimalize Tablo

### attention_test_results (Minimalize - Tekrar Yok)
```sql
CREATE TABLE attention_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- ===== TEMEL TEST BİLGİLERİ =====
  test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  test_end_time TIMESTAMP WITH TIME ZONE,
  test_duration_seconds INTEGER DEFAULT 0,           -- Test süresi (saniye)
  completion_status TEXT DEFAULT 'completed',        -- 'completed', 'incomplete'
  
  -- ===== EXCEL HAM VERİ (Ana Sonuçlar) =====
  total_questions_attempted INTEGER DEFAULT 0,       -- Kaç soru cevaplanmış
  total_correct_answers INTEGER DEFAULT 0,           -- Toplam doğru sayısı  
  accuracy_percentage DECIMAL(6,2) DEFAULT 0,        -- Doğruluk Skoru (%)
  speed_score DECIMAL(6,2) DEFAULT 0,                -- İşlem Hızı Skoru
  average_reaction_time INTEGER DEFAULT 0,           -- Ortalama tepki süresi (ms)
  
  -- ===== BÖLÜM BAZLI SONUÇLAR (3 Bölüm) =====
  section1_correct INTEGER DEFAULT 0,                -- 1. Bölüm doğru (1-13)
  section1_total INTEGER DEFAULT 13,                 -- 1. Bölüm toplam
  section1_accuracy DECIMAL(6,2) DEFAULT 0,          -- 1. Bölüm başarı %
  
  section2_correct INTEGER DEFAULT 0,                -- 2. Bölüm doğru (14-30)  
  section2_total INTEGER DEFAULT 17,                 -- 2. Bölüm toplam
  section2_accuracy DECIMAL(6,2) DEFAULT 0,          -- 2. Bölüm başarı %
  
  section3_correct INTEGER DEFAULT 0,                -- 3. Bölüm doğru (31-50)
  section3_total INTEGER DEFAULT 20,                 -- 3. Bölüm toplam  
  section3_accuracy DECIMAL(6,2) DEFAULT 0,          -- 3. Bölüm başarı %
  
  -- ===== SORU TİPİ BAZLI SONUÇLAR =====
  number_questions_correct INTEGER DEFAULT 0,        -- Sayı soruları doğru (s)
  number_questions_total INTEGER DEFAULT 0,          -- Sayı soruları toplam
  number_questions_accuracy DECIMAL(6,2) DEFAULT 0,  -- Sayı soruları başarı %
  
  letter_questions_correct INTEGER DEFAULT 0,        -- Harf soruları doğru (h)
  letter_questions_total INTEGER DEFAULT 0,          -- Harf soruları toplam
  letter_questions_accuracy DECIMAL(6,2) DEFAULT 0,  -- Harf soruları başarı %
  
  mixed_questions_correct INTEGER DEFAULT 0,         -- Karma sorular doğru (s/h)
  mixed_questions_total INTEGER DEFAULT 0,           -- Karma sorular toplam
  mixed_questions_accuracy DECIMAL(6,2) DEFAULT 0,   -- Karma sorular başarı %
  
  -- ===== DETAY VERİLER (Sadece Gerekli JSONB) =====
  detailed_answers JSONB,                            -- Her sorunun detaylı cevabı
  wrong_answers JSONB,                               -- Yanlış cevapların detayı
  reaction_times JSONB,                              -- Tüm tepki süreleri
  
  -- ===== METAVERİ =====
  notes TEXT,                                        -- Ek notlar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== İNDEKSLER (Sadece Gerekli) =====
CREATE INDEX idx_attention_student_id ON attention_test_results(student_id);
CREATE INDEX idx_attention_conducted_by ON attention_test_results(conducted_by);
CREATE INDEX idx_attention_test_date ON attention_test_results(test_start_time);
CREATE INDEX idx_attention_accuracy ON attention_test_results(accuracy_percentage);
CREATE INDEX idx_attention_speed ON attention_test_results(speed_score);

-- JSONB indeks (detaylı analiz için)
CREATE INDEX idx_attention_detailed_answers ON attention_test_results USING gin(detailed_answers);

-- Güncelleme trigger'ı
CREATE TRIGGER update_attention_test_results_updated_at
BEFORE UPDATE ON attention_test_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## ⚠️ HTML FONKSİYON ↔ DATABASE FIELD UYUMSUZLUKLARI

### 🔴 UYUMSUZ ALANLAR (Mapping Gerekli)

| HTML Fonksiyon Çıktısı | Database Field | Durum |
|------------------------|----------------|-------|
| `basicStats.practiceScore` | ❌ YOK | Minimalizasyonda çıkarıldı |
| `basicStats.practiceTotal` | ❌ YOK | Minimalizasyonda çıkarıldı |
| `basicStats.mainScore` | `total_correct_answers` | ❌ İsim farklı |
| `basicStats.mainTotal` | `total_questions_attempted` | ❌ İsim farklı |
| `rawData.accuracyScore` | `accuracy_percentage` | ❌ İsim farklı |
| `basicStats.testDuration` | `test_duration_seconds` | ❌ İsim farklı + birim |
| `sections.section1.correctCount` | `section1_correct` | ❌ İsim farklı |
| `sections.section1.wrongCount` | ❌ YOK | Minimalizasyonda çıkarıldı |
| `sections.section1.totalCount` | `section1_total` | ❌ İsim farklı |
| `testState.mainAnswers` | `detailed_answers` | ❌ İsim farklı |
| `testState.wrongSelections` | `wrong_answers` | ❌ İsim farklı |
| `testState.reactionTimes` | `reaction_times` | ❌ İsim farklı |

### ✅ UYUMLU ALANLAR

| HTML Fonksiyon Çıktısı | Database Field | Durum |
|------------------------|----------------|-------|
| `rawData.speedScore` | `speed_score` | ✅ Uyumlu |
| `basicStats.averageReactionTime` | `average_reaction_time` | ✅ Uyumlu |
| `sections.section1.accuracy` | `section1_accuracy` | ✅ Uyumlu |
| `sections.section2.accuracy` | `section2_accuracy` | ✅ Uyumlu |
| `sections.section3.accuracy` | `section3_accuracy` | ✅ Uyumlu |
| `questionTypes.numberQuestions.correct` | `number_questions_correct` | ✅ Uyumlu |
| `questionTypes.numberQuestions.accuracy` | `number_questions_accuracy` | ✅ Uyumlu |
| `questionTypes.letterQuestions.correct` | `letter_questions_correct` | ✅ Uyumlu |
| `questionTypes.letterQuestions.accuracy` | `letter_questions_accuracy` | ✅ Uyumlu |
| `questionTypes.mixedQuestions.correct` | `mixed_questions_correct` | ✅ Uyumlu |
| `questionTypes.mixedQuestions.accuracy` | `mixed_questions_accuracy` | ✅ Uyumlu |

## 🔧 JAVASCRIPT MAPPING FONKSİYONU GEREKLİ

```javascript
// HTML'den gelen veriyi Database formatına çevir
function mapHtmlToDatabase(htmlResults) {
  const { rawData, sections, questionTypes, errorDetails, questionDetails } = htmlResults;
  
  return {
    // Temel veriler - İsim mapping'i gerekli
    total_questions_attempted: rawData.mainTotal,        // mainTotal → total_questions_attempted  
    total_correct_answers: rawData.mainScore,            // mainScore → total_correct_answers
    accuracy_percentage: rawData.accuracyScore,          // accuracyScore → accuracy_percentage
    speed_score: rawData.speedScore,                     // speedScore → speed_score ✅
    average_reaction_time: rawData.averageReactionTime,  // averageReactionTime → average_reaction_time ✅
    test_duration_seconds: Math.round(rawData.testDuration / 1000), // ms → seconds
    
    // Bölüm verileri - İsim mapping'i gerekli
    section1_correct: sections.section1.correctCount,    // correctCount → section1_correct
    section1_total: sections.section1.totalCount,        // totalCount → section1_total
    section1_accuracy: sections.section1.accuracy,       // accuracy → section1_accuracy ✅
    
    section2_correct: sections.section2.correctCount,    // correctCount → section2_correct
    section2_total: sections.section2.totalCount,        // totalCount → section2_total
    section2_accuracy: sections.section2.accuracy,       // accuracy → section2_accuracy ✅
    
    section3_correct: sections.section3.correctCount,    // correctCount → section3_correct
    section3_total: sections.section3.totalCount,        // totalCount → section3_total
    section3_accuracy: sections.section3.accuracy,       // accuracy → section3_accuracy ✅
    
    // Soru tipi verileri - Uyumlu ✅
    number_questions_correct: questionTypes.numberQuestions.correct,     // ✅
    number_questions_total: questionTypes.numberQuestions.correct + questionTypes.numberQuestions.wrong,
    number_questions_accuracy: questionTypes.numberQuestions.accuracy,   // ✅
    
    letter_questions_correct: questionTypes.letterQuestions.correct,     // ✅
    letter_questions_total: questionTypes.letterQuestions.correct + questionTypes.letterQuestions.wrong,
    letter_questions_accuracy: questionTypes.letterQuestions.accuracy,   // ✅
    
    mixed_questions_correct: questionTypes.mixedQuestions.correct,       // ✅
    mixed_questions_total: questionTypes.mixedQuestions.correct + questionTypes.mixedQuestions.wrong,
    mixed_questions_accuracy: questionTypes.mixedQuestions.accuracy,     // ✅
    
    // JSONB veriler - İsim mapping'i gerekli
    detailed_answers: questionDetails,                   // questionDetails → detailed_answers
    wrong_answers: errorDetails.wrongSelections,        // wrongSelections → wrong_answers
    reaction_times: testState.reactionTimes             // reactionTimes → reaction_times
  };
}

// Kullanım örneği
const htmlResults = JSON.parse(localStorage.getItem('attentionTestResults'));
const databaseData = mapHtmlToDatabase(htmlResults);

// Supabase'e kaydet
const { data, error } = await supabase
  .from('attention_test_results')
  .insert(databaseData);
```

## 📊 Minimalize JSONB Yapıları

### detailed_answers JSONB (Soru Detayları)
```json
[
  {
    "question": 1,
    "content": ["5", "6", "2", "1", "5", "8"],
    "target": "5",
    "selected": "5",
    "correct": true,
    "type": "s",
    "section": 1,
    "reactionTime": 1205
  },
  {
    "question": 2,
    "content": ["m", "t", "k", "a", "t", "h"], 
    "target": "t",
    "selected": "k",
    "correct": false,
    "type": "h",
    "section": 1,
    "reactionTime": 1567
  }
]
```

### wrong_answers JSONB (Sadece Yanlışlar)
```json
[
  {
    "question": 2,
    "selectedWrong": "k",
    "correctAnswer": "t",
    "type": "h",
    "section": 1
  },
  {
    "question": 5,
    "selectedWrong": "3",
    "correctAnswer": "4", 
    "type": "s",
    "section": 1
  }
]
```

### reaction_times JSONB (Tepki Süreleri)
```json
[1205, 1567, 892, 2341, 1156, 1789, 1423, 1678, 1234, 1890]
```

## 🎯 Excel İle Tam Uyumluluk

### Excel → Database Eşleştirmesi
| Excel Sütunu | Database Alanı | Açıklama |
|--------------|----------------|----------|
| **Ham Veri** | `total_correct_answers` / `total_questions_attempted` | Doğru/Toplam |
| **Doğruluk Skoru** | `accuracy_percentage` | Başarı yüzdesi |
| **İşlem Hızı** | `average_reaction_time` | Ortalama tepki süresi |
| **İşlem Hızı Skoru** | `speed_score` | Hız puanı |
| **1.BÖLÜM** | `section1_correct` / `section1_accuracy` | 1-13 sorular |
| **2.BÖLÜM** | `section2_correct` / `section2_accuracy` | 14-30 sorular |
| **3.BÖLÜM** | `section3_correct` / `section3_accuracy` | 31-50 sorular |
| **TÜM BÖLÜM** | `total_correct_answers` / `accuracy_percentage` | Genel başarı |

### Soru Tipi Eşleştirmesi
| Soru Kodu | Database Alanı | Açıklama |
|-----------|----------------|----------|
| **s** | `number_questions_*` | Sayı soruları (5-6-2-1-5-8) |
| **h** | `letter_questions_*` | Harf soruları (m-t-k-a-t-h) |
| **s/h** | `mixed_questions_*` | Karma sorular (7ç1-ç71-ç17) |

## 💾 Basit Veri Girişi Örneği

```sql
INSERT INTO attention_test_results (
  student_id,
  conducted_by,
  test_start_time,
  test_end_time,
  test_duration_seconds,
  total_questions_attempted,
  total_correct_answers,
  accuracy_percentage,
  speed_score,
  average_reaction_time,
  section1_correct,
  section1_accuracy,
  section2_correct,
  section2_accuracy, 
  section3_correct,
  section3_accuracy,
  number_questions_correct,
  number_questions_total,
  number_questions_accuracy,
  letter_questions_correct,
  letter_questions_total,
  letter_questions_accuracy,
  mixed_questions_correct,
  mixed_questions_total,
  mixed_questions_accuracy,
  detailed_answers,
  wrong_answers,
  reaction_times
) VALUES (
  'student-uuid-here',
  'teacher-uuid-here',
  '2025-01-28 10:00:00+03',
  '2025-01-28 10:03:00+03',
  180,                    -- 3 dakika
  47,                     -- 47 soru cevaplanmış
  42,                     -- 42 doğru
  89.36,                  -- %89.36 başarı
  75.50,                  -- Hız puanı
  1247,                   -- 1247ms ortalama tepki
  11, 84.62,              -- 1. bölüm: 11/13, %84.62
  16, 94.12,              -- 2. bölüm: 16/17, %94.12
  15, 88.24,              -- 3. bölüm: 15/17, %88.24
  18, 21, 85.71,          -- Sayı: 18/21, %85.71
  16, 18, 88.89,          -- Harf: 16/18, %88.89
  8, 8, 100.00,           -- Karma: 8/8, %100
  '[{"question":1,"selected":"5","correct":true,...}]'::jsonb,
  '[{"question":2,"selectedWrong":"k","correctAnswer":"t",...}]'::jsonb,
  '[1205,1567,892,2341,1156,1789,...]'::jsonb
);
```

## 🔍 Basit Sorgular

```sql
-- Öğrenci genel performansı
SELECT 
  total_correct_answers,
  total_questions_attempted,
  accuracy_percentage,
  speed_score
FROM attention_test_results 
WHERE student_id = 'uuid-here';

-- Bölüm bazlı performans
SELECT 
  section1_accuracy as "1.Bölüm",
  section2_accuracy as "2.Bölüm", 
  section3_accuracy as "3.Bölüm"
FROM attention_test_results
WHERE student_id = 'uuid-here';

-- Soru tipi performansı
SELECT
  number_questions_accuracy as "Sayı Soruları",
  letter_questions_accuracy as "Harf Soruları",
  mixed_questions_accuracy as "Karma Sorular"
FROM attention_test_results
WHERE student_id = 'uuid-here';

-- En başarılı öğrenciler
SELECT 
  student_id,
  total_correct_answers,
  accuracy_percentage,
  speed_score
FROM attention_test_results 
WHERE accuracy_percentage > 80
ORDER BY accuracy_percentage DESC;
```

## ✅ MİNİMALİZASYON SONUCU

### Öncesi: 83 alan
### Sonrası: 30 alan (%64 azalma)

### Çıkarılan Tekrarlı Veriler:
❌ `rawData.*` ve `excelSummary.*` çakışmaları
❌ Aynı verinin farklı formatlardaki kopyaları  
❌ Gereksiz `_name` alanları
❌ Çoklu `duration` alanları
❌ Gereksiz `completed` boolean'ları
❌ Karmaşık metadata alanları

### Tutulan Önemli Veriler:
✅ **Excel'deki tüm sütunlar** karşılanıyor
✅ **3 bölüm performansı** ayrı ayrı
✅ **3 soru tipi performansı** ayrı ayrı  
✅ **Detaylı analiz** için JSONB veriler
✅ **Hızlı sorgular** için indeksler

## ⚠️ SONUÇ: MAPPING FONKSİYONU GEREKLİ
**HTML fonksiyon çıktıları ile database field isimleri %50 uyumlu. JavaScript mapping fonksiyonu ile dönüştürme şart!** 