# TAM-TEST AYARLARI VE NOTLAR

## GENEL YAKLASIM
1. **Hiçbir şeyi varsayma** - Her klasörün ayarlarını tek tek kontrol et
2. **Birebir kopyalama** - Orijinal klasördeki SVG ve JavaScript yapısını tam olarak kopyala
3. **ID prefix'leri** - Her test için unique ID'ler kullan (test1-, test2-, test3-)

## SVG YAPISI KURALLARI

### 1. SVG Container
```html
<svg id="testX-puzzle-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 957.3 666.7" width="800">
```
- **ViewBox**: Orijinal klasördeki ile aynı olmalı
- **ID**: testX-puzzle-svg formatında
- **xmlns**: Her zaman dahil et

### 2. Defs Bölümü
```html
<defs>
    <clipPath id="testX-clippath">
        <!-- Orijinal klasördeki clipPath'i kopyala -->
    </clipPath>
    <linearGradient id="testX-linear-gradient" ...>
        <!-- Orijinal klasördeki gradient'i kopyala -->
    </linearGradient>
</defs>
```
- **ClipPath**: Orijinal klasördeki rect veya polygon'u kopyala
- **Gradient**: Transform ve stop değerlerini tam kopyala
- **ID'ler**: testX- prefix'i ekle

### 3. Arka Plan Yapısı
```html
<!-- Arka plan -->
<rect y="0" width="957.3" height="666.7" style="fill: #282828;"/>

<!-- Gradient arka plan -->
<g style="clip-path: url(#testX-clippath);">
    <polygon points="..." style="fill: url(#testX-linear-gradient);"/>
</g>
```
- **Arka plan rengi**: Her klasörde farklı olabilir
- **Gradient**: clipPath ile sınırlandırılmış

### 4. Parça Sıralaması
**ÖNEMLİ**: Orijinal klasördeki parça sırasını aynen koru!

Örnek:
- **1 klasörü**: pr-4, pr-1, pr-3, pr-2
- **2 klasörü**: pr-3, pr-2, pr-1, pr-4
- **3 klasörü**: pr-1, pr-3, pr-2, pr-4
- **4 klasörü**: pr-1, pr-4, pr-2, pr-3

### 5. Parça Yapısı
```html
<!-- Sağ taraftaki hedef parçalar -->
<path id="testX-pr-1" d="..." style="fill: #color; stroke: #000; stroke-miterlimit: 10; stroke-width: 5px;"/>
<!-- Diğer parçalar -->

<!-- Sol taraftaki ana parçalar -->
<circle cx="..." cy="..." r="..." style="stroke: #000; stroke-miterlimit: 10; stroke-width: 2px;"/>
<g>
    <path d="..." style="fill: #color; stroke: #000; stroke-miterlimit: 10; stroke-width: 1px;"/>
    <!-- Diğer arka plan parçaları -->
</g>

<!-- Tıklanabilir alanlar -->
<path id="testX-tk-1" d="..." class="clickable"/>
<!-- Diğer tıklanabilir alanlar -->
```

### 6. Daire Vurguları
```html
<circle id="testX-highlight-pr-1" cx="0" cy="0" r="0" class="highlight-circle" style="display: none;"/>
```
- **Başlangıç değerleri**: cx="0" cy="0" r="0"
- **JavaScript**: Dinamik olarak hesaplanacak

## JAVASCRIPT YAPISI

### 1. Ana Fonksiyon Yapısı
```javascript
function initTestXSection() {
    // Eşleştirme kuralları
    const testXRules = [
        { clickable_id: "testX-tk-1", highlight_id: "testX-pr-1", round_number: 1 },
        // ...
    ];
    
    let currentRound = 1;
    let gameActive = true;
    
    function initGame() {
        setupClickHandlers();
        calculateAndPositionHighlights(); // ÖNEMLİ: Daire hesaplama
        startRound(currentRound);
    }
    
    // Diğer fonksiyonlar...
    
    initGame(); // Son satır
}
```

### 2. Daire Hesaplama (KRİTİK!)
```javascript
function calculateAndPositionHighlights() {
    const prElements = ['testX-pr-1', 'testX-pr-2', 'testX-pr-3', 'testX-pr-4'];
    
    prElements.forEach((prId, index) => {
        const element = document.getElementById(prId);
        if (element) {
            // Merkez hesaplama
            const bbox = element.getBBox();
            let cx = bbox.x + bbox.width / 2;
            let cy = bbox.y + bbox.height / 2;
            
            // ÖNEMLİ: Sadece 1 klasöründe pr-3 ve pr-4 için geometrik merkez var
            if (prId === 'test1-pr-3' || prId === 'test1-pr-4') {
                // Geometrik merkez hesaplama kodu
            }
            
            // MaxDistance hesaplama
            let maxDistance = 0;
            const children = element.querySelectorAll('path[style*="fill"], polygon[style*="fill"], rect[style*="fill"]');
            
            children.forEach(child => {
                // Polygon, path, rect için mesafe hesaplama
            });
            
            // Multiplier ayarları (HER KLASÖR FARKLI!)
            let multiplier = 1.2; // varsayılan
            
            if (element.querySelector('path')) {
                multiplier = 1.35;
            }
            
            // Özel durumlar - HER KLASÖR İÇİN FARKLI
            if (prId === 'testX-pr-Y') {
                multiplier = Z; // Orijinal klasördeki değer
            }
            
            const radius = maxDistance * multiplier;
            
            const highlight = document.getElementById(`testX-highlight-${prId.replace('testX-', '')}`);
            if (highlight) {
                highlight.setAttribute('cx', cx);
                highlight.setAttribute('cy', cy);
                highlight.setAttribute('r', radius);
            }
        }
    });
}
```

