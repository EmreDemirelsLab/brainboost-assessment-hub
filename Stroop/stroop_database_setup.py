import psycopg2
from psycopg2 import sql
import json
from datetime import datetime
import numpy as np

class StroopDatabaseManager:
    def __init__(self, db_config):
        """
        Veritabanı bağlantı bilgileri
        db_config = {
            'host': 'localhost',
            'database': 'bilisseltest',
            'user': 'postgres',
            'password': 'password'
        }
        """
        self.db_config = db_config
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Veritabanına bağlan"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            print("Veritabanına başarıyla bağlanıldı.")
        except Exception as e:
            print(f"Veritabanı bağlantı hatası: {e}")
            raise
    
    def disconnect(self):
        """Veritabanı bağlantısını kapat"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def create_tables(self):
        """Stroop tabloları oluştur"""
        # SQL dosyasını oku ve çalıştır
        try:
            with open('stroop_database_setup.sql', 'r', encoding='utf-8') as f:
                sql_commands = f.read()
            
            # SQL komutlarını çalıştır
            self.cursor.execute(sql_commands)
            self.conn.commit()
            print("Tablolar başarıyla oluşturuldu.")
        except Exception as e:
            self.conn.rollback()
            print(f"Tablo oluşturma hatası: {e}")
            raise
    
    def save_ham_veri(self, test_id, kullanici_id, tepkiler):
        """
        Ham veri kaydet
        tepkiler: Liste içinde her tepki için dict
        {
            'uyaran_suresi_ms': 2000,
            'tepki_var_mi': True,
            'tepki_zamani_ms': 650,
            'dogru_mu': True,
            'asama_no': 1,
            'kelime_gosterilen': 'KIRMIZI',
            'renk_gosterilen': 'kirmizi',
            'beklenen_tepki': 'space',
            'verilen_tepki': 'space'
        }
        """
        try:
            for tepki in tepkiler:
                query = """
                INSERT INTO stroop_ham_veri 
                (kullanici_id, test_id, uyaran_suresi_ms, tepki_var_mi, 
                 tepki_zamani_ms, dogru_mu, asama_no, kelime_gosterilen,
                 renk_gosterilen, beklenen_tepki, verilen_tepki)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    kullanici_id, test_id,
                    tepki.get('uyaran_suresi_ms'),
                    tepki.get('tepki_var_mi'),
                    tepki.get('tepki_zamani_ms'),
                    tepki.get('dogru_mu'),
                    tepki.get('asama_no'),
                    tepki.get('kelime_gosterilen'),
                    tepki.get('renk_gosterilen'),
                    tepki.get('beklenen_tepki'),
                    tepki.get('verilen_tepki')
                )
                self.cursor.execute(query, values)
            
            self.conn.commit()
            print(f"{len(tepkiler)} ham veri kaydı eklendi.")
        except Exception as e:
            self.conn.rollback()
            print(f"Ham veri kaydetme hatası: {e}")
            raise
    
    def hesapla_ve_kaydet_sonuclar(self, test_id, kullanici_id):
        """Test sonuçlarını hesapla ve kaydet"""
        try:
            # Her aşama için verileri al
            sonuclar = {}
            
            for asama in [1, 2, 3]:
                query = """
                SELECT tepki_zamani_ms, dogru_mu, tepki_var_mi
                FROM stroop_ham_veri
                WHERE test_id = %s AND asama_no = %s
                ORDER BY id
                """
                self.cursor.execute(query, (test_id, asama))
                asama_verileri = self.cursor.fetchall()
                
                # Hesaplamalar
                dogru_tepkiler = [row[0] for row in asama_verileri if row[1] and row[2]]
                toplam_tepki = len(asama_verileri)
                dogru_sayisi = len(dogru_tepkiler)
                
                if dogru_sayisi > 0:
                    ort_sure = np.mean(dogru_tepkiler)
                else:
                    ort_sure = None
                
                dogruluk = (dogru_sayisi / toplam_tepki * 100) if toplam_tepki > 0 else 0
                hata = toplam_tepki - dogru_sayisi
                
                if asama == 1:
                    sonuclar['bts_ort_sure'] = ort_sure
                    sonuclar['bts_dogruluk'] = dogruluk
                    sonuclar['bts_hata'] = hata
                    sonuclar['bts_toplam_tepki'] = toplam_tepki
                elif asama == 2:
                    sonuclar['kts_ort_sure'] = ort_sure
                    sonuclar['kts_dogruluk'] = dogruluk
                    sonuclar['kts_hata'] = hata
                    sonuclar['kts_toplam_tepki'] = toplam_tepki
                else:  # asama == 3
                    sonuclar['sts_ort_sure'] = ort_sure
                    sonuclar['sts_dogruluk'] = dogruluk
                    sonuclar['sts_hata'] = hata
                    sonuclar['sts_toplam_tepki'] = toplam_tepki
            
            # İnterferans hesapla
            if sonuclar.get('sts_ort_sure') and sonuclar.get('bts_ort_sure'):
                sonuclar['interferans_fark'] = sonuclar['sts_ort_sure'] - sonuclar['bts_ort_sure']
                sonuclar['interferans_orani'] = (sonuclar['interferans_fark'] / sonuclar['bts_ort_sure']) * 100
            
            # Dürtüsellik analizi
            # Kısa tepki süresi + yüksek hata = dürtüsellik
            ort_tepki_suresi = np.mean([s for s in [sonuclar.get('bts_ort_sure'), 
                                                    sonuclar.get('kts_ort_sure'), 
                                                    sonuclar.get('sts_ort_sure')] if s])
            ort_hata_orani = np.mean([sonuclar.get('bts_hata', 0) / sonuclar.get('bts_toplam_tepki', 1),
                                      sonuclar.get('kts_hata', 0) / sonuclar.get('kts_toplam_tepki', 1),
                                      sonuclar.get('sts_hata', 0) / sonuclar.get('sts_toplam_tepki', 1)])
            
            # Dürtüsellik: Hızlı tepki (< 400ms) ve yüksek hata (> %20)
            sonuclar['durtussellik_var'] = ort_tepki_suresi < 400 and ort_hata_orani > 0.2
            if sonuclar['durtussellik_var']:
                sonuclar['durtussellik_aciklama'] = f"Ortalama tepki süresi: {ort_tepki_suresi:.0f}ms, Hata oranı: {ort_hata_orani*100:.1f}%"
            
            # Süre bilgilerini al (örnek değerler, gerçek uygulamada frontend'den gelecek)
            # Bu kısım gerçek uygulamada test sırasında kaydedilecek
            sonuclar['bolum1_sure_sn'] = 30.5  # Örnek
            sonuclar['bolum2_sure_sn'] = 45.2  # Örnek
            sonuclar['bolum3_sure_sn'] = 52.8  # Örnek
            sonuclar['toplam_sure_sn'] = sonuclar['bolum1_sure_sn'] + sonuclar['bolum2_sure_sn'] + sonuclar['bolum3_sure_sn']
            
            # Sonuçları kaydet
            self._kaydet_test_sonuclari(test_id, kullanici_id, sonuclar)
            
            # Beceri skorlarını hesapla ve kaydet
            self._hesapla_beceri_skorlari(test_id, kullanici_id, sonuclar)
            
        except Exception as e:
            self.conn.rollback()
            print(f"Sonuç hesaplama hatası: {e}")
            raise
    
    def _kaydet_test_sonuclari(self, test_id, kullanici_id, sonuclar):
        """Test sonuçlarını veritabanına kaydet"""
        query = """
        INSERT INTO stroop_sonuclari 
        (kullanici_id, test_id, bts_ort_sure, bts_dogruluk, bts_hata, bts_toplam_tepki,
         kts_ort_sure, kts_dogruluk, kts_hata, kts_toplam_tepki,
         sts_ort_sure, sts_dogruluk, sts_hata, sts_toplam_tepki,
         interferans_fark, interferans_orani,
         bolum1_sure_sn, bolum2_sure_sn, bolum3_sure_sn, toplam_sure_sn,
         durtussellik_var, durtussellik_aciklama)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            kullanici_id, test_id,
            sonuclar.get('bts_ort_sure'), sonuclar.get('bts_dogruluk'), 
            sonuclar.get('bts_hata'), sonuclar.get('bts_toplam_tepki'),
            sonuclar.get('kts_ort_sure'), sonuclar.get('kts_dogruluk'),
            sonuclar.get('kts_hata'), sonuclar.get('kts_toplam_tepki'),
            sonuclar.get('sts_ort_sure'), sonuclar.get('sts_dogruluk'),
            sonuclar.get('sts_hata'), sonuclar.get('sts_toplam_tepki'),
            sonuclar.get('interferans_fark'), sonuclar.get('interferans_orani'),
            sonuclar.get('bolum1_sure_sn'), sonuclar.get('bolum2_sure_sn'),
            sonuclar.get('bolum3_sure_sn'), sonuclar.get('toplam_sure_sn'),
            sonuclar.get('durtussellik_var'), sonuclar.get('durtussellik_aciklama')
        )
        
        self.cursor.execute(query, values)
        self.conn.commit()
        print("Test sonuçları kaydedildi.")
    
    def _hesapla_beceri_skorlari(self, test_id, kullanici_id, sonuclar):
        """7 bilişsel beceri skorunu hesapla"""
        skorlar = {}
        
        # 1. İşlem Hızı (Toplam süreye göre)
        # Normalleştirme: 60 saniye = 100 puan, 180 saniye = 0 puan
        toplam_sure = sonuclar.get('toplam_sure_sn', 120)
        skorlar['islem_hizi_skoru'] = max(0, min(100, (180 - toplam_sure) / 1.2))
        
        # 2. Tepkime Hızı (Ortalama tepki sürelerine göre)
        # Normalleştirme: 300ms = 100 puan, 1000ms = 0 puan
        ort_tepki = np.mean([s for s in [sonuclar.get('bts_ort_sure'), 
                                         sonuclar.get('kts_ort_sure'), 
                                         sonuclar.get('sts_ort_sure')] if s])
        skorlar['tepkime_hizi_skoru'] = max(0, min(100, (1000 - ort_tepki) / 7))
        
        # 3. Sürdürülebilir Dikkat (Doğruluk oranlarına göre)
        ort_dogruluk = np.mean([sonuclar.get('bts_dogruluk', 0),
                                sonuclar.get('kts_dogruluk', 0),
                                sonuclar.get('sts_dogruluk', 0)])
        skorlar['surdurulebilir_dikkat_skoru'] = ort_dogruluk
        
        # 4. Seçici Dikkat (STS performansına göre)
        skorlar['secici_dikkat_skoru'] = sonuclar.get('sts_dogruluk', 0)
        
        # 5. Kısa Süreli Görsel Hafıza (KTS performansına göre)
        skorlar['kisa_sureli_gorsel_hafiza_skoru'] = sonuclar.get('kts_dogruluk', 0)
        
        # 6. Dürtüsellik (Ters skorlama - dürtüsellik yoksa yüksek puan)
        if sonuclar.get('durtussellik_var'):
            skorlar['durtussellik_skoru'] = 30  # Dürtüsellik varsa düşük puan
        else:
            skorlar['durtussellik_skoru'] = 90  # Dürtüsellik yoksa yüksek puan
        
        # 7. Bilişsel Esneklik (İnterferans oranına göre)
        # Düşük interferans = yüksek esneklik
        interferans_orani = abs(sonuclar.get('interferans_orani', 0))
        skorlar['bilissel_esneklik_skoru'] = max(0, min(100, 100 - interferans_orani))
        
        # Genel performans skoru
        skorlar['genel_performans_skoru'] = np.mean(list(skorlar.values()))
        
        # Skorları kaydet
        query = """
        INSERT INTO stroop_beceri_skorlari
        (test_id, kullanici_id, islem_hizi_skoru, tepkime_hizi_skoru,
         surdurulebilir_dikkat_skoru, secici_dikkat_skoru,
         kisa_sureli_gorsel_hafiza_skoru, durtussellik_skoru,
         bilissel_esneklik_skoru, genel_performans_skoru)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            test_id, kullanici_id,
            skorlar['islem_hizi_skoru'],
            skorlar['tepkime_hizi_skoru'],
            skorlar['surdurulebilir_dikkat_skoru'],
            skorlar['secici_dikkat_skoru'],
            skorlar['kisa_sureli_gorsel_hafiza_skoru'],
            skorlar['durtussellik_skoru'],
            skorlar['bilissel_esneklik_skoru'],
            skorlar['genel_performans_skoru']
        )
        
        self.cursor.execute(query, values)
        self.conn.commit()
        print("Beceri skorları kaydedildi.")
        
        # Skorları göster
        print("\nBilişsel Beceri Skorları:")
        for beceri, skor in skorlar.items():
            print(f"- {beceri}: {skor:.1f}/100")


