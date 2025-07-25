export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      akil_mantik_testi_detaylari: {
        Row: {
          analitik_dusunme_skoru: number | null
          cozum_verimliligi: number | null
          created_at: string | null
          dragdrop_soru_dogruluk: number | null
          dragdrop_soru_sayisi: number | null
          dragdrop_soru_skoru: number | null
          en_hizli_cozum_suresi: number | null
          en_yavas_cozum_suresi: number | null
          hata_duzeltme_yetisi: number | null
          id: string
          impulsivite_analizi: number | null
          kullanici_id: string
          ortalama_cozum_suresi: number | null
          sayisal_mantik_skoru: number | null
          secenekli_soru_dogruluk: number | null
          secenekli_soru_sayisi: number | null
          secenekli_soru_skoru: number | null
          sekil_mantik_skoru: number | null
          sistematik_yaklasim_skoru: number | null
          soru_tipi_analizi: Json | null
          sozel_mantik_skoru: number | null
          test_sonuc_id: string
          updated_at: string | null
          zorluk_bazli_performans: Json | null
        }
        Insert: {
          analitik_dusunme_skoru?: number | null
          cozum_verimliligi?: number | null
          created_at?: string | null
          dragdrop_soru_dogruluk?: number | null
          dragdrop_soru_sayisi?: number | null
          dragdrop_soru_skoru?: number | null
          en_hizli_cozum_suresi?: number | null
          en_yavas_cozum_suresi?: number | null
          hata_duzeltme_yetisi?: number | null
          id?: string
          impulsivite_analizi?: number | null
          kullanici_id: string
          ortalama_cozum_suresi?: number | null
          sayisal_mantik_skoru?: number | null
          secenekli_soru_dogruluk?: number | null
          secenekli_soru_sayisi?: number | null
          secenekli_soru_skoru?: number | null
          sekil_mantik_skoru?: number | null
          sistematik_yaklasim_skoru?: number | null
          soru_tipi_analizi?: Json | null
          sozel_mantik_skoru?: number | null
          test_sonuc_id: string
          updated_at?: string | null
          zorluk_bazli_performans?: Json | null
        }
        Update: {
          analitik_dusunme_skoru?: number | null
          cozum_verimliligi?: number | null
          created_at?: string | null
          dragdrop_soru_dogruluk?: number | null
          dragdrop_soru_sayisi?: number | null
          dragdrop_soru_skoru?: number | null
          en_hizli_cozum_suresi?: number | null
          en_yavas_cozum_suresi?: number | null
          hata_duzeltme_yetisi?: number | null
          id?: string
          impulsivite_analizi?: number | null
          kullanici_id?: string
          ortalama_cozum_suresi?: number | null
          sayisal_mantik_skoru?: number | null
          secenekli_soru_dogruluk?: number | null
          secenekli_soru_sayisi?: number | null
          secenekli_soru_skoru?: number | null
          sekil_mantik_skoru?: number | null
          sistematik_yaklasim_skoru?: number | null
          soru_tipi_analizi?: Json | null
          sozel_mantik_skoru?: number | null
          test_sonuc_id?: string
          updated_at?: string | null
          zorluk_bazli_performans?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "akil_mantik_testi_detaylari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "akil_mantik_testi_detaylari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      bilissel_beceri_skorlari: {
        Row: {
          beceri_profili_analizi: Json | null
          bilissel_esneklik_skoru: number
          bilissel_yas: number | null
          calisma_hafizasi_skoru: number
          created_at: string | null
          gelisim_alanlari: string[] | null
          genel_bilissel_indeks: number
          gorseli_uzaysal_beceriler_skoru: number
          guclu_alanlar: string[] | null
          id: string
          isleme_hizi_skoru: number
          karsilastirma_verileri: Json | null
          kullanici_id: string
          mantiksal_akil_yurutme_skoru: number
          oneriler: string[] | null
          oturum_id: string
          performans_seviyesi: string | null
          secici_dikkat_skoru: number
          updated_at: string | null
          yasitlarina_gore_performans: string | null
        }
        Insert: {
          beceri_profili_analizi?: Json | null
          bilissel_esneklik_skoru?: number
          bilissel_yas?: number | null
          calisma_hafizasi_skoru?: number
          created_at?: string | null
          gelisim_alanlari?: string[] | null
          genel_bilissel_indeks?: number
          gorseli_uzaysal_beceriler_skoru?: number
          guclu_alanlar?: string[] | null
          id?: string
          isleme_hizi_skoru?: number
          karsilastirma_verileri?: Json | null
          kullanici_id: string
          mantiksal_akil_yurutme_skoru?: number
          oneriler?: string[] | null
          oturum_id: string
          performans_seviyesi?: string | null
          secici_dikkat_skoru?: number
          updated_at?: string | null
          yasitlarina_gore_performans?: string | null
        }
        Update: {
          beceri_profili_analizi?: Json | null
          bilissel_esneklik_skoru?: number
          bilissel_yas?: number | null
          calisma_hafizasi_skoru?: number
          created_at?: string | null
          gelisim_alanlari?: string[] | null
          genel_bilissel_indeks?: number
          gorseli_uzaysal_beceriler_skoru?: number
          guclu_alanlar?: string[] | null
          id?: string
          isleme_hizi_skoru?: number
          karsilastirma_verileri?: Json | null
          kullanici_id?: string
          mantiksal_akil_yurutme_skoru?: number
          oneriler?: string[] | null
          oturum_id?: string
          performans_seviyesi?: string | null
          secici_dikkat_skoru?: number
          updated_at?: string | null
          yasitlarina_gore_performans?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bilissel_beceri_skorlari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bilissel_beceri_skorlari_oturum_id_fkey"
            columns: ["oturum_id"]
            isOneToOne: true
            referencedRelation: "test_oturumlari"
            referencedColumns: ["id"]
          },
        ]
      }
      burdon_test_results: {
        Row: {
          conducted_by: string | null
          created_at: string | null
          id: string
          student_id: string | null
          test_auto_completed: boolean | null
          test_elapsed_time_seconds: number | null
          test_end_time: string | null
          test_start_time: string | null
          updated_at: string | null
        }
        Insert: {
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          student_id?: string | null
          test_auto_completed?: boolean | null
          test_elapsed_time_seconds?: number | null
          test_end_time?: string | null
          test_start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          student_id?: string | null
          test_auto_completed?: boolean | null
          test_elapsed_time_seconds?: number | null
          test_end_time?: string | null
          test_start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "burdon_test_results_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "burdon_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dikkat_testi_detaylari: {
        Row: {
          bolum_bazli_analiz: Json | null
          created_at: string | null
          dikkat_dagitici_performansi: number | null
          dikkat_kontrolu_skoru: number | null
          egitim_bolumu_dogruluk: number | null
          egitim_bolumu_hiz: number | null
          egitim_bolumu_skor: number | null
          hedef_uyaran_performansi: number | null
          id: string
          impulsivite_skoru: number | null
          kaçirilan_hedef_sayisi: number | null
          kullanici_id: string
          ortalama_tepki_suresi_dikkat_dagitici: number | null
          ortalama_tepki_suresi_hedef: number | null
          seçici_dikkat_skoru: number | null
          surekli_dikkat_skoru: number | null
          tepki_suresi_tutarliligi: number | null
          test_bolumu_dogruluk: number | null
          test_bolumu_hiz: number | null
          test_bolumu_skor: number | null
          test_sonuc_id: string
          updated_at: string | null
          yanlis_alarm_sayisi: number | null
          zaman_bazli_performans: Json | null
        }
        Insert: {
          bolum_bazli_analiz?: Json | null
          created_at?: string | null
          dikkat_dagitici_performansi?: number | null
          dikkat_kontrolu_skoru?: number | null
          egitim_bolumu_dogruluk?: number | null
          egitim_bolumu_hiz?: number | null
          egitim_bolumu_skor?: number | null
          hedef_uyaran_performansi?: number | null
          id?: string
          impulsivite_skoru?: number | null
          kaçirilan_hedef_sayisi?: number | null
          kullanici_id: string
          ortalama_tepki_suresi_dikkat_dagitici?: number | null
          ortalama_tepki_suresi_hedef?: number | null
          seçici_dikkat_skoru?: number | null
          surekli_dikkat_skoru?: number | null
          tepki_suresi_tutarliligi?: number | null
          test_bolumu_dogruluk?: number | null
          test_bolumu_hiz?: number | null
          test_bolumu_skor?: number | null
          test_sonuc_id: string
          updated_at?: string | null
          yanlis_alarm_sayisi?: number | null
          zaman_bazli_performans?: Json | null
        }
        Update: {
          bolum_bazli_analiz?: Json | null
          created_at?: string | null
          dikkat_dagitici_performansi?: number | null
          dikkat_kontrolu_skoru?: number | null
          egitim_bolumu_dogruluk?: number | null
          egitim_bolumu_hiz?: number | null
          egitim_bolumu_skor?: number | null
          hedef_uyaran_performansi?: number | null
          id?: string
          impulsivite_skoru?: number | null
          kaçirilan_hedef_sayisi?: number | null
          kullanici_id?: string
          ortalama_tepki_suresi_dikkat_dagitici?: number | null
          ortalama_tepki_suresi_hedef?: number | null
          seçici_dikkat_skoru?: number | null
          surekli_dikkat_skoru?: number | null
          tepki_suresi_tutarliligi?: number | null
          test_bolumu_dogruluk?: number | null
          test_bolumu_hiz?: number | null
          test_bolumu_skor?: number | null
          test_sonuc_id?: string
          updated_at?: string | null
          yanlis_alarm_sayisi?: number | null
          zaman_bazli_performans?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dikkat_testi_detaylari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dikkat_testi_detaylari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      hafiza_testi_detaylari: {
        Row: {
          atlama_hatalari_sayisi: number | null
          calisma_hafizasi_skoru: number | null
          created_at: string | null
          dizi_uzunlugu_performansi: Json | null
          dogru_hatirlama_orani: number | null
          ekleme_hatalari_sayisi: number | null
          hafiza_kapasitesi_skor: number | null
          hafizaya_alma_suresi: number | null
          hatirlama_hizi: number | null
          hatirlama_stratejileri: Json | null
          id: string
          karisma_hatalari_sayisi: number | null
          kisa_sureli_hafiza_skoru: number | null
          kullanici_id: string
          maksimum_hatirlanabilen_oge: number | null
          ogrenme_hizi_skoru: number | null
          ortalama_hatirlanabilen_oge: number | null
          siralama_hatalari_sayisi: number | null
          test_sonuc_id: string
          unutma_hizi_skoru: number | null
          updated_at: string | null
          uzun_sureli_hafiza_skoru: number | null
          yanlis_hatirlama_orani: number | null
        }
        Insert: {
          atlama_hatalari_sayisi?: number | null
          calisma_hafizasi_skoru?: number | null
          created_at?: string | null
          dizi_uzunlugu_performansi?: Json | null
          dogru_hatirlama_orani?: number | null
          ekleme_hatalari_sayisi?: number | null
          hafiza_kapasitesi_skor?: number | null
          hafizaya_alma_suresi?: number | null
          hatirlama_hizi?: number | null
          hatirlama_stratejileri?: Json | null
          id?: string
          karisma_hatalari_sayisi?: number | null
          kisa_sureli_hafiza_skoru?: number | null
          kullanici_id: string
          maksimum_hatirlanabilen_oge?: number | null
          ogrenme_hizi_skoru?: number | null
          ortalama_hatirlanabilen_oge?: number | null
          siralama_hatalari_sayisi?: number | null
          test_sonuc_id: string
          unutma_hizi_skoru?: number | null
          updated_at?: string | null
          uzun_sureli_hafiza_skoru?: number | null
          yanlis_hatirlama_orani?: number | null
        }
        Update: {
          atlama_hatalari_sayisi?: number | null
          calisma_hafizasi_skoru?: number | null
          created_at?: string | null
          dizi_uzunlugu_performansi?: Json | null
          dogru_hatirlama_orani?: number | null
          ekleme_hatalari_sayisi?: number | null
          hafiza_kapasitesi_skor?: number | null
          hafizaya_alma_suresi?: number | null
          hatirlama_hizi?: number | null
          hatirlama_stratejileri?: Json | null
          id?: string
          karisma_hatalari_sayisi?: number | null
          kisa_sureli_hafiza_skoru?: number | null
          kullanici_id?: string
          maksimum_hatirlanabilen_oge?: number | null
          ogrenme_hizi_skoru?: number | null
          ortalama_hatirlanabilen_oge?: number | null
          siralama_hatalari_sayisi?: number | null
          test_sonuc_id?: string
          unutma_hizi_skoru?: number | null
          updated_at?: string | null
          uzun_sureli_hafiza_skoru?: number | null
          yanlis_hatirlama_orani?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hafiza_testi_detaylari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hafiza_testi_detaylari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      kullanici_profilleri: {
        Row: {
          cinsiyet: string | null
          created_at: string | null
          egitim_seviyesi: string | null
          ek_bilgiler: Json | null
          id: string
          kullanici_id: string
          meslek: string | null
          updated_at: string | null
          yas: number | null
        }
        Insert: {
          cinsiyet?: string | null
          created_at?: string | null
          egitim_seviyesi?: string | null
          ek_bilgiler?: Json | null
          id?: string
          kullanici_id: string
          meslek?: string | null
          updated_at?: string | null
          yas?: number | null
        }
        Update: {
          cinsiyet?: string | null
          created_at?: string | null
          egitim_seviyesi?: string | null
          ek_bilgiler?: Json | null
          id?: string
          kullanici_id?: string
          meslek?: string | null
          updated_at?: string | null
          yas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kullanici_profilleri_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
        ]
      }
      kullanicilar: {
        Row: {
          ad_soyad: string | null
          created_at: string | null
          eposta: string
          id: string
          kullanici_kodu: string | null
          updated_at: string | null
        }
        Insert: {
          ad_soyad?: string | null
          created_at?: string | null
          eposta: string
          id?: string
          kullanici_kodu?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_soyad?: string | null
          created_at?: string | null
          eposta?: string
          id?: string
          kullanici_kodu?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      puzzle_testi_detaylari: {
        Row: {
          basarili_tamamlama_sayisi: number | null
          created_at: string | null
          deneme_yanilma_orani: number | null
          donusum_becerileri_skoru: number | null
          gereksiz_hamle_sayisi: number | null
          hamle_analizi: Json | null
          hamle_verimliligi: number | null
          id: string
          kolay_seviye_performansi: number | null
          kullanici_id: string
          mental_rotasyon_skoru: number | null
          optimal_cozum_orani: number | null
          orta_seviye_performansi: number | null
          ortalama_tamamlama_suresi: number | null
          puzzle_tipi_performansi: Json | null
          sekil_tanimlama_skoru: number | null
          sistematik_yaklasim_skoru: number | null
          tamamlama_orani: number | null
          test_sonuc_id: string
          toplam_deneme_sayisi: number | null
          updated_at: string | null
          uzaysal_iliskiler_skoru: number | null
          zor_seviye_performansi: number | null
        }
        Insert: {
          basarili_tamamlama_sayisi?: number | null
          created_at?: string | null
          deneme_yanilma_orani?: number | null
          donusum_becerileri_skoru?: number | null
          gereksiz_hamle_sayisi?: number | null
          hamle_analizi?: Json | null
          hamle_verimliligi?: number | null
          id?: string
          kolay_seviye_performansi?: number | null
          kullanici_id: string
          mental_rotasyon_skoru?: number | null
          optimal_cozum_orani?: number | null
          orta_seviye_performansi?: number | null
          ortalama_tamamlama_suresi?: number | null
          puzzle_tipi_performansi?: Json | null
          sekil_tanimlama_skoru?: number | null
          sistematik_yaklasim_skoru?: number | null
          tamamlama_orani?: number | null
          test_sonuc_id: string
          toplam_deneme_sayisi?: number | null
          updated_at?: string | null
          uzaysal_iliskiler_skoru?: number | null
          zor_seviye_performansi?: number | null
        }
        Update: {
          basarili_tamamlama_sayisi?: number | null
          created_at?: string | null
          deneme_yanilma_orani?: number | null
          donusum_becerileri_skoru?: number | null
          gereksiz_hamle_sayisi?: number | null
          hamle_analizi?: Json | null
          hamle_verimliligi?: number | null
          id?: string
          kolay_seviye_performansi?: number | null
          kullanici_id?: string
          mental_rotasyon_skoru?: number | null
          optimal_cozum_orani?: number | null
          orta_seviye_performansi?: number | null
          ortalama_tamamlama_suresi?: number | null
          puzzle_tipi_performansi?: Json | null
          sekil_tanimlama_skoru?: number | null
          sistematik_yaklasim_skoru?: number | null
          tamamlama_orani?: number | null
          test_sonuc_id?: string
          toplam_deneme_sayisi?: number | null
          updated_at?: string | null
          uzaysal_iliskiler_skoru?: number | null
          zor_seviye_performansi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_testi_detaylari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_testi_detaylari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      soru_cevaplari: {
        Row: {
          analiz_verileri: Json | null
          bolum_adi: string | null
          cevap_dogru: boolean | null
          cevap_turu: string | null
          cevap_verme_zamani: string | null
          created_at: string | null
          dogru_cevap: Json | null
          dogruluk_skoru: number | null
          hiz_skoru: number | null
          id: string
          kullanici_cevabi: Json | null
          kullanici_id: string
          oturum_id: string
          soru_baslangic_zamani: string | null
          soru_gosterim_suresi_ms: number | null
          soru_icerik: Json | null
          soru_indeksi: number
          soru_kategorisi: string | null
          soru_tipi: string | null
          tepki_suresi_ms: number | null
          test_sonuc_id: string
          test_turu: string
          zorluk_seviyesi: string | null
        }
        Insert: {
          analiz_verileri?: Json | null
          bolum_adi?: string | null
          cevap_dogru?: boolean | null
          cevap_turu?: string | null
          cevap_verme_zamani?: string | null
          created_at?: string | null
          dogru_cevap?: Json | null
          dogruluk_skoru?: number | null
          hiz_skoru?: number | null
          id?: string
          kullanici_cevabi?: Json | null
          kullanici_id: string
          oturum_id: string
          soru_baslangic_zamani?: string | null
          soru_gosterim_suresi_ms?: number | null
          soru_icerik?: Json | null
          soru_indeksi: number
          soru_kategorisi?: string | null
          soru_tipi?: string | null
          tepki_suresi_ms?: number | null
          test_sonuc_id: string
          test_turu: string
          zorluk_seviyesi?: string | null
        }
        Update: {
          analiz_verileri?: Json | null
          bolum_adi?: string | null
          cevap_dogru?: boolean | null
          cevap_turu?: string | null
          cevap_verme_zamani?: string | null
          created_at?: string | null
          dogru_cevap?: Json | null
          dogruluk_skoru?: number | null
          hiz_skoru?: number | null
          id?: string
          kullanici_cevabi?: Json | null
          kullanici_id?: string
          oturum_id?: string
          soru_baslangic_zamani?: string | null
          soru_gosterim_suresi_ms?: number | null
          soru_icerik?: Json | null
          soru_indeksi?: number
          soru_kategorisi?: string | null
          soru_tipi?: string | null
          tepki_suresi_ms?: number | null
          test_sonuc_id?: string
          test_turu?: string
          zorluk_seviyesi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soru_cevaplari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soru_cevaplari_oturum_id_fkey"
            columns: ["oturum_id"]
            isOneToOne: false
            referencedRelation: "test_oturumlari"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soru_cevaplari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      stroop_testi_detaylari: {
        Row: {
          adaptasyon_hizi_skoru: number | null
          bilissel_esneklik_skoru: number | null
          blok_bazli_performans: Json | null
          created_at: string | null
          dikkat_kontrolu_skoru: number | null
          id: string
          inkongruent_dogruluk_orani: number | null
          inkongruent_ortalama_tepki_suresi: number | null
          inkongruent_skor: number | null
          kondisyon_bazli_analiz: Json | null
          kongruent_dogruluk_orani: number | null
          kongruent_ortalama_tepki_suresi: number | null
          kongruent_skor: number | null
          kullanici_id: string
          mudahale_direnci_skoru: number | null
          ogrenme_etkisi_skoru: number | null
          performans_tutarliligi: number | null
          pratik_etkisi_skoru: number | null
          stroop_etkisi_skoru: number | null
          stroop_etkisi_suresi: number | null
          tepki_suresi_tutarliligi: number | null
          test_sonuc_id: string
          updated_at: string | null
        }
        Insert: {
          adaptasyon_hizi_skoru?: number | null
          bilissel_esneklik_skoru?: number | null
          blok_bazli_performans?: Json | null
          created_at?: string | null
          dikkat_kontrolu_skoru?: number | null
          id?: string
          inkongruent_dogruluk_orani?: number | null
          inkongruent_ortalama_tepki_suresi?: number | null
          inkongruent_skor?: number | null
          kondisyon_bazli_analiz?: Json | null
          kongruent_dogruluk_orani?: number | null
          kongruent_ortalama_tepki_suresi?: number | null
          kongruent_skor?: number | null
          kullanici_id: string
          mudahale_direnci_skoru?: number | null
          ogrenme_etkisi_skoru?: number | null
          performans_tutarliligi?: number | null
          pratik_etkisi_skoru?: number | null
          stroop_etkisi_skoru?: number | null
          stroop_etkisi_suresi?: number | null
          tepki_suresi_tutarliligi?: number | null
          test_sonuc_id: string
          updated_at?: string | null
        }
        Update: {
          adaptasyon_hizi_skoru?: number | null
          bilissel_esneklik_skoru?: number | null
          blok_bazli_performans?: Json | null
          created_at?: string | null
          dikkat_kontrolu_skoru?: number | null
          id?: string
          inkongruent_dogruluk_orani?: number | null
          inkongruent_ortalama_tepki_suresi?: number | null
          inkongruent_skor?: number | null
          kondisyon_bazli_analiz?: Json | null
          kongruent_dogruluk_orani?: number | null
          kongruent_ortalama_tepki_suresi?: number | null
          kongruent_skor?: number | null
          kullanici_id?: string
          mudahale_direnci_skoru?: number | null
          ogrenme_etkisi_skoru?: number | null
          performans_tutarliligi?: number | null
          pratik_etkisi_skoru?: number | null
          stroop_etkisi_skoru?: number | null
          stroop_etkisi_suresi?: number | null
          tepki_suresi_tutarliligi?: number | null
          test_sonuc_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stroop_testi_detaylari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stroop_testi_detaylari_test_sonuc_id_fkey"
            columns: ["test_sonuc_id"]
            isOneToOne: false
            referencedRelation: "test_sonuclari"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          created_at: string
          grade_level: number | null
          id: string
          notes: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_name: string | null
          student_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          grade_level?: number | null
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_name?: string | null
          student_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          grade_level?: number | null
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_name?: string | null
          student_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_oturumlari: {
        Row: {
          baslangic_tarihi: string | null
          bitis_tarihi: string | null
          cihaz_bilgisi: string | null
          created_at: string | null
          durum: string | null
          genel_skor: number | null
          id: string
          ip_adresi: unknown | null
          kullanici_id: string
          mevcut_test_indeksi: number | null
          oturum_uuid: string
          performans_seviyesi: string | null
          tarayici_bilgisi: string | null
          toplam_sure_saniye: number | null
          updated_at: string | null
        }
        Insert: {
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          cihaz_bilgisi?: string | null
          created_at?: string | null
          durum?: string | null
          genel_skor?: number | null
          id?: string
          ip_adresi?: unknown | null
          kullanici_id: string
          mevcut_test_indeksi?: number | null
          oturum_uuid: string
          performans_seviyesi?: string | null
          tarayici_bilgisi?: string | null
          toplam_sure_saniye?: number | null
          updated_at?: string | null
        }
        Update: {
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          cihaz_bilgisi?: string | null
          created_at?: string | null
          durum?: string | null
          genel_skor?: number | null
          id?: string
          ip_adresi?: unknown | null
          kullanici_id?: string
          mevcut_test_indeksi?: number | null
          oturum_uuid?: string
          performans_seviyesi?: string | null
          tarayici_bilgisi?: string | null
          toplam_sure_saniye?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_oturumlari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sonuclari: {
        Row: {
          atlanan_soru_sayisi: number | null
          baslangic_tarihi: string | null
          bitis_tarihi: string | null
          cevaplanan_soru_sayisi: number | null
          created_at: string | null
          dogru_cevap_sayisi: number | null
          dogruluk_skoru: number | null
          durum: string | null
          en_hizli_tepki_ms: number | null
          en_yavas_tepki_ms: number | null
          genel_test_skoru: number | null
          ham_veri: Json | null
          hiz_skoru: number | null
          id: string
          kullanici_id: string
          ortalama_tepki_suresi_ms: number | null
          oturum_id: string
          performans_analizi: Json | null
          tamamlanma_yuzdesi: number | null
          test_suresi_saniye: number | null
          test_turu: string
          toplam_soru_sayisi: number | null
          updated_at: string | null
          yanlis_cevap_sayisi: number | null
        }
        Insert: {
          atlanan_soru_sayisi?: number | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          cevaplanan_soru_sayisi?: number | null
          created_at?: string | null
          dogru_cevap_sayisi?: number | null
          dogruluk_skoru?: number | null
          durum?: string | null
          en_hizli_tepki_ms?: number | null
          en_yavas_tepki_ms?: number | null
          genel_test_skoru?: number | null
          ham_veri?: Json | null
          hiz_skoru?: number | null
          id?: string
          kullanici_id: string
          ortalama_tepki_suresi_ms?: number | null
          oturum_id: string
          performans_analizi?: Json | null
          tamamlanma_yuzdesi?: number | null
          test_suresi_saniye?: number | null
          test_turu: string
          toplam_soru_sayisi?: number | null
          updated_at?: string | null
          yanlis_cevap_sayisi?: number | null
        }
        Update: {
          atlanan_soru_sayisi?: number | null
          baslangic_tarihi?: string | null
          bitis_tarihi?: string | null
          cevaplanan_soru_sayisi?: number | null
          created_at?: string | null
          dogru_cevap_sayisi?: number | null
          dogruluk_skoru?: number | null
          durum?: string | null
          en_hizli_tepki_ms?: number | null
          en_yavas_tepki_ms?: number | null
          genel_test_skoru?: number | null
          ham_veri?: Json | null
          hiz_skoru?: number | null
          id?: string
          kullanici_id?: string
          ortalama_tepki_suresi_ms?: number | null
          oturum_id?: string
          performans_analizi?: Json | null
          tamamlanma_yuzdesi?: number | null
          test_suresi_saniye?: number | null
          test_turu?: string
          toplam_soru_sayisi?: number | null
          updated_at?: string | null
          yanlis_cevap_sayisi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_sonuclari_kullanici_id_fkey"
            columns: ["kullanici_id"]
            isOneToOne: false
            referencedRelation: "kullanicilar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sonuclari_oturum_id_fkey"
            columns: ["oturum_id"]
            isOneToOne: false
            referencedRelation: "test_oturumlari"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "trainer" | "representative" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["admin", "trainer", "representative", "user"],
    },
  },
} as const