### 3. Multiplier Değerleri (KLASÖR BAZINDA)

**1 Klasörü:**
- pr-2: 1.4
- pr-3: 1.45
- pr-4: 1.6
- Geometrik merkez: pr-3, pr-4 için

**2 Klasörü:**
- pr-3: 1.25
- pr-4: 1.4
- Geometrik merkez: YOK

**3 Klasörü:**
- pr-1 ve pr-2: 1.05 (küçültülmüş)
- pr-3 ve pr-4: 1.15 (varsayılan)
- Geometrik merkez: YOK

**4 Klasörü:**
- Tüm parçalar: 1.3 (kareler için büyük)
- Geometrik merkez: YOK

### 4. Eşleştirme Kuralları
```javascript
const testXRules = [
    { clickable_id: "testX-tk-1", highlight_id: "testX-pr-1", round_number: 1 },
    { clickable_id: "testX-tk-2", highlight_id: "testX-pr-2", round_number: 2 },
    { clickable_id: "testX-tk-3", highlight_id: "testX-pr-3", round_number: 3 },
    { clickable_id: "testX-tk-4", highlight_id: "testX-pr-4", round_number: 4 }
];
```
- **Sıra**: Her zaman tk-1→pr-1, tk-2→pr-2, tk-3→pr-3, tk-4→pr-4

### 5. Oyun Akışı
```javascript
function handleClick(event) {
    // ...
    setTimeout(() => {
        event.target.classList.remove('correct');
        currentRound++;
        
        if (currentRound <= testXRules.length) {
            startRound(currentRound);
        } else {
            // Test tamamlandı, sonraki bölüme geç
            setTimeout(() => {
                nextSection();
            }, 1000);
        }
    }, 1500);
}
```

## HATA KONTROL LİSTESİ

### SVG Hataları
- [ ] ViewBox orijinal ile aynı mı?
- [ ] Parça sırası orijinal ile aynı mı?
- [ ] Renkler doğru mu? (#bd5c9f, #fcbd0e, vs.)
- [ ] Stroke genişlikleri doğru mu? (5px hedef, 1px arka plan)
- [ ] ClipPath doğru mu?
- [ ] Gradient doğru mu?

### JavaScript Hataları
- [ ] prElements dizisi parça sırasına uygun mu?
- [ ] Multiplier değerleri orijinal klasördeki ile aynı mı?
- [ ] Geometrik merkez hesaplama gerekli mi?
- [ ] Daire hesaplama fonksiyonu çağrılıyor mu?
- [ ] ID'ler doğru mu? (testX- prefix'i)

### Görsel Kontrol
- [ ] Arka plan rengi doğru mu?
- [ ] Renkli parçalar görünüyor mu?
- [ ] Daireler doğru pozisyonda mı?
- [ ] Daire boyutları uygun mu?
- [ ] Hover efektleri çalışıyor mu?

## ADIM ADIM SÜREÇ

1. **Orijinal klasörü analiz et**
   - SVG yapısını incele
   - JavaScript kodunu incele
   - Multiplier değerlerini not et
   - Geometrik merkez var mı kontrol et

2. **SVG'yi kopyala**
   - ViewBox'ı kopyala
   - Defs bölümünü kopyala (ID'leri değiştir)
   - Parça sırasını aynen koru
   - Renkler ve stroke değerlerini kopyala

3. **JavaScript'i ekle**
   - calculateAndPositionHighlights fonksiyonunu ekle
   - Multiplier değerlerini ayarla
   - Geometrik merkez gerekiyorsa ekle
   - initGame'de calculateAndPositionHighlights'ı çağır

4. **Test et**
   - Arka plan rengi doğru mu?
   - Daireler doğru pozisyonda mı?
   - Oyun akışı çalışıyor mu?
   - Sonraki bölüme geçiş çalışıyor mu?

## ÖRNEK DOSYA YAPISI

```
tam-test/
├── index.html          # Ana dosya
├── tam-test-ayarlari.md # Bu dosya
└── README.md           # Genel açıklama
```

## NOTLAR
- Her test eklenmeden önce bu dosyayı oku
- Orijinal klasördeki her detayı kontrol et
- Asla varsayımda bulunma
- Test et, test et, test et! 