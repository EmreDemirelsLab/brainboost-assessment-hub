const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3002;

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

// Puzzle tipleri tanımları
const PUZZLE_TIPLERI = {
    'dort_parcali_tek_renk_kare': { parca_sayisi: 4, kategori: '4_parcali' },
    'dort_parcali_tek_renk_yuvarlak': { parca_sayisi: 4, kategori: '4_parcali' },
    'dort_parcali_tek_renk_ucgen': { parca_sayisi: 4, kategori: '4_parcali' },
    'dort_parcali_cift_renk_bir': { parca_sayisi: 4, kategori: '4_parcali' },
    'dort_parcali_cift_renk_iki': { parca_sayisi: 4, kategori: '4_parcali' },
    'alti_parcali_cift_renk': { parca_sayisi: 6, kategori: '6_parcali' },
    'dokuz_parcali_tek_renk': { parca_sayisi: 9, kategori: '9_parcali' },
    'dokuz_parcali_cok_renk': { parca_sayisi: 9, kategori: '9_parcali' },
    'onalti_parcali_tek_renk': { parca_sayisi: 16, kategori: '16_parcali' }
};

// Test başlatma
app.post('/api/puzzle/test/basla', async (req, res) => {
    try {
        const { kullanici_id } = req.body;
        
        if (!kullanici_id) {
            return res.status(400).json({ error: 'kullanici_id gerekli' });
        }

        // Test kaydı oluştur
        const testResult = await pool.query(
            'INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani) VALUES ($1, $2, NOW()) RETURNING id',
            [kullanici_id, 'PUZZLE']
        );
        
        const test_id = testResult.rows[0].id;

        // Puzzle sonuçları tablosuna başlangıç kaydı
        await pool.query(`
            INSERT INTO puzzle_sonuclari (kullanici_id, test_id) 
            VALUES ($1, $2)
        `, [kullanici_id, test_id]);

        res.json({
            success: true,
            test_id: test_id,
            message: 'Puzzle testi başlatıldı',
            puzzle_tipleri: Object.keys(PUZZLE_TIPLERI)
        });

    } catch (error) {
        console.error('Test başlatma hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Parça tepkisi kaydetme
app.post('/api/puzzle/parca/kaydet', async (req, res) => {
    try {
        const { 
            test_id, 
            kullanici_id, 
            puzzle_tipi, 
            puzzle_no, 
            parca_no, 
            dogru_mu, 
            tepki_suresi_ms,
            beklenen_pozisyon,
            verilen_pozisyon,
            puzzle_tamamlandi 
        } = req.body;

        // Validasyon
        if (!test_id || !kullanici_id || !puzzle_tipi || puzzle_no === undefined || parca_no === undefined) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        // Ham veriyi kaydet
        await pool.query(`
            INSERT INTO puzzle_ham_veri 
            (kullanici_id, test_id, puzzle_tipi, puzzle_no, parca_no, dogru_mu, 
             tepki_suresi_ms, beklenen_pozisyon, verilen_pozisyon, puzzle_tamamlandi)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [kullanici_id, test_id, puzzle_tipi, puzzle_no, parca_no, dogru_mu, 
            tepki_suresi_ms, beklenen_pozisyon, verilen_pozisyon, puzzle_tamamlandi]);

        res.json({
            success: true,
            message: 'Parça tepkisi kaydedildi'
        });

    } catch (error) {
        console.error('Parça kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test tamamlama ve sonuç hesaplama
app.post('/api/puzzle/test/tamamla', async (req, res) => {
    try {
        const { test_id, kullanici_id } = req.body;

        if (!test_id || !kullanici_id) {
            return res.status(400).json({ error: 'test_id ve kullanici_id gerekli' });
        }

        // Sonuçları hesapla
        await hesaplaSonuclar(test_id, kullanici_id);
        
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
async function hesaplaSonuclar(test_id, kullanici_id) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Ham verileri al
        const hamVeri = await client.query(`
            SELECT * FROM puzzle_ham_veri 
            WHERE test_id = $1 
            ORDER BY puzzle_tipi, puzzle_no, parca_no
        `, [test_id]);

        const veriler = hamVeri.rows;
        
        // Kategori bazında hesaplamalar
        const kategoriler = {
            '4_parcali': { dogru: 0, toplam: 0, sure_toplam: 0, dogru_sure_toplam: 0 },
            '6_parcali': { dogru: 0, toplam: 0, sure_toplam: 0, dogru_sure_toplam: 0 },
            '9_parcali': { dogru: 0, toplam: 0, sure_toplam: 0, dogru_sure_toplam: 0 },
            '16_parcali': { dogru: 0, toplam: 0, sure_toplam: 0, dogru_sure_toplam: 0 }
        };

        let toplamDogru = 0;
        let toplamParca = 0;
        let toplamTestSuresi = 0;
        let dogruCevapSureToplam = 0;
        let dogruCevapSayisi = 0;

        // Her veriyi kategorize et
        veriler.forEach(veri => {
            const puzzleInfo = PUZZLE_TIPLERI[veri.puzzle_tipi];
            if (!puzzleInfo) return;

            const kategori = puzzleInfo.kategori;
            const sure = veri.tepki_suresi_ms || 0;

            kategoriler[kategori].toplam++;
            kategoriler[kategori].sure_toplam += sure;
            toplamParca++;
            toplamTestSuresi += sure;

            if (veri.dogru_mu) {
                kategoriler[kategori].dogru++;
                kategoriler[kategori].dogru_sure_toplam += sure;
                toplamDogru++;
                dogruCevapSureToplam += sure;
                dogruCevapSayisi++;
            }
        });

        // Sonuçları hesapla
        const sonuclar = {
            // 4 Parçalı
            dort_parcali_dogru_sayisi: kategoriler['4_parcali'].dogru,
            dort_parcali_dogruluk_yuzdesi: kategoriler['4_parcali'].toplam > 0 ? 
                (kategoriler['4_parcali'].dogru / kategoriler['4_parcali'].toplam * 100) : 0,
            dort_parcali_ortalama_sure: kategoriler['4_parcali'].dogru > 0 ? 
                (kategoriler['4_parcali'].dogru_sure_toplam / kategoriler['4_parcali'].dogru) : 0,
            dort_parcali_toplam_sure: kategoriler['4_parcali'].sure_toplam,

            // 6 Parçalı
            alti_parcali_dogru_sayisi: kategoriler['6_parcali'].dogru,
            alti_parcali_dogruluk_yuzdesi: kategoriler['6_parcali'].toplam > 0 ? 
                (kategoriler['6_parcali'].dogru / kategoriler['6_parcali'].toplam * 100) : 0,
            alti_parcali_sure: kategoriler['6_parcali'].sure_toplam,

            // 9 Parçalı
            dokuz_parcali_dogru_sayisi: kategoriler['9_parcali'].dogru,
            dokuz_parcali_dogruluk_yuzdesi: kategoriler['9_parcali'].toplam > 0 ? 
                (kategoriler['9_parcali'].dogru / kategoriler['9_parcali'].toplam * 100) : 0,
            dokuz_parcali_ortalama_sure: kategoriler['9_parcali'].dogru > 0 ? 
                (kategoriler['9_parcali'].dogru_sure_toplam / kategoriler['9_parcali'].dogru) : 0,
            dokuz_parcali_toplam_sure: kategoriler['9_parcali'].sure_toplam,

            // 16 Parçalı
            onalti_parcali_dogru_sayisi: kategoriler['16_parcali'].dogru,
            onalti_parcali_dogruluk_yuzdesi: kategoriler['16_parcali'].toplam > 0 ? 
                (kategoriler['16_parcali'].dogru / kategoriler['16_parcali'].toplam * 100) : 0,
            onalti_parcali_sure: kategoriler['16_parcali'].sure_toplam,

            // Genel
            toplam_dogru_sayisi: toplamDogru,
            genel_dogruluk_yuzdesi: toplamParca > 0 ? (toplamDogru / toplamParca * 100) : 0,
            ortalama_tepki_suresi: dogruCevapSayisi > 0 ? (dogruCevapSureToplam / dogruCevapSayisi) : 0,
            toplam_test_suresi: toplamTestSuresi,

            // Bilgi işleme hızı skoru
            bilgi_isleme_hizi_skoru: dogruCevapSayisi > 0 ? 
                Math.max(0, 100 - ((dogruCevapSureToplam / dogruCevapSayisi) / 15000 * 100)) : 0
        };

        // Sonuçları güncelle
        await client.query(`
            UPDATE puzzle_sonuclari SET
                dort_parcali_dogru_sayisi = $1,
                dort_parcali_dogruluk_yuzdesi = $2,
                dort_parcali_ortalama_sure = $3,
                dort_parcali_toplam_sure = $4,
                alti_parcali_dogru_sayisi = $5,
                alti_parcali_dogruluk_yuzdesi = $6,
                alti_parcali_sure = $7,
                dokuz_parcali_dogru_sayisi = $8,
                dokuz_parcali_dogruluk_yuzdesi = $9,
                dokuz_parcali_ortalama_sure = $10,
                dokuz_parcali_toplam_sure = $11,
                onalti_parcali_dogru_sayisi = $12,
                onalti_parcali_dogruluk_yuzdesi = $13,
                onalti_parcali_sure = $14,
                toplam_dogru_sayisi = $15,
                genel_dogruluk_yuzdesi = $16,
                ortalama_tepki_suresi = $17,
                toplam_test_suresi = $18,
                bilgi_isleme_hizi_skoru = $19
            WHERE test_id = $20
        `, [
            sonuclar.dort_parcali_dogru_sayisi,
            sonuclar.dort_parcali_dogruluk_yuzdesi,
            sonuclar.dort_parcali_ortalama_sure,
            sonuclar.dort_parcali_toplam_sure,
            sonuclar.alti_parcali_dogru_sayisi,
            sonuclar.alti_parcali_dogruluk_yuzdesi,
            sonuclar.alti_parcali_sure,
            sonuclar.dokuz_parcali_dogru_sayisi,
            sonuclar.dokuz_parcali_dogruluk_yuzdesi,
            sonuclar.dokuz_parcali_ortalama_sure,
            sonuclar.dokuz_parcali_toplam_sure,
            sonuclar.onalti_parcali_dogru_sayisi,
            sonuclar.onalti_parcali_dogruluk_yuzdesi,
            sonuclar.onalti_parcali_sure,
            sonuclar.toplam_dogru_sayisi,
            sonuclar.genel_dogruluk_yuzdesi,
            sonuclar.ortalama_tepki_suresi,
            sonuclar.toplam_test_suresi,
            sonuclar.bilgi_isleme_hizi_skoru,
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
            'SELECT * FROM puzzle_sonuclari WHERE test_id = $1',
            [test_id]
        );
        
        if (sonucResult.rows.length === 0) {
            throw new Error('Test sonuçları bulunamadı');
        }
        
        const sonuc = sonucResult.rows[0];
        
        // Beceri skorlarını hesapla
        const skorlar = {
            // Seçici Dikkat: Karmaşık puzzlelerdeki performans (9 ve 16 parçalı)
            secici_dikkat_skoru: Math.max(0, (sonuc.dokuz_parcali_dogruluk_yuzdesi + sonuc.onalti_parcali_dogruluk_yuzdesi) / 2),
            
            // Kısa Süreli Görsel Hafıza: Parça pozisyonlarını hatırlama (genel doğruluk)
            kisa_sureli_gorsel_hafiza_skoru: sonuc.genel_dogruluk_yuzdesi,
            
            // Sürdürülebilir Dikkat: Test boyunca performans tutarlılığı
            surdurulebilir_dikkat_skoru: Math.max(0, 100 - Math.abs(sonuc.dort_parcali_dogruluk_yuzdesi - sonuc.onalti_parcali_dogruluk_yuzdesi)),
            
            // Görsel Ayrım/Manipülasyon: Farklı şekil/renk kombinasyonları (çift renkli performans)
            gorsel_ayrim_manipulasyon_skoru: (sonuc.alti_parcali_dogruluk_yuzdesi + sonuc.dokuz_parcali_dogruluk_yuzdesi) / 2,
            
            // Tepkime Hızı: Ortalama tepki süresine göre (15000ms = 0 puan, 1000ms = 100 puan)
            tepkime_hizi_skoru: Math.max(0, Math.min(100, (15000 - sonuc.ortalama_tepki_suresi) / 140)),
            
            // İşlem Hızı: Bilgi işleme hızı skoruna eşit
            islem_hizi_skoru: sonuc.bilgi_isleme_hizi_skoru
        };
        
        // Genel performans skoru
        skorlar.genel_performans_skoru = Object.values(skorlar).reduce((a, b) => a + b, 0) / Object.keys(skorlar).length;
        
        // Beceri skorlarını kaydet
        await client.query(`
            INSERT INTO puzzle_beceri_skorlari 
            (test_id, kullanici_id, secici_dikkat_skoru, kisa_sureli_gorsel_hafiza_skoru,
             surdurulebilir_dikkat_skoru, gorsel_ayrim_manipulasyon_skoru, 
             tepkime_hizi_skoru, islem_hizi_skoru, genel_performans_skoru)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            test_id, kullanici_id,
            skorlar.secici_dikkat_skoru,
            skorlar.kisa_sureli_gorsel_hafiza_skoru,
            skorlar.surdurulebilir_dikkat_skoru,
            skorlar.gorsel_ayrim_manipulasyon_skoru,
            skorlar.tepkime_hizi_skoru,
            skorlar.islem_hizi_skoru,
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
            b.kisa_sureli_gorsel_hafiza_skoru,
            b.surdurulebilir_dikkat_skoru,
            b.gorsel_ayrim_manipulasyon_skoru,
            b.tepkime_hizi_skoru,
            b.islem_hizi_skoru,
            b.genel_performans_skoru
        FROM puzzle_sonuclari s
        LEFT JOIN puzzle_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.test_id = $1
    `, [test_id]);
    
    return result.rows[0] || null;
}

// Test sonucu görüntüleme
app.get('/api/puzzle/sonuc/:test_id', async (req, res) => {
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

// Kullanıcının tüm puzzle testleri
app.get('/api/puzzle/kullanici/:kullanici_id/testler', async (req, res) => {
    try {
        const { kullanici_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                s.test_id,
                s.tarih,
                s.genel_dogruluk_yuzdesi,
                s.toplam_test_suresi,
                s.bilgi_isleme_hizi_skoru,
                b.genel_performans_skoru
            FROM puzzle_sonuclari s
            LEFT JOIN puzzle_beceri_skorlari b ON s.test_id = b.test_id
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

// Puzzle tiplerini getirme
app.get('/api/puzzle/tipler', (req, res) => {
    res.json({
        success: true,
        puzzle_tipleri: PUZZLE_TIPLERI
    });
});

// Server başlatma
app.listen(port, () => {
    console.log(`Puzzle API sunucusu http://localhost:${port} adresinde çalışıyor`);
});

module.exports = app; 