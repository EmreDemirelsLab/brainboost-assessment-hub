import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Trophy, Target, Brain, Clock, Puzzle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestResultsProps {
  assessmentId: string;
  testResults: Record<string, any>;
}

const TEST_ICONS = {
  dikkat: Target,
  hafiza: Brain,
  stroop: Clock,
  puzzle: Puzzle,
  'akil-mantik': Lightbulb
};

const TEST_NAMES = {
  dikkat: 'Dikkat Testi',
  hafiza: 'Hafıza Testi',
  stroop: 'Stroop Testi',
  puzzle: 'Puzzle Testi',
  'akil-mantik': 'Akıl ve Mantık Testi'
};

export function TestResults({ assessmentId, testResults }: TestResultsProps) {
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentData();
  }, [assessmentId]);

  const fetchAssessmentData = async () => {
    try {
      const { data, error } = await supabase
        .from('cognitive_assessment_results')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      setAssessmentData(data);
    } catch (error) {
      console.error('Assessment data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return 'Mükemmel';
    if (score >= 70) return 'İyi';
    if (score >= 55) return 'Orta';
    return 'Geliştirilmeli';
  };

  const exportToPDF = () => {
    // PDF export functionality will be implemented here
    console.log('PDF export functionality will be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Sonuçlar yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallScore = assessmentData?.overall_cognitive_score || 0;
  const overallGrade = calculateOverallGrade(overallScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              Bilişsel Değerlendirme Tamamlandı!
            </CardTitle>
            <p className="text-xl opacity-90">
              Genel Bilişsel Skorunuz: {overallScore.toFixed(1)}%
            </p>
            <Badge 
              className={`${overallGrade.bg} ${overallGrade.color} text-lg font-bold px-4 py-2 mt-4`}
            >
              {overallGrade.grade} - {getPerformanceLevel(overallScore)}
            </Badge>
          </CardHeader>
        </Card>

        {/* Individual Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(testResults).map(([testId, results]) => {
            const IconComponent = TEST_ICONS[testId as keyof typeof TEST_ICONS];
            const testName = TEST_NAMES[testId as keyof typeof TEST_NAMES];
            const score = results.score || 0;
            const grade = calculateOverallGrade(score);

            return (
              <Card key={testId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{testName}</CardTitle>
                    </div>
                    <Badge className={`${grade.bg} ${grade.color} font-bold`}>
                      {grade.grade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Başarı Oranı</span>
                        <span className="font-medium">{score.toFixed(1)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Doğru Cevap</span>
                        <p className="font-medium text-green-600">
                          {results.correctAnswers || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Toplam Soru</span>
                        <p className="font-medium">
                          {results.totalQuestions || 0}
                        </p>
                      </div>
                    </div>

                    {results.averageResponseTime && (
                      <div className="text-sm">
                        <span className="text-gray-600">Ortalama Tepki Süresi</span>
                        <p className="font-medium text-blue-600">
                          {(results.averageResponseTime / 1000).toFixed(2)} saniye
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>Detaylı Analiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900 mb-1">Dikkat</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {(testResults.dikkat?.score || 0).toFixed(0)}%
                </p>
                <p className="text-xs text-blue-700">
                  {getPerformanceLevel(testResults.dikkat?.score || 0)}
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-900 mb-1">Hafıza</h3>
                <p className="text-2xl font-bold text-green-600">
                  {(testResults.hafiza?.score || 0).toFixed(0)}%
                </p>
                <p className="text-xs text-green-700">
                  {getPerformanceLevel(testResults.hafiza?.score || 0)}
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-purple-900 mb-1">Bilişsel Kontrol</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {(testResults.stroop?.score || 0).toFixed(0)}%
                </p>
                <p className="text-xs text-purple-700">
                  {getPerformanceLevel(testResults.stroop?.score || 0)}
                </p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Puzzle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-medium text-orange-900 mb-1">Görsel İşlem</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {((testResults.puzzle?.score || 0) + (testResults['akil-mantik']?.score || 0)) / 2}%
                </p>
                <p className="text-xs text-orange-700">
                  {getPerformanceLevel(((testResults.puzzle?.score || 0) + (testResults['akil-mantik']?.score || 0)) / 2)}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Öneriler:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {overallScore >= 85 && (
                  <li>• Mükemmel performans! Bilişsel becerileriniz çok güçlü.</li>
                )}
                {overallScore >= 70 && overallScore < 85 && (
                  <li>• İyi bir performans sergilediniiz. Düzenli egzersizlerle daha da geliştirebilirsiniz.</li>
                )}
                {overallScore < 70 && (
                  <li>• Bilişsel egzersizler ve düzenli antrenmanlarla gelişim sağlayabilirsiniz.</li>
                )}
                <li>• Düzenli uyku, egzersiz ve sağlıklı beslenme bilişsel performansı artırır.</li>
                <li>• Hafıza oyunları, puzzle çözme ve okuma gibi aktiviteler faydalıdır.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={exportToPDF} size="lg" className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>PDF İndir</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.reload()}
          >
            Yeni Test Başlat
          </Button>
        </div>
      </div>
    </div>
  );
}