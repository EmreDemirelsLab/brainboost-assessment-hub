import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTestSession } from '@/hooks/useTestSession';
import { testService } from '@/services/testService';
import { ScoreService } from '@/services/scoreService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Play, RotateCcw } from 'lucide-react';

const TEST_SEQUENCE = [
  { id: 'dikkat', name: 'Dikkat Testi', path: '/cognitive-tests/dikkat/dikkat.html' },
  { id: 'hafiza', name: 'Hafıza Testi', path: '/cognitive-tests/hafiza/hafiza.html' },
  { id: 'akil_mantik', name: 'Akıl-Mantık Testi', path: '/cognitive-tests/akil-mantik/akil-mantik.html' },
  { id: 'puzzle', name: 'Puzzle Testi', path: '/cognitive-tests/puzzle/puzzle.html' },
  { id: 'stroop', name: 'Stroop Testi', path: '/cognitive-tests/stroop/stroop.html' }
];

export function CognitiveTestRunner() {
  const { user } = useAuth();
  const { session, scores, loading, startSession, completeSession } = useTestSession(user?.id || '');
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [testWindow, setTestWindow] = useState<Window | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const testServiceRef = useRef(testService);
  const scoreService = useRef(new ScoreService());

  // Global fonksiyonları window'a ekle
  useEffect(() => {
    (window as any).getCurrentUser = () => user;
    (window as any).getCurrentSession = () => session;
    (window as any).saveTestResult = async (testType: string, data: any) => {
      return await testServiceRef.current.saveTestResult(data);
    };
    (window as any).saveTestDetails = async (testType: string, testResultId: string, details: any) => {
      return await testServiceRef.current.saveTestDetails(testType as any, testResultId, details);
    };
    (window as any).saveQuestionResponses = async (responses: any[]) => {
      return await testServiceRef.current.saveQuestionResponses(responses);
    };
  }, [user, session]);

  // Test mesajlarını dinle
  useEffect(() => {
    const handleTestMessage = (event: MessageEvent) => {
      if (event.data.type === 'test-complete') {
        console.log('Test tamamlandı:', event.data);
        
        // Tamamlanan testi listeye ekle
        setCompletedTests(prev => [...prev, event.data.testName]);
        setIsTestRunning(false);
        
        // Test penceresini kapat
        if (testWindow) {
          testWindow.close();
          setTestWindow(null);
        }
        
        // Sıradaki teste geç
        if (currentTestIndex < TEST_SEQUENCE.length - 1) {
          setCurrentTestIndex(prev => prev + 1);
        } else {
          // Tüm testler tamamlandı
          handleAllTestsComplete();
        }
      }
    };

    window.addEventListener('message', handleTestMessage);
    return () => window.removeEventListener('message', handleTestMessage);
  }, [testWindow, currentTestIndex]);

  const handleStartTests = async () => {
    if (!user) return;
    
    const { data } = await startSession();
    if (data) {
      setCurrentTestIndex(0);
      setCompletedTests([]);
      startCurrentTest();
    }
  };

  const startCurrentTest = () => {
    if (currentTestIndex >= TEST_SEQUENCE.length) return;
    
    const currentTest = TEST_SEQUENCE[currentTestIndex];
    const testUrl = `${window.location.origin}${currentTest.path}`;
    
    const newWindow = window.open(
      testUrl,
      'cognitive-test',
      'width=1200,height=800,resizable=yes,scrollbars=yes'
    );
    
    if (newWindow) {
      setTestWindow(newWindow);
      setIsTestRunning(true);
    }
  };

  const handleAllTestsComplete = async () => {
    console.log('Tüm testler tamamlandı!');
    
    try {
      const result = await completeSession();
      if (result.success) {
        console.log('Bilişsel skorlar hesaplandı:', result.scores);
      }
    } catch (error) {
      console.error('Test tamamlama hatası:', error);
    }
  };

  const resetTests = () => {
    setCurrentTestIndex(0);
    setCompletedTests([]);
    setIsTestRunning(false);
    if (testWindow) {
      testWindow.close();
      setTestWindow(null);
    }
  };

  const progress = (completedTests.length / TEST_SEQUENCE.length) * 100;
  const currentTest = TEST_SEQUENCE[currentTestIndex];
  const allTestsCompleted = completedTests.length === TEST_SEQUENCE.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Bilişsel Beceriler Test Bataryası
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>İlerleme</span>
              <span>{completedTests.length} / {TEST_SEQUENCE.length} test tamamlandı</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Test Listesi */}
          <div className="grid gap-3">
            {TEST_SEQUENCE.map((test, index) => {
              const isCompleted = completedTests.includes(test.id);
              const isCurrent = index === currentTestIndex && !allTestsCompleted;
              const isRunning = isCurrent && isTestRunning;
              
              return (
                <div
                  key={test.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isCurrent 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">
                        {isCompleted 
                          ? 'Tamamlandı' 
                          : isRunning 
                            ? 'Çalışıyor...' 
                            : isCurrent 
                              ? 'Sıradaki test' 
                              : 'Bekliyor'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {isCurrent && !isRunning && (
                    <Button
                      onClick={startCurrentTest}
                      size="sm"
                      className="ml-4"
                    >
                      Başlat
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Kontrol Butonları */}
          <div className="flex gap-3 pt-4">
            {!session && (
              <Button
                onClick={handleStartTests}
                disabled={loading || !user}
                className="flex-1"
              >
                {loading ? 'Başlatılıyor...' : 'Testleri Başlat'}
              </Button>
            )}
            
            {session && !allTestsCompleted && (
              <Button
                onClick={resetTests}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Sıfırla
              </Button>
            )}
            
            {allTestsCompleted && scores && (
              <div className="flex-1 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  🎉 Tüm testler başarıyla tamamlandı!
                </h3>
                <p className="text-sm text-green-700">
                  Genel Bilişsel Endeks: {scores.genel_bilissel_endeks}/100
                </p>
                <p className="text-sm text-green-700">
                  Performans Seviyesi: {scores.performans_seviyesi}
                </p>
              </div>
            )}
          </div>

          {/* Uyarı Mesajları */}
          {!user && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Testleri başlatmak için giriş yapmanız gerekiyor.
              </p>
            </div>
          )}
          
          {isTestRunning && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Test penceresi açıldı. Lütfen test penceresinde işlemleri tamamlayın.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 