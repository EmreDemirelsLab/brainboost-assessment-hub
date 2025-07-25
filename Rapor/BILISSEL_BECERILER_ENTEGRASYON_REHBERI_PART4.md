# 📊 BİLİŞSEL BECERİLER TESTİ VERİTABANI ENTEGRASYONU - PART 4

## 🔧 SERVİS KATMANI (src/services/)

### 1. testService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import { TestOturumu, TestSonuc, SoruCevap, TestTuru } from '@/types/database';

export class TestService {
  // Test oturumu başlat
  async createTestSession(kullaniciId: string): Promise<{ data: TestOturumu | null; error: any }> {
    const { data, error } = await supabase
      .from('test_oturumlari')
      .insert({
        kullanici_id: kullaniciId,
        oturum_uuid: crypto.randomUUID(),
        durum: 'baslatildi',
        tarayici_bilgisi: navigator.userAgent,
        cihaz_bilgisi: this.getDeviceInfo(),
        ip_adresi: await this.getClientIP()
      })
      .select()
      .single();
    
    return { data, error };
  }

  // Test sonucu kaydet
  async saveTestResult(testData: Partial<TestSonuc>): Promise<{ data: TestSonuc | null; error: any }> {
    const { data, error } = await supabase
      .from('test_sonuclari')
      .insert(testData)
      .select()
      .single();
    
    return { data, error };
  }

  // Soru cevaplarını toplu kaydet
  async saveQuestionResponses(responses: Partial<SoruCevap>[]): Promise<{ data: SoruCevap[] | null; error: any }> {
    const { data, error } = await supabase
      .from('soru_cevaplari')
      .insert(responses)
      .select();
    
    return { data, error };
  }

