-- Test verilerini temizle (409 Conflict hatalarını önlemek için)
-- Supabase Dashboard SQL Editor'da çalıştırın

-- 1. Soru cevaplarını sil
DELETE FROM soru_cevaplari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';

-- 2. Test detaylarını sil
DELETE FROM dikkat_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';
DELETE FROM hafiza_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';
DELETE FROM akil_mantik_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';
DELETE FROM puzzle_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';
DELETE FROM stroop_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';

-- 3. Test sonuçlarını sil
DELETE FROM test_sonuclari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';

-- 4. Test oturumlarını sil
DELETE FROM test_oturumlari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';

-- 5. Bilişsel skorları sil
DELETE FROM bilissel_beceri_skorlari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77';

-- Kontrol
SELECT 'test_oturumlari' as tablo, count(*) as kayit_sayisi FROM test_oturumlari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77'
UNION ALL
SELECT 'test_sonuclari' as tablo, count(*) as kayit_sayisi FROM test_sonuclari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77'
UNION ALL
SELECT 'dikkat_testi_detaylari' as tablo, count(*) as kayit_sayisi FROM dikkat_testi_detaylari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77'
UNION ALL
SELECT 'soru_cevaplari' as tablo, count(*) as kayit_sayisi FROM soru_cevaplari WHERE kullanici_id = 'a02fb2b2-cca4-4f7c-924d-a149f2e60a77'; 