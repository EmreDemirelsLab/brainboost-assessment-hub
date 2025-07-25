-- Doğru RLS Politikaları - 3 Rol Sistemi
-- Supabase Dashboard SQL Editor'da çalıştırın

-- Önce RLS'yi tekrar aktifleştir
ALTER TABLE test_sonuclari ENABLE ROW LEVEL SECURITY;
ALTER TABLE dikkat_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafiza_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE akil_mantik_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE stroop_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE soru_cevaplari ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilissel_beceri_skorlari ENABLE ROW LEVEL SECURITY;

-- Test oturumları: Herkes kendi oturumunu oluşturabilir
ALTER TABLE test_oturumlari ENABLE ROW LEVEL SECURITY;

-- 1. TEST SONUÇLARI POLİTİKALARI
-- Insert: Herkes kendi test sonucunu ekleyebilir
CREATE POLICY "users_can_insert_own_results" 
ON test_sonuclari FOR INSERT 
WITH CHECK (kullanici_id = auth.uid());

-- Select: Sadece admin ve beyin antrenörleri görebilir
CREATE POLICY "admin_trainer_can_view_results" 
ON test_sonuclari FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- Update: Sadece admin ve beyin antrenörleri güncelleyebilir
CREATE POLICY "admin_trainer_can_update_results" 
ON test_sonuclari FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- 2. TEST DETAYLARI POLİTİKALARI (Dikkat, Hafıza, vs.)
-- Insert: Herkes kendi test detayını ekleyebilir
CREATE POLICY "users_can_insert_own_details" 
ON dikkat_testi_detaylari FOR INSERT 
WITH CHECK (
  test_sonuc_id IN (
    SELECT id FROM test_sonuclari 
    WHERE kullanici_id = auth.uid()
  )
);

-- Select: Sadece admin ve beyin antrenörleri görebilir
CREATE POLICY "admin_trainer_can_view_details" 
ON dikkat_testi_detaylari FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- Aynı politikaları diğer test detay tablolarına da uygula
-- Hafıza testi
CREATE POLICY "users_can_insert_own_hafiza" ON hafiza_testi_detaylari FOR INSERT WITH CHECK (test_sonuc_id IN (SELECT id FROM test_sonuclari WHERE kullanici_id = auth.uid()));
CREATE POLICY "admin_trainer_can_view_hafiza" ON hafiza_testi_detaylari FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'beyin_antrenoru')));

-- Akıl-Mantık testi
CREATE POLICY "users_can_insert_own_akil_mantik" ON akil_mantik_testi_detaylari FOR INSERT WITH CHECK (test_sonuc_id IN (SELECT id FROM test_sonuclari WHERE kullanici_id = auth.uid()));
CREATE POLICY "admin_trainer_can_view_akil_mantik" ON akil_mantik_testi_detaylari FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'beyin_antrenoru')));

-- Puzzle testi
CREATE POLICY "users_can_insert_own_puzzle" ON puzzle_testi_detaylari FOR INSERT WITH CHECK (test_sonuc_id IN (SELECT id FROM test_sonuclari WHERE kullanici_id = auth.uid()));
CREATE POLICY "admin_trainer_can_view_puzzle" ON puzzle_testi_detaylari FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'beyin_antrenoru')));

-- Stroop testi
CREATE POLICY "users_can_insert_own_stroop" ON stroop_testi_detaylari FOR INSERT WITH CHECK (test_sonuc_id IN (SELECT id FROM test_sonuclari WHERE kullanici_id = auth.uid()));
CREATE POLICY "admin_trainer_can_view_stroop" ON stroop_testi_detaylari FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'beyin_antrenoru')));

-- 3. SORU CEVAPLARI POLİTİKALARI
CREATE POLICY "users_can_insert_own_answers" 
ON soru_cevaplari FOR INSERT 
WITH CHECK (kullanici_id = auth.uid());

CREATE POLICY "admin_trainer_can_view_answers" 
ON soru_cevaplari FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- 4. TEST OTURUMLARI POLİTİKALARI
CREATE POLICY "users_can_manage_own_sessions" 
ON test_oturumlari FOR ALL 
USING (kullanici_id = auth.uid())
WITH CHECK (kullanici_id = auth.uid());

CREATE POLICY "admin_trainer_can_view_sessions" 
ON test_oturumlari FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- 5. BİLİŞSEL SKORLAR POLİTİKALARI
CREATE POLICY "users_can_insert_own_scores" 
ON bilissel_beceri_skorlari FOR INSERT 
WITH CHECK (kullanici_id = auth.uid());

CREATE POLICY "admin_trainer_can_view_scores" 
ON bilissel_beceri_skorlari FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'beyin_antrenoru')
  )
);

-- Kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
    'test_sonuclari', 
    'dikkat_testi_detaylari', 
    'soru_cevaplari'
) 
ORDER BY tablename; 