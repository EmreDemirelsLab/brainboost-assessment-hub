// Dikkat Testi Detayları
export interface DikkatTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  bolum1_dogru: number;
  bolum1_yanlis: number;
  bolum1_sure_ms: number;
  bolum1_dogruluk: number;
  bolum2_dogru: number;
  bolum2_yanlis: number;
  bolum2_sure_ms: number;
  bolum2_dogruluk: number;
  bolum3_dogru: number;
  bolum3_yanlis: number;
  bolum3_sure_ms: number;
  bolum3_dogruluk: number;
  sayi_sorulari_dogru: number;
  sayi_sorulari_yanlis: number;
  harf_sorulari_dogru: number;
  harf_sorulari_yanlis: number;
  karma_sorular_dogru: number;
  karma_sorular_yanlis: number;
  ornek_test_skoru: number;
  ornek_test_denemeleri: number;
  created_at: string;
}

// Akıl-Mantık Testi Detayları
export interface AkilMantikTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  dortlu_yatay_skoru: number;
  dortlu_kare_skoru: number;
  altili_kare_skoru: number;
  l_format_skoru: number;
  dokuzlu_format_skoru: number;
  durtuselluk_skoru: number;
  hizli_yanlis_cevaplar: number;
  cok_hizli_yanlis_cevaplar: number;
  durtuselluk_uyarisi: boolean;
  ornek_denemeleri: number;
  ornek_dogru_sayisi: number;
  son_soru_numarasi: number;
  created_at: string;
}

// Hafıza Testi Detayları
export interface HafizaTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  anlik_hatirlama_skoru: number;
  geciktirilmis_hatirlama_skoru: number;
  tanima_skoru: number;
  yanlis_pozitifler: number;
  yanlis_negatifler: number;
  gorsel_hafiza_skoru: number;
  kelime_hafiza_skoru: number;
  created_at: string;
}

// Puzzle Testi Detayları
export interface PuzzleTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  uzamsal_dogruluk: number;
  oruntu_tanima_skoru: number;
  tamamlama_verimliligi: number;
  parca_tamamlama_hizi: number;
  rotasyon_dogrulugu: number;
  created_at: string;
}

// Stroop Testi Detayları
export interface StroopTestiDetaylari {
  id: string;
  test_sonuc_id: string;
  uyumlu_dogruluk: number;
  uyumsuz_dogruluk: number;
  stroop_etkisi_ms: number;
  bilissel_esneklik_skoru: number;
  mudahale_kontrolu_skoru: number;
  adaptasyon_hizi: number;
  created_at: string;
} 