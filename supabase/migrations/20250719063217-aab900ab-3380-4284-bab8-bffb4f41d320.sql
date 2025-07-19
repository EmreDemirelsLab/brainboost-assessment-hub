-- Burdon Dikkat Testi için test kaydı oluştur
INSERT INTO public.tests (title, description, test_type, instructions, duration_minutes, is_active, created_by) 
VALUES (
  'Burdon Dikkat Testi',
  'Dikkat sürdürme, odaklanma ve seçici dikkat becerilerini değerlendiren test',
  'burdon_attention',
  'Ekranda gösterilen harfler arasından hedef harfleri (a, b, d, g) bulup işaretleyiniz. Test 3 bölümden oluşur ve toplam 5 dakika sürer.',
  5,
  true,
  'a02fb2b2-cca4-4f7c-924d-a149f2e60a77'
) ON CONFLICT DO NOTHING;