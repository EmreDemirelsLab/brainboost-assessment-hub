# Stroop Testi İçin Gerekli MP3 Dosyaları (Excel Verilerine Göre)

## 📋 Optimize Edilmiş: 9 Adet Ses Dosyası

### 1. **stroop_giris.mp3**
**İçerik:** "Bu bölüm üç aşamadan oluşmaktadır. Her aşamanın başında örnek uygulamayı tamamlayacaksınız."
**Kullanım:** Test başlangıcında genel bilgilendirme

---

### 2. **stroop_asama1_talimat.mp3**
**İçerik:** "1. aşamada ekranda renk ismi yazan kelimeleri görür görmez boşluk (space) tuşuna basmalısınız."
**Kullanım:** 1. Aşama talimat ekranında

---

### 3. **stroop_asama1_ornek_hazir.mp3**
**İçerik:** "Örnek uygulamaya hazırsanız \"Başla\"ya tıklayın."
**Kullanım:** **TÜM 3 AŞAMADA** örnek uygulama öncesi hazırlık (aynı ses dosyası kullanılır)

---

### 4. **stroop_asama1_ornek_bitis.mp3**
**İçerik:** "Örnek Uygulamayı tamamladınız."
**Kullanım:** **TÜM 3 AŞAMADA** örnek uygulama tamamlandıktan sonra (aynı ses dosyası kullanılır)

---

### 5. **stroop_asama1_test_hazir.mp3**
**İçerik:** "Teste başlamak için hazır olduğunuzda \"Başla\"ya tıklayın."
**Kullanım:** **TÜM 3 AŞAMADA** ana testi öncesi hazırlık (aynı ses dosyası kullanılır)

---

### 6. **stroop_1asama_bitis.mp3**
**İçerik:** "Testi tamamladınız. Sıradaki bölüme geçmek için \"İleri\"ye tıklayın."
**Kullanım:** **1. ve 2. AŞAMA BİTİŞİNDE** (aşamalar arası geçişlerde)

---

### 7. **stroop_asama2_talimat.mp3**
**İçerik:** "2. aşamada sadece renk ile kelimenin adı aynı ise boşluk (space) tuşuna basmalısınız."
**Kullanım:** 2. Aşama talimat ekranında

---

### 8. **stroop_asama3_talimat.mp3**
**İçerik:** "3. aşamada sadece renk ile kelimenin adı aynı değil ise boşluk (space) tuşuna basmalısınız."
**Kullanım:** 3. Aşama talimat ekranında

---

### 9. **stroop_test_bitis.mp3**
**İçerik:** "Testi tamamladınız. Sıradaki bölüme geçmek için \"İleri\"ye tıklayın."
**Kullanım:** **GENEL TEST BİTİŞİNDE** (tüm test tamamlandığında)

---

## 🎯 Test Akışı ve Ses Dosyası Kullanımı

### Test Başlangıcı:
1. `stroop_giris.mp3` → Genel açıklama

### 1. Aşama:
1. `stroop_asama1_talimat.mp3` → Aşama talimatı
2. `stroop_asama1_ornek_hazir.mp3` → Örnek hazırlık
3. *Örnek uygulama (sessiz)*
4. `stroop_asama1_ornek_bitis.mp3` → Örnek bitiş
5. `stroop_asama1_test_hazir.mp3` → Test hazırlık
6. *Ana test (sessiz)*
7. `stroop_1asama_bitis.mp3` → **1. Aşama bitiş ekranı**

### 2. Aşama:
1. `stroop_asama2_talimat.mp3` → Aşama talimatı
2. `stroop_asama1_ornek_hazir.mp3` → Örnek hazırlık (**aynı dosya**)
3. *Örnek uygulama (sessiz)*
4. `stroop_asama1_ornek_bitis.mp3` → Örnek bitiş (**aynı dosya**)
5. `stroop_asama1_test_hazir.mp3` → Test hazırlık (**aynı dosya**)
6. *Ana test (sessiz)*
7. `stroop_1asama_bitis.mp3` → **2. Aşama bitiş ekranı** (**aynı dosya**)

### 3. Aşama:
1. `stroop_asama3_talimat.mp3` → Aşama talimatı
2. `stroop_asama1_ornek_hazir.mp3` → Örnek hazırlık (**aynı dosya**)
3. *Örnek uygulama (sessiz)*
4. `stroop_asama1_ornek_bitis.mp3` → Örnek bitiş (**aynı dosya**)
5. `stroop_asama1_test_hazir.mp3` → Test hazırlık (**aynı dosya**)
6. *Ana test (sessiz)*

### Test Sonu:
1. `stroop_test_bitis.mp3` → **Genel test bitiş**

---

## 📝 Teknik Notlar

- **Toplam dosya sayısı:** 9 adet (optimize edilmiş)
- **Ortalama süre:** Her dosya 3-5 saniye arası
- **Format:** MP3, 44.1kHz, Stereo
- **Ses kalitesi:** Temiz, net, arka plan gürültüsü yok
- **Tonlama:** Profesyonel, sakin, açık
- **Hız:** Normal konuşma hızı (dakikada 150-160 kelime)

---

## 🎤 Ses Kaydı Önerileri

1. **Stüdyo ortamı** kullanın (sessiz oda)
2. **Kaliteli mikrofon** kullanın
3. **Aynı ses tonu** ve **hız** ile kaydedin
4. **Arka plan müziği** eklemeyin
5. **Başında ve sonunda sessizlik** bırakın (0.5 saniye)
6. **Normalleştirme** uygulayın (-3dB peak)

---

## 📁 Dosya Konumu
Bu dosyalar `Stroop/mp3/` klasörüne yerleştirilmelidir:

```
Stroop/
├── mp3/
│   ├── stroop_giris.mp3
│   ├── stroop_asama1_talimat.mp3
│   ├── stroop_asama1_ornek_hazir.mp3  ← (3 aşamada da kullanılır)
│   ├── stroop_asama1_ornek_bitis.mp3  ← (3 aşamada da kullanılır)
│   ├── stroop_asama1_test_hazir.mp3   ← (3 aşamada da kullanılır)
│   ├── stroop_1asama_bitis.mp3        ← (1. ve 2. aşama bitişinde)
│   ├── stroop_asama2_talimat.mp3
│   ├── stroop_asama3_talimat.mp3
│   └── stroop_test_bitis.mp3          ← (genel test bitişinde)
└── stroop.html
``` 