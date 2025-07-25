import { supabase } from '@/integrations/supabase/client';

export class ScoreService {
  // 6 ana bilişsel beceri skorunu hesapla
  async calculateCognitiveScores(oturumId: string): Promise<{ data: any | null; error: any }> {
    // Oturumdaki tüm test sonuçlarını getir
    const { data: testSonuclari, error: testError } = await (supabase as any)
      .from('test_sonuclari')
      .select(`
        *,
        dikkat_testi_detaylari(*),
        akil_mantik_testi_detaylari(*),
        hafiza_testi_detaylari(*),
        puzzle_testi_detaylari(*),
        stroop_testi_detaylari(*)
      `)
      .eq('oturum_id', oturumId);

    if (testError || !testSonuclari) {
      return { data: null, error: testError };
    }

    // Skorları hesapla
    const skorlar = this.computeScores(testSonuclari);

    // Veritabanına kaydet
    const { data, error } = await (supabase as any)
      .from('bilissel_beceri_skorlari')
      .upsert({
        oturum_id: oturumId,
        kullanici_id: testSonuclari[0]?.kullanici_id,
        ...skorlar
      })
      .select()
      .single();

    return { data, error };
  }

  // Skor hesaplama algoritması
  private computeScores(testSonuclari: any[]): any {
    const dikkatTest = testSonuclari.find(t => t.test_turu === 'dikkat');
    const akilMantikTest = testSonuclari.find(t => t.test_turu === 'akil_mantik');
    const hafizaTest = testSonuclari.find(t => t.test_turu === 'hafiza');
    const puzzleTest = testSonuclari.find(t => t.test_turu === 'puzzle');
    const stroopTest = testSonuclari.find(t => t.test_turu === 'stroop');

    // 1. Seçici Dikkat Skoru (Dikkat testinden)
    const seciciDikkatSkoru = this.calculateSelectiveAttention(dikkatTest);

    // 2. Çalışma Hafızası Skoru (Hafıza testinden)
    const calismaHafizasiSkoru = this.calculateWorkingMemory(hafizaTest);

    // 3. Bilişsel Esneklik Skoru (Stroop testinden)
    const bilisselEsneklikSkoru = this.calculateCognitiveFlexibility(stroopTest);

    // 4. İşlem Hızı Skoru (Tüm testlerden ortalama tepki süresi)
    const islemHiziSkoru = this.calculateProcessingSpeed(testSonuclari);

    // 5. Görsel-Uzamsal Skoru (Puzzle testinden)
    const gorselUzamsalSkoru = this.calculateVisuospatial(puzzleTest);

    // 6. Mantıksal Akıl Skoru (Akıl-Mantık testinden)
    const mantikselAkilSkoru = this.calculateLogicalReasoning(akilMantikTest);

    // Genel Bilişsel Endeks (ağırlıklı ortalama)
    const genelBilisselEndeks = this.calculateOverallIndex({
      seciciDikkatSkoru,
      calismaHafizasiSkoru,
      bilisselEsneklikSkoru,
      islemHiziSkoru,
      gorselUzamsalSkoru,
      mantikselAkilSkoru
    });

    // Performans seviyesi belirleme
    const performansSeviyesi = this.determinePerformanceLevel(genelBilisselEndeks);

    // Bilişsel yaş karşılığı hesaplama
    const bilisselYasKarsiligi = this.calculateCognitiveAge(genelBilisselEndeks);

    return {
      secici_dikkat_skoru: seciciDikkatSkoru,
      calisma_hafizasi_skoru: calismaHafizasiSkoru,
      bilissel_esneklik_skoru: bilisselEsneklikSkoru,
      islem_hizi_skoru: islemHiziSkoru,
      gorsel_uzamsal_skoru: gorselUzamsalSkoru,
      mantiksal_akil_skoru: mantikselAkilSkoru,
      genel_bilissel_endeks: genelBilisselEndeks,
      performans_seviyesi: performansSeviyesi,
      bilissel_yas_karsiligi: bilisselYasKarsiligi
    };
  }

  // Alt hesaplama fonksiyonları
  private calculateSelectiveAttention(dikkatTest: any): number {
    if (!dikkatTest) return 0;
    
    // Dikkat testi doğruluk oranı + hız faktörü
    const dogrulukOrani = dikkatTest.dogruluk_skoru;
    const hizFaktoru = Math.min(100, dikkatTest.hiz_skoru);
    
    return Math.round((dogrulukOrani * 0.7) + (hizFaktoru * 0.3));
  }

  private calculateWorkingMemory(hafizaTest: any): number {
    if (!hafizaTest) return 0;
    
    // Hafıza testi skorlarının ağırlıklı ortalaması
    const detaylar = hafizaTest.hafiza_testi_detaylari?.[0];
    if (!detaylar) return hafizaTest.dogruluk_skoru;
    
    const anlikHatirlamaAgirligi = 0.4;
    const geciktirilmisAgirligi = 0.4;
    const tanimaAgirligi = 0.2;
    
    return Math.round(
      (detaylar.anlik_hatirlama_skoru * anlikHatirlamaAgirligi) +
      (detaylar.geciktirilmis_hatirlama_skoru * geciktirilmisAgirligi) +
      (detaylar.tanima_skoru * tanimaAgirligi)
    );
  }