  // Test detaylarını kaydet (test tipine göre)
  async saveTestDetails(testTuru: TestTuru, testSonucId: string, detaylar: any): Promise<{ data: any; error: any }> {
    const tableName = this.getDetailTableName(testTuru);
    
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        test_sonuc_id: testSonucId,
        ...detaylar
      })
      .select()
      .single();
    
    return { data, error };
  }

  // Test oturumunu güncelle
  async updateTestSession(oturumId: string, updates: Partial<TestOturumu>): Promise<{ data: TestOturumu | null; error: any }> {
    const { data, error } = await supabase
      .from('test_oturumlari')
      .update(updates)
      .eq('id', oturumId)
      .select()
      .single();
    
    return { data, error };
  }

  // Kullanıcının test geçmişini getir
  async getUserTestHistory(kullaniciId: string): Promise<{ data: TestOturumu[] | null; error: any }> {
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

  // Yardımcı fonksiyonlar
  private getDetailTableName(testTuru: TestTuru): string {
    const tableMap = {
      'dikkat': 'dikkat_testi_detaylari',
      'akil_mantik': 'akil_mantik_testi_detaylari',
      'hafiza': 'hafiza_testi_detaylari',
      'puzzle': 'puzzle_testi_detaylari',
      'stroop': 'stroop_testi_detaylari'
    };
    return tableMap[testTuru];
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
```

### 2. scoreService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import { BilisselBeceriSkorlari, TestSonuc } from '@/types/database';

export class ScoreService {
  // 6 ana bilişsel beceri skorunu hesapla
  async calculateCognitiveScores(oturumId: string): Promise<{ data: BilisselBeceriSkorlari | null; error: any }> {
    // Oturumdaki tüm test sonuçlarını getir
    const { data: testSonuclari, error: testError } = await supabase
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
    const { data, error } = await supabase
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
  private computeScores(testSonuclari: any[]): Partial<BilisselBeceriSkorlari> {
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

  private determinePerformanceLevel(genelEndeks: number): 'dusuk' | 'orta_alti' | 'orta' | 'orta_ustu' | 'yuksek' {
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
```

## 🔄 HTML TEST DOSYALARININ GÜNCELLENMESİ

### Mevcut Test Dosyalarında Yapılacak Değişiklikler

#### 1. Dikkat Testi (dikkat.html) - Sadece saveTestResults fonksiyonu değiştirilecek

```javascript
// ÖNCE (mevcut kod - yaklaşık satır 2000+)
function saveTestResults(results) {
    // Mevcut kaydetme kodu...
    fetch('/api/dikkat-test-sonuclari', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

// SONRA (güncellenmiş kod)
async function saveTestResults(results) {
    try {
        // Mevcut tüm hesaplamalar aynı kalır
        const detailedResults = {
            // ... mevcut result hesaplamaları ...
        };

        // Supabase formatına dönüştür
        const testSonucData = {
            oturum_id: window.currentSession?.id,
            kullanici_id: window.currentUser?.id,
            test_turu: 'dikkat',
            durum: 'tamamlandi',
            tamamlanma_yuzdesi: 100,
            bitis_tarihi: new Date().toISOString(),
            test_suresi_saniye: Math.round(testState.totalTime / 1000),
            toplam_soru_sayisi: 50,
            cevaplanan_soru_sayisi: testState.mainAnswers.length,
            dogru_cevap_sayisi: testState.mainAnswers.filter(a => a.isCorrect).length,
            yanlis_cevap_sayisi: testState.mainAnswers.filter(a => !a.isCorrect).length,
            dogruluk_skoru: Math.round(accuracyScore),
            hiz_skoru: Math.round(speedScore),
            genel_test_skoru: Math.round((accuracyScore + speedScore) / 2),
            ortalama_tepki_suresi_ms: Math.round(basicStats.averageReactionTime),
            ham_veri: detailedResults, // Orijinal veri korunur
            performans_analizi: {
                sections: sectionStats,
                questionTypes: typeStats,
                errorDetails: testState.wrongSelections
            }
        };

        // Test sonucunu kaydet
        const testService = new TestService();
        const { data: testSonuc, error: testError } = await testService.saveTestResult(testSonucData);
        
        if (testError) throw testError;

        // Dikkat testi detaylarını kaydet
        const dikkatDetaylari = {
            bolum1_dogru: sectionStats.section1.correctAnswers,
            bolum1_yanlis: sectionStats.section1.wrongAnswers,
            bolum1_sure_ms: sectionStats.section1.duration,
            bolum1_dogruluk: sectionStats.section1.accuracy,
            // ... diğer bölümler
            sayi_sorulari_dogru: typeStats.numberQuestions.correct,
            sayi_sorulari_yanlis: typeStats.numberQuestions.wrong,
            // ... diğer soru türleri
            ornek_test_skoru: testState.practiceScore,
            ornek_test_denemeleri: testState.practiceAttempts
        };

        await testService.saveTestDetails('dikkat', testSonuc.id, dikkatDetaylari);

        // Soru cevaplarını kaydet
        const soruCevaplari = testState.mainAnswers.map(answer => ({
            test_sonuc_id: testSonuc.id,
            oturum_id: window.currentSession?.id,
            kullanici_id: window.currentUser?.id,
            soru_numarasi: answer.questionNo,
            soru_turu: answer.questionType,
            bolum_adi: answer.sectionName,
            bolum_numarasi: answer.section,
            kullanici_cevabi: answer.selectedAnswer?.toString(),
            dogru_cevap: answer.correctAnswer?.toString(),
            dogru_mu: answer.isCorrect,
            tepki_suresi_ms: Math.round(answer.reactionTime * 1000),
            ek_veriler: {
                timestamp: answer.timestamp,
                reactionTimeCategory: answer.reactionTime < 1 ? 'fast' : 'normal'
            }
        }));

        await testService.saveQuestionResponses(soruCevaplari);

        console.log('✅ Dikkat testi verileri başarıyla kaydedildi');
        
    } catch (error) {
        console.error('❌ Dikkat testi kayıt hatası:', error);
        // Hata durumunda da test devam etsin
    }
}
```

#### 2. Akıl-Mantık Testi (akil-mantik.html) - Benzer güncelleme

```javascript
// saveTestResults fonksiyonu güncellenmesi (yaklaşık satır 1630+)
async function saveTestResults(results) {
    try {
        const testSonucData = {
            oturum_id: window.currentSession?.id,
            kullanici_id: window.currentUser?.id,
            test_turu: 'akil_mantik',
            durum: 'tamamlandi',
            // ... diğer standart alanlar
            ham_veri: results, // Orijinal veri korunur
        };

        const testService = new TestService();
        const { data: testSonuc } = await testService.saveTestResult(testSonucData);

        // Akıl-mantık detaylarını kaydet
        const akilMantikDetaylari = {
            dortlu_yatay_skoru: results.sectionResults[1].correct,
            dortlu_kare_skoru: results.sectionResults[2].correct,
            altili_kare_skoru: results.sectionResults[3].correct,
            l_format_skoru: results.sectionResults[4].correct,
            dokuzlu_format_skoru: results.sectionResults[5].correct,
            durtuselluk_skoru: results.impulsivityAnalysis.impulsivity_score,
            hizli_yanlis_cevaplar: results.impulsivityAnalysis.fast_wrong_answers,
            cok_hizli_yanlis_cevaplar: results.impulsivityAnalysis.very_fast_wrong_answers,
            durtuselluk_uyarisi: results.impulsivityAnalysis.warning_triggered,
            ornek_denemeleri: results.exampleAttempts,
            ornek_dogru_sayisi: results.exampleCorrectCount,
            son_soru_numarasi: results.lastQuestionReached
        };

        await testService.saveTestDetails('akil_mantik', testSonuc.id, akilMantikDetaylari);

        console.log('✅ Akıl-Mantık testi verileri başarıyla kaydedildi');
        
    } catch (error) {
        console.error('❌ Akıl-Mantık testi kayıt hatası:', error);
    }
}
```

### Global Test Yönetimi için Eklenmesi Gerekenler

#### Test HTML dosyalarının başına eklenecek script:

```html
<!-- Her test HTML dosyasının <head> bölümüne eklenecek -->
<script>
// Global test yönetimi
window.currentUser = null;
window.currentSession = null;
window.testService = null;

// Sayfa yüklendiğinde kullanıcı ve oturum bilgilerini al
window.addEventListener('load', async function() {
    try {
        // Parent window'dan kullanıcı bilgilerini al
        if (window.opener && window.opener.getCurrentUser) {
            window.currentUser = window.opener.getCurrentUser();
            window.currentSession = window.opener.getCurrentSession();
        }
        
        // Test service'i başlat
        if (window.TestService) {
            window.testService = new TestService();
        }
        
        console.log('Test ortamı hazır:', {
            user: window.currentUser?.id,
            session: window.currentSession?.id
        });
        
    } catch (error) {
        console.warn('Test ortamı başlatma uyarısı:', error);
    }
});
</script>
``` 