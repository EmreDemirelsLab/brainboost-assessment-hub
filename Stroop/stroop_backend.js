const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3003;

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

// Stroop aşamaları tanımları
const STROOP_ASAMALARI = {
    1: { 
        ad: 'Basit Tepki Süresi (BTS)', 
        aciklama: '1. Aşama - Kelime okuma',
        toplam_tepki: 12 
    },
    2: { 
        ad: 'Karmaşık Tepki Süresi (KTS)', 
        aciklama: '2. Aşama - Renk-kelime eşleştirme',
        toplam_tepki: 24 
    },
    3: { 
        ad: 'Stroop Tepki Süresi (STS)', 
        aciklama: '3. Aşama - Çelişkili uyaran',
        toplam_tepki: 24 
    }
};

// Test başlatma
app.post('/api/stroop/test/basla', async (req, res) => {
    try {
        const { kullanici_id } = req.body;
        
        if (!kullanici_id) {
            return res.status(400).json({ error: 'kullanici_id gerekli' });
        }

        // Test kaydı oluştur
        const testResult = await pool.query(
            'INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani) VALUES ($1, $2, NOW()) RETURNING id',
            [kullanici_id, 'STROOP']
        );
        
        const test_id = testResult.rows[0].id;

        // Stroop sonuçları tablosuna başlangıç kaydı
        await pool.query(`
            INSERT INTO stroop_sonuclari (kullanici_id, test_id) 
            VALUES ($1, $2)
        `, [kullanici_id, test_id]);

        res.json({
            success: true,
            test_id: test_id,
            message: 'Stroop testi başlatıldı',
            asamalar: STROOP_ASAMALARI
        });

    } catch (error) {
        console.error('Test başlatma hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tepki kaydetme
app.post('/api/stroop/tepki/kaydet', async (req, res) => {
    try {
        const { 
            test_id, 
            kullanici_id, 
            uyaran_suresi_ms,
            tepki_var_mi,
            tepki_zamani_ms,
            dogru_mu,
            asama_no,
            kelime_gosterilen,
            renk_gosterilen,
            beklenen_tepki,
            verilen_tepki
        } = req.body;

        // Validasyon
        if (!test_id || !kullanici_id || !asama_no) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        if (![1, 2, 3].includes(asama_no)) {
            return res.status(400).json({ error: 'Geçersiz aşama numarası' });
        }

        // Ham veriyi kaydet
        await pool.query(`
            INSERT INTO stroop_ham_veri 
            (kullanici_id, test_id, uyaran_suresi_ms, tepki_var_mi, tepki_zamani_ms,
             dogru_mu, asama_no, kelime_gosterilen, renk_gosterilen, 
             beklenen_tepki, verilen_tepki)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [kullanici_id, test_id, uyaran_suresi_ms, tepki_var_mi, tepki_zamani_ms,
            dogru_mu, asama_no, kelime_gosterilen, renk_gosterilen,
            beklenen_tepki, verilen_tepki]);

        res.json({
            success: true,
            message: 'Tepki kaydedildi'
        });

    } catch (error) {
        console.error('Tepki kaydetme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bölüm süresi güncelleme
app.post('/api/stroop/bolum/sure-guncelle', async (req, res) => {
    try {
        const { test_id, bolum_no, sure_saniye } = req.body;

        if (!test_id || !bolum_no || sure_saniye === undefined) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        let sutun_adi;
        switch (bolum_no) {
            case 1: sutun_adi = 'bolum1_sure_sn'; break;
            case 2: sutun_adi = 'bolum2_sure_sn'; break;
            case 3: sutun_adi = 'bolum3_sure_sn'; break;
            default: 
                return res.status(400).json({ error: 'Geçersiz bölüm numarası' });
        }

        await pool.query(`
            UPDATE stroop_sonuclari 
            SET ${sutun_adi} = $1
            WHERE test_id = $2
        `, [sure_saniye, test_id]);

        res.json({
            success: true,
            message: `Bölüm ${bolum_no} süresi güncellendi`
        });

    } catch (error) {
        console.error('Süre güncelleme hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test tamamlama ve sonuç hesaplama
app.post('/api/stroop/test/tamamla', async (req, res) => {
    try {
        const { test_id, kullanici_id, toplam_sure_sn } = req.body;

        if (!test_id || !kullanici_id) {
            return res.status(400).json({ error: 'test_id ve kullanici_id gerekli' });
        }

        // Toplam süreyi güncelle
        if (toplam_sure_sn) {
            await pool.query(`
                UPDATE stroop_sonuclari 
                SET toplam_sure_sn = $1
                WHERE test_id = $2
            `, [toplam_sure_sn, test_id]);
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

        // Her aşama için verileri al ve hesapla
        const sonuclar = {};
        
        for (let asama = 1; asama <= 3; asama++) {
            const hamVeri = await client.query(`
                SELECT tepki_zamani_ms, dogru_mu, tepki_var_mi
                FROM stroop_ham_veri
                WHERE test_id = $1 AND asama_no = $2
                ORDER BY id
            `, [test_id, asama]);

            const veriler = hamVeri.rows;
            
            // Doğru tepkileri filtrele
            const dogruTepkiler = veriler.filter(v => v.dogru_mu && v.tepki_var_mi);
            const toplamTepki = veriler.length;
            const dogruSayisi = dogruTepkiler.length;
            
            // Ortalama süre hesapla (sadece doğru tepkiler için)
            const ortSure = dogruTepkiler.length > 0 ? 
                dogruTepkiler.reduce((sum, t) => sum + (t.tepki_zamani_ms || 0), 0) / dogruTepkiler.length : 0;
            
            // Doğruluk yüzdesi
            const dogruluk = toplamTepki > 0 ? (dogruSayisi / toplamTepki * 100) : 0;
            
            // Hata sayısı
            const hata = toplamTepki - dogruSayisi;

            // Aşama bazında sonuçları kaydet
            if (asama === 1) {
                sonuclar.bts_ort_sure = ortSure;
                sonuclar.bts_dogruluk = dogruluk;
                sonuclar.bts_hata = hata;
                sonuclar.bts_toplam_tepki = toplamTepki;
            } else if (asama === 2) {
                sonuclar.kts_ort_sure = ortSure;
                sonuclar.kts_dogruluk = dogruluk;
                sonuclar.kts_hata = hata;
                sonuclar.kts_toplam_tepki = toplamTepki;
            } else {
                sonuclar.sts_ort_sure = ortSure;
                sonuclar.sts_dogruluk = dogruluk;
                sonuclar.sts_hata = hata;
                sonuclar.sts_toplam_tepki = toplamTepki;
            }
        }

        // İnterferans hesapla
        if (sonuclar.sts_ort_sure && sonuclar.bts_ort_sure) {
            sonuclar.interferans_fark = sonuclar.sts_ort_sure - sonuclar.bts_ort_sure;
            sonuclar.interferans_orani = (sonuclar.interferans_fark / sonuclar.bts_ort_sure) * 100;
        }

        // Dürtüsellik analizi
        const ortTepkiSuresi = (sonuclar.bts_ort_sure + sonuclar.kts_ort_sure + sonuclar.sts_ort_sure) / 3;
        const ortHataOrani = (
            (sonuclar.bts_hata / sonuclar.bts_toplam_tepki) +
            (sonuclar.kts_hata / sonuclar.kts_toplam_tepki) +
            (sonuclar.sts_hata / sonuclar.sts_toplam_tepki)
        ) / 3;

        // Dürtüsellik: Hızlı tepki (< 400ms) ve yüksek hata (> %20)
        sonuclar.durtussellik_var = ortTepkiSuresi < 400 && ortHataOrani > 0.2;
        if (sonuclar.durtussellik_var) {
            sonuclar.durtussellik_aciklama = 
                `Ortalama tepki süresi: ${ortTepkiSuresi.toFixed(0)}ms, Hata oranı: ${(ortHataOrani*100).toFixed(1)}%`;
        }

        // Sonuçları güncelle
        await client.query(`
            UPDATE stroop_sonuclari SET
                bts_ort_sure = $1, bts_dogruluk = $2, bts_hata = $3, bts_toplam_tepki = $4,
                kts_ort_sure = $5, kts_dogruluk = $6, kts_hata = $7, kts_toplam_tepki = $8,
                sts_ort_sure = $9, sts_dogruluk = $10, sts_hata = $11, sts_toplam_tepki = $12,
                interferans_fark = $13, interferans_orani = $14,
                durtussellik_var = $15, durtussellik_aciklama = $16
            WHERE test_id = $17
        `, [
            sonuclar.bts_ort_sure, sonuclar.bts_dogruluk, sonuclar.bts_hata, sonuclar.bts_toplam_tepki,
            sonuclar.kts_ort_sure, sonuclar.kts_dogruluk, sonuclar.kts_hata, sonuclar.kts_toplam_tepki,
            sonuclar.sts_ort_sure, sonuclar.sts_dogruluk, sonuclar.sts_hata, sonuclar.sts_toplam_tepki,
            sonuclar.interferans_fark, sonuclar.interferans_orani,
            sonuclar.durtussellik_var, sonuclar.durtussellik_aciklama,
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
            'SELECT * FROM stroop_sonuclari WHERE test_id = $1',
            [test_id]
        );
        
        if (sonucResult.rows.length === 0) {
            throw new Error('Test sonuçları bulunamadı');
        }
        
        const sonuc = sonucResult.rows[0];
        
        // Beceri skorlarını hesapla
        const skorlar = {
            // 1. İşlem Hızı (Toplam süreye göre)
            // Normalleştirme: 60 saniye = 100 puan, 180 saniye = 0 puan
            islem_hizi_skoru: sonuc.toplam_sure_sn ? 
                Math.max(0, Math.min(100, (180 - sonuc.toplam_sure_sn) / 1.2)) : 0,
            
            // 2. Tepkime Hızı (Ortalama tepki sürelerine göre)
            // Normalleştirme: 300ms = 100 puan, 1000ms = 0 puan
            tepkime_hizi_skoru: (() => {
                const ortTepki = (sonuc.bts_ort_sure + sonuc.kts_ort_sure + sonuc.sts_ort_sure) / 3;
                return Math.max(0, Math.min(100, (1000 - ortTepki) / 7));
            })(),
            
            // 3. Sürdürülebilir Dikkat (Doğruluk oranlarına göre)
            surdurulebilir_dikkat_skoru: (sonuc.bts_dogruluk + sonuc.kts_dogruluk + sonuc.sts_dogruluk) / 3,
            
            // 4. Seçici Dikkat (STS performansına göre)
            secici_dikkat_skoru: sonuc.sts_dogruluk || 0,
            
            // 5. Kısa Süreli Görsel Hafıza (KTS performansına göre)
            kisa_sureli_gorsel_hafiza_skoru: sonuc.kts_dogruluk || 0,
            
            // 6. Dürtüsellik (Ters skorlama - dürtüsellik yoksa yüksek puan)
            durtussellik_skoru: sonuc.durtussellik_var ? 30 : 90,
            
            // 7. Bilişsel Esneklik (İnterferans oranına göre)
            // Düşük interferans = yüksek esneklik
            bilissel_esneklik_skoru: sonuc.interferans_orani ? 
                Math.max(0, Math.min(100, 100 - Math.abs(sonuc.interferans_orani))) : 50
        };
        
        // Genel performans skoru
        skorlar.genel_performans_skoru = Object.values(skorlar).reduce((a, b) => a + b, 0) / Object.keys(skorlar).length;
        
        // Beceri skorlarını kaydet
        await client.query(`
            INSERT INTO stroop_beceri_skorlari
            (test_id, kullanici_id, islem_hizi_skoru, tepkime_hizi_skoru,
             surdurulebilir_dikkat_skoru, secici_dikkat_skoru,
             kisa_sureli_gorsel_hafiza_skoru, durtussellik_skoru,
             bilissel_esneklik_skoru, genel_performans_skoru)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            test_id, kullanici_id,
            skorlar.islem_hizi_skoru,
            skorlar.tepkime_hizi_skoru,
            skorlar.surdurulebilir_dikkat_skoru,
            skorlar.secici_dikkat_skoru,
            skorlar.kisa_sureli_gorsel_hafiza_skoru,
            skorlar.durtussellik_skoru,
            skorlar.bilissel_esneklik_skoru,
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
            b.islem_hizi_skoru,
            b.tepkime_hizi_skoru,
            b.surdurulebilir_dikkat_skoru,
            b.secici_dikkat_skoru,
            b.kisa_sureli_gorsel_hafiza_skoru,
            b.durtussellik_skoru,
            b.bilissel_esneklik_skoru,
            b.genel_performans_skoru
        FROM stroop_sonuclari s
        LEFT JOIN stroop_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.test_id = $1
    `, [test_id]);
    
    return result.rows[0] || null;
}

// Test sonucu görüntüleme
app.get('/api/stroop/sonuc/:test_id', async (req, res) => {
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

// Kullanıcının tüm stroop testleri
app.get('/api/stroop/kullanici/:kullanici_id/testler', async (req, res) => {
    try {
        const { kullanici_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                s.test_id,
                s.tarih,
                s.bts_dogruluk,
                s.kts_dogruluk,
                s.sts_dogruluk,
                s.interferans_orani,
                s.toplam_sure_sn,
                s.durtussellik_var,
                b.genel_performans_skoru
            FROM stroop_sonuclari s
            LEFT JOIN stroop_beceri_skorlari b ON s.test_id = b.test_id
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

// Stroop aşamalarını getirme
app.get('/api/stroop/asamalar', (req, res) => {
    res.json({
        success: true,
        asamalar: STROOP_ASAMALARI
    });
});

// Ham veri analizi
app.get('/api/stroop/analiz/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                asama_no,
                COUNT(*) as toplam_tepki,
                COUNT(CASE WHEN dogru_mu = true THEN 1 END) as dogru_tepki,
                COUNT(CASE WHEN tepki_var_mi = false THEN 1 END) as tepkisiz,
                AVG(CASE WHEN dogru_mu = true THEN tepki_zamani_ms END) as ort_dogru_sure,
                AVG(tepki_zamani_ms) as ort_tepki_sure
            FROM stroop_ham_veri
            WHERE test_id = $1
            GROUP BY asama_no
            ORDER BY asama_no
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
    console.log(`Stroop API sunucusu http://localhost:${port} adresinde çalışıyor`);
});

module.exports = app; 