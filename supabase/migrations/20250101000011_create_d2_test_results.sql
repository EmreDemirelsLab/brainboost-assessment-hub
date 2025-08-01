-- 📊 D2_TEST_RESULTS TABLOSU - D2 Dikkat Testi İçin
-- Modern Supabase entegrasyonu ile

CREATE TABLE IF NOT EXISTS d2_test_results (
    -- 🔑 Temel Kimlik Bilgileri
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
    
    -- 🎯 D2 TEST SPECIFIC METRICS (Ham Veriler)
    total_items_processed INTEGER NOT NULL DEFAULT 0, -- TN_val: Toplam işlenen madde
    correct_selections INTEGER NOT NULL DEFAULT 0,    -- D: Doğru seçimler
    commission_errors INTEGER NOT NULL DEFAULT 0,     -- E1: Yanlış işaretleme hataları
    omission_errors INTEGER NOT NULL DEFAULT 0,       -- E2: Atlama hataları
    total_errors INTEGER NOT NULL DEFAULT 0,          -- E: Toplam hata (E1 + E2)
    concentration_performance INTEGER NOT NULL DEFAULT 0, -- CP: Konsantrasyon performansı
    total_net_performance INTEGER NOT NULL DEFAULT 0, -- TN_E: Net performans
    fluctuation_rate INTEGER NOT NULL DEFAULT 0,      -- FR: Dalgalanma oranı
    
    -- 📊 CALCULATED SCORES (Hesaplanan Puanlar)
    total_score INTEGER,                    -- Genel skor
    processing_speed DECIMAL(5,2),         -- İşlem hızı (madde/dakika)
    attention_stability DECIMAL(5,2),      -- Dikkat kararlılığı (%)
    concentration_performance_percentage DECIMAL(5,2), -- Konsantrasyon performansı (%)
    
    -- 📝 DETAYLI VERİLER (JSON)
    line_results JSONB,      -- Satır satır sonuçlar
    detailed_results JSONB,  -- Detaylı test verileri
    
    -- 🔧 Sistem Bilgileri (İsteğe Bağlı)
    browser_info VARCHAR(500),
    device_info VARCHAR(500),
    ip_address INET
);

-- 🔒 Row Level Security
ALTER TABLE d2_test_results ENABLE ROW LEVEL SECURITY;

-- 📇 İndeksler (sadece mevcut değilse ekle)
CREATE INDEX IF NOT EXISTS idx_d2_test_student_id ON d2_test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_d2_test_conducted_by ON d2_test_results(conducted_by);
CREATE INDEX IF NOT EXISTS idx_d2_test_start_time ON d2_test_results(test_start_time);
CREATE INDEX IF NOT EXISTS idx_d2_test_completion_status ON d2_test_results(completion_status);

-- 🔐 RLS Policies (sadece mevcut değilse ekle)
-- Bu policy'ler 20250101000014 migration'da düzeltilecek, şimdilik skip et
-- 📝 NOT: Bu policy'ler zaten var, 20250101000014_fix_all_test_policies.sql'de düzeltiliyor

-- ✅ Tetikleyiciler (Otomatik Hesaplamalar)
-- Fonksiyon zaten varsa üzerine yaz
CREATE OR REPLACE FUNCTION calculate_d2_test_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Konsantrasyon performansı yüzdesi hesapla
    IF NEW.correct_selections > 0 THEN
        NEW.concentration_performance_percentage := ROUND(
            (NEW.correct_selections::DECIMAL / (NEW.correct_selections + NEW.commission_errors)::DECIMAL) * 100, 2
        );
    END IF;
    
    -- İşlem hızı hesapla (dakika başına işlenen madde)
    IF NEW.test_duration_seconds > 0 THEN
        NEW.processing_speed := ROUND(
            (NEW.total_items_processed::DECIMAL / (NEW.test_duration_seconds::DECIMAL / 60)), 2
        );
    END IF;
    
    -- Dikkat kararlılığı hesapla (dalgalanma oranı düşükse stabilite yüksek)
    NEW.attention_stability := ROUND(
        CASE 
            WHEN NEW.fluctuation_rate = 0 THEN 100
            ELSE GREATEST(0, 100 - (NEW.fluctuation_rate * 5))
        END, 2
    );
    
    -- Toplam skor (konsantrasyon performansını kullan)
    NEW.total_score := NEW.concentration_performance;
    
    -- Güncelleme zamanı
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı önce kaldır, sonra yeniden oluştur
DROP TRIGGER IF EXISTS trigger_calculate_d2_test_metrics ON d2_test_results;
CREATE TRIGGER trigger_calculate_d2_test_metrics
    BEFORE INSERT OR UPDATE ON d2_test_results
    FOR EACH ROW EXECUTE FUNCTION calculate_d2_test_metrics();

-- 📝 Tablo yorumu
COMMENT ON TABLE d2_test_results IS 'D2 Dikkat Testi Sonuçları - Konsantrasyon ve Dikkat Performansı';
COMMENT ON COLUMN d2_test_results.total_items_processed IS 'TN_val: Toplam işlenen madde sayısı';
COMMENT ON COLUMN d2_test_results.correct_selections IS 'D: Doğru seçimler';
COMMENT ON COLUMN d2_test_results.commission_errors IS 'E1: Yanlış işaretleme hataları';
COMMENT ON COLUMN d2_test_results.omission_errors IS 'E2: Atlama hataları';
COMMENT ON COLUMN d2_test_results.concentration_performance IS 'CP: Konsantrasyon performansı';
COMMENT ON COLUMN d2_test_results.fluctuation_rate IS 'FR: Dalgalanma oranı'; 