# Örnek kullanım
if __name__ == "__main__":
    # Veritabanı bağlantı bilgileri
    db_config = {
        'host': 'localhost',
        'database': 'bilisseltest',
        'user': 'postgres',
        'password': 'password'
    }
    
    # Manager oluştur
    manager = StroopDatabaseManager(db_config)
    
    try:
        # Bağlan
        manager.connect()
        
        # Tabloları oluştur
        # manager.create_tables()
        
        # Örnek test verisi
        test_id = 1
        kullanici_id = 1
        
        # Örnek ham veri (normalde frontend'den gelecek)
        ornek_tepkiler = [
            # 1. Aşama - BTS
            {'uyaran_suresi_ms': 2000, 'tepki_var_mi': True, 'tepki_zamani_ms': 450, 
             'dogru_mu': True, 'asama_no': 1, 'kelime_gosterilen': 'KIRMIZI', 
             'renk_gosterilen': 'kirmizi', 'beklenen_tepki': 'space', 'verilen_tepki': 'space'},
            # ... daha fazla tepki
        ]
        
        # Ham veriyi kaydet
        # manager.save_ham_veri(test_id, kullanici_id, ornek_tepkiler)
        
        # Sonuçları hesapla ve kaydet
        # manager.hesapla_ve_kaydet_sonuclar(test_id, kullanici_id)
        
    finally:
        # Bağlantıyı kapat
        manager.disconnect() 