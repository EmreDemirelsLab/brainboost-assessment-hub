-- 💾 MEMORY_TEST_RESULTS TABLOSU - Hafıza Testi İçin
-- Dikkat testindeki gibi tam Supabase entegrasyonu

CREATE TABLE memory_test_results (
    -- 🔑 Temel Kimlik Bilgileri (Dikkat Testindeki Gibi)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conducted_by UUID NOT NULL REFERENCES users(id),
    
    -- ⏱️ Zaman Bilgileri  
    test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    test_end_time TIMESTAMP WITH TIME ZONE,
    test_duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 📋 Test Durumu
    completion_status VARCHAR(50) DEFAULT 'completed' 
        CHECK (completion_status IN ('completed', 'incomplete', 'failed')),
    notes TEXT,
    
    -- 🎯 GENEL PERFORMANS (20 Soru)
    total_questions INTEGER NOT NULL DEFAULT 20,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    missed_answers INTEGER NOT NULL DEFAULT 0, -- Zaman aşımı
    accuracy_percentage DECIMAL(5,2),
    speed_score DECIMAL(5,2),
    total_response_time DECIMAL(8,3),
    average_response_time DECIMAL(6,3),
    
    -- 📊 EXCEL UYUMLULUK
    last_answered_question INTEGER, -- "Yetiştiremediğe kaçıncı soruda kaldı?"
    remaining_questions INTEGER,
    remaining_time_seconds INTEGER,
    
    -- 🔢 SET BAZLI ANALİZ (4 Set × 5 soru = 20)
    -- SET 1 (Soru 1-5)
    set1_correct INTEGER DEFAULT 0,
    set1_wrong INTEGER DEFAULT 0,
    set1_missed INTEGER DEFAULT 0,
    set1_accuracy DECIMAL(5,2),
    set1_completion_time_seconds INTEGER,
    
    -- SET 2 (Soru 6-10) 
    set2_correct INTEGER DEFAULT 0,
    set2_wrong INTEGER DEFAULT 0,
    set2_missed INTEGER DEFAULT 0,
    set2_accuracy DECIMAL(5,2),
    set2_completion_time_seconds INTEGER,
    
    -- SET 3 (Soru 11-15)
    set3_correct INTEGER DEFAULT 0,
    set3_wrong INTEGER DEFAULT 0,
    set3_missed INTEGER DEFAULT 0,
    set3_accuracy DECIMAL(5,2),
    set3_completion_time_seconds INTEGER,
    
    -- SET 4 (Soru 16-20)
    set4_correct INTEGER DEFAULT 0,
    set4_wrong INTEGER DEFAULT 0,
    set4_missed INTEGER DEFAULT 0,
    set4_accuracy DECIMAL(5,2),
    set4_completion_time_seconds INTEGER,
    
    -- 🧠 BECERİ TÜRÜ BAZLI PERFORMANS (5 Beceri)
    skill_kisa_sureli_isitsel_correct INTEGER DEFAULT 0,
    skill_kisa_sureli_isitsel_total INTEGER DEFAULT 0,
    skill_kisa_sureli_isitsel_accuracy DECIMAL(5,2),
    
    skill_kisa_sureli_gorsel_correct INTEGER DEFAULT 0,
    skill_kisa_sureli_gorsel_total INTEGER DEFAULT 0,
    skill_kisa_sureli_gorsel_accuracy DECIMAL(5,2),
    
    skill_uzun_sureli_isitsel_correct INTEGER DEFAULT 0,
    skill_uzun_sureli_isitsel_total INTEGER DEFAULT 0,
    skill_uzun_sureli_isitsel_accuracy DECIMAL(5,2),
    
    skill_uzun_sureli_gorsel_correct INTEGER DEFAULT 0,
    skill_uzun_sureli_gorsel_total INTEGER DEFAULT 0,
    skill_uzun_sureli_gorsel_accuracy DECIMAL(5,2),
    
    skill_isler_hafiza_correct INTEGER DEFAULT 0,
    skill_isler_hafiza_total INTEGER DEFAULT 0,
    skill_isler_hafiza_accuracy DECIMAL(5,2),
    
    -- 📚 ÖRNEK TEST BİLGİLERİ
    example_attempts INTEGER DEFAULT 0,
    example_correct_count INTEGER DEFAULT 0,
    example_success_rate DECIMAL(5,2),
    
    -- 📝 DETAYLI VERİLER (JSON)
    detailed_answers JSONB, -- Her sorunun detaylı cevap bilgisi
    set_analysis JSONB, -- Set bazlı detaylı analiz
    skill_breakdown JSONB, -- Beceri türü detaylı analiz
    question_response_times JSONB, -- Her sorunun tepki süresi
    wrong_answer_choices JSONB, -- Yanlış seçenekler analizi
    
    -- 🔧 Sistem Bilgileri (İsteğe Bağlı)
    browser_info VARCHAR(500),
    device_info VARCHAR(500),
    ip_address INET
);

-- 🔒 Row Level Security (Dikkat Testindeki Gibi)
ALTER TABLE memory_test_results ENABLE ROW LEVEL SECURITY;

-- 📇 İndeksler
CREATE INDEX idx_memory_test_student_id ON memory_test_results(student_id);
CREATE INDEX idx_memory_test_conducted_by ON memory_test_results(conducted_by);
CREATE INDEX idx_memory_test_start_time ON memory_test_results(test_start_time);
CREATE INDEX idx_memory_test_completion_status ON memory_test_results(completion_status);

