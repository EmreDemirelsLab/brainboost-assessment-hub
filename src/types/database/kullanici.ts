export interface Kullanici {
  id: string;
  kullanici_kodu?: string;
  eposta: string;
  ad_soyad?: string;
  created_at: string;
  updated_at: string;
}

export interface KullaniciProfili {
  id: string;
  kullanici_id: string;
  yas?: number;
  cinsiyet?: 'erkek' | 'kadin' | 'diger';
  egitim_seviyesi?: string;
  meslek?: string;
  ek_bilgiler?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KullaniciWithProfile extends Kullanici {
  kullanici_profilleri?: KullaniciProfili;
} 