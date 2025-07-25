export interface BilisselBeceriSkorlari {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  secici_dikkat_skoru: number;
  calisma_hafizasi_skoru: number;
  bilissel_esneklik_skoru: number;
  islem_hizi_skoru: number;
  gorsel_uzamsal_skoru: number;
  mantiksal_akil_skoru: number;
  genel_bilissel_endeks: number;
  bilissel_yas_karsiligi: number;
  performans_seviyesi: 'dusuk' | 'orta_alti' | 'orta' | 'orta_ustu' | 'yuksek';
  hesaplama_tarihi: string;
  guncelleme_tarihi: string;
  created_at: string;
  updated_at: string;
}

export interface BilisselSkorAnalizi {
  guclu_alanlar: string[];
  gelistirilmesi_gereken_alanlar: string[];
  yas_grubu_karsilastirmasi: {
    yas_grubu: string;
    ortalama_skor: number;
    kullanici_skor: number;
    yuzdelik_dilim: number;
  };
  oneri_listesi: string[];
}

export interface BilisselSkorlarWithAnalysis extends BilisselBeceriSkorlari {
  analiz?: BilisselSkorAnalizi;
  test_sonuclari?: any[]; // TestSonuc tipini kullanmak için circular import'u önlemek için any kullanıyoruz
} 