const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3006;

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

// Dikkat test soruları (HTML'den alınan veriler)
const DIKKAT_SORULARI = {
    practiceQuestions: [
        { question: ['o', 'k', 'o', 'm', 't', 'y'], target: 'o' },
        { question: ['56', '79', '27', '60', '23', '56'], target: '56' },
        { question: ['ke', 'me', 'em', 'ke', 'en', 'mn'], target: 'ke' },
        { question: ['5', '8', '3', '9', '2', '5'], target: '5' },
        { question: ['6k1', 'k61', 'k16', '61k', 'k16', '16k'], target: 'k16' }
    ],
    
    mainQuestions: [
        { question: ['5', '6', '2', '1', '5', '8'], target: '5' },
        { question: ['m', 't', 'k', 'a', 't', 'h'], target: 't' },
        { question: ['6', '1', '5', '2', '3', '3'], target: '3' },
        { question: ['y', 'd', 'u', 'v', 'u', 'p'], target: 'u' },
        { question: ['6', '1', '3', '1', '5', '8'], target: '1' },
        { question: ['7', '4', '2', '1', '8', '4'], target: '4' },
        { question: ['n', 'a', 'e', 'c', 'e', 'm'], target: 'e' },
        { question: ['7', '4', '6', '2', '5', '6'], target: '6' },
        { question: ['d', 'h', 'k', 'd', 'b', 'o'], target: 'd' },
        { question: ['2', '7', '5', '9', '4', '9'], target: '9' },
        { question: ['s', 'y', 'd', 'g', 's', 'p'], target: 's' },
        { question: ['3', '8', '5', '2', '5', '6'], target: '5' },
        { question: ['m', 'n', 'j', 'c', 'm', 'ç'], target: 'm' },
        { question: ['84', '56', '86', '45', '57', '45'], target: '45' },
        { question: ['ta', 'at', 'al', 'li', 'at', 'il'], target: 'at' },
        { question: ['68', '48', '86', '68', '84', '54'], target: '68' },
        { question: ['ık', 'na', 'ku', 'ok', 'ık', 'ka'], target: 'ık' },
        { question: ['24', '42', '74', '45', '27', '74'], target: '74' },
        { question: ['me', 'na', 'en', 'na', 'ma', 'ne'], target: 'na' },
        { question: ['69', '92', '26', '96', '62', '62'], target: '62' },
        { question: ['şı', 'ce', 'şe', 'ça', 'ca', 'ça'], target: 'ça' },
        { question: ['72', '27', '52', '22', '25', '72'], target: '72' },
        { question: ['hi', 'hı', 'ıh', 'ik', 'ik', 'ih'], target: 'ik' },
        { question: ['43', '48', '84', '38', '83', '43'], target: '43' },
        { question: ['ro', 'no', 'on', 'ru', 'ro', 'un'], target: 'ro' },
        { question: ['13', '31', '24', '24', '12', '35'], target: '24' },
        { question: ['bı', 'ıd', 'bi', 'ıd', 'ib', 'di'], target: 'ıd' },
        { question: ['52', '25', '55', '55', '22', '24'], target: '55' },
        { question: ['uç', 'aş', 'şi', 'uş', 'şe', 'uş'], target: 'uş' },
        { question: ['36', '23', '63', '32', '33', '36'], target: '36' },
        { question: ['yku', 'nkv', 'mac', 'yhg', 'ylg', 'yku'], target: 'yku' },
        { question: ['375', '562', '656', '756', '356', '656'], target: '656' },
        { question: ['cau', 'uau', 'cua', 'cuv', 'uca', 'cau'], target: 'cau' },
        { question: ['424', '243', '424', '342', '234', '324'], target: '424' },
        { question: ['lhm', 'hlm', 'hml', 'mlh', 'lmh', 'mlh'], target: 'mlh' },
        { question: ['852', '258', '285', '258', '825', '582'], target: '258' },
        { question: ['7ç1', 'ç71', 'ç17', '71ç', 'ç17', '17ç'], target: 'ç17' },
        { question: ['289', '298', '982', '928', '829', '982'], target: '982' },
        { question: ['sbv', 'nzı', 'sbm', 'sdg', 'sbm', 'sag'], target: 'sbm' },
        { question: ['636', '361', '636', '163', '316', '136'], target: '636' },
        { question: ['env', 'vzn', 'evn', 'evk', 'ven', 'evk'], target: 'evk' },
        { question: ['525', '528', '285', '582', '528', '825'], target: '528' },
        { question: ['ıvs', 'svs', 'ısv', 'ısh', 'sıv', 'ısh'], target: 'ısh' },
        { question: ['969', '964', '649', '694', '964', '946'], target: '964' },
        { question: ['mhm', 'hmm', 'hhm', 'hmh', 'mmh', 'mmh'], target: 'mmh' },
        { question: ['817', '187', '781', '718', '871', '718'], target: '718' },
        { question: ['2v5', 'v52', 'v25', '25v', 'v52', '52v'], target: 'v52' },
        { question: ['652', '256', '562', '526', '625', '256'], target: '256' },
        { question: ['4g4', '4gg', '44g', '4g4', 'g4g', 'g44'], target: '4g4' },
        { question: ['797', '797', '369', '697', '973', '396'], target: '797' }
    ]
};

