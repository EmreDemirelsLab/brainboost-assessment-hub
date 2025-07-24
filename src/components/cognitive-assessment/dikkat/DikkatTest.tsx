import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface DikkatTestProps {
  onComplete: (results: any) => void;
}

type TestScreen = 'welcome' | 'audio-setup' | 'info' | 'instructions' | 'demo' | 'countdown' | 'test' | 'completed';

interface TestState {
  currentScreen: TestScreen;
  currentSection: number; // 1, 2, 3
  currentQuestion: number;
  startTime: number;
  responses: Array<{
    questionId: string;
    answer: string;
    responseTime: number;
    isCorrect: boolean;
  }>;
  audioEnabled: boolean;
  volume: number;
}

// Test data structure based on dikkatsağlam.html
const TEST_DATA = {
  examples: [
    {
      id: "ornek1",
      text: "Aşağıdaki sayıları dinleyin ve hangi sayının tekrarlandığını bulun.",
      audio: "/audio/dikkat/ornek1.mp3",
      options: ["3", "7", "9", "5"],
      correct: "7"
    }
  ],
  sections: [
    {
      id: "bolum1",
      title: "Bölüm 1 - Sayılar",
      type: "numbers",
      questions: [
        {
          id: "s1_q1",
          text: "Dinlediğiniz sayı dizisinde tekrarlanan sayıyı bulun.",
          audio: "/audio/dikkat/s1_q1.mp3",
          options: ["2", "4", "6", "8"],
          correct: "4"
        }
        // ... more questions will be added
      ]
    },
    {
      id: "bolum2", 
      title: "Bölüm 2 - Harfler",
      type: "letters",
      questions: [
        {
          id: "s2_q1",
          text: "Dinlediğiniz harf dizisinde tekrarlanan harfi bulun.",
          audio: "/audio/dikkat/s2_q1.mp3",
          options: ["A", "E", "I", "O"],
          correct: "E"
        }
        // ... more questions will be added
      ]
    },
    {
      id: "bolum3",
      title: "Bölüm 3 - Karışık",
      type: "mixed", 
      questions: [
        {
          id: "s3_q1",
          text: "Dinlediğiniz dizide tekrarlanan öğeyi bulun.",
          audio: "/audio/dikkat/s3_q1.mp3", 
          options: ["3", "B", "7", "D"],
          correct: "B"
        }
        // ... more questions will be added
      ]
    }
  ]
};

