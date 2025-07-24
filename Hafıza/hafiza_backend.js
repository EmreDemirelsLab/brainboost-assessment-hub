const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3005;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL bağlantısı
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bilisseltest',
    password: 'password',
    port: 5432,
});

// Hafıza test setleri ve soruları (HTML'den alınan veriler)
const HAFIZA_SETLER = {
    1: {
        set_adi: 'Set 1',
        aciklama: 'Serçe ve Bahçe',
        audio_dosyasi: 'set1_ses.mp3',
        audio_metni: '2 serçe çatıya yuva yapmış',
        gorsel_dosyasi: 'set1_gorsel.mp3',
        gorsel_metni: 'Bu bir bahçe resmidir.',
        gorsel_resmi: 'bahce.png'
    },
    2: {
        set_adi: 'Set 2',
        aciklama: 'Uçurtma ve Kütüphane',
        audio_dosyasi: 'set2_ses.mp3',
        audio_metni: 'Ayşe mavi uçurtmasını parkta uçurdu',
        gorsel_dosyasi: 'set2_gorsel.mp3',
        gorsel_metni: 'Bu bir kütüphane resmidir.',
        gorsel_resmi: 'kutuphane.png'
    },
    3: {
        set_adi: 'Set 3',
        aciklama: 'Öğretmen ve Kamp',
        audio_dosyasi: 'set3_ses.mp3',
        audio_metni: 'Türkçe öğretmeni 30 öğrenciye ders anlattı',
        gorsel_dosyasi: 'set3_gorsel.mp3',
        gorsel_metni: 'Bu bir kamp resmidir.',
        gorsel_resmi: 'kamp.png'
    },
    4: {
        set_adi: 'Set 4',
        aciklama: 'Deniz ve Yelken',
        audio_dosyasi: 'set4_ses.mp3',
        audio_metni: 'Denizde yüzen 4 çocuktan, sadece birinin kırmızı kolluğu vardı',
        gorsel_dosyasi: 'set4_gorsel.mp3',
        gorsel_metni: 'Bu bir yelken resmidir.',
        gorsel_resmi: 'yelken.png'
    }
};

