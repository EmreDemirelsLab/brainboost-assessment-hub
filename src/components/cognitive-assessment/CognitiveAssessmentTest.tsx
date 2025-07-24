import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export function CognitiveAssessmentTest() {
  const [currentTestIndex, setCurrentTestIndex] = useState(-1); // -1 = başlangıç, 0-4 = testler, 5 = bitiş

  const handleStartTest = () => {
    setCurrentTestIndex(0); // Dikkat testini başlat
  };

  const handleTestComplete = () => {
    const nextIndex = currentTestIndex + 1;
    if (nextIndex >= 5) {
      setCurrentTestIndex(5); // Bitiş ekranı
    } else {
      setCurrentTestIndex(nextIndex); // Sonraki test
    }
  };

  // Başlangıç ekranı
  if (currentTestIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
        <h1 className="text-4xl font-bold text-center text-slate-800">
          Bilişsel Beceriler Testi
        </h1>
        <p className="text-lg text-center text-slate-600 max-w-2xl">
          Bu test 5 farklı bilişsel beceriyi değerlendirir: Dikkat, Hafıza, Stroop, Puzzle ve Akıl-Mantık testleri sırasıyla uygulanacaktır.
        </p>
        <Button 
          onClick={handleStartTest}
          size="lg"
          className="text-lg px-8 py-4"
        >
          Bilişsel Beceriler Testi
        </Button>
      </div>
    );
  }

  // Bitiş ekranı
  if (currentTestIndex === 5) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
        <h1 className="text-4xl font-bold text-center text-slate-800">
          Testler Tamamlandı
        </h1>
      </div>
    );
  }

  // Test ekranları
  return <TestIframe testIndex={currentTestIndex} onComplete={handleTestComplete} />;
}

interface TestIframeProps {
  testIndex: number;
  onComplete: () => void;
}

function TestIframe({ testIndex, onComplete }: TestIframeProps) {
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    iframe.style.backgroundColor = 'white';

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'test-complete') {
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
        onComplete();
      }
    };

    window.addEventListener('message', handleMessage);

    // Test HTML içeriklerini yükle
    const testContents = [
      getDikkatHTML(),
      getHafizaHTML(), 
      getStroopHTML(),
      getPuzzleHTML(),
      getAkilMantikHTML()
    ];

    iframe.srcdoc = testContents[testIndex];
    document.body.appendChild(iframe);

    return () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [testIndex, onComplete]);

  return null;
}

// HTML içeriklerini döndüren fonksiyonlar - basitçe placeholder döndür
function getDikkatHTML() {
  return `<!DOCTYPE html>
<html><head><title>Dikkat Testi</title></head>
<body>
  <h1>Dikkat Testi Yükleniyor...</h1>
  <script>
    setTimeout(() => {
      window.parent.postMessage({type: 'test-complete', test: 'dikkat'}, '*');
    }, 3000);
  </script>
</body></html>`;
}

function getHafizaHTML() {
  return `<!DOCTYPE html>
<html><head><title>Hafıza Testi</title></head>
<body>
  <h1>Hafıza Testi Yükleniyor...</h1>
  <script>
    setTimeout(() => {
      window.parent.postMessage({type: 'test-complete', test: 'hafiza'}, '*');
    }, 3000);
  </script>
</body></html>`;
}

function getStroopHTML() {
  return `<!DOCTYPE html>
<html><head><title>Stroop Testi</title></head>
<body>
  <h1>Stroop Testi Yükleniyor...</h1>
  <script>
    setTimeout(() => {
      window.parent.postMessage({type: 'test-complete', test: 'stroop'}, '*');
    }, 3000);
  </script>
</body></html>`;
}

function getPuzzleHTML() {
  return `<!DOCTYPE html>
<html><head><title>Puzzle Testi</title></head>
<body>
  <h1>Puzzle Testi Yükleniyor...</h1>
  <script>
    setTimeout(() => {
      window.parent.postMessage({type: 'test-complete', test: 'puzzle'}, '*');
    }, 3000);
  </script>
</body></html>`;
}

function getAkilMantikHTML() {
  return `<!DOCTYPE html>
<html><head><title>Akıl Mantık Testi</title></head>
<body>
  <h1>Akıl Mantık Testi Yükleniyor...</h1>
  <script>
    setTimeout(() => {
      window.parent.postMessage({type: 'test-complete', test: 'akil-mantik'}, '*');
    }, 3000);
  </script>
</body></html>`;
}