-- 🔐 RLS Policies (Dikkat Testindeki Gibi)
CREATE POLICY "Users can view their own memory test results" 
    ON memory_test_results FOR SELECT 
    USING (student_id = auth.uid()::uuid);

CREATE POLICY "Trainers can view their students' memory test results" 
    ON memory_test_results FOR SELECT 
    USING (
        conducted_by = auth.uid()::uuid OR 
        student_id IN (
            SELECT id FROM users 
            WHERE supervisor_id = auth.uid()::uuid
        )
    );

CREATE POLICY "Trainers can insert memory test results" 
    ON memory_test_results FOR INSERT 
    WITH CHECK (conducted_by = auth.uid()::uuid);

CREATE POLICY "Trainers can update memory test results" 
    ON memory_test_results FOR UPDATE 
    USING (conducted_by = auth.uid()::uuid);

-- ✅ Tetikleyiciler (Otomatik Hesaplamalar)
CREATE OR REPLACE FUNCTION calculate_memory_test_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Doğruluk oranı hesapla
    IF NEW.total_questions > 0 THEN
        NEW.accuracy_percentage := ROUND((NEW.correct_answers::DECIMAL / NEW.total_questions::DECIMAL) * 100, 2);
    END IF;
    
    -- Set doğruluk oranları hesapla
    IF (NEW.set1_correct + NEW.set1_wrong + NEW.set1_missed) > 0 THEN
        NEW.set1_accuracy := ROUND((NEW.set1_correct::DECIMAL / (NEW.set1_correct + NEW.set1_wrong + NEW.set1_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set2_correct + NEW.set2_wrong + NEW.set2_missed) > 0 THEN
        NEW.set2_accuracy := ROUND((NEW.set2_correct::DECIMAL / (NEW.set2_correct + NEW.set2_wrong + NEW.set2_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set3_correct + NEW.set3_wrong + NEW.set3_missed) > 0 THEN
        NEW.set3_accuracy := ROUND((NEW.set3_correct::DECIMAL / (NEW.set3_correct + NEW.set3_wrong + NEW.set3_missed)::DECIMAL) * 100, 2);
    END IF;
    
    IF (NEW.set4_correct + NEW.set4_wrong + NEW.set4_missed) > 0 THEN
        NEW.set4_accuracy := ROUND((NEW.set4_correct::DECIMAL / (NEW.set4_correct + NEW.set4_wrong + NEW.set4_missed)::DECIMAL) * 100, 2);
    END IF;
    
    -- Beceri doğruluk oranları hesapla
    IF NEW.skill_kisa_sureli_isitsel_total > 0 THEN
        NEW.skill_kisa_sureli_isitsel_accuracy := ROUND((NEW.skill_kisa_sureli_isitsel_correct::DECIMAL / NEW.skill_kisa_sureli_isitsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_kisa_sureli_gorsel_total > 0 THEN
        NEW.skill_kisa_sureli_gorsel_accuracy := ROUND((NEW.skill_kisa_sureli_gorsel_correct::DECIMAL / NEW.skill_kisa_sureli_gorsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_uzun_sureli_isitsel_total > 0 THEN
        NEW.skill_uzun_sureli_isitsel_accuracy := ROUND((NEW.skill_uzun_sureli_isitsel_correct::DECIMAL / NEW.skill_uzun_sureli_isitsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_uzun_sureli_gorsel_total > 0 THEN
        NEW.skill_uzun_sureli_gorsel_accuracy := ROUND((NEW.skill_uzun_sureli_gorsel_correct::DECIMAL / NEW.skill_uzun_sureli_gorsel_total::DECIMAL) * 100, 2);
    END IF;
    
    IF NEW.skill_isler_hafiza_total > 0 THEN
        NEW.skill_isler_hafiza_accuracy := ROUND((NEW.skill_isler_hafiza_correct::DECIMAL / NEW.skill_isler_hafiza_total::DECIMAL) * 100, 2);
    END IF;
    
    -- Ortalama tepki süresi hesapla
    IF NEW.total_questions > 0 AND NEW.total_response_time > 0 THEN
        NEW.average_response_time := ROUND(NEW.total_response_time / NEW.total_questions, 3);
    END IF;
    
    -- Örnek test başarı oranı
    IF NEW.example_attempts > 0 THEN
        NEW.example_success_rate := ROUND((NEW.example_correct_count::DECIMAL / (NEW.example_attempts * 4)::DECIMAL) * 100, 2);
    END IF;
    
    -- Kalan sorular hesapla
    IF NEW.last_answered_question IS NOT NULL THEN
        NEW.remaining_questions := 20 - NEW.last_answered_question;
        NEW.remaining_time_seconds := NEW.remaining_questions * 6; -- Her soru 6 saniye
    END IF;
    
    -- Güncelleme zamanı
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_memory_test_metrics
    BEFORE INSERT OR UPDATE ON memory_test_results
    FOR EACH ROW EXECUTE FUNCTION calculate_memory_test_metrics();

-- 📝 Tablo yorumu
COMMENT ON TABLE memory_test_results IS 'Hafıza Testi Sonuçları - Gibson Hafıza Testi verileri';
COMMENT ON COLUMN memory_test_results.total_questions IS 'Toplam soru sayısı (20)';
COMMENT ON COLUMN memory_test_results.set1_correct IS '1. Set doğru cevap sayısı (Soru 1-5)';
COMMENT ON COLUMN memory_test_results.skill_kisa_sureli_isitsel_correct IS 'Kısa Süreli İşitsel beceri doğru sayısı'; 