import { TestSonuc } from './test-sonuc';
import { BilisselBeceriSkorlari } from './bilissel-skorlar';

export interface TestOturumu {
  id: string;
  kullanici_id: string;
  oturum_uuid: string;
  durum: 'baslatildi' | 'devam_ediyor' | 'tamamlandi' | 'terk_edildi';
  mevcut_test_indeksi: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  toplam_sure_saniye: number;
  genel_skor: number;
  performans_seviyesi?: 'dusuk' | 'orta' | 'yuksek';
  tarayici_bilgisi?: string;
  cihaz_bilgisi?: string;
  ip_adresi?: string;
  created_at: string;
  updated_at: string;
}

export interface TestOturumuWithResults extends TestOturumu {
  test_sonuclari?: TestSonuc[];
  bilissel_beceri_skorlari?: BilisselBeceriSkorlari;
} 