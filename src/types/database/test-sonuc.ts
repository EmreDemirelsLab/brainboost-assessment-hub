import { SoruCevap } from './soru-cevap';
import { 
  DikkatTestiDetaylari, 
  AkilMantikTestiDetaylari, 
  HafizaTestiDetaylari, 
  PuzzleTestiDetaylari, 
  StroopTestiDetaylari 
} from './test-detaylari';

export type TestTuru = 'dikkat' | 'akil_mantik' | 'hafiza' | 'puzzle' | 'stroop';
export type TestDurum = 'baslanmadi' | 'devam_ediyor' | 'tamamlandi' | 'basarisiz' | 'zaman_asimi';

export interface TestSonuc {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  test_turu: TestTuru;
  durum: TestDurum;
  tamamlanma_yuzdesi: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  test_suresi_saniye: number;
  toplam_soru_sayisi: number;
  cevaplanan_soru_sayisi: number;
  dogru_cevap_sayisi: number;
  yanlis_cevap_sayisi: number;
  atlanan_soru_sayisi: number;
  dogruluk_skoru: number;
  hiz_skoru: number;
  genel_test_skoru: number;
  ortalama_tepki_suresi_ms: number;
  en_hizli_tepki_ms: number;
  en_yavas_tepki_ms: number;
  ham_veri?: Record<string, any>;
  performans_analizi?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TestSonucWithDetails extends TestSonuc {
  soru_cevaplari?: SoruCevap[];
  dikkat_testi_detaylari?: DikkatTestiDetaylari;
  akil_mantik_testi_detaylari?: AkilMantikTestiDetaylari;
  hafiza_testi_detaylari?: HafizaTestiDetaylari;
  puzzle_testi_detaylari?: PuzzleTestiDetaylari;
  stroop_testi_detaylari?: StroopTestiDetaylari;
} 