// Element kategorisi belirleme fonksiyonu
function getElementCategory(element) {
    if (element.length === 1) {
        return /\d/.test(element) ? 'Tek Rakam' : 'Tek Harf';
    } else if (element.length === 2) {
        return /\d/.test(element) ? 'İki Rakam' : 'İki Harf';
    } else if (element.length === 3) {
        return 'Üç Karakter';
    } else {
        return 'Karışık Format';
    }
}

// Zorluk seviyesi belirleme
function getDifficultyLevel(element) {
    const category = getElementCategory(element);
    switch (category) {
        case 'Tek Harf':
        case 'Tek Rakam':
            return 1;
        case 'İki Harf':
        case 'İki Rakam':
            return 2;
        case 'Üç Karakter':
            return 3;
        default:
            return 4;
    }
}

// Test başlatma
app.post('/api/dikkat/test/basla', async (req, res) => {
    try {
        const { kullanici_id } = req.body;
        
        if (!kullanici_id) {
            return res.status(400).json({ error: 'kullanici_id gerekli' });
        }

        // Test kaydı oluştur
        const testResult = await pool.query(
            'INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani) VALUES ($1, $2, NOW()) RETURNING id',
            [kullanici_id, 'DIKKAT']
        );
        
        const test_id = testResult.rows[0].id;

        // Dikkat sonuçları tablosuna başlangıç kaydı
        await pool.query(`
            INSERT INTO dikkat_sonuclari (kullanici_id, test_id) 
            VALUES ($1, $2)
        `, [kullanici_id, test_id]);

        res.json({
            success: true,
            test_id: test_id,
            message: 'Dikkat testi başlatıldı',
            ornek_soru_sayisi: DIKKAT_SORULARI.practiceQuestions.length,
            ana_test_soru_sayisi: DIKKAT_SORULARI.mainQuestions.length,
            toplam_soru: DIKKAT_SORULARI.practiceQuestions.length + DIKKAT_SORULARI.mainQuestions.length,
            ornek_test_suresi_saniye: 30,
            ana_test_suresi_saniye: 180
        });

    } catch (error) {
        console.error('Test başlatma hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Soru cevabı kaydetme
app.post('/api/dikkat/soru/kaydet', async (req, res) => {
    try {
        const { 
            test_id, 
            kullanici_id, 
            soru_no,
            test_tipi,
            soru_elementi,
            hedef_element,
            verilen_cevap,
            tepki_suresi_ms
        } = req.body;

        // Validasyon
        if (!test_id || !kullanici_id || !soru_no || !test_tipi) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        if (!['practice', 'main'].includes(test_tipi)) {
            return res.status(400).json({ error: 'Geçersiz test tipi' });
        }

        // Doğru mu kontrolü
        const dogru_mu = verilen_cevap !== null && verilen_cevap === hedef_element;

        // Ham veriyi kaydet
        await pool.query(`
            INSERT INTO dikkat_ham_veri 
            (kullanici_id, test_id, soru_no, test_tipi, soru_elementi, 
             hedef_element, verilen_cevap, dogru_mu, tepki_suresi_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [kullanici_id, test_id, soru_no, test_tipi, JSON.stringify(soru_elementi), 
            hedef_element, verilen_cevap, dogru_mu, tepki_suresi_ms]);

        res.json({
            success: true,
            message: 'Soru cevabı kaydedildi',
            dogru_mu: dogru_mu,
            kategori: getElementCategory(hedef_element),
            zorluk_seviyesi: getDifficultyLevel(hedef_element)
        });

    } catch (error) {
        console.error('Soru kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Örnek test sonucu kaydetme
app.post('/api/dikkat/ornek/kaydet', async (req, res) => {
    try {
        const { test_id, kullanici_id, ornek_dogru_sayisi, ornek_sure_saniye, deneme_sayisi } = req.body;

        if (!test_id || !kullanici_id || ornek_dogru_sayisi === undefined) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        const ornek_dogruluk_yuzdesi = (ornek_dogru_sayisi / 5) * 100;
        const ornek_gecti = ornek_dogru_sayisi >= 3; // 3/5 doğru gerekli

        // Örnek detay tablosuna kaydet
        await pool.query(`
            INSERT INTO dikkat_ornek_detay 
            (kullanici_id, test_id, deneme_no, ornek_dogru_sayisi, 
             ornek_sure_saniye, ornek_gecti, tekrar_gerekli)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [kullanici_id, test_id, deneme_sayisi || 1, ornek_dogru_sayisi, 
            ornek_sure_saniye || 0, ornek_gecti, !ornek_gecti]);

        res.json({
            success: true,
            message: 'Örnek test sonucu kaydedildi',
            ornek_gecti: ornek_gecti,
            ornek_dogruluk_yuzdesi: ornek_dogruluk_yuzdesi,
            tekrar_gerekli: !ornek_gecti
        });

    } catch (error) {
        console.error('Örnek test kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test tamamlama ve sonuç hesaplama
app.post('/api/dikkat/test/tamamla', async (req, res) => {
    try {
        const { test_id, kullanici_id, ana_test_suresi } = req.body;

        if (!test_id || !kullanici_id) {
            return res.status(400).json({ error: 'test_id ve kullanici_id gerekli' });
        }

        // Sonuçları hesapla
        await hesaplaSonuclar(test_id, kullanici_id, ana_test_suresi);
        
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
async function hesaplaSonuclar(test_id, kullanici_id, ana_test_suresi) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Ham verileri al
        const hamVeri = await client.query(`
            SELECT * FROM dikkat_ham_veri 
            WHERE test_id = $1 
            ORDER BY soru_no
        `, [test_id]);

        const veriler = hamVeri.rows;
        
        // Örnek ve ana test verilerini ayır
        const ornekVeriler = veriler.filter(v => v.test_tipi === 'practice');
        const anaTestVeriler = veriler.filter(v => v.test_tipi === 'main');

        // Örnek test hesaplamaları
        const ornekDogruSayisi = ornekVeriler.filter(v => v.dogru_mu).length;
        const ornekDogrulukYuzdesi = ornekVeriler.length > 0 ? (ornekDogruSayisi / ornekVeriler.length * 100) : 0;
        const ornekGecti = ornekDogruSayisi >= 3;
        const ornekOrtalamaTepkiSuresi = ornekVeriler.length > 0 ? 
            ornekVeriler.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / ornekVeriler.length : 0;

        // Ana test hesaplamaları
        const anaTestDogruSayisi = anaTestVeriler.filter(v => v.dogru_mu).length;
        const anaTestDogrulukYuzdesi = anaTestVeriler.length > 0 ? (anaTestDogruSayisi / anaTestVeriler.length * 100) : 0;
        const anaTestOrtalamaTepkiSuresi = anaTestVeriler.length > 0 ?
            anaTestVeriler.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / anaTestVeriler.length : 0;
        const anaTestTamamlandi = anaTestVeriler.length > 0;

        // Genel metrikler
        const toplamDogruSayisi = ornekDogruSayisi + anaTestDogruSayisi;
        const toplamSoruSayisi = veriler.length;
        const genelDogrulukYuzdesi = toplamSoruSayisi > 0 ? (toplamDogruSayisi / toplamSoruSayisi * 100) : 0;
        const genelOrtalamaTepkiSuresi = toplamSoruSayisi > 0 ?
            veriler.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / toplamSoruSayisi : 0;

        // Performans analizi
        const hizliTepkiSayisi = veriler.filter(v => v.tepki_suresi_ms && v.tepki_suresi_ms < 1000).length;
        const yavasTepkiSayisi = veriler.filter(v => v.tepki_suresi_ms && v.tepki_suresi_ms > 3000).length;
        const ortalamaHizSkoru = genelOrtalamaTepkiSuresi > 0 ? 
            Math.max(0, Math.min(100, (5000 - genelOrtalamaTepkiSuresi) / 50)) : 0;

        // Dikkat türleri analizi
        const tekKarakterDogru = veriler.filter(v => v.dogru_mu && v.hedef_element.length === 1).length;
        const ciftKarakterDogru = veriler.filter(v => v.dogru_mu && v.hedef_element.length === 2).length;
        const ucKarakterDogru = veriler.filter(v => v.dogru_mu && v.hedef_element.length >= 3).length;

        // Hata analizi
        const yanlisSecimSayisi = veriler.filter(v => !v.dogru_mu && v.verilen_cevap !== null).length;
        const cevapsizSayisi = veriler.filter(v => v.verilen_cevap === null).length;

        // Sonuçları güncelle
        await client.query(`
            UPDATE dikkat_sonuclari SET
                ornek_dogru_sayisi = $1, ornek_dogruluk_yuzdesi = $2, ornek_gecti = $3,
                ornek_ortalama_tepki_suresi = $4,
                ana_test_dogru_sayisi = $5, ana_test_dogruluk_yuzdesi = $6,
                ana_test_ortalama_tepki_suresi = $7, ana_test_toplam_suresi = $8,
                ana_test_tamamlandi = $9,
                toplam_dogru_sayisi = $10, toplam_soru_sayisi = $11, genel_dogruluk_yuzdesi = $12,
                genel_ortalama_tepki_suresi = $13,
                hizli_tepki_sayisi = $14, yavas_tepki_sayisi = $15, ortalama_hiz_skoru = $16,
                tek_karakter_dogru = $17, cift_karakter_dogru = $18, uc_karakter_dogru = $19,
                yanlis_secim_sayisi = $20, cevapsiz_sayisi = $21
            WHERE test_id = $22
        `, [
            ornekDogruSayisi, ornekDogrulukYuzdesi, ornekGecti, ornekOrtalamaTepkiSuresi,
            anaTestDogruSayisi, anaTestDogrulukYuzdesi, anaTestOrtalamaTepkiSuresi, ana_test_suresi || 0,
            anaTestTamamlandi,
            toplamDogruSayisi, toplamSoruSayisi, genelDogrulukYuzdesi, genelOrtalamaTepkiSuresi,
            hizliTepkiSayisi, yavasTepkiSayisi, ortalamaHizSkoru,
            tekKarakterDogru, ciftKarakterDogru, ucKarakterDogru,
            yanlisSecimSayisi, cevapsizSayisi,
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
        // Sonuçları al
        const sonucResult = await client.query(`
            SELECT * FROM dikkat_sonuclari WHERE test_id = $1
        `, [test_id]);

        const sonuc = sonucResult.rows[0];
        if (!sonuc) return;

        // Ham verileri al
        const hamVeri = await client.query(`
            SELECT * FROM dikkat_ham_veri WHERE test_id = $1
        `, [test_id]);

        const veriler = hamVeri.rows;

        // Beceri skorlarını hesapla (0-100 arası)
        const skorlar = {
            // Seçici Dikkat: Hedef elementleri doğru seçme yetisi
            secici_dikkat_skoru: sonuc.genel_dogruluk_yuzdesi || 0,
            
            // Sürdürülebilir Dikkat: Ana testteki performans istikrarı
            surdurulebilir_dikkat_skoru: sonuc.ana_test_dogruluk_yuzdesi || 0,
            
            // Bölünmüş Dikkat: Farklı element türlerindeki performans
            bolunmus_dikkat_skoru: veriler.length > 0 ? 
                ((sonuc.tek_karakter_dogru + sonuc.cift_karakter_dogru + sonuc.uc_karakter_dogru) / veriler.length * 100) : 0,
            
            // Görsel Tarama Hızı: Hız skoruna dayalı
            gorsel_tarama_hizi_skoru: sonuc.ortalama_hiz_skoru || 0,
            
            // Tepkime Hızı: Hızlı tepki oranı
            tepkime_hizi_skoru: veriler.length > 0 ? (sonuc.hizli_tepki_sayisi / veriler.length * 100) : 0,
            
            // Dikkati Yönlendirme: Hata oranının tersi
            dikkati_yonlendirme_skoru: Math.max(0, 100 - ((sonuc.yanlis_secim_sayisi + sonuc.cevapsiz_sayisi) / veriler.length * 100))
        };
        
        // Genel performans skoru
        skorlar.genel_performans_skoru = Object.values(skorlar).reduce((a, b) => a + b, 0) / Object.keys(skorlar).length;
        
        // Beceri skorlarını kaydet
        await client.query(`
            INSERT INTO dikkat_beceri_skorlari
            (test_id, kullanici_id, secici_dikkat_skoru, surdurulebilir_dikkat_skoru,
             bolunmus_dikkat_skoru, gorsel_tarama_hizi_skoru, tepkime_hizi_skoru,
             dikkati_yonlendirme_skoru, genel_performans_skoru)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            test_id, kullanici_id,
            skorlar.secici_dikkat_skoru,
            skorlar.surdurulebilir_dikkat_skoru,
            skorlar.bolunmus_dikkat_skoru,
            skorlar.gorsel_tarama_hizi_skoru,
            skorlar.tepkime_hizi_skoru,
            skorlar.dikkati_yonlendirme_skoru,
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
            b.secici_dikkat_skoru,
            b.surdurulebilir_dikkat_skoru,
            b.bolunmus_dikkat_skoru,
            b.gorsel_tarama_hizi_skoru,
            b.tepkime_hizi_skoru,
            b.dikkati_yonlendirme_skoru,
            b.genel_performans_skoru
        FROM dikkat_sonuclari s
        LEFT JOIN dikkat_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.test_id = $1
    `, [test_id]);
    
    return result.rows[0] || null;
}

// Test sonucu görüntüleme
app.get('/api/dikkat/sonuc/:test_id', async (req, res) => {
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

// Kullanıcının tüm dikkat testleri
app.get('/api/dikkat/kullanici/:kullanici_id/testler', async (req, res) => {
    try {
        const { kullanici_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                s.test_id,
                s.tarih,
                s.genel_dogruluk_yuzdesi,
                s.toplam_dogru_sayisi,
                s.ana_test_toplam_suresi,
                s.genel_ortalama_tepki_suresi,
                s.ortalama_hiz_skoru,
                s.ornek_gecti,
                s.ana_test_tamamlandi,
                b.genel_performans_skoru
            FROM dikkat_sonuclari s
            LEFT JOIN dikkat_beceri_skorlari b ON s.test_id = b.test_id
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

// Soru listesini getirme
app.get('/api/dikkat/sorular', (req, res) => {
    res.json({
        success: true,
        sorular: DIKKAT_SORULARI
    });
});

// Soru kategorilerini getirme
app.get('/api/dikkat/kategoriler', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM dikkat_soru_kategorileri ORDER BY zorluk_seviyesi, kategori_adi
        `);
        
        res.json({
            success: true,
            kategoriler: result.rows
        });
        
    } catch (error) {
        console.error('Kategori getirme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ham veri analizi
app.get('/api/dikkat/analiz/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                test_tipi,
                hedef_element,
                COUNT(*) as toplam_soru,
                COUNT(CASE WHEN dogru_mu = true THEN 1 END) as dogru_sayisi,
                COUNT(CASE WHEN verilen_cevap IS NULL THEN 1 END) as cevapsiz,
                AVG(CASE WHEN dogru_mu = true THEN tepki_suresi_ms END) as ort_dogru_sure,
                AVG(tepki_suresi_ms) as ort_tepki_sure,
                MIN(tepki_suresi_ms) as min_tepki_sure,
                MAX(tepki_suresi_ms) as max_tepki_sure
            FROM dikkat_ham_veri
            WHERE test_id = $1
            GROUP BY test_tipi, hedef_element
            ORDER BY test_tipi, hedef_element
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

// Örnek test detayları
app.get('/api/dikkat/ornek-detay/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        const result = await pool.query(`
            SELECT * FROM dikkat_ornek_detay 
            WHERE test_id = $1 
            ORDER BY deneme_no DESC
        `, [test_id]);
        
        res.json({
            success: true,
            ornek_detaylar: result.rows
        });
        
    } catch (error) {
        console.error('Örnek detay getirme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Server başlatma
app.listen(port, () => {
    console.log(`Dikkat API sunucusu http://localhost:${port} adresinde çalışıyor`);
});

module.exports = app; 