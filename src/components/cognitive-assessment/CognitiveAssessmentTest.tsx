import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, Brain, Target, Puzzle, Lightbulb } from "lucide-react";
import { DikkatTest } from './dikkat/DikkatTest';
import { HafizaTest } from './hafiza/HafizaTest';
import { StroopTest } from './stroop/StroopTest';
import { PuzzleTest } from './puzzle/PuzzleTest';
import { AkilMantikTest } from './akil-mantik/AkilMantikTest';
import { TestResults } from './TestResults';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<TestStep>('welcome');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const startAssessment = async () => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cognitive_assessment_results')
        .insert({
          user_id: user.id,
          conducted_by: user.id,
          test_start_time: new Date().toISOString(),
          test_status: 'in_progress',
          current_test_step: 1
        })
        .select()
        .single();

      if (error) throw error;

      setAssessmentId(data.id);
      setCurrentStep('dikkat');
      toast.success('Test başlatıldı');
    } catch (error) {
      console.error('Assessment başlatma hatası:', error);
      toast.error('Test başlatılırken bir hata oluştu');
    }
  };

  const handleTestComplete = async (testId: string, results: any) => {
    if (!assessmentId) return;

    try {
      const updateData: any = {
        [`${testId}_test_results`]: results,
        [`${testId}_test_score`]: results.score || 0,
        [`${testId}_test_completed_at`]: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('cognitive_assessment_results')
        .update(updateData)
        .eq('id', assessmentId);

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        [testId]: results
      }));

      // Sonraki teste geç
      const currentIndex = TESTS.findIndex(test => test.id === currentStep);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < TESTS.length) {
        setCurrentStep(TESTS[nextIndex].id as TestStep);
        
        // Mevcut test adımını güncelle
        await supabase
          .from('cognitive_assessment_results')
          .update({ current_test_step: nextIndex + 1 })
          .eq('id', assessmentId);
      } else {
        // Tüm testler tamamlandı
        await completeAssessment();
      }
    } catch (error) {
      console.error('Test sonucu kaydetme hatası:', error);
      toast.error('Test sonucu kaydedilirken bir hata oluştu');
    }
  };

  const completeAssessment = async () => {
    if (!assessmentId) return;

    try {
      const overallScore = Object.values(testResults).reduce((sum: number, result: any) => {
        return sum + (result.score || 0);
      }, 0) / Object.keys(testResults).length;

      const { error } = await supabase
        .from('cognitive_assessment_results')
        .update({
          test_end_time: new Date().toISOString(),
          test_status: 'completed',
          overall_cognitive_score: overallScore,
          cognitive_assessment_summary: {
            totalTests: TESTS.length,
            completedTests: Object.keys(testResults).length,
            averageScore: overallScore,
            testResults: testResults
          }
        })
        .eq('id', assessmentId);

      if (error) throw error;

      setCurrentStep('results');
      toast.success('Tüm testler başarıyla tamamlandı!');
    } catch (error) {
      console.error('Assessment tamamlama hatası:', error);
      toast.error('Test tamamlanırken bir hata oluştu');
    }
  };

  const renderCurrentTest = () => {
    switch (currentStep) {
      case 'dikkat':
        return <DikkatTest onComplete={(results) => handleTestComplete('dikkat', results)} />;
      case 'hafiza':
        return <HafizaTest onComplete={(results) => handleTestComplete('hafiza', results)} />;
      case 'stroop':
        return <StroopTest onComplete={(results) => handleTestComplete('stroop', results)} />;
      case 'puzzle':
        return <PuzzleTest onComplete={(results) => handleTestComplete('puzzle', results)} />;
      case 'akil-mantik':
        return <AkilMantikTest onComplete={(results) => handleTestComplete('akil_mantik', results)} />;
      case 'results':
        return (
          <TestResults 
            testResults={testResults}
            assessmentId={assessmentId}
            onNewTest={() => {
              setCurrentStep('welcome');
              setAssessmentId(null);
              setTestResults({});
            }}
          />
        );
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
              onClick={startAssessment}
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