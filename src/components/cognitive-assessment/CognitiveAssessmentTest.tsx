import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, Brain, Target, Puzzle, Lightbulb } from "lucide-react";

type TestStep = 'welcome' | 'dikkat' | 'hafiza' | 'stroop' | 'puzzle' | 'akil-mantik' | 'results';

interface CognitiveAssessmentState {
  currentStep: TestStep;
  assessmentId: string | null;
  startTime: Date | null;
  completedTests: Set<string>;
  testResults: Record<string, any>;
}

const TESTS = [
  {
    id: 'dikkat',
    title: 'Dikkat Testi',
    description: 'Dikkat sürdürme ve odaklanma becerilerinizi ölçer',
    icon: Target,
    duration: '~5 dakika',
    color: 'text-blue-600'
  },
  {
    id: 'hafiza',
    title: 'Hafıza Testi',
    description: 'İşitsel ve görsel hafıza kapasitelerinizi değerlendirir',
    icon: Brain,
    duration: '~4 dakika',
    color: 'text-green-600'
  },
  {
    id: 'stroop',
    title: 'Stroop Testi',
    description: 'Bilişsel esneklik ve kontrol becerilerinizi test eder',
    icon: Clock,
    duration: '~3 dakika',
    color: 'text-purple-600'
  },
  {
    id: 'puzzle',
    title: 'Puzzle Testi',
    description: 'Görsel-uzamsal işlem becerilerinizi ölçer',
    icon: Puzzle,
    duration: '~4 dakika',
    color: 'text-orange-600'
  },
  {
    id: 'akil-mantik',
    title: 'Akıl ve Mantık Testi',
    description: 'Mantıksal akıl yürütme ve problem çözme becerilerinizi değerlendirir',
    icon: Lightbulb,
    duration: '~4 dakika',
    color: 'text-red-600'
  }
];

export function CognitiveAssessmentTest() {
  const [currentStep, setCurrentStep] = useState<TestStep>('welcome');

  const handleStartAssessment = () => {
    console.log('Test başlatıldı');
    setCurrentStep('dikkat');
  };

  const handleTestComplete = (testId: string, results: any) => {
    console.log(`${testId} testi tamamlandı:`, results);
    // Sonraki teste geç
    const currentIndex = TESTS.findIndex(test => test.id === currentStep);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < TESTS.length) {
      setCurrentStep(TESTS[nextIndex].id as TestStep);
    } else {
      setCurrentStep('results');
    }
  };

  const renderCurrentTest = () => {
    switch (currentStep) {
      case 'dikkat':
        return <div className="min-h-screen bg-blue-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Dikkat Testi</h2>
            <Button onClick={() => handleTestComplete('dikkat', { score: 85 })}>
              Test Tamamla (Demo)
            </Button>
          </div>
        </div>;
      case 'hafiza':
        return <div className="min-h-screen bg-green-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Hafıza Testi</h2>
            <Button onClick={() => handleTestComplete('hafiza', { score: 78 })}>
              Test Tamamla (Demo)
            </Button>
          </div>
        </div>;
      case 'stroop':
        return <div className="min-h-screen bg-purple-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Stroop Testi</h2>
            <Button onClick={() => handleTestComplete('stroop', { score: 92 })}>
              Test Tamamla (Demo)
            </Button>
          </div>
        </div>;
      case 'puzzle':
        return <div className="min-h-screen bg-orange-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Puzzle Testi</h2>
            <Button onClick={() => handleTestComplete('puzzle', { score: 88 })}>
              Test Tamamla (Demo)
            </Button>
          </div>
        </div>;
      case 'akil-mantik':
        return <div className="min-h-screen bg-red-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Akıl ve Mantık Testi</h2>
            <Button onClick={() => handleTestComplete('akil-mantik', { score: 95 })}>
              Test Tamamla (Demo)
            </Button>
          </div>
        </div>;
      case 'results':
        return <div className="min-h-screen bg-green-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Tüm Testler Tamamlandı!</h2>
            <p className="text-lg">Sonuçlarınız hazırlanıyor...</p>
            <Button className="mt-4" onClick={() => setCurrentStep('welcome')}>
              Yeni Test Başlat
            </Button>
          </div>
        </div>;
      default:
        return null;
    }
  };

  if (currentStep !== 'welcome') {
    return renderCurrentTest();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            ForBrain Bilişsel Beceri Değerlendirme Testi
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Bu kapsamlı test, bilişsel becerilerinizi 5 farklı alanda değerlendirir.
            Toplam süre yaklaşık 20 dakikadır.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {TESTS.map((test, index) => {
              const Icon = test.icon;
              
              return (
                <div 
                  key={test.id}
                  className="relative p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${test.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {index + 1}. {test.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {test.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {test.duration}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">⚠️ Önemli Notlar:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Testler sırasıyla yapılmalı ve geri dönüş mümkün değildir</li>
              <li>• Sessiz bir ortamda ve kesintisiz olarak testi tamamlayın</li>
              <li>• Her test için kulaklık kullanmanız önerilir</li>
              <li>• Test sırasında başka sekme açmayın veya sayfayı yenilemeyehin</li>
            </ul>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleStartAssessment}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Testi Başlat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}