export function DikkatTest({ onComplete }: DikkatTestProps) {
  const [state, setState] = useState<TestState>({
    currentScreen: 'welcome',
    currentSection: 0,
    currentQuestion: 0,
    startTime: 0,
    responses: [],
    audioEnabled: true,
    volume: 0.8
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleAudioToggle = () => {
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  const handleVolumeChange = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  const playAudio = useCallback((audioSrc: string) => {
    if (!state.audioEnabled) return;
    
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.volume = state.volume;
      audioRef.current.play().catch(console.error);
    }
  }, [state.audioEnabled, state.volume]);

  const handleAnswerSelect = (answer: string) => {
    const currentSection = TEST_DATA.sections[state.currentSection];
    const currentQ = currentSection.questions[state.currentQuestion];
    const responseTime = Date.now() - state.startTime;
    const isCorrect = answer === currentQ.correct;

    const response = {
      questionId: currentQ.id,
      answer,
      responseTime,
      isCorrect
    };

    setState(prev => ({
      ...prev,
      responses: [...prev.responses, response]
    }));

    // Next question or section
    if (state.currentQuestion < currentSection.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        startTime: Date.now()
      }));
    } else if (state.currentSection < TEST_DATA.sections.length - 1) {
      setState(prev => ({
        ...prev,
        currentSection: prev.currentSection + 1,
        currentQuestion: 0,
        currentScreen: 'countdown',
        startTime: Date.now()
      }));
    } else {
      // Test completed
      handleTestComplete();
    }
  };

  const handleTestComplete = () => {
    const results = calculateResults();
    setState(prev => ({ ...prev, currentScreen: 'completed' }));
    setTimeout(() => onComplete(results), 2000);
  };

  const calculateResults = () => {
    const totalQuestions = state.responses.length;
    const correctAnswers = state.responses.filter(r => r.isCorrect).length;
    const averageResponseTime = state.responses.reduce((sum, r) => sum + r.responseTime, 0) / totalQuestions;
    
    const score = (correctAnswers / totalQuestions) * 100;
    
    return {
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      averageResponseTime,
      responses: state.responses,
      sectionResults: TEST_DATA.sections.map((section, index) => {
        const sectionResponses = state.responses.filter(r => 
          r.questionId.startsWith(`s${index + 1}_`)
        );
        const sectionCorrect = sectionResponses.filter(r => r.isCorrect).length;
        return {
          sectionId: section.id,
          sectionTitle: section.title,
          correct: sectionCorrect,
          total: sectionResponses.length,
          percentage: (sectionCorrect / sectionResponses.length) * 100
        };
      })
    };
  };

  const startCountdown = (callback: () => void, seconds: number = 3) => {
    let count = seconds;
    const countdownInterval = setInterval(() => {
      if (count <= 0) {
        clearInterval(countdownInterval);
        callback();
      }
      count--;
    }, 1000);
  };

  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Volume2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ForBrain Dikkat Testi
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Bu test dikkat sürdürme ve odaklanma becerilerinizi ölçmek için tasarlanmıştır.
          </p>
          
          <div className="space-y-4 text-left max-w-md mx-auto mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <p className="text-gray-700">Kulaklık takın ve ses seviyesini ayarlayın</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <p className="text-gray-700">Sessiz bir ortamda olduğunuzdan emin olun</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <p className="text-gray-700">Test süresince dikkatinizi dağıtacak şeylerden uzak durun</p>
            </div>
          </div>

          <Button 
            onClick={() => setState(prev => ({ ...prev, currentScreen: 'audio-setup' }))}
            size="lg"
            className="px-8 py-3"
          >
            Devam Et
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAudioSetup = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Ses Ayarları</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Ses Durumu:</span>
              <Button
                variant={state.audioEnabled ? "default" : "outline"}
                onClick={handleAudioToggle}
                className="flex items-center space-x-2"
              >
                {state.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{state.audioEnabled ? "Açık" : "Kapalı"}</span>
              </Button>
            </div>

            <div className="space-y-3">
              <label className="text-lg font-medium">Ses Seviyesi:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center text-gray-600">
                {Math.round(state.volume * 100)}%
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Test Sesi:</h3>
              <p className="text-sm text-blue-800 mb-3">
                Aşağıdaki butona tıklayarak ses seviyesini test edin:
              </p>
              <Button
                variant="outline"
                onClick={() => playAudio('/audio/dikkat/test-sound.mp3')}
                className="flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Test Sesi Çal</span>
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={() => setState(prev => ({ ...prev, currentScreen: 'info' }))}
              size="lg"
              className="px-8 py-3"
            >
              Ses Ayarı Tamam
            </Button>
          </div>
        </CardContent>
      </Card>

      <audio ref={audioRef} />
    </div>
  );

  const renderInfoScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Test Hakkında</h2>
          
          <div className="space-y-6 text-gray-700">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Test Nasıl Çalışır?</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Size bir dizi sayı, harf veya karışık öğe dinletilecek</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Bu dizide tekrarlanan öğeyi bulmanız gerekecek</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Doğru seçeneği işaretleyerek devam edeceksiniz</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm text-gray-600">Farklı Bölüm</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">~5</div>
                <div className="text-sm text-gray-600">Dakika Süre</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">15</div>
                <div className="text-sm text-gray-600">Toplam Soru</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Önemli:</h4>
              <p className="text-sm text-yellow-800">
                Test başladıktan sonra geri dönemezsiniz. Her soruyu dikkatlice dinleyin ve 
                en iyi cevabı vermeye çalışın.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={() => setState(prev => ({ ...prev, currentScreen: 'instructions' }))}
              size="lg"
              className="px-8 py-3"
            >
              Talimatları Oku
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentTest = () => {
    if (state.currentSection >= TEST_DATA.sections.length) return null;
    
    const currentSection = TEST_DATA.sections[state.currentSection];
    const currentQ = currentSection.questions[state.currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{currentSection.title}</h2>
              <p className="text-gray-600">
                Soru {state.currentQuestion + 1} / {currentSection.questions.length}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-lg text-center text-blue-900 mb-4">
                {currentQ.text}
              </p>
              
              <div className="text-center">
                <Button
                  onClick={() => playAudio(currentQ.audio)}
                  className="flex items-center space-x-2"
                  size="lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Ses Dosyasını Dinle</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  variant="outline"
                  className="h-16 text-xl font-semibold hover:bg-blue-50 hover:border-blue-300"
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <audio ref={audioRef} />
      </div>
    );
  };

  // Render based on current screen
  switch (state.currentScreen) {
    case 'welcome':
      return renderWelcomeScreen();
    case 'audio-setup':
      return renderAudioSetup();
    case 'info':
      return renderInfoScreen();
    case 'test':
      return renderCurrentTest();
    case 'completed':
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dikkat Testi Tamamlandı!
              </h2>
              <p className="text-gray-600">
                Sonuçlarınız hesaplanıyor...
              </p>
            </CardContent>
          </Card>
        </div>
      );
    default:
      // For instructions, demo, countdown screens - simplified for now
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-6">Hazırlanıyor...</h2>
              <Button 
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  currentScreen: 'test',
                  startTime: Date.now()
                }))}
                size="lg"
              >
                Teste Başla
              </Button>
            </CardContent>
          </Card>
        </div>
      );
  }
}