// Test soruları tanımları (HTML'den alınan veriler)
const HAFIZA_SORULARI = [
    // SET 1 soruları
    [
        { soru_no: 1, question: 'Çatıya yuva yapan hayvan hangisidir?', options: ['Martı', 'Güvercin', 'Serçe', 'Leylek', 'Karga'], correct: 2, type: 'text', setNo: 1, skillType: 'Kısa Süreli İşitsel' },
        { soru_no: 2, question: 'Bahçe resminde çocuk ne yapıyordu?', options: ['Top oynuyordu', 'Yürüyordu', 'Kitap okuyordu', 'Çiçek suluyordu', 'Koşuyordu'], correct: 3, type: 'text', setNo: 1, skillType: 'Kısa Süreli Görsel' },
        { soru_no: 3, question: 'Bahçe resmindeki çiçek hangisiydi?', options: ['cicek1.png', 'cicek2.png', 'cicek3.png', 'cicek4.png', 'cicek5.png'], correct: 0, type: 'image', setNo: 1, skillType: 'Kısa Süreli Görsel' },
        { soru_no: 4, question: 'Serçeler yuvayı nereye yapmış?', options: ['Ağaca', 'Balkona', 'Direğe', 'Çatıya', 'Duvara'], correct: 3, type: 'text', setNo: 1, skillType: 'Kısa Süreli İşitsel' },
        { soru_no: 5, question: 'Bahçe resminde hangisi yoktu?', options: ['Ağaç', 'Kuş', 'Hortum', 'Çocuk', 'Çiçek'], correct: 1, type: 'text', setNo: 1, skillType: 'İşler Hafıza' }
    ],
    // SET 2 soruları
    [
        { soru_no: 6, question: 'Ayşe uçurtmayı nerede uçurdu?', options: ['Sahilde', 'Parkta', 'Ormanda', 'Evde', 'Çiftlikte'], correct: 1, type: 'text', setNo: 2, skillType: 'Kısa Süreli İşitsel' },
        { soru_no: 7, question: 'Kütüphane resminde kaç çocuk vardı?', options: ['1', '3', '2', '4', '5'], correct: 1, type: 'text', setNo: 2, skillType: 'Kısa Süreli Görsel' },
        { soru_no: 8, question: 'Bahçe resminde çocuğun elindeki hortum hangi renkti?', options: ['Sarı', 'Mavi', 'Kırmızı', 'Yeşil', 'Beyaz'], correct: 2, type: 'text', setNo: 2, skillType: 'Uzun Süreli Görsel' },
        { soru_no: 9, question: 'Kaç serçe çatıya yuva yapmış?', options: ['1', '2', '3', '4', '5'], correct: 1, type: 'text', setNo: 2, skillType: 'Uzun Süreli İşitsel' },
        { soru_no: 10, question: 'Kütüphane resminde hangisi yoktu?', options: ['Tablo', 'Saat', 'Kalemlik', 'Koltuk', 'Masa'], correct: 1, type: 'text', setNo: 2, skillType: 'İşler Hafıza' }
    ],
    // SET 3 soruları
    [
        { soru_no: 11, question: 'Öğrencilere hangi öğretmen ders anlattı?', options: ['Matematik Öğretmeni', 'İngilizce Öğretmeni', 'Türkçe Öğretmeni', 'Müzik Öğretmeni', 'Sınıf Öğretmeni'], correct: 2, type: 'text', setNo: 3, skillType: 'Kısa Süreli İşitsel' },
        { soru_no: 12, question: 'Kütüphane resminde bulunan koltuk hangisiydi?', options: ['koltuk1.png', 'koltuk2.png', 'koltuk3.png', 'koltuk4.png', 'koltuk5.png'], correct: 0, type: 'image', setNo: 3, skillType: 'Uzun Süreli Görsel' },
        { soru_no: 13, question: 'Kamp resminde hangisi yoktu?', options: ['Kuş', 'Çadır', 'El feneri', 'Top', 'Köpek'], correct: 3, type: 'text', setNo: 3, skillType: 'İşler Hafıza' },
        { soru_no: 14, question: 'Kamp resmindeki köpek hangisiydi?', options: ['kopek1.png', 'kopek2.png', 'kopek3.png', 'kopek4.png', 'kopek5.png'], correct: 4, type: 'image', setNo: 3, skillType: 'Kısa Süreli Görsel' },
        { soru_no: 15, question: 'Parkta mavi uçurtmayı kim uçurdu?', options: ['Aysel', 'Arda', 'Aslı', 'Ayşe', 'Ayaz'], correct: 3, type: 'text', setNo: 3, skillType: 'Uzun Süreli İşitsel' }
    ],
    // SET 4 soruları
    [
        { soru_no: 16, question: 'Yelken resminde üzerinde elma olan yelken hangi renkti?', options: ['Kırmızı', 'Sarı', 'Mavi', 'Yeşil', 'Turuncu'], correct: 2, type: 'text', setNo: 4, skillType: 'Kısa Süreli Görsel' },
        { soru_no: 17, question: 'Türkçe öğretmeni kaç öğrenciye ders anlattı?', options: ['29', '30', '31', '32', '33'], correct: 1, type: 'text', setNo: 4, skillType: 'Uzun Süreli İşitsel' },
        { soru_no: 18, question: 'Yelken resminde yelkenlerin üzerindeki rakamların toplamı kaçtır?', options: ['6', '7', '8', '9', '5'], correct: 3, type: 'text', setNo: 4, skillType: 'İşler Hafıza' },
        { soru_no: 19, question: 'Kamp resminde bulunan top hangisiydi?', options: ['top1.png', 'top2.png', 'top3.png', 'top4.png', 'top5.png'], correct: 1, type: 'image', setNo: 4, skillType: 'Uzun Süreli Görsel' },
        { soru_no: 20, question: 'Denizde yüzen ve kırmızı kolluğu olmayan kaç çocuk vardı?', options: ['0', '1', '2', '3', '4'], correct: 2, type: 'text', setNo: 4, skillType: 'İşler Hafıza' }
    ]
];

