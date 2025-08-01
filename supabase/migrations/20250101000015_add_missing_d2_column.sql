-- 🔧 D2 TEST MISSING COLUMN FIX  
-- concentration_performance_percentage alanı eksikliğini gider

-- D2 test tablosuna eksik alanı ekle
ALTER TABLE d2_test_results 
ADD COLUMN IF NOT EXISTS concentration_performance_percentage DECIMAL(5,2);

-- Trigger'ın düzgün çalışması için mevcut kayıtları güncelle  
UPDATE d2_test_results 
SET concentration_performance_percentage = 0 
WHERE concentration_performance_percentage IS NULL;

-- 📝 Column açıklaması
COMMENT ON COLUMN d2_test_results.concentration_performance_percentage 
IS 'CP/D+E1 Konsantrasyon performansı yüzdesi - trigger ile hesaplanır';