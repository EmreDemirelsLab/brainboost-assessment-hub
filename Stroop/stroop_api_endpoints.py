from flask import Flask, request, jsonify
from Stroop.stroop_database_setup import StroopDatabaseManager
import json
from datetime import datetime

app = Flask(__name__)

# Veritabanı konfigürasyonu
DB_CONFIG = {
    'host': 'localhost',
    'database': 'bilisseltest',
    'user': 'postgres',
    'password': 'password'
}

@app.route('/api/stroop/test/basla', methods=['POST'])
def stroop_test_basla():
    """
    Yeni bir Stroop testi başlat
    Body: {
        "kullanici_id": 123
    }
    """
    try:
        data = request.json
        kullanici_id = data.get('kullanici_id')
        
        if not kullanici_id:
            return jsonify({'error': 'kullanici_id gerekli'}), 400
        
        # Test kaydı oluştur (TestGecmisi tablosuna)
        # Bu kısım mevcut sisteme göre uyarlanacak
        test_id = create_test_record(kullanici_id, 'STROOP')
        
        return jsonify({
            'success': True,
            'test_id': test_id,
            'message': 'Stroop testi başlatıldı'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stroop/tepki/kaydet', methods=['POST'])
def stroop_tepki_kaydet():
    """
    Tek bir tepkiyi kaydet
    Body: {
        "test_id": 1,
        "kullanici_id": 123,
        "tepki": {
            "uyaran_suresi_ms": 2000,
            "tepki_var_mi": true,
            "tepki_zamani_ms": 650,
            "dogru_mu": true,
            "asama_no": 1,
            "kelime_gosterilen": "KIRMIZI",
            "renk_gosterilen": "kirmizi",
            "beklenen_tepki": "space",
            "verilen_tepki": "space"
        }
    }
    """
    try:
        data = request.json
        test_id = data.get('test_id')
        kullanici_id = data.get('kullanici_id')
        tepki = data.get('tepki')
        
        if not all([test_id, kullanici_id, tepki]):
            return jsonify({'error': 'Eksik parametreler'}), 400
        
        manager = StroopDatabaseManager(DB_CONFIG)
        manager.connect()
        
        # Tek tepkiyi kaydet
        manager.save_ham_veri(test_id, kullanici_id, [tepki])
        
        manager.disconnect()
        
        return jsonify({
            'success': True,
            'message': 'Tepki kaydedildi'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stroop/test/tamamla', methods=['POST'])
def stroop_test_tamamla():
    """
    Testi tamamla ve sonuçları hesapla
    Body: {
        "test_id": 1,
        "kullanici_id": 123,
        "sureler": {
            "bolum1_sure_sn": 30.5,
            "bolum2_sure_sn": 45.2,
            "bolum3_sure_sn": 52.8
        },
        "tepkiler": [
            {
                "uyaran_suresi_ms": 2000,
                "tepki_var_mi": true,
                "tepki_zamani_ms": 650,
                "dogru_mu": true,
                "asama_no": 1,
                ...
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        test_id = data.get('test_id')
        kullanici_id = data.get('kullanici_id')
        sureler = data.get('sureler', {})
        tepkiler = data.get('tepkiler', [])
        
        if not all([test_id, kullanici_id]):
            return jsonify({'error': 'test_id ve kullanici_id gerekli'}), 400
        
        manager = StroopDatabaseManager(DB_CONFIG)
        manager.connect()
        
        # Tüm tepkileri kaydet
        if tepkiler:
            manager.save_ham_veri(test_id, kullanici_id, tepkiler)
        
        # Süreleri güncelle (manager'a bu özelliği ekleyelim)
        if sureler:
            update_test_sureler(manager, test_id, sureler)
        
        # Sonuçları hesapla ve kaydet
        manager.hesapla_ve_kaydet_sonuclar(test_id, kullanici_id)
        
        # Sonuçları getir
        sonuclar = get_test_sonuclari(manager, test_id)
        
        manager.disconnect()
        
        return jsonify({
            'success': True,
            'message': 'Test tamamlandı ve sonuçlar hesaplandı',
            'sonuclar': sonuclar
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stroop/sonuc/<int:test_id>', methods=['GET'])
def stroop_sonuc_getir(test_id):
    """Test sonuçlarını getir"""
    try:
        manager = StroopDatabaseManager(DB_CONFIG)
        manager.connect()
        
        # Sonuçları getir
        query = """
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
        WHERE s.test_id = %s
        """
        
        manager.cursor.execute(query, (test_id,))
        result = manager.cursor.fetchone()
        
        if not result:
            manager.disconnect()
            return jsonify({'error': 'Test bulunamadı'}), 404
        
        # Sonuçları düzenle
        columns = [desc[0] for desc in manager.cursor.description]
        sonuc_dict = dict(zip(columns, result))
        
        manager.disconnect()
        
        return jsonify({
            'success': True,
            'sonuc': sonuc_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stroop/kullanici/<int:kullanici_id>/testler', methods=['GET'])
def kullanici_testleri(kullanici_id):
    """Kullanıcının tüm Stroop test sonuçlarını getir"""
    try:
        manager = StroopDatabaseManager(DB_CONFIG)
        manager.connect()
        
        query = """
        SELECT 
            s.test_id,
            s.tarih,
            s.bts_dogruluk,
            s.kts_dogruluk,
            s.sts_dogruluk,
            s.interferans_orani,
            s.toplam_sure_sn,
            b.genel_performans_skoru
        FROM stroop_sonuclari s
        LEFT JOIN stroop_beceri_skorlari b ON s.test_id = b.test_id
        WHERE s.kullanici_id = %s
        ORDER BY s.tarih DESC
        """
        
        manager.cursor.execute(query, (kullanici_id,))
        results = manager.cursor.fetchall()
        
        columns = [desc[0] for desc in manager.cursor.description]
        testler = [dict(zip(columns, row)) for row in results]
        
        manager.disconnect()
        
        return jsonify({
            'success': True,
            'testler': testler
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Yardımcı fonksiyonlar
def create_test_record(kullanici_id, test_tipi):
    """TestGecmisi tablosuna yeni kayıt ekle"""
    # Bu fonksiyon mevcut sisteme göre implement edilecek
    # Örnek implementasyon:
    manager = StroopDatabaseManager(DB_CONFIG)
    manager.connect()
    
    query = """
    INSERT INTO TestGecmisi (kullanici_id, test_tipi, baslama_zamani)
    VALUES (%s, %s, %s)
    RETURNING id
    """
    
    manager.cursor.execute(query, (kullanici_id, test_tipi, datetime.now()))
    test_id = manager.cursor.fetchone()[0]
    manager.conn.commit()
    manager.disconnect()
    
    return test_id

def update_test_sureler(manager, test_id, sureler):
    """Test sürelerini güncelle"""
    # Bu özellik StroopDatabaseManager'a eklenebilir
    # Şimdilik doğrudan SQL ile güncelleme yapıyoruz
    query = """
    UPDATE stroop_sonuclari
    SET bolum1_sure_sn = %s,
        bolum2_sure_sn = %s,
        bolum3_sure_sn = %s,
        toplam_sure_sn = %s
    WHERE test_id = %s
    """
    
    toplam_sure = sum(sureler.values())
    values = (
        sureler.get('bolum1_sure_sn'),
        sureler.get('bolum2_sure_sn'),
        sureler.get('bolum3_sure_sn'),
        toplam_sure,
        test_id
    )
    
    manager.cursor.execute(query, values)
    manager.conn.commit()

def get_test_sonuclari(manager, test_id):
    """Test sonuçlarını getir"""
    query = """
    SELECT * FROM stroop_sonuclari WHERE test_id = %s
    """
    manager.cursor.execute(query, (test_id,))
    result = manager.cursor.fetchone()
    
    if result:
        columns = [desc[0] for desc in manager.cursor.description]
        return dict(zip(columns, result))
    return None

if __name__ == '__main__':
    app.run(debug=True, port=5001) 