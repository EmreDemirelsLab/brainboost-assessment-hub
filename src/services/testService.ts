import { supabase } from '../integrations/supabase/client';
import { ScoreService } from './scoreService';

class TestService {
  private scoreService = new ScoreService();

  async createTestSession(kullaniciId: string): Promise<any> {
    console.log('🔍 createTestSession çağrıldı:', kullaniciId);
    
    try {
      // Kullanıcının users tablosunda olup olmadığını kontrol et
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', kullaniciId)
        .single();

      console.log('👤 Kullanıcı kontrolü:', { existingUser, userCheckError });

      if (userCheckError || !existingUser) {
        console.log('❌ Kullanıcı users tablosunda bulunamadı:', kullaniciId);
        return { 
          data: null, 
          error: { 
            message: 'Kullanıcı bulunamadı. Lütfen giriş yapın.',
            code: 'USER_NOT_FOUND'
          } 
        };
      }

      // Aktif oturum kontrol et
      console.log('🔎 Aktif oturum kontrol ediliyor...');
      const { data: existingSessions, error: checkError } = await supabase
        .from('test_oturumlari')
        .select('*')
        .eq('kullanici_id', kullaniciId)
        .in('durum', ['baslatildi', 'devam_ediyor'])
        .order('created_at', { ascending: false });

      console.log('📋 Aktif oturum kontrolü:', { existingSessions, checkError });

      // Eski oturumları temizle
      if (existingSessions && existingSessions.length > 0) {
        console.log('🧹 Eski oturumlar temizleniyor...');
        const { error: cleanupError } = await supabase
          .from('test_oturumlari')
          .update({ durum: 'terk_edildi' })
          .eq('kullanici_id', kullaniciId)
          .in('durum', ['baslatildi', 'devam_ediyor']);
        
        console.log('🧹 Cleanup sonucu:', { cleanupError });
      }

      // Yeni oturum oluştur
      const uniqueUUID = crypto.randomUUID();
      console.log('🆕 Yeni oturum oluşturuluyor...', { kullaniciId, uniqueUUID });

      const { data, error } = await supabase
        .from('test_oturumlari')
        .insert({
          kullanici_id: kullaniciId,
          oturum_uuid: uniqueUUID,
          durum: 'baslatildi',
          baslangic_tarihi: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      console.log('📊 Yeni oturum sonucu:', { data, error });
      return { data, error };

    } catch (error) {
      console.error('❌ createTestSession hata:', error);
      return { data: null, error };
    }
  }

  // Test sonucu kaydet (upsert - insert or update)
  async saveTestResult(testData: any): Promise<{ data: any | null; error: any }> {
    try {
      // Önce aynı oturum + test türü kombinasyonu var mı kontrol et
      const { data: existingResult, error: checkError } = await supabase
        .from('test_sonuclari')
        .select('*')
        .eq('oturum_id', testData.oturum_id)
        .eq('test_turu', testData.test_turu)
        .maybeSingle();

      if (existingResult && !checkError) {
        // Mevcut kayıt varsa, güncelle
        console.log('🔄 Mevcut test sonucu güncelleniyor:', existingResult.id);
        const { data, error } = await supabase
          .from('test_sonuclari')
          .update(testData)
          .eq('id', existingResult.id)
          .select()
          .single();
        
        return { data, error };
      } else {
        // Mevcut kayıt yoksa, yeni kayıt ekle
        console.log('🆕 Yeni test sonucu ekleniyor');
        const { data, error } = await supabase
          .from('test_sonuclari')
          .insert(testData)
          .select()
          .single();
        
        return { data, error };
      }
    } catch (error) {
      console.error('❌ saveTestResult hatası:', error);
      return { data: null, error };
    }
  }

  // Soru cevaplarını toplu kaydet (upsert - insert or update)
  async saveQuestionResponses(responses: any[]): Promise<{ data: any[] | null; error: any }> {
    try {
      if (!responses || responses.length === 0) {
        return { data: [], error: null };
      }

      // Önce mevcut cevapları temizle (aynı test_sonuc_id için)
      const testSonucId = responses[0]?.test_sonuc_id;
      if (testSonucId) {
        console.log('🧹 Mevcut soru cevapları temizleniyor:', testSonucId);
        await supabase
          .from('soru_cevaplari')
          .delete()
          .eq('test_sonuc_id', testSonucId);
      }

      // Yeni cevapları ekle
      console.log('🆕 Yeni soru cevapları ekleniyor:', responses.length);
      const { data, error } = await supabase
        .from('soru_cevaplari')
        .insert(responses)
        .select();
      
      return { data, error };
    } catch (error) {
      console.error('❌ saveQuestionResponses hatası:', error);
      return { data: null, error };
    }
  }

  // Test detaylarını kaydet (upsert - insert or update)
  async saveTestDetails(testTuru: string, testSonucId: string, detaylar: any): Promise<{ data: any; error: any }> {
    try {
      const tableName = this.getDetailTableName(testTuru);
      
      // Tablo ismi geçerli değilse hata döndür
      if (!this.isValidTableName(tableName)) {
        return { data: null, error: { message: 'Geçersiz test türü' } };
      }
      
      // Önce aynı test_sonuc_id ile kayıt var mı kontrol et - any kullanarak type safety'yi bypass et
      const checkQuery = (supabase as any).from(tableName);
      const { data: existingDetail, error: checkError } = await checkQuery
        .select('*')
        .eq('test_sonuc_id', testSonucId)
        .maybeSingle();

      const detailData = {
        test_sonuc_id: testSonucId,
        kullanici_id: detaylar.kullanici_id,
        ...detaylar
      };

      if (existingDetail && !checkError) {
        // Mevcut kayıt varsa, güncelle
        console.log('🔄 Mevcut test detayı güncelleniyor:', existingDetail.id);
        const updateQuery = (supabase as any).from(tableName);
        const { data, error } = await updateQuery
          .update(detailData)
          .eq('id', existingDetail.id)
          .select()
          .single();
        
        return { data, error };
      } else {
        // Mevcut kayıt yoksa, yeni kayıt ekle
        console.log('🆕 Yeni test detayı ekleniyor');
        const insertQuery = (supabase as any).from(tableName);
        const { data, error } = await insertQuery
          .insert(detailData)
          .select()
          .single();
        
        return { data, error };
      }
    } catch (error) {
      console.error('❌ saveTestDetails hatası:', error);
      return { data: null, error };
    }
  }

  // Test oturumunu güncelle
  async updateTestSession(oturumId: string, updates: any): Promise<{ data: any | null; error: any }> {
    const { data, error } = await supabase
      .from('test_oturumlari')
      .update(updates)
      .eq('id', oturumId)
      .select()
      .single();
    
    return { data, error };
  }

  // Kullanıcının test geçmişini getir
  async getUserTestHistory(kullaniciId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('test_oturumlari')
      .select(`
        *,
        test_sonuclari(*),
        bilissel_beceri_skorlari(*)
      `)
      .eq('kullanici_id', kullaniciId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  // Test oturumu durumunu getir
  async getTestSession(oturumId: string): Promise<{ data: any | null; error: any }> {
    const { data, error } = await supabase
      .from('test_oturumlari')
      .select('*')
      .eq('id', oturumId)
      .single();
    
    return { data, error };
  }

  // Burdon test fonksiyonları kaldırıldı - artık desteklenmiyor

  // Test oturumunu tamamla ve skorları hesapla
  async completeTestSession(oturumId: string): Promise<{ data: any | null; error: any }> {
    try {
      // Test oturumunu tamamla
      const { error: updateError } = await supabase
        .from('test_oturumlari')
        .update({ 
          durum: 'tamamlandi',
          bitis_tarihi: new Date().toISOString()
        })
        .eq('id', oturumId);

      if (updateError) throw updateError;

      // Bilişsel skorları hesapla
      const scoreResult = await this.scoreService.calculateCognitiveScores(oturumId);
      
      return { data: scoreResult.data, error: scoreResult.error };
    } catch (error) {
      console.error('❌ completeTestSession hatası:', error);
      return { data: null, error };
    }
  }

  // Yardımcı fonksiyonlar
  private getDetailTableName(testTuru: string): string {
    const tableMap: Record<string, string> = {
      'dikkat': 'dikkat_testi_detaylari',
      'akil_mantik': 'akil_mantik_testi_detaylari',
      'hafiza': 'hafiza_testi_detaylari',
      'puzzle': 'puzzle_testi_detaylari',
      'stroop': 'stroop_testi_detaylari'
    };
    return tableMap[testTuru] || 'dikkat_testi_detaylari';
  }

  private isValidTableName(tableName: string): boolean {
    const validTables = [
      'dikkat_testi_detaylari',
      'akil_mantik_testi_detaylari',
      'hafiza_testi_detaylari',
      'puzzle_testi_detaylari',
      'stroop_testi_detaylari'
    ];
    return validTables.includes(tableName);
  }

  private getDeviceInfo(): string {
    return JSON.stringify({
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    });
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const testService = new TestService();