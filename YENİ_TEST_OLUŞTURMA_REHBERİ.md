# 🧪 YENİ TEST OLUŞTURMA REHBERİ
*Database entegrasyonu ve RLS policy sorunlarından kaçınmak için kritik kontrol noktaları*

## 🗄️ DATABASE YAPISINA UYGUNLUK

### 1. Tablo Referansları
```sql
-- ❌ YANLIŞ - Kaldırılan tablolar
FROM public.students
FROM public.user_roles

-- ✅ DOĞRU - Mevcut tablolar
FROM public.users
FROM public.attention_test_results
```

### 2. Yeni Rol Sistemi
```javascript
// ❌ ESKİ ROLLER (Artık kullanılmıyor)
'trainer', 'representative', 'user'

// ✅ YENİ ROLLER (Aktif sistem)
'admin', 'beyin_antrenoru', 'temsilci', 'kullanici'
```

### 3. Users Tablosu Yapısı
```sql
users (
  id UUID PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  roles JSONB,                    -- ['admin'] veya ['kullanici']
  supervisor_id UUID,             -- Hiyerarşi için
  demographic_info JSONB,         -- Öğrenci bilgileri
  -- ARTIK YOK: parent_user_id
)
```

## 🔒 RLS POLICY KURALLARI

### 1. Policy Naming Convention
```sql
-- ✅ DOĞRU Naming
CREATE POLICY "test_name_select_policy" ON test_table
CREATE POLICY "test_name_insert_policy" ON test_table
CREATE POLICY "test_name_update_policy" ON test_table
CREATE POLICY "test_name_delete_policy" ON test_table
```

### 2. SELECT Policy Template
```sql
CREATE POLICY "test_table_select_policy" ON public.test_table
FOR SELECT USING (
  -- Kullanıcılar kendi sonuçlarını görebilir
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND u.id = student_id
  )
  OR
  -- Yöneticiler tüm sonuçları görebilir
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.roles ? 'admin' OR 
      u.roles ? 'temsilci' OR
      u.roles ? 'beyin_antrenoru'
    )
  )
  OR
  -- Supervisor alt kullanıcılarının sonuçlarını görebilir
  EXISTS (
    SELECT 1 FROM public.users supervisor
    WHERE supervisor.auth_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users student_user
      WHERE student_user.id = student_id
      AND student_user.supervisor_id = supervisor.id
    )
  )
);
```

### 3. INSERT Policy Template
```sql
CREATE POLICY "test_table_insert_policy" ON public.test_table
FOR INSERT WITH CHECK (
  -- Yöneticiler test sonucu kaydedebilir
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.roles ? 'admin' OR 
      u.roles ? 'temsilci' OR
      u.roles ? 'beyin_antrenoru'
    )
  )
  OR
  -- Kullanıcılar kendi test sonuçlarını kaydedebilir
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND u.id = student_id
    AND u.roles ? 'kullanici'
  )
);
```

## 🏗️ TEST TABLOSU YAPISI

### 1. Zorunlu Alanlar
```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Zaman damgaları (Mutlaka olmalı)
  test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  test_end_time TIMESTAMP WITH TIME ZONE,
  test_duration_seconds INTEGER DEFAULT 0,
  
  -- Test durumu
  completion_status TEXT DEFAULT 'completed',
  
  -- Ana sonuçlar
  total_questions_attempted INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(6,2) DEFAULT 0,
  
  -- JSONB detay alanları
  detailed_answers JSONB,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Performans İndeksleri
```sql
-- Zorunlu indeksler
CREATE INDEX idx_test_student_id ON test_results(student_id);
CREATE INDEX idx_test_conducted_by ON test_results(conducted_by);
CREATE INDEX idx_test_start_time ON test_results(test_start_time);

-- JSONB indeks (detaylı sorgular için)
CREATE INDEX idx_test_detailed_answers ON test_results USING gin(detailed_answers);
```

### 3. Trigger ve Fonksiyonlar
```sql
-- Updated at trigger
CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS enable
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
```

## 📱 FRONTEND ENTEGRASYON

### 1. Test Kaydetme Mantığı
```javascript
// ✅ DOĞRU conducted_by mantığı
const { data: userData } = await supabase
  .from('users')
  .select('id, roles, supervisor_id')
  .eq('auth_user_id', user.id)
  .single();

// conducted_by HER ZAMAN test yapan kişinin ID'si
let conductedBy = userData.id;  // YANLIŞ DEĞİL!

