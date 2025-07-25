-- Geçici olarak RLS'yi devre dışı bırak ve temel politikaları ekle

-- Kullanıcılar tablosu için RLS'yi devre dışı bırak
ALTER TABLE kullanicilar DISABLE ROW LEVEL SECURITY;

-- Test oturumlari tablosu için RLS'yi devre dışı bırak  
ALTER TABLE test_oturumlari DISABLE ROW LEVEL SECURITY;

-- Test sonuclari tablosu için RLS'yi devre dışı bırak
ALTER TABLE test_sonuclari DISABLE ROW LEVEL SECURITY;

-- Soru cevaplari tablosu için RLS'yi devre dışı bırak
ALTER TABLE soru_cevaplari DISABLE ROW LEVEL SECURITY;

-- Test detay tabloları için RLS'yi devre dışı bırak
ALTER TABLE dikkat_testi_detaylari DISABLE ROW LEVEL SECURITY;
ALTER TABLE akil_mantik_testi_detaylari DISABLE ROW LEVEL SECURITY;
ALTER TABLE hafiza_testi_detaylari DISABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_testi_detaylari DISABLE ROW LEVEL SECURITY;
ALTER TABLE stroop_testi_detaylari DISABLE ROW LEVEL SECURITY;

-- Bilişsel skorlar tablosu için RLS'yi devre dışı bırak
ALTER TABLE bilissel_beceri_skorlari DISABLE ROW LEVEL SECURITY;

-- Kullanıcı profilleri tablosu için RLS'yi devre dışı bırak
ALTER TABLE kullanici_profilleri DISABLE ROW LEVEL SECURITY; 