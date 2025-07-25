export interface SoruCevap {
  id: string;
  test_sonuc_id: string;
  oturum_id: string;
  kullanici_id: string;
  soru_numarasi: number;
  soru_turu?: string;
  bolum_adi?: string;
  bolum_numarasi?: number;
  kullanici_cevabi?: string;
  dogru_cevap?: string;
  dogru_mu: boolean;
  tepki_suresi_ms: number;
  soru_baslangic_zamani?: string;
  soru_bitis_zamani?: string;
  ek_veriler?: Record<string, any>;
  created_at: string;
}

export interface SoruCevapAnalizi {
  soru_numarasi: number;
  dogru_mu: boolean;
  tepki_suresi_ms: number;
  zorluk_seviyesi?: 'kolay' | 'orta' | 'zor';
  hata_tipi?: string;
} 