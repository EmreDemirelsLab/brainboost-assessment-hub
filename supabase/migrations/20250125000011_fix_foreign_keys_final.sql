-- KESIN ÇÖZÜM: Foreign Key Constraint'leri Düzelt
-- test_oturumlari tablosundaki constraint sorununu çöz

-- 1. Mevcut tüm foreign key constraint'leri kaldır
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey;
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_user_id_fkey;

ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey;
ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_user_id_fkey;

-- 2. users tablosunun var olduğunu doğrula ve kullanici_id kolonunu users.id'ye bağla
-- test_oturumlari için
ALTER TABLE test_oturumlari 
ADD CONSTRAINT test_oturumlari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- test_sonuclari için  
ALTER TABLE test_sonuclari 
ADD CONSTRAINT test_sonuclari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Soru cevapları için de aynı düzenleme
ALTER TABLE soru_cevaplari DROP CONSTRAINT IF EXISTS soru_cevaplari_kullanici_id_fkey;
ALTER TABLE soru_cevaplari 
ADD CONSTRAINT soru_cevaplari_kullanici_id_fkey 
FOREIGN KEY (kullanici_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Test detay tabloları için oturum referansları
ALTER TABLE dikkat_testi_detaylari DROP CONSTRAINT IF EXISTS dikkat_testi_detaylari_oturum_id_fkey;
ALTER TABLE dikkat_testi_detaylari 
ADD CONSTRAINT dikkat_testi_detaylari_oturum_id_fkey 
FOREIGN KEY (oturum_id) REFERENCES test_oturumlari(id) ON DELETE CASCADE;

ALTER TABLE akil_mantik_testi_detaylari DROP CONSTRAINT IF EXISTS akil_mantik_testi_detaylari_oturum_id_fkey;
ALTER TABLE akil_mantik_testi_detaylari 
ADD CONSTRAINT akil_mantik_testi_detaylari_oturum_id_fkey 
FOREIGN KEY (oturum_id) REFERENCES test_oturumlari(id) ON DELETE CASCADE;

ALTER TABLE hafiza_testi_detaylari DROP CONSTRAINT IF EXISTS hafiza_testi_detaylari_oturum_id_fkey;
ALTER TABLE hafiza_testi_detaylari 
ADD CONSTRAINT hafiza_testi_detaylari_oturum_id_fkey 
FOREIGN KEY (oturum_id) REFERENCES test_oturumlari(id) ON DELETE CASCADE;

ALTER TABLE puzzle_testi_detaylari DROP CONSTRAINT IF EXISTS puzzle_testi_detaylari_oturum_id_fkey;
ALTER TABLE puzzle_testi_detaylari 
ADD CONSTRAINT puzzle_testi_detaylari_oturum_id_fkey 
FOREIGN KEY (oturum_id) REFERENCES test_oturumlari(id) ON DELETE CASCADE;

ALTER TABLE stroop_testi_detaylari DROP CONSTRAINT IF EXISTS stroop_testi_detaylari_oturum_id_fkey;
ALTER TABLE stroop_testi_detaylari 
ADD CONSTRAINT stroop_testi_detaylari_oturum_id_fkey 
FOREIGN KEY (oturum_id) REFERENCES test_oturumlari(id) ON DELETE CASCADE; 