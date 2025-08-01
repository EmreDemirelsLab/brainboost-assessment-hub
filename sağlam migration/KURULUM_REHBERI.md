# 🚀 RLS SİSTEMİ KURULUM REHBERİ

## 📋 KURULUM ADIMLARI

### **ADIM 1: Mevcut Durumu Kontrol Et**
```bash
# Helper functions var mı kontrol et
psql -d production_db -f check_helper_functions.sql
```

**Beklenen Sonuç:**
```
HELPER_FUNCTIONS | get_current_user_id | uuid
HELPER_FUNCTIONS | get_current_user_role | text  
HELPER_FUNCTIONS | can_user_access_user | boolean
```

### **ADIM 2A: Eğer Helper Functions Varsa**
✅ **Sistem hazır! Direkt teste geç.**

### **ADIM 2B: Eğer Helper Functions Eksikse**
```bash
# Sadece helper functions'ları ekle
psql -d production_db -f add_helper_functions_only.sql
```

### **ADIM 3: Sistem Testi**
1. **Öğrenci** olarak login ol
2. **Burdon testi** yap
3. **Console'da** başarı mesajını kontrol et
4. **Beyin antrenörü** olarak login ol
5. **Reports** sayfasında test sonucunu gör

## 🔧 **SORUN GİDERME**

### **Problem: Helper Functions Eksik**
**Hata:** `function get_current_user_id() does not exist`

**Çözüm:**
```bash
psql -d production_db -f complete_rls_system_final.sql
```

### **Problem: Policy Çakışması**
**Hata:** `policy already exists`

**Çözüm:**
```bash
# 1. Temizle
psql -d production_db -f clean_all_policies_first.sql
psql -d production_db -f clean_remaining_policies.sql

# 2. Yeniden kur
psql -d production_db -f complete_rls_system_final.sql
```

### **Problem: Test Kaydedemiyor**
**Hata:** `RLS policy violation`

**Çözüm:** Hiyerarşi kontrol et
```sql
-- Öğrencinin supervisor'ü kim?
SELECT supervisor_id FROM users WHERE id = 'STUDENT_ID';

-- Supervisor doğru mu?
SELECT id FROM users WHERE id = 'SUPERVISOR_ID';
```

## ✅ **DOĞRULAMA SORULARI**

### **1. RLS Policies Aktif mi?**
```sql
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' AND policyname LIKE '%hierarchy%';
-- Sonuç: 24 olmalı
```

### **2. Helper Functions Var mı?**
```sql
SELECT COUNT(*) FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_current_user_role', 'can_user_access_user');
-- Sonuç: 3 olmalı
```

### **3. RLS Aktif mi?**
```sql
SELECT COUNT(*) FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' 
  AND c.relrowsecurity = true
  AND t.tablename IN ('users', 'attention_test_results', 'burdon_test_results', 'd2_test_results', 'memory_test_results');
-- Sonuç: 5+ olmalı
```

## 📁 **DOSYA AÇIKLAMALARI**

### **complete_rls_system_final.sql** (337 satır)
- **İçerik**: Komple RLS sistemi
- **Kullanım**: İlk kurulum veya tam reset
- **Süre**: ~30 saniye

### **clean_all_policies_first.sql** (117 satır)
- **İçerik**: Policy temizleme
- **Kullanım**: Çakışma problemlerinde
- **Süre**: ~10 saniye

### **check_helper_functions.sql** (27 satır)
- **İçerik**: Fonksiyon kontrolü
- **Kullanım**: Durum kontrolü
- **Süre**: ~2 saniye

## 🎯 **HIZLI KURULUM**

### **Sıfırdan Kurulum (Önerilen)**
```bash
cd "sağlam migration"
psql -d production_db -f complete_rls_system_final.sql
```

### **Problem Çözme Kurulumu**
```bash
cd "sağlam migration"
psql -d production_db -f clean_all_policies_first.sql
psql -d production_db -f clean_remaining_policies.sql
psql -d production_db -f complete_rls_system_final.sql
```

## 📞 **DESTEK**

Sorun yaşıyorsanız:
1. **Console error logları** paylaşın
2. **Database query sonuçları** paylaşın
3. **Kullanıcı hiyerarşisi** kontrol edin
4. **Bu rehberdeki kontrol sorguları** çalıştırın