// student_id belirleme
let studentId;
if (userData.roles.includes('kullanici')) {
  studentId = userData.id;  // Kendi testi
} else {
  studentId = selectedUserId;  // Seçilen kullanıcı
}
```

### 2. Hata Yönetimi
```javascript
if (insertError) {
  console.error('❌ Test kayıt hatası:', insertError);
  
  // Hata kodlarına göre işlem
  if (insertError.code === '23503') {
    console.error('🔗 Foreign key hatası - User ID geçersiz');
  } else if (insertError.code === '42501') {
    console.error('🔒 RLS policy hatası - Yetki yetersiz');
  }
  
  // Hata durumunda localStorage'a kaydet
  localStorage.setItem('pendingTestResults', JSON.stringify({
    data: testData,
    error: insertError,
    timestamp: new Date().toISOString()
  }));
  
  return false;
}
```

### 3. Rol Kontrolü
```javascript
// ✅ DOĞRU rol kontrol fonksiyonu
function getUserRole(roles) {
  if (Array.isArray(roles)) {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('temsilci')) return 'temsilci';
    if (roles.includes('beyin_antrenoru')) return 'beyin_antrenoru';
    if (roles.includes('kullanici')) return 'kullanici';
  }
  return 'kullanici'; // Fallback
}

// ❌ YANLIŞ - Eski roller aramak
if (roles.includes('trainer')) // HATA!
```

## 🚨 KAÇINILMASI GEREKEN TUZAKLAR

### 1. Eski Tablo Referansları
```sql
-- ❌ BU TABLOLAR ARTIK YOK
SELECT * FROM students;
SELECT * FROM user_roles;
SELECT * FROM exercises;
SELECT * FROM reports;
```

### 2. Yanlış conducted_by Mantığı
```javascript
// ❌ YANLIŞ
if (userRole === 'kullanici') {
  conductedBy = userData.supervisor_id;  // HATA!
}

// ✅ DOĞRU
conductedBy = userData.id;  // Her zaman test yapan kişi
```

### 3. RLS Policy'de Eski Rol Kontrolleri
```sql
-- ❌ YANLIŞ
WHERE users.roles ? 'trainer'
WHERE users.roles ? 'representative'
WHERE users.roles ? 'user'

-- ✅ DOĞRU
WHERE users.roles ? 'beyin_antrenoru'
WHERE users.roles ? 'temsilci'
WHERE users.roles ? 'kullanici'
```

## ✅ TEST OLUŞTURMA CHECKLİSTİ

### Migration Dosyası
- [ ] Tablo yapısı doğru (student_id, conducted_by zorunlu)
- [ ] RLS enable edildi
- [ ] Performans indeksleri eklendi
- [ ] Updated at trigger eklendi
- [ ] 4 policy oluşturuldu (SELECT, INSERT, UPDATE, DELETE)
- [ ] Yeni rol sistemi kullanıldı
- [ ] Students tablosu referansı YOK

### Frontend Entegrasyon
- [ ] conducted_by = userData.id (her zaman)
- [ ] Yeni rol sistemi kullanıldı
- [ ] Hata yönetimi localStorage ile
- [ ] RLS hata kodları kontrol ediliyor
- [ ] Geçerli user ID kontrolü yapıldı

### Types Güncellemesi
- [ ] src/integrations/supabase/types.ts güncellendi
- [ ] Yeni tablo interface'i eklendi
- [ ] JSONB alanlar any tipinde

## 📋 ÖRNEK MIGRATION TEMPLATE

```sql
-- Yeni test tablosu oluşturma template
CREATE TABLE IF NOT EXISTS public.new_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  test_end_time TIMESTAMP WITH TIME ZONE,
  test_duration_seconds INTEGER DEFAULT 0,
  completion_status TEXT DEFAULT 'completed',
  
  -- Test-specific fields
  total_score DECIMAL(6,2) DEFAULT 0,
  detailed_results JSONB,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- İndeksler
CREATE INDEX idx_newtest_student_id ON public.new_test_results(student_id);
CREATE INDEX idx_newtest_conducted_by ON public.new_test_results(conducted_by);

-- RLS
ALTER TABLE public.new_test_results ENABLE ROW LEVEL SECURITY;

-- Policies (yukarıdaki template'leri kullan)
CREATE POLICY "new_test_results_select_policy" ON public.new_test_results
FOR SELECT USING (...);

-- Trigger
CREATE TRIGGER update_new_test_results_updated_at
    BEFORE UPDATE ON public.new_test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---
**⚠️ Kritik Uyarı:** Her yeni test tablosu oluşturmadan önce bu rehberi kontrol edin. RLS policy hatalarının debugı çok zordur! 