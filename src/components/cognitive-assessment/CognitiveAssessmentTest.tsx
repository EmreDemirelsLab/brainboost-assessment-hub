import React from 'react';
import { Button } from "@/components/ui/button";

export function CognitiveAssessmentTest() {
  const handleStartTest = () => {
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
          testWindow.document.title = 'ForBrain Bilişsel Beceriler Testi';
          
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
          Bilişsel Beceriler Testi
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
      >
        Testi Başlat
      </Button>
    </div>
  );
}