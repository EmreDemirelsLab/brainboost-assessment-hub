const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3004;

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

// Akıl Mantık test kategorileri ve soruları
const AKIL_MANTIK_KATEGORILER = {
    1: {
        ad: 'Dörtlü Yatay Format',
        aciklama: '4 elemanlı yatay dizilim örüntüleri',
        soru_sayisi: 8,
        zorluk_seviyesi: 2
    },
    2: {
        ad: 'Dörtlü Kare Format',
        aciklama: '4 elemanlı kare dizilim örüntüleri',
        soru_sayisi: 6,
        zorluk_seviyesi: 3
    },
    3: {
        ad: 'Altılı Kare Format',
        aciklama: '6 elemanlı kare dizilim örüntüleri',
        soru_sayisi: 3,
        zorluk_seviyesi: 4
    },
    4: {
        ad: 'L Format',
        aciklama: 'L şeklinde dizilim örüntüleri',
        soru_sayisi: 3,
        zorluk_seviyesi: 4
    },
    5: {
        ad: 'Dokuzlu Format',
        aciklama: '9 elemanlı karmaşık örüntüler',
        soru_sayisi: 3,
        zorluk_seviyesi: 5
    }
};

// Test soruları tanımları (HTML'den alınan veriler)
const TEST_SORULARI = [
    // BÖLÜM 1 - Dörtlü Yatay Format (8 soru)
    { soru_no: 1, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/1', dogru_cevap: 1, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 2, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/2', dogru_cevap: 4, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 3, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/3', dogru_cevap: 3, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 4, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/4', dogru_cevap: 4, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 5, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/5', dogru_cevap: 3, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 6, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/6', dogru_cevap: 1, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 7, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/7', dogru_cevap: 2, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    { soru_no: 8, folder: 'ÖRÜNTÜLER /2-DÖRTLÜ YATAY/8', dogru_cevap: 1, bolum_no: 1, kategori: 'Dörtlü Yatay Format', zorluk: 2 },
    
    // BÖLÜM 2 - Dörtlü Kare Format (6 soru)
    { soru_no: 9, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/1', dogru_cevap: 3, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    { soru_no: 10, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/2', dogru_cevap: 2, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    { soru_no: 11, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/3', dogru_cevap: 3, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    { soru_no: 12, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/4', dogru_cevap: 1, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    { soru_no: 13, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/5', dogru_cevap: 2, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    { soru_no: 14, folder: 'ÖRÜNTÜLER /3-DÖRTLÜ KARE FORMAT/6', dogru_cevap: 3, bolum_no: 2, kategori: 'Dörtlü Kare Format', zorluk: 3 },
    
    // BÖLÜM 3 - Altılı Kare Format (3 soru)
    { soru_no: 15, folder: 'ÖRÜNTÜLER /4-ALTILI KARE FORMAT/1', dogru_cevap: 5, bolum_no: 3, kategori: 'Altılı Kare Format', zorluk: 4 },
    { soru_no: 16, folder: 'ÖRÜNTÜLER /4-ALTILI KARE FORMAT/2', dogru_cevap: 0, bolum_no: 3, kategori: 'Altılı Kare Format', zorluk: 4 },
    { soru_no: 17, folder: 'ÖRÜNTÜLER /4-ALTILI KARE FORMAT/3', dogru_cevap: 2, bolum_no: 3, kategori: 'Altılı Kare Format', zorluk: 4 },
    
    // BÖLÜM 4 - L Format (3 soru)
    { soru_no: 18, folder: 'ÖRÜNTÜLER /5- L FORMAT/1', dogru_cevap: 4, bolum_no: 4, kategori: 'L Format', zorluk: 4 },
    { soru_no: 19, folder: 'ÖRÜNTÜLER /5- L FORMAT/2', dogru_cevap: 2, bolum_no: 4, kategori: 'L Format', zorluk: 4 },
    { soru_no: 20, folder: 'ÖRÜNTÜLER /5- L FORMAT/3', dogru_cevap: 2, bolum_no: 4, kategori: 'L Format', zorluk: 4 },
    
    // BÖLÜM 5 - Dokuzlu Format (3 soru)
    { soru_no: 21, folder: 'ÖRÜNTÜLER /6-DOKUZLU FORMAT/1', dogru_cevap: 2, bolum_no: 5, kategori: 'Dokuzlu Format', zorluk: 5 },
    { soru_no: 22, folder: 'ÖRÜNTÜLER /6-DOKUZLU FORMAT/2', dogru_cevap: 3, bolum_no: 5, kategori: 'Dokuzlu Format', zorluk: 5 },
    { soru_no: 23, folder: 'ÖRÜNTÜLER /6-DOKUZLU FORMAT/3', dogru_cevap: 0, bolum_no: 5, kategori: 'Dokuzlu Format', zorluk: 5 }
];

// Test başlatma
app.post('/api/akil-mantik/test/basla', async (req, res) => {
    try {
        const { kullanici_id } = req.body;
        
        if (!kullanici_id) {
            return res.status(400).json({ error: 'kullanici_id gerekli' });
        }

        // Test kaydı oluştur
        const testResult = await pool.query(
            'INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani) VALUES ($1, $2, NOW()) RETURNING id',
            [kullanici_id, 'AKIL_MANTIK']
        );
        
        const test_id = testResult.rows[0].id;

        // Akıl Mantık sonuçları tablosuna başlangıç kaydı
        await pool.query(`
            INSERT INTO akil_mantik_sonuclari (kullanici_id, test_id) 
            VALUES ($1, $2)
        `, [kullanici_id, test_id]);

        res.json({
            success: true,
            test_id: test_id,
            message: 'Akıl Mantık testi başlatıldı',
            kategoriler: AKIL_MANTIK_KATEGORILER,
            toplam_soru: 23,
            max_sure_dakika: 5
        });

    } catch (error) {
        console.error('Test başlatma hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Soru cevabı kaydetme
app.post('/api/akil-mantik/soru/kaydet', async (req, res) => {
    try {
        const { 
            test_id, 
            kullanici_id, 
            soru_no,
            kategori,
            bolum_no,
            zorluk_seviyesi,
            gosterilen_soru_resmi,
            secenekler,
            dogru_cevap,
            verilen_cevap,
            tepki_suresi_ms,
            soru_gosterilme_suresi_ms
        } = req.body;

        // Validasyon
        if (!test_id || !kullanici_id || !soru_no || !kategori || !bolum_no) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        if (soru_no < 1 || soru_no > 23) {
            return res.status(400).json({ error: 'Geçersiz soru numarası' });
        }

        if (bolum_no < 1 || bolum_no > 5) {
            return res.status(400).json({ error: 'Geçersiz bölüm numarası' });
        }

        // Doğru mu kontrolü
        const dogru_mu = verilen_cevap !== null && verilen_cevap === dogru_cevap;

        // Ham veriyi kaydet
        await pool.query(`
            INSERT INTO akil_mantik_ham_veri 
            (kullanici_id, test_id, soru_no, kategori, bolum_no, zorluk_seviyesi,
             gosterilen_soru_resmi, secenekler, dogru_cevap, verilen_cevap, 
             dogru_mu, tepki_suresi_ms, soru_gosterilme_suresi_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [kullanici_id, test_id, soru_no, kategori, bolum_no, zorluk_seviyesi,
            gosterilen_soru_resmi, JSON.stringify(secenekler), dogru_cevap, verilen_cevap,
            dogru_mu, tepki_suresi_ms, soru_gosterilme_suresi_ms]);

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

// Test tamamlama ve sonuç hesaplama
app.post('/api/akil-mantik/test/tamamla', async (req, res) => {
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
            SELECT * FROM akil_mantik_ham_veri 
            WHERE test_id = $1 
            ORDER BY soru_no
        `, [test_id]);

        const veriler = hamVeri.rows;
        
        // Bölüm bazında hesaplamalar
        const bolumSonuclari = {};
        
        for (let bolum = 1; bolum <= 5; bolum++) {
            const bolumVerileri = veriler.filter(v => v.bolum_no === bolum);
            const dogruCevaplar = bolumVerileri.filter(v => v.dogru_mu);
            
            const dogru_sayisi = dogruCevaplar.length;
            const toplam_soru = bolumVerileri.length;
            const dogruluk_yuzdesi = toplam_soru > 0 ? (dogru_sayisi / toplam_soru * 100) : 0;
            
            // Ortalama süre (sadece doğru cevaplar için)
            const ortalama_sure = dogruCevaplar.length > 0 ? 
                dogruCevaplar.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0) / dogruCevaplar.length : 0;
            
            // Toplam süre (tüm cevaplar için)
            const toplam_sure = bolumVerileri.reduce((sum, v) => sum + (v.tepki_suresi_ms || 0), 0);
            
            bolumSonuclari[`bolum${bolum}`] = {
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

        // Zorluk seviyesi performansı
        const kolayDogruSayisi = veriler.filter(v => v.dogru_mu && v.zorluk_seviyesi <= 2).length;
        const ortaDogruSayisi = veriler.filter(v => v.dogru_mu && v.zorluk_seviyesi === 3).length;
        const zorDogruSayisi = veriler.filter(v => v.dogru_mu && v.zorluk_seviyesi >= 4).length;

        // Tamamlanamayan soru bilgisi
        const tamamlanmayanSoru = veriler.find(v => v.verilen_cevap === null);

        // Sonuçları güncelle
        await client.query(`
            UPDATE akil_mantik_sonuclari SET
                bolum1_dogru_sayisi = $1, bolum1_toplam_soru = $2, bolum1_dogruluk_yuzdesi = $3, 
                bolum1_ortalama_sure = $4, bolum1_toplam_sure = $5,
                bolum2_dogru_sayisi = $6, bolum2_toplam_soru = $7, bolum2_dogruluk_yuzdesi = $8,
                bolum2_ortalama_sure = $9, bolum2_toplam_sure = $10,
                bolum3_dogru_sayisi = $11, bolum3_toplam_soru = $12, bolum3_dogruluk_yuzdesi = $13,
                bolum3_ortalama_sure = $14, bolum3_toplam_sure = $15,
                bolum4_dogru_sayisi = $16, bolum4_toplam_soru = $17, bolum4_dogruluk_yuzdesi = $18,
                bolum4_ortalama_sure = $19, bolum4_toplam_sure = $20,
                bolum5_dogru_sayisi = $21, bolum5_toplam_soru = $22, bolum5_dogruluk_yuzdesi = $23,
                bolum5_ortalama_sure = $24, bolum5_toplam_sure = $25,
                toplam_dogru_sayisi = $26, toplam_soru_sayisi = $27, genel_dogruluk_yuzdesi = $28,
                ortalama_tepki_suresi = $29, toplam_test_suresi = $30,
                kolay_sorular_dogru = $31, orta_sorular_dogru = $32, zor_sorular_dogru = $33,
                tamamlanamayan_soru_no = $34, tamamlanamayan_kategori = $35
            WHERE test_id = $36
        `, [
            bolumSonuclari.bolum1.dogru_sayisi, bolumSonuclari.bolum1.toplam_soru, bolumSonuclari.bolum1.dogruluk_yuzdesi,
            bolumSonuclari.bolum1.ortalama_sure, bolumSonuclari.bolum1.toplam_sure,
            bolumSonuclari.bolum2.dogru_sayisi, bolumSonuclari.bolum2.toplam_soru, bolumSonuclari.bolum2.dogruluk_yuzdesi,
            bolumSonuclari.bolum2.ortalama_sure, bolumSonuclari.bolum2.toplam_sure,
            bolumSonuclari.bolum3.dogru_sayisi, bolumSonuclari.bolum3.toplam_soru, bolumSonuclari.bolum3.dogruluk_yuzdesi,
            bolumSonuclari.bolum3.ortalama_sure, bolumSonuclari.bolum3.toplam_sure,
            bolumSonuclari.bolum4.dogru_sayisi, bolumSonuclari.bolum4.toplam_soru, bolumSonuclari.bolum4.dogruluk_yuzdesi,
            bolumSonuclari.bolum4.ortalama_sure, bolumSonuclari.bolum4.toplam_sure,
            bolumSonuclari.bolum5.dogru_sayisi, bolumSonuclari.bolum5.toplam_soru, bolumSonuclari.bolum5.dogruluk_yuzdesi,
            bolumSonuclari.bolum5.ortalama_sure, bolumSonuclari.bolum5.toplam_sure,
            toplam_dogru_sayisi, toplam_soru_sayisi, genel_dogruluk_yuzdesi,
            ortalama_tepki_suresi, toplam_test_suresi || 0,
            kolayDogruSayisi, ortaDogruSayisi, zorDogruSayisi,
            tamamlanmayanSoru ? tamamlanmayanSoru.soru_no : null,
            tamamlanmayanSoru ? tamamlanmayanSoru.kategori : null,
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
        const sonucResult = await client.query(
            'SELECT * FROM akil_mantik_sonuclari WHERE test_id = $1',
            [test_id]
        );
        
        if (sonucResult.rows.length === 0) {
            throw new Error('Test sonuçları bulunamadı');
        }
        
        const sonuc = sonucResult.rows[0];
        
        // Beceri skorlarını hesapla
        const skorlar = {
            // 1. Görsel Algı ve Ayırım Becerisi (Dörtlü formatlar performansı)
            gorsel_algi_ayirim_skoru: (sonuc.bolum1_dogruluk_yuzdesi + sonuc.bolum2_dogruluk_yuzdesi) / 2,
            
            // 2. Uzamsal İlişkiler Becerisi (Kare ve L formatlar)
            uzamsal_iliskiler_skoru: (sonuc.bolum2_dogruluk_yuzdesi + sonuc.bolum4_dogruluk_yuzdesi) / 2,
            
            // 3. Mantıksal Akıl Yürütme Becerisi (Zor sorular performansı)
            mantiksal_akil_yurutme_skoru: (() => {
                const zorSoruOrani = sonuc.zor_sorular_dogru / 9; // 9 zor soru var (bölüm 3,4,5)
                return Math.min(100, zorSoruOrani * 100);
            })(),
            
            // 4. Problem Çözme Becerisi (Genel doğruluk + hız kombinasyonu)
            problem_cozme_skoru: (() => {
                const dogrulukSkoru = sonuc.genel_dogruluk_yuzdesi;
                const hizSkoru = sonuc.ortalama_tepki_suresi ? 
                    Math.max(0, Math.min(100, (30000 - sonuc.ortalama_tepki_suresi) / 200)) : 0;
                return (dogrulukSkoru * 0.7) + (hizSkoru * 0.3);
            })(),
            
            // 5. Örüntü Tanıma Becerisi (Tüm bölümlerin ortalaması)
            oruntu_tanima_skoru: (
                sonuc.bolum1_dogruluk_yuzdesi + sonuc.bolum2_dogruluk_yuzdesi + 
                sonuc.bolum3_dogruluk_yuzdesi + sonuc.bolum4_dogruluk_yuzdesi + 
                sonuc.bolum5_dogruluk_yuzdesi
            ) / 5,
            
            // 6. Şekil-Zemin Ayırımı Becerisi (Karmaşık formatlar: Altılı ve Dokuzlu)
            sekil_zemin_ayirimi_skoru: (sonuc.bolum3_dogruluk_yuzdesi + sonuc.bolum5_dogruluk_yuzdesi) / 2
        };
        
        // Genel performans skoru
        skorlar.genel_performans_skoru = Object.values(skorlar).reduce((a, b) => a + b, 0) / Object.keys(skorlar).length;
        
        // Beceri skorlarını kaydet
        await client.query(`
            INSERT INTO akil_mantik_beceri_skorlari
            (test_id, kullanici_id, gorsel_algi_ayirim_skoru, uzamsal_iliskiler_skoru,
             mantiksal_akil_yurutme_skoru, problem_cozme_skoru, oruntu_tanima_skoru,
             sekil_zemin_ayirimi_skoru, genel_performans_skoru)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            test_id, kullanici_id,
            skorlar.gorsel_algi_ayirim_skoru,
            skorlar.uzamsal_iliskiler_skoru,
            skorlar.mantiksal_akil_yurutme_skoru,
            skorlar.problem_cozme_skoru,
            skorlar.oruntu_tanima_skoru,
            skorlar.sekil_zemin_ayirimi_skoru,
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
            b.gorsel_algi_ayirim_skoru,
            b.uzamsal_iliskiler_skoru,
            b.mantiksal_akil_yurutme_skoru,
            b.problem_cozme_skoru,
            b.oruntu_tanima_skoru,
            b.sekil_zemin_ayirimi_skoru,
            b.genel_performans_skoru
        FROM akil_mantik_sonuclari s
        LEFT JOIN akil_mantik_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.test_id = $1
    `, [test_id]);
    
    return result.rows[0] || null;
}

// Test sonucu görüntüleme
app.get('/api/akil-mantik/sonuc/:test_id', async (req, res) => {
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

// Kullanıcının tüm akıl mantık testleri
app.get('/api/akil-mantik/kullanici/:kullanici_id/testler', async (req, res) => {
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
                b.genel_performans_skoru
            FROM akil_mantik_sonuclari s
            LEFT JOIN akil_mantik_beceri_skorlari b ON s.test_id = b.test_id
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

// Kategorileri getirme
app.get('/api/akil-mantik/kategoriler', (req, res) => {
    res.json({
        success: true,
        kategoriler: AKIL_MANTIK_KATEGORILER
    });
});

// Soru listesini getirme
app.get('/api/akil-mantik/sorular', (req, res) => {
    res.json({
        success: true,
        sorular: TEST_SORULARI
    });
});

// Ham veri analizi
app.get('/api/akil-mantik/analiz/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                bolum_no,
                kategori,
                COUNT(*) as toplam_soru,
                COUNT(CASE WHEN dogru_mu = true THEN 1 END) as dogru_sayisi,
                COUNT(CASE WHEN verilen_cevap IS NULL THEN 1 END) as cevapsiz,
                AVG(CASE WHEN dogru_mu = true THEN tepki_suresi_ms END) as ort_dogru_sure,
                AVG(tepki_suresi_ms) as ort_tepki_sure,
                AVG(zorluk_seviyesi) as ort_zorluk
            FROM akil_mantik_ham_veri
            WHERE test_id = $1
            GROUP BY bolum_no, kategori
            ORDER BY bolum_no
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
    console.log(`Akıl Mantık API sunucusu http://localhost:${port} adresinde çalışıyor`);
});

module.exports = app; 