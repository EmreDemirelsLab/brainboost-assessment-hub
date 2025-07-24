import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, Brain, Target, Puzzle, Lightbulb, CheckCircle } from "lucide-react";
import { DikkatTest } from "./dikkat/DikkatTest";
import { HafizaTest } from "./hafiza/HafizaTest";
import { StroopTest } from "./stroop/StroopTest";
import { PuzzleTest } from "./puzzle/PuzzleTest";
import { AkilMantikTest } from "./akil-mantik/AkilMantikTest";
import { TestResults } from "./TestResults";
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
  const [state, setState] = useState<CognitiveAssessmentState>({
    currentStep: 'welcome',
    assessmentId: null,
    startTime: null,
    completedTests: new Set(),
    testResults: {}
  });

  const currentTestIndex = TESTS.findIndex(test => test.id === state.currentStep);
  const progress = state.currentStep === 'welcome' ? 0 : 
                  state.currentStep === 'results' ? 100 : 
                  ((currentTestIndex + 1) / TESTS.length) * 100;

  const handleStartAssessment = async () => {
    try {
      const startTime = new Date();
      
      const { data, error } = await supabase
        .from('cognitive_assessment_results')
        .insert({
          user_id: user?.id,
          conducted_by: user?.id,
          test_start_time: startTime.toISOString(),
          current_test_step: 1
        })
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        currentStep: 'dikkat',
        assessmentId: data.id,
        startTime
      }));
    } catch (error) {
      console.error('Assessment başlatma hatası:', error);
      toast.error('Test başlatılırken bir hata oluştu');
    }
  };

  const handleTestComplete = async (testId: string, results: any) => {
    try {
      const updateData = {
        [`${testId}_test_results`]: results,
        [`${testId}_test_score`]: results.score || 0,
        [`${testId}_test_completed_at`]: new Date().toISOString(),
        current_test_step: currentTestIndex + 2
      };

      const { error } = await supabase
        .from('cognitive_assessment_results')
        .update(updateData)
        .eq('id', state.assessmentId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        completedTests: new Set([...prev.completedTests, testId]),
        testResults: { ...prev.testResults, [testId]: results }
      }));

      // Next test'e geç
      const nextTestIndex = currentTestIndex + 1;
      if (nextTestIndex < TESTS.length) {
        const nextTestId = TESTS[nextTestIndex].id as TestStep;
        setState(prev => ({ ...prev, currentStep: nextTestId }));
      } else {
        await handleAllTestsComplete();
      }
    } catch (error) {
      console.error('Test sonucu kaydetme hatası:', error);
      toast.error('Test sonucu kaydedilirken bir hata oluştu');
    }
  };

  const handleAllTestsComplete = async () => {
    try {
      const endTime = new Date();
      const duration = state.startTime ? 
        Math.floor((endTime.getTime() - state.startTime.getTime()) / 1000) : 0;

      // Calculate overall cognitive score
      const scores = Object.values(state.testResults).map((result: any) => result.score || 0);
      const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      const { error } = await supabase
        .from('cognitive_assessment_results')
        .update({
          test_end_time: endTime.toISOString(),
          total_test_duration_seconds: duration,
          test_status: 'completed',
          overall_cognitive_score: overallScore,
          cognitive_assessment_summary: {
            tests_completed: TESTS.length,
            total_duration: duration,
            individual_scores: state.testResults
          }
        })
        .eq('id', state.assessmentId);

      if (error) throw error;

      setState(prev => ({ ...prev, currentStep: 'results' }));
      toast.success('Tüm testler başarıyla tamamlandı!');
    } catch (error) {
      console.error('Assessment tamamlama hatası:', error);
      toast.error('Test tamamlanırken bir hata oluştu');
    }
  };

  const renderCurrentTest = () => {
    switch (state.currentStep) {
      case 'dikkat':
        return <DikkatTest onComplete={(results) => handleTestComplete('dikkat', results)} />;
      case 'hafiza':
        return <HafizaTest onComplete={(results) => handleTestComplete('hafiza', results)} />;
      case 'stroop':
        return <StroopTest onComplete={(results) => handleTestComplete('stroop', results)} />;
      case 'puzzle':
        return <PuzzleTest onComplete={(results) => handleTestComplete('puzzle', results)} />;
      case 'akil-mantik':
        return <AkilMantikTest onComplete={(results) => handleTestComplete('akil-mantik', results)} />;
      case 'results':
        return <TestResults assessmentId={state.assessmentId!} testResults={state.testResults} />;
      default:
        return null;
    }
  };

  if (state.currentStep !== 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {state.currentStep === 'results' ? 'Test Tamamlandı' : `Test ${currentTestIndex + 1} / ${TESTS.length}`}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% Tamamlandı
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Test Content */}
        <div className="pt-20">
          {renderCurrentTest()}
        </div>
      </div>
    );
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
              const isCompleted = state.completedTests.has(test.id);
              
              return (
                <div 
                  key={test.id}
                  className="relative p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${test.color}`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
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