export interface BurdonTestResult {
  id: string;
  student_id: string | null;
  conducted_by: string | null;
  test_start_time: string | null;
  test_end_time: string | null;
  test_elapsed_time_seconds: number | null;
  test_auto_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  student_name?: string;
  conducted_by_name?: string;
  // Fields that match the actual database structure
  total_correct?: number;
  total_missed?: number;
  total_wrong?: number;
  total_score?: number;
  attention_ratio?: number;
  section1_correct?: number;
  section1_missed?: number;
  section1_wrong?: number;
  section1_score?: number;
  section2_correct?: number;
  section2_missed?: number;
  section2_wrong?: number;
  section2_score?: number;
  section3_correct?: number;
  section3_missed?: number;
  section3_wrong?: number;
  section3_score?: number;
  detailed_results?: any;
  notes?: string | null;
}

export interface Test {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  duration_minutes: number | null;
  is_active?: boolean;
  created_at: string;
  instructions?: string | null;
}

export interface Student {
  id: string;
  user_id: string | null;
  student_number: string | null;
  birth_date?: string | null;
  grade_level?: number | null;
  school_name?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
}

export interface TestResult {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  test_turu: string;
  durum: string;
  tamamlanma_yuzdesi?: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string | null;
  test_suresi_saniye?: number;
  toplam_soru_sayisi?: number;
  cevaplanan_soru_sayisi?: number;
  dogru_cevap_sayisi?: number;
  yanlis_cevap_sayisi?: number;
  atlanan_soru_sayisi?: number;
  dogruluk_skoru?: number;
  hiz_skoru?: number;
  genel_test_skoru?: number;
  ortalama_tepki_suresi_ms?: number;
  en_hizli_tepki_ms?: number;
  en_yavas_tepki_ms?: number;
  ham_veri?: Record<string, any>;
  performans_analizi?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  kullanici_id: string;
  oturum_uuid: string;
  durum: 'baslatildi' | 'devam_ediyor' | 'tamamlandi' | 'terk_edildi';
  mevcut_test_indeksi?: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string | null;
  toplam_sure_saniye?: number;
  genel_skor?: number;
  performans_seviyesi?: 'dusuk' | 'orta' | 'yuksek';
  tarayici_bilgisi?: string;
  cihaz_bilgisi?: string;
  ip_adresi?: string;
  created_at: string;
  updated_at: string;
}

export interface CognitiveScores {
  id: string;
  oturum_id: string;
  kullanici_id: string;
  secici_dikkat_skoru: number;
  calisma_hafizasi_skoru: number;
  bilissel_esneklik_skoru: number;
  isleme_hizi_skoru: number;
  gorseli_uzaysal_beceriler_skoru: number;
  mantiksal_akil_yurutme_skoru: number;
  genel_bilissel_indeks: number;
  bilissel_yas?: number;
  performans_seviyesi?: string;
  guclu_alanlar?: string[];
  gelisim_alanlari?: string[];
  oneriler?: string[];
  yasitlarina_gore_performans?: string;
  beceri_profili_analizi?: Record<string, any>;
  karsilastirma_verileri?: Record<string, any>;
  created_at: string;
  updated_at: string;
}