// Test başlatma
app.post('/api/hafiza/test/basla', async (req, res) => {
    try {
        const { kullanici_id } = req.body;
        
        if (!kullanici_id) {
            return res.status(400).json({ error: 'kullanici_id gerekli' });
        }

        // Test kaydı oluştur
        const testResult = await pool.query(
            'INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani) VALUES ($1, $2, NOW()) RETURNING id',
            [kullanici_id, 'HAFIZA']
        );
        
        const test_id = testResult.rows[0].id;

        // Hafıza sonuçları tablosuna başlangıç kaydı
        await pool.query(`
            INSERT INTO hafiza_sonuclari (kullanici_id, test_id) 
            VALUES ($1, $2)
        `, [kullanici_id, test_id]);

        res.json({
            success: true,
            test_id: test_id,
            message: 'Hafıza testi başlatıldı',
            setler: HAFIZA_SETLER,
            toplam_soru: 20,
            soru_basina_sure_saniye: 6
        });

    } catch (error) {
        console.error('Test başlatma hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Soru cevabı kaydetme
app.post('/api/hafiza/soru/kaydet', async (req, res) => {
    try {
        const { 
            test_id, 
            kullanici_id, 
            soru_no,
            set_no,
            soru_tipi,
            beceri_tipi,
            soru_metni,
            secenekler,
            dogru_cevap,
            verilen_cevap,
            tepki_suresi_ms,
            zaman_asimi
        } = req.body;

        // Validasyon
        if (!test_id || !kullanici_id || !soru_no || !set_no) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        if (soru_no < 1 || soru_no > 20) {
            return res.status(400).json({ error: 'Geçersiz soru numarası' });
        }

        if (set_no < 1 || set_no > 4) {
            return res.status(400).json({ error: 'Geçersiz set numarası' });
        }

        // Doğru mu kontrolü
        const dogru_mu = verilen_cevap !== null && verilen_cevap === dogru_cevap;

        // Ham veriyi kaydet
        await pool.query(`
            INSERT INTO hafiza_ham_veri 
            (kullanici_id, test_id, soru_no, set_no, soru_tipi, beceri_tipi,
             soru_metni, secenekler, dogru_cevap, verilen_cevap, 
             dogru_mu, tepki_suresi_ms, zaman_asimi)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [kullanici_id, test_id, soru_no, set_no, soru_tipi, beceri_tipi,
            soru_metni, JSON.stringify(secenekler), dogru_cevap, verilen_cevap,
            dogru_mu, tepki_suresi_ms, zaman_asimi]);

        res.json({
            success: true,
            message: 'Soru cevabı kaydedildi',
            dogru_mu: dogru_mu
        });

    } catch (error) {
        console.error('Soru kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Örnek test sonucu kaydetme
app.post('/api/hafiza/ornek/kaydet', async (req, res) => {
    try {
        const { test_id, kullanici_id, ornek_dogru_sayisi, deneme_sayisi } = req.body;

        if (!test_id || !kullanici_id || ornek_dogru_sayisi === undefined) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        const ornek_dogruluk_yuzdesi = (ornek_dogru_sayisi / 4) * 100;
        const ornek_gecti = ornek_dogruluk_yuzdesi >= 75;

        await pool.query(`
            INSERT INTO hafiza_ornek_sonuclari 
            (kullanici_id, test_id, ornek_dogru_sayisi, ornek_dogruluk_yuzdesi, 
             ornek_gecti, deneme_sayisi)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [kullanici_id, test_id, ornek_dogru_sayisi, ornek_dogruluk_yuzdesi, 
            ornek_gecti, deneme_sayisi]);

        res.json({
            success: true,
            message: 'Örnek test sonucu kaydedildi',
            ornek_gecti: ornek_gecti,
            ornek_dogruluk_yuzdesi: ornek_dogruluk_yuzdesi
        });

    } catch (error) {
        console.error('Örnek test kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test tamamlama ve sonuç hesaplama
app.post('/api/hafiza/test/tamamla', async (req, res) => {
    try {
        const { test_id, kullanici_id, toplam_test_suresi } = req.body;

        if (!test_id || !kullanici_id) {
            return res.status(400).json({ error: 'test_id ve kullanici_id gerekli' });
        }

        // Sonuçları hesapla
        await hesaplaSonuclar(test_id, kullanici_id, toplam_test_suresi);
        
        // Beceri skorlarını hesapla
        await hesaplaBeceriSkorlari(test_id, kullanici_id);

        // Sonuçları getir
        const sonuclar = await getSonuclar(test_id);

        res.json({
            success: true,
            message: 'Test tamamlandı ve sonuçlar hesaplandı',
            sonuclar: sonuclar
        });

    } catch (error) {
        console.error('Test tamamlama hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Sonuçları hesaplama fonksiyonu
async function hesaplaSonuclar(test_id, kullanici_id, toplam_test_suresi) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Ham verileri al
        const hamVeri = await client.query(`
            SELECT * FROM hafiza_ham_veri 
            WHERE test_id = $1 
            ORDER BY soru_no
        `, [test_id]);

        const veriler = hamVeri.rows;
        
        // Set bazında hesaplamalar
        const setSonuclari = {};
        
        for (let set = 1; set <= 4; set++) {
            const setVerileri = veriler.filter(v => v.set_no === set);
            const dogruCevaplar = setVerileri.filter(v => v.dogru_mu);
            
            const dogru_sayisi = dogruCevaplar.length;
            const toplam_soru = setVerileri.length;
            const dogruluk_yuzdesi = toplam_soru > 0 ? (dogru_sayisi / toplam_soru * 100) : 0;
            
            // Ortalama süre (sadece doğru cevaplar için)
            const ortalama_sure = dogruCevaplar.length > 0 ? 
                dogruCevaplar.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / dogruCevaplar.length : 0;
            
            // Toplam süre (tüm cevaplar için)
            const toplam_sure = setVerileri.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0);
            
            setSonuclari[`set${set}`] = {
                dogru_sayisi,
                toplam_soru,
                dogruluk_yuzdesi,
                ortalama_sure,
                toplam_sure
            };
        }

        // Genel metrikler
        const toplamDogruCevaplar = veriler.filter(v => v.dogru_mu);
        const toplam_dogru_sayisi = toplamDogruCevaplar.length;
        const toplam_soru_sayisi = veriler.length;
        const genel_dogruluk_yuzdesi = toplam_soru_sayisi > 0 ? (toplam_dogru_sayisi / toplam_soru_sayisi * 100) : 0;
        const ortalama_tepki_suresi = toplamDogruCevaplar.length > 0 ?
            toplamDogruCevaplar.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / toplamDogruCevaplar.length : 0;

        // Zaman aşımı analizi
        const zaman_asimi_sayisi = veriler.filter(v => v.zaman_asimi).length;
        const zaman_asimi_orani = toplam_soru_sayisi > 0 ? (zaman_asimi_sayisi / toplam_soru_sayisi * 100) : 0;

        // Hız skoru hesaplama (6 saniye maksimum, daha hızlı = daha yüksek puan)
        const hiz_skoru = ortalama_tepki_suresi > 0 ? 
            Math.max(0, Math.min(100, (6000 - ortalama_tepki_suresi) / 60)) : 0;

        // Tamamlanamayan soru bilgisi
        const tamamlanmayanSoru = veriler.find(v => v.verilen_cevap === null);

        // Sonuçları güncelle
        await client.query(`
            UPDATE hafiza_sonuclari SET
                set1_dogru_sayisi = $1, set1_toplam_soru = $2, set1_dogruluk_yuzdesi = $3, 
                set1_ortalama_sure = $4, set1_toplam_sure = $5,
                set2_dogru_sayisi = $6, set2_toplam_soru = $7, set2_dogruluk_yuzdesi = $8,
                set2_ortalama_sure = $9, set2_toplam_sure = $10,
                set3_dogru_sayisi = $11, set3_toplam_soru = $12, set3_dogruluk_yuzdesi = $13,
                set3_ortalama_sure = $14, set3_toplam_sure = $15,
                set4_dogru_sayisi = $16, set4_toplam_soru = $17, set4_dogruluk_yuzdesi = $18,
                set4_ortalama_sure = $19, set4_toplam_sure = $20,
                toplam_dogru_sayisi = $21, toplam_soru_sayisi = $22, genel_dogruluk_yuzdesi = $23,
                ortalama_tepki_suresi = $24, toplam_test_suresi = $25,
                zaman_asimi_sayisi = $26, zaman_asimi_orani = $27, hiz_skoru = $28,
                tamamlanamayan_soru_no = $29, tamamlanamayan_set_no = $30
            WHERE test_id = $31
        `, [
            setSonuclari.set1.dogru_sayisi, setSonuclari.set1.toplam_soru, setSonuclari.set1.dogruluk_yuzdesi,
            setSonuclari.set1.ortalama_sure, setSonuclari.set1.toplam_sure,
            setSonuclari.set2.dogru_sayisi, setSonuclari.set2.toplam_soru, setSonuclari.set2.dogruluk_yuzdesi,
            setSonuclari.set2.ortalama_sure, setSonuclari.set2.toplam_sure,
            setSonuclari.set3.dogru_sayisi, setSonuclari.set3.toplam_soru, setSonuclari.set3.dogruluk_yuzdesi,
            setSonuclari.set3.ortalama_sure, setSonuclari.set3.toplam_sure,
            setSonuclari.set4.dogru_sayisi, setSonuclari.set4.toplam_soru, setSonuclari.set4.dogruluk_yuzdesi,
            setSonuclari.set4.ortalama_sure, setSonuclari.set4.toplam_sure,
            toplam_dogru_sayisi, toplam_soru_sayisi, genel_dogruluk_yuzdesi,
            ortalama_tepki_suresi, toplam_test_suresi || 0,
            zaman_asimi_sayisi, zaman_asimi_orani, hiz_skoru,
            tamamlanmayanSoru ? tamamlanmayanSoru.soru_no : null,
            tamamlanmayanSoru ? tamamlanmayanSoru.set_no : null,
            test_id
        ]);

        await client.query('COMMIT');
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Beceri skorlarını hesaplama
async function hesaplaBeceriSkorlari(test_id, kullanici_id) {
    const client = await pool.connect();
    
    try {
        // Ham verileri beceri tipi bazında al
        const hamVeri = await client.query(`
            SELECT beceri_tipi, dogru_mu, COUNT(*) as toplam
            FROM hafiza_ham_veri 
            WHERE test_id = $1 
            GROUP BY beceri_tipi, dogru_mu
            ORDER BY beceri_tipi
        `, [test_id]);

        // Beceri bazında doğru/yanlış sayılarını hesapla
        const beceriSayilari = {};
        hamVeri.rows.forEach(row => {
            if (!beceriSayilari[row.beceri_tipi]) {
                beceriSayilari[row.beceri_tipi] = { dogru: 0, toplam: 0 };
            }
            beceriSayilari[row.beceri_tipi].toplam += parseInt(row.toplam);
            if (row.dogru_mu) {
                beceriSayilari[row.beceri_tipi].dogru += parseInt(row.toplam);
            }
        });

        // Beceri skorlarını hesapla (0-100 arası)
        const skorlar = {
            kisa_sureli_isitsel_hafiza_skoru: beceriSayilari['Kısa Süreli İşitsel'] ? 
                (beceriSayilari['Kısa Süreli İşitsel'].dogru / beceriSayilari['Kısa Süreli İşitsel'].toplam * 100) : 0,
            
            kisa_sureli_gorsel_hafiza_skoru: beceriSayilari['Kısa Süreli Görsel'] ? 
                (beceriSayilari['Kısa Süreli Görsel'].dogru / beceriSayilari['Kısa Süreli Görsel'].toplam * 100) : 0,
            
            uzun_sureli_isitsel_hafiza_skoru: beceriSayilari['Uzun Süreli İşitsel'] ? 
                (beceriSayilari['Uzun Süreli İşitsel'].dogru / beceriSayilari['Uzun Süreli İşitsel'].toplam * 100) : 0,
            
            uzun_sureli_gorsel_hafiza_skoru: beceriSayilari['Uzun Süreli Görsel'] ? 
                (beceriSayilari['Uzun Süreli Görsel'].dogru / beceriSayilari['Uzun Süreli Görsel'].toplam * 100) : 0,
            
            isler_hafiza_skoru: beceriSayilari['İşler Hafıza'] ? 
                (beceriSayilari['İşler Hafıza'].dogru / beceriSayilari['İşler Hafıza'].toplam * 100) : 0
        };
        
        // Genel performans skoru
        skorlar.genel_performans_skoru = Object.values(skorlar).reduce((a, b) => a + b, 0) / Object.keys(skorlar).length;
        
        // Beceri skorlarını kaydet
        await client.query(`
            INSERT INTO hafiza_beceri_skorlari
            (test_id, kullanici_id, kisa_sureli_isitsel_hafiza_skoru, kisa_sureli_gorsel_hafiza_skoru,
             uzun_sureli_isitsel_hafiza_skoru, uzun_sureli_gorsel_hafiza_skoru, isler_hafiza_skoru,
             genel_performans_skoru)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            test_id, kullanici_id,
            skorlar.kisa_sureli_isitsel_hafiza_skoru,
            skorlar.kisa_sureli_gorsel_hafiza_skoru,
            skorlar.uzun_sureli_isitsel_hafiza_skoru,
            skorlar.uzun_sureli_gorsel_hafiza_skoru,
            skorlar.isler_hafiza_skoru,
            skorlar.genel_performans_skoru
        ]);
        
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}

// Sonuçları getirme
async function getSonuclar(test_id) {
    const result = await pool.query(`
        SELECT 
            s.*,
            b.kisa_sureli_isitsel_hafiza_skoru,
            b.kisa_sureli_gorsel_hafiza_skoru,
            b.uzun_sureli_isitsel_hafiza_skoru,
            b.uzun_sureli_gorsel_hafiza_skoru,
            b.isler_hafiza_skoru,
            b.genel_performans_skoru
        FROM hafiza_sonuclari s
        LEFT JOIN hafiza_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.test_id = $1
    `, [test_id]);
    
    return result.rows[0] || null;
}

// Test sonucu görüntüleme
app.get('/api/hafiza/sonuc/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        const sonuc = await getSonuclar(test_id);
        
        if (!sonuc) {
            return res.status(404).json({ error: 'Test bulunamadı' });
        }
        
        res.json({
            success: true,
            sonuc: sonuc
        });
        
    } catch (error) {
        console.error('Sonuç getirme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Kullanıcının tüm hafıza testleri
app.get('/api/hafiza/kullanici/:kullanici_id/testler', async (req, res) => {
    try {
        const { kullanici_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                s.test_id,
                s.tarih,
                s.genel_dogruluk_yuzdesi,
                s.toplam_dogru_sayisi,
                s.toplam_test_suresi,
                s.ortalama_tepki_suresi,
                s.hiz_skoru,
                s.zaman_asimi_orani,
                b.genel_performans_skoru
            FROM hafiza_sonuclari s
            LEFT JOIN hafiza_beceri_skorlari b ON s.test_id = b.test_id
            WHERE s.kullanici_id = $1
            ORDER BY s.tarih DESC
        `, [kullanici_id]);
        
        res.json({
            success: true,
            testler: result.rows
        });
        
    } catch (error) {
        console.error('Kullanıcı testleri getirme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Setleri getirme
app.get('/api/hafiza/setler', (req, res) => {
    res.json({
        success: true,
        setler: HAFIZA_SETLER
    });
});

// Soru listesini getirme
app.get('/api/hafiza/sorular', (req, res) => {
    res.json({
        success: true,
        sorular: HAFIZA_SORULARI
    });
});

// Ham veri analizi
app.get('/api/hafiza/analiz/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                set_no,
                beceri_tipi,
                COUNT(*) as toplam_soru,
                COUNT(CASE WHEN dogru_mu = true THEN 1 END) as dogru_sayisi,
                COUNT(CASE WHEN verilen_cevap IS NULL THEN 1 END) as cevapsiz,
                COUNT(CASE WHEN zaman_asimi = true THEN 1 END) as zaman_asimi,
                AVG(CASE WHEN dogru_mu = true THEN tepki_suresi_ms END) as ort_dogru_sure,
                AVG(tepki_suresi_ms) as ort_tepki_sure
            FROM hafiza_ham_veri
            WHERE test_id = $1
            GROUP BY set_no, beceri_tipi
            ORDER BY set_no, beceri_tipi
        `, [test_id]);
        
        res.json({
            success: true,
            analiz: result.rows
        });
        
    } catch (error) {
        console.error('Analiz getirme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Server başlatma
app.listen(port, () => {
    console.log(`Hafıza API sunucusu http://localhost:${port} adresinde çalışıyor`);
});

module.exports = app; 