  private calculateCognitiveFlexibility(stroopTest: any): number {
    if (!stroopTest) return 0;
    
    const detaylar = stroopTest.stroop_testi_detaylari?.[0];
    if (!detaylar) return stroopTest.dogruluk_skoru;
    
    // Stroop etkisi ne kadar düşükse o kadar iyi
    const stroopEtkisiNormalize = Math.max(0, 100 - (detaylar.stroop_etkisi_ms / 10));
    const bilisselEsneklik = detaylar.bilissel_esneklik_skoru;
    
    return Math.round((stroopEtkisiNormalize * 0.6) + (bilisselEsneklik * 0.4));
  }

  private calculateProcessingSpeed(testSonuclari: any[]): number {
    const toplamTepkiSuresi = testSonuclari.reduce((sum, test) => 
      sum + (test.ortalama_tepki_suresi_ms || 0), 0);
    const testSayisi = testSonuclari.filter(t => t.ortalama_tepki_suresi_ms > 0).length;
    
    if (testSayisi === 0) return 0;
    
    const ortalamaTepkiSuresi = toplamTepkiSuresi / testSayisi;
    
    // Hız skoru: düşük tepki süresi = yüksek skor
    // 1000ms = 50 puan, 500ms = 100 puan, 2000ms = 0 puan
    return Math.max(0, Math.min(100, Math.round(150 - (ortalamaTepkiSuresi / 10))));
  }

  private calculateVisuospatial(puzzleTest: any): number {
    if (!puzzleTest) return 0;
    
    const detaylar = puzzleTest.puzzle_testi_detaylari?.[0];
    if (!detaylar) return puzzleTest.dogruluk_skoru;
    
    const uzamsalDogruluk = detaylar.uzamsal_dogruluk;
    const oruntuTanima = detaylar.oruntu_tanima_skoru;
    const tamamlamaVerimi = detaylar.tamamlama_verimliligi;
    
    return Math.round((uzamsalDogruluk * 0.4) + (oruntuTanima * 0.4) + (tamamlamaVerimi * 0.2));
  }

  private calculateLogicalReasoning(akilMantikTest: any): number {
    if (!akilMantikTest) return 0;
    
    const detaylar = akilMantikTest.akil_mantik_testi_detaylari?.[0];
    if (!detaylar) return akilMantikTest.dogruluk_skoru;
    
    // Tüm bölüm skorlarının ağırlıklı ortalaması
    const toplamSkor = 
      detaylar.dortlu_yatay_skoru +
      detaylar.dortlu_kare_skoru +
      detaylar.altili_kare_skoru +
      detaylar.l_format_skoru +
      detaylar.dokuzlu_format_skoru;
    
    // Dürtüsellik cezası (dürtüsel davranış skorunu düşürür)
    const durtusellukCezasi = detaylar.durtuselluk_uyarisi ? 10 : 0;
    
    return Math.max(0, Math.round((toplamSkor / 5) - durtusellukCezasi));
  }

  private calculateOverallIndex(skorlar: any): number {
    const agirliklar = {
      seciciDikkatSkoru: 0.20,
      calismaHafizasiSkoru: 0.20,
      bilisselEsneklikSkoru: 0.15,
      islemHiziSkoru: 0.15,
      gorselUzamsalSkoru: 0.15,
      mantikselAkilSkoru: 0.15
    };
    
    return Math.round(
      (skorlar.seciciDikkatSkoru * agirliklar.seciciDikkatSkoru) +
      (skorlar.calismaHafizasiSkoru * agirliklar.calismaHafizasiSkoru) +
      (skorlar.bilisselEsneklikSkoru * agirliklar.bilisselEsneklikSkoru) +
      (skorlar.islemHiziSkoru * agirliklar.islemHiziSkoru) +
      (skorlar.gorselUzamsalSkoru * agirliklar.gorselUzamsalSkoru) +
      (skorlar.mantikselAkilSkoru * agirliklar.mantikselAkilSkoru)
    );
  }

  private determinePerformanceLevel(genelEndeks: number): string {
    if (genelEndeks >= 85) return 'yuksek';
    if (genelEndeks >= 70) return 'orta_ustu';
    if (genelEndeks >= 50) return 'orta';
    if (genelEndeks >= 30) return 'orta_alti';
    return 'dusuk';
  }

  private calculateCognitiveAge(genelEndeks: number): number {
    // Basit bir yaş karşılığı hesaplaması
    // 100 puan = 25 yaş, 50 puan = 50 yaş, 0 puan = 75 yaş
    return Math.round(75 - (genelEndeks * 0.5));
  }
}

export const scoreService = new ScoreService(); 