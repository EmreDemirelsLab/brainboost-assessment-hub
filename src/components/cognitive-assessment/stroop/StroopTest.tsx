import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StroopTestProps {
  onComplete: (results: any) => void;
}

export function StroopTest({ onComplete }: StroopTestProps) {
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
    // Simulated test completion for now
    setTimeout(() => {
      const mockResults = {
        score: 78,
        totalQuestions: 30,
        correctAnswers: 24,
        testType: 'stroop'
      };
      onComplete(mockResults);
    }, 3000);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Stroop Testi
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Bu test bilişsel esneklik ve kontrol becerilerinizi test eder.
            </p>
            <Button onClick={handleStart} size="lg">
              Stroop Testini Başlat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stroop Testi Devam Ediyor...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">
            Test tamamlanıyor, lütfen bekleyin...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}