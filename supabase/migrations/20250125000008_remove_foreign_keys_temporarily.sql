-- Geçici olarak foreign key constraint'leri kaldır

-- test_oturumlari tablosundaki kullanici_id foreign key'ini kaldır
ALTER TABLE test_oturumlari DROP CONSTRAINT IF EXISTS test_oturumlari_kullanici_id_fkey;

-- test_sonuclari tablosundaki kullanici_id foreign key'ini kaldır  
ALTER TABLE test_sonuclari DROP CONSTRAINT IF EXISTS test_sonuclari_kullanici_id_fkey; 