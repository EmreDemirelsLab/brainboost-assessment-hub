import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useTestSession } from '@/hooks/useTestSession';
import { testService } from '@/services/testService';

// Test sırası ve yönlendirme fonksiyonları
const getNextTest = (currentTest: string) => {
  const testSequence = [
    { name: 'Dikkat Testi', url: '/cognitive-tests/dikkat/dikkat.html' },
    { name: 'Hafıza Testi', url: '/cognitive-tests/hafiza/hafiza.html' },
    { name: 'Akıl-Mantık Testi', url: '/cognitive-tests/akil-mantik/akil-mantik.html' },
    { name: 'Puzzle Testi', url: '/cognitive-tests/puzzle/puzzle.html' },
    { name: 'Stroop Testi', url: '/cognitive-tests/stroop/stroop.html' }
  ];
  
  const currentIndex = testSequence.findIndex(test => 
    test.url.includes(currentTest) || test.name.toLowerCase().includes(currentTest)
  );
  
  return currentIndex >= 0 && currentIndex < testSequence.length - 1 
    ? testSequence[currentIndex + 1] 
    : null;
};

const startNextTest = (testUrl: string) => {
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;
  
  window.open(testUrl, '_blank', 
    `width=${screenWidth},height=${screenHeight},left=0,top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,fullscreen=yes`);
};

export function CognitiveAssessmentTest() {
  const { user } = useAuth();
  const { session, startSession } = useTestSession(user?.id || '');
  // testService artık import edilen instance

  // Global fonksiyonları window'a ekle ve test mesajlarını dinle
  useEffect(() => {
    (window as any).getCurrentUser = () => user;
    (window as any).getCurrentSession = () => session;
    (window as any).saveTestResult = async (testType: string, data: any) => {
      console.log('💾 Test sonucu kaydediliyor:', { testType, data });
      console.log('📊 Test sonucu detayları:', JSON.stringify(data, null, 2));
      const result = await testService.saveTestResult(data);
      console.log('✅ Test sonucu kaydedildi:', result);
      if (result.error) {
        console.error('❌ Test sonucu kaydetme hatası:', result.error);
      }
      return result;
    };
    (window as any).saveTestDetails = async (testType: string, testResultId: string, details: any) => {
      console.log('📊 Test detayları kaydediliyor:', { testType, testResultId, details });
      console.log('📋 Test detayları JSON:', JSON.stringify(details, null, 2));
      const result = await testService.saveTestDetails(testType as any, testResultId, details);
      console.log('✅ Test detayları kaydedildi:', result);
      if (result.error) {
        console.error('❌ Test detayları kaydetme hatası:', result.error);
      }
      return result;
    };
    (window as any).saveQuestionResponses = async (responses: any[]) => {
      console.log('❓ Soru cevapları kaydediliyor:', responses);
      const result = await testService.saveQuestionResponses(responses);
      console.log('✅ Soru cevapları kaydedildi:', result);
      return result;
    };

    // Test pencerelerinden gelen mesajları dinle
    const handleTestMessage = (event: MessageEvent) => {
      console.log('📨 Test mesajı alındı:', event.data);
      
      if (event.data?.type === 'test-complete') {
        const { testName, results } = event.data;
        console.log(`🎉 ${testName} testi tamamlandı:`, results);
        
        // Test penceresi kapat
        if (event.source && (event.source as Window).close) {
          (event.source as Window).close();
        }
        
        // Başarı mesajı göster ve sonraki teste geçiş seçeneği sun
        const nextTest = getNextTest(testName);
        if (nextTest) {
          const userChoice = confirm(`${testName} testi başarıyla tamamlandı! Sonuçlar kaydedildi.\n\nSonraki test: ${nextTest.name}\nDevam etmek istiyor musunuz?`);
          if (userChoice) {
            startNextTest(nextTest.url);
          }
        } else {
          alert(`${testName} testi başarıyla tamamlandı! Tüm testler tamamlandı.`);
        }
      }
    };

    window.addEventListener('message', handleTestMessage);
    
    return () => {
      window.removeEventListener('message', handleTestMessage);
    };
  }, [user, session]);

  const handleStartTest = async () => {
    console.log('🚀 Test başlatma işlemi başladı');
    console.log('👤 User:', user);
    console.log('🎯 Session:', session);
    
    // User kontrolü
    if (!user) {
      console.error('❌ User bulunamadı');
      alert('Giriş yapmanız gerekiyor!');
      return;
    }

    console.log('🔍 User ID:', user.id);
    console.log('🔍 startSession fonksiyonu:', typeof startSession);

    // Önce test oturumu başlat
    if (!session) {
      console.log('🔄 Session başlatılıyor...');
      try {
        const result = await startSession();
        console.log('📊 Session result:', result);
        
        if (!result?.data || result?.error) {
          console.error('❌ Session başlatılamadı:', result?.error);
          alert(`Test oturumu başlatılamadı: ${result?.error?.message || 'Bilinmeyen hata'}`);
          return;
        }
        console.log('✅ Session başarıyla başlatıldı:', result.data);
      } catch (error) {
        console.error('❌ Session başlatma hatası:', error);
        alert(`Test oturumu başlatma hatası: ${error}`);
        return;
      }
    }

    // Test penceresi açma işlemi - tam ekran
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    
    const testWindow = window.open('/cognitive-tests/dikkat/dikkat.html', '_blank', 
      `width=${screenWidth},height=${screenHeight},left=0,top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,fullscreen=yes`);

    if (!testWindow) {
      alert('Test penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.');
    } else {
      // Test penceresi yüklendikten sonra başlığı değiştir ve tam ekran moduna geç
      testWindow.addEventListener('load', () => {
        try {
          // Pencere başlığını değiştir
          testWindow.document.title = 'Fortest Bilişsel Beceriler Testi';

          // Tam ekran moduna geçmeye çalış
          if (testWindow.document.documentElement && testWindow.document.documentElement.requestFullscreen) {
            testWindow.document.documentElement.requestFullscreen().catch(err => {
              console.log('Tam ekran modu başlatılamadı:', err);
            });
          }
        } catch (error) {
          console.log('Pencere ayarları uygulanamadı:', error);
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 p-6">
      {/* Logo */}
      <div className="text-center">
        <img 
          src="/assets/images/forbrain logo.png" 
          alt="ForBrain Logo" 
          className="h-20 mx-auto mb-6"
        />
        
        {/* Başlık */}
        <h1 className="text-4xl font-bold text-slate-800 mb-6">
          Fortest Bilişsel Beceriler Testi
        </h1>
        
        {/* Açıklama */}
        <p className="text-lg text-slate-600 max-w-2xl mb-6">
          Bu test bilişsel becerilerinizi değerlendirmek için tasarlanmıştır. Toplam 5 alt testten oluşmaktadır.
        </p>
        
        {/* Uyarı */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-2xl">
          <p className="text-sm text-amber-800">
            <strong>Önemli:</strong> Test ayrı bir pencerede açılacaktır. Pop-up engelleyici ayarlarınızın kapalı olduğundan emin olun.
          </p>
        </div>
      </div>
      
      {/* Testi Başlat Butonu */}
      <Button 
        onClick={handleStartTest}
        size="lg"
        className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
        disabled={!user}
      >
        {!user ? 'Giriş Yapın' : 'Testi Başlat'}
      </Button>
      
      {!user && (
        <p className="text-sm text-red-600 mt-2">
          Testi başlatmak için giriş yapmanız gerekiyor.
        </p>
      )}
    </div>
  );
}