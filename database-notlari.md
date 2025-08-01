# Database Notları

## Students Tablosu Düzeltmesi
- **Sorun**: Students sayfası sadece `users` tablosundan veri çekiyordu
- **Çözüm**: `users` ve `students` tablolarını JOIN ile birleştirdik
- **Alan eşleştirmeleri**:
  - `birth_date` → `date_of_birth`
  - `school_name` → `school`
  - `student_number`, `parent_*` alanları kaldırıldı

## TrainerAddStudentModal Geliştirmesi
- Öğrenci detay bilgileri formu eklendi
- `students` tablosuna eksiksiz veri yazılıyor
- Doğum tarihi, sınıf, okul, notlar eklenebiliyor

## Dikkat Testi - Supabase Veri Yapısı

### Test Yapısı
- **3 Bölüm**: Section1 (1-13), Section2 (14-30), Section3 (31-50)
- **50 Ana Soru** + 5 Pratik Soru
- **Soru Tipleri**: `s` (sayı), `h` (harf), `s/h` (karma)
- **Süre**: Pratik 30sn, Ana test 180sn

### Supabase'e Kaydedilecek Veriler

#### Temel Sonuçlar
- `practiceScore` / `practiceTotal` (pratik test)
- `mainScore` / `mainTotal` (ana test)
- `accuracyScore` (doğruluk yüzdesi)
- `speedScore` (hız puanı)
- `averageReactionTime` (ortalama tepki süresi)
- `testDuration` (toplam süre)
- `completedAt` (tamamlanma zamanı)
- `incompleteAtQuestion` (yarıda kalma noktası)

#### Bölüm Bazlı Analiz
- Her bölüm için: `correctCount`, `wrongCount`, `accuracy`, `duration`, `averageTimePerQuestion`

#### Soru Türü Bazlı Analiz
- **Sayı Soruları**: doğru/yanlış sayısı, başarı oranı
- **Harf Soruları**: doğru/yanlış sayısı, başarı oranı
- **Karma Sorular**: doğru/yanlış sayısı, başarı oranı

#### Detay Veriler
- `questionDetails[]`: Her soru için seçim, doğru cevap, tepki süresi, timestamp
- `wrongSelections[]`: Yanlış seçimlerin detayları
- `reactionTimes[]`: Tüm tepki süreleri dizisi

#### Güvenlik Kayıtları
- **Periyodik Kayıt**: Her 10 saniyede otomatik kayıt
- **Acil Durum Kayıt**: Sayfa kapanırsa veri kaybı önleme
- **Otomatik Kayıt**: Tab değişimi/minimize durumunda

## 🎯 EN BASİT DİKKAT TESTİ TABLOSU

### attention_test_results (Excel Uyumlu)
```sql
CREATE TABLE attention_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Test Temel Bilgileri
  test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  test_end_time TIMESTAMP WITH TIME ZONE,
  test_duration_seconds INTEGER,
  completion_status TEXT DEFAULT 'completed', -- 'completed', 'incomplete'
  
  -- Ham Veri (Excel Sütun 1)
  total_questions_attempted INTEGER DEFAULT 0, -- Kaç soru cevaplanmış
  total_correct_answers INTEGER DEFAULT 0,     -- Toplam doğru sayısı
  total_wrong_answers INTEGER DEFAULT 0,       -- Toplam yanlış sayısı
  
  -- Doğruluk Skoru (Excel Sütun 2) 
  accuracy_percentage DECIMAL(5,2), -- Doğru/Toplam * 100
  
  -- İşlem Hızı (Excel Sütun 3)
  speed_score DECIMAL(5,2), -- Hız puanı
  
  -- İşlem Hızı Skoru (Excel Sütun 4) 
  processing_speed_score DECIMAL(5,2), -- İşlem hızı skoru
  
  -- 1. BÖLÜM (Soru 1-13)
  section1_correct INTEGER DEFAULT 0,
  section1_total INTEGER DEFAULT 13,
  section1_accuracy DECIMAL(5,2),
  
  -- 2. BÖLÜM (Soru 14-30) 
  section2_correct INTEGER DEFAULT 0,
  section2_total INTEGER DEFAULT 17,
  section2_accuracy DECIMAL(5,2),
  
  -- 3. BÖLÜM (Soru 31-50)
  section3_correct INTEGER DEFAULT 0,
  section3_total INTEGER DEFAULT 20,
  section3_accuracy DECIMAL(5,2),
  
  -- TÜM BÖLÜM Özeti (Excel'deki genel hesaplamalar)
  overall_correct INTEGER DEFAULT 0,     -- Tüm bölümlerden toplam doğru
  overall_total INTEGER DEFAULT 50,      -- Toplam soru sayısı
  overall_accuracy DECIMAL(5,2),         -- Genel başarı oranı
  
  -- SORU TİPİ BAZLI ANALİZ (s, h, h/s)
  -- Sayı Soruları (s)
  number_questions_correct INTEGER DEFAULT 0,   -- Sayı sorularında doğru
  number_questions_total INTEGER DEFAULT 0,     -- Toplam sayı sorusu
  number_questions_accuracy DECIMAL(5,2),       -- Sayı soruları başarı oranı
  
  -- Harf Soruları (h)
  letter_questions_correct INTEGER DEFAULT 0,   -- Harf sorularında doğru
  letter_questions_total INTEGER DEFAULT 0,     -- Toplam harf sorusu  
  letter_questions_accuracy DECIMAL(5,2),       -- Harf soruları başarı oranı
  
  -- Karma Sorular (h/s)
  mixed_questions_correct INTEGER DEFAULT 0,    -- Karma sorularda doğru
  mixed_questions_total INTEGER DEFAULT 0,      -- Toplam karma soru
  mixed_questions_accuracy DECIMAL(5,2),        -- Karma sorular başarı oranı
  
  -- Detaylı Cevaplar (JSONB - Basit)
  detailed_answers JSONB, -- Her sorunun cevabı ve doğru/yanlış bilgisi
  
  -- Zaman damgaları
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Temel İndeksler
CREATE INDEX idx_attention_student_id ON attention_test_results(student_id);
CREATE INDEX idx_attention_start_time ON attention_test_results(test_start_time);
CREATE INDEX idx_attention_accuracy ON attention_test_results(accuracy_percentage);

-- Soru tipi bazlı indeksler
CREATE INDEX idx_attention_number_accuracy ON attention_test_results(number_questions_accuracy);
CREATE INDEX idx_attention_letter_accuracy ON attention_test_results(letter_questions_accuracy);
CREATE INDEX idx_attention_mixed_accuracy ON attention_test_results(mixed_questions_accuracy);

-- Güncelleme trigger'ı
CREATE TRIGGER update_attention_results_updated_at
BEFORE UPDATE ON attention_test_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### JSONB Yapısı (Basit)
```json
{
  "answers": [
    {"question": 1, "selected": "5", "correct": "5", "isCorrect": true, "section": 1, "type": "s"},
    {"question": 2, "selected": "k", "correct": "t", "isCorrect": false, "section": 1, "type": "h"},
    {"question": 3, "selected": "3", "correct": "3", "isCorrect": true, "section": 1, "type": "s"},
    {"question": 37, "selected": "ç17", "correct": "ç17", "isCorrect": true, "section": 3, "type": "h/s"},
    {"question": 47, "selected": "v52", "correct": "v52", "isCorrect": true, "section": 3, "type": "h/s"}
  ],
  "sectionSummary": {
    "section1": {"correct": 11, "total": 13, "accuracy": 84.62},
    "section2": {"correct": 14, "total": 17, "accuracy": 82.35},
    "section3": {"correct": 17, "total": 20, "accuracy": 85.00}
  },
  "questionTypeSummary": {
    "numberQuestions": {"correct": 18, "total": 21, "accuracy": 85.71},
    "letterQuestions": {"correct": 16, "total": 18, "accuracy": 88.89},
    "mixedQuestions": {"correct": 8, "total": 8, "accuracy": 100.00}
  }
}
```

### Veri Girişi Örneği
```sql
INSERT INTO attention_test_results (
  student_id,
  conducted_by,
  test_start_time,
  test_end_time,
  test_duration_seconds,
  total_questions_attempted,
  total_correct_answers,
  total_wrong_answers,
  accuracy_percentage,
  speed_score,
  processing_speed_score,
  section1_correct,
  section1_accuracy,
  section2_correct, 
  section2_accuracy,
  section3_correct,
  section3_accuracy,
  overall_correct,
  overall_accuracy,
  number_questions_correct,
  number_questions_total,
  number_questions_accuracy,
  letter_questions_correct,
  letter_questions_total,
  letter_questions_accuracy,
  mixed_questions_correct,
  mixed_questions_total,
  mixed_questions_accuracy,
  detailed_answers
) VALUES (
  'student-uuid-here',
  'teacher-uuid-here',
  '2025-01-28 10:00:00+03',
  '2025-01-28 10:03:00+03',
  180,
  47, -- 50 sorudan 47'si cevaplanmış
  42, -- 42 doğru
  5,  -- 5 yanlış
  89.36, -- 42/47 * 100
  75.5,  -- Hız puanı
  82.3,  -- İşlem hızı skoru
  11,    -- 1. bölüm doğru
  84.62, -- 11/13 * 100
  16,    -- 2. bölüm doğru
  94.12, -- 16/17 * 100
  15,    -- 3. bölüm doğru (20 sorudan sadece 17'si cevaplanmış)
  88.24, -- 15/17 * 100
  42,    -- Toplam doğru
  89.36, -- Genel başarı
  18,    -- Sayı sorularında doğru
  21,    -- Toplam sayı sorusu
  85.71, -- Sayı soruları başarısı (18/21 * 100)
  16,    -- Harf sorularında doğru  
  18,    -- Toplam harf sorusu
  88.89, -- Harf soruları başarısı (16/18 * 100)
  8,     -- Karma sorularda doğru
  8,     -- Toplam karma soru
  100.00, -- Karma sorular başarısı (8/8 * 100)
  '{"answers": [...], "sectionSummary": {...}, "questionTypeSummary": {...}}'::jsonb
);
```

### Excel Uyumluluk
✅ **Ham Veri**: `total_questions_attempted`, `total_correct_answers`
✅ **Doğruluk Skoru**: `accuracy_percentage` 
✅ **İşlem Hızı**: `speed_score`
✅ **İşlem Hızı Skoru**: `processing_speed_score`
✅ **Bölüm Bazlı**: `section1_accuracy`, `section2_accuracy`, `section3_accuracy`
✅ **Genel Başarı**: `overall_accuracy`
✅ **Soru Tipleri**: 
  - **s (Sayı)**: `number_questions_correct`, `number_questions_accuracy`
  - **h (Harf)**: `letter_questions_correct`, `letter_questions_accuracy`
  - **h/s (Karma)**: `mixed_questions_correct`, `mixed_questions_accuracy`

### Basit Sorgular
```sql
-- Öğrenci başarı durumu
SELECT 
  overall_correct,
  overall_total,
  overall_accuracy,
  speed_score
FROM attention_test_results 
WHERE student_id = 'uuid-here';

-- Bölüm performansları
SELECT 
  section1_accuracy,
  section2_accuracy,
  section3_accuracy
FROM attention_test_results;

-- En başarılı öğrenciler
SELECT student_id, overall_accuracy 
FROM attention_test_results 
WHERE overall_accuracy > 80
ORDER BY overall_accuracy DESC;

-- Soru tipi bazlı performans
SELECT 
  student_id,
  number_questions_accuracy as sayi_basari,
  letter_questions_accuracy as harf_basari,
  mixed_questions_accuracy as karma_basari
FROM attention_test_results;

-- Hangi soru tipinde zayıf öğrenciler
SELECT student_id, 
  CASE 
    WHEN number_questions_accuracy < 70 THEN 'Sayı sorularında zayıf'
    WHEN letter_questions_accuracy < 70 THEN 'Harf sorularında zayıf'
    WHEN mixed_questions_accuracy < 70 THEN 'Karma sorularda zayıf'
    ELSE 'Tüm alanlarda başarılı'
  END as zayif_alan
FROM attention_test_results;
``` 