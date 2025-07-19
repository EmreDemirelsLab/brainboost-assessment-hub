import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BurdonTestProps {
  onComplete?: () => void;
  studentId?: string;
}

interface TestData {
  startTime: number | null;
  endTime: number | null;
  testDuration: number;
  currentElapsedTime: number;
  targetChars: string[];
  currentSection: number;
  completedSections: number;
  timerInterval: NodeJS.Timeout | null;
  autoCompleted: boolean;
  sections: {
    [key: number]: {
      grid: any[];
      markedChars: any[];
      results: {
        correct: number;
        missed: number;
        wrong: number;
        score: number;
      };
    };
  };
  totalResults: {
    correct: number;
    missed: number;
    wrong: number;
    score: number;
    ratio: number;
  };
}

// Sabit harf dizileri - 3 bölüm
const sectionLetters = {
  1: [
    ['a', 'e', 'p', 'z', 'n', 'z', 's', 'u', 'a', 'h', 'v', 'k', 'l', 'a', 's', 'i', 'b', 'i', 'o', 'u', 'o', 'e'],
    ['r', 'v', 'b', 'p', 'm', 'i', 'b', 'i', 'r', 'b', 's', 'm', 'n', 't', 'd', 'a', 'u', 'f', 'c', 'f', 'k', 'a'],
    ['c', 'k', 'a', 'h', 's', 'e', 'y', 'p', 'h', 'b', 'p', 's', 'd', 'g', 'y', 'z', 'd', 'v', 'r', 'i', 'f', 'g'],
    ['y', 'd', 'v', 'c', 'o', 'y', 'e', 'r', 'z', 'h', 'e', 'z', 's', 'e', 'g', 'm', 'k', 'f', 'z', 'd', 'a', 'y'],
    ['f', 's', 'd', 'y', 'i', 'b', 't', 'd', 'h', 'm', 'l', 'r', 'i', 'e', 'm', 't', 'g', 't', 'b', 'd', 'f', 'u'],
    ['k', 'c', 'i', 'c', 'k', 'o', 'k', 'o', 's', 't', 'l', 'u', 'z', 'u', 'g', 'm', 'a', 'f', 'l', 'v', 'u', 't'],
    ['i', 'z', 'r', 'f', 'o', 'u', 'd', 'v', 'h', 'y', 'p', 'n', 'b', 'p', 'm', 'v', 'h', 'n', 'n', 'g', 'r', 'y'],
    ['p', 'v', 'k', 'l', 'n', 't', 'y', 'o', 'r', 'z', 'n', 'c', 'p', 'h', 't', 'e', 'm', 'z', 'i', 'o', 'i', 'm'],
    ['r', 'a', 'l', 'y', 'g', 's', 'o', 'i', 'v', 'a', 'i', 'n', 'a', 'r', 'c', 'h', 'o', 'd', 'b', 'f', 'p', 'h'],
    ['k', 'u', 'b', 's', 'y', 'g', 'u', 'e', 'm', 'k', 'l', 't', 'c', 'g', 'v', 'g', 'r', 'i', 'p', 'c', 't', 'e']
  ],
  2: [
    ['c', 'i', 't', 'e', 'l', 'r', 'n', 'z', 'f', 'u', 'd', 't', 'm', 's', 'h', 'd', 'k', 'u', 'f', 'd', 's', 'm'],
    ['s', 'i', 'v', 'e', 't', 'c', 'p', 'l', 'r', 'g', 'v', 'g', 'c', 't', 'l', 'r', 'm', 'e', 'u', 'g', 'y', 'e'],
    ['b', 'o', 'k', 'e', 'h', 'b', 'u', 'k', 'o', 'p', 'f', 'i', 'd', 'o', 'h', 'o', 'r', 'a', 'n', 'i', 'a', 'v'],
    ['i', 'o', 's', 'g', 'y', 'l', 'a', 'r', 'm', 'i', 'f', 'b', 'z', 'm', 'e', 'l', 'h', 'p', 'z', 'n', 'z', 'r'],
    ['o', 'y', 't', 'n', 'a', 'k', 'v', 'p', 'y', 'k', 'g', 'v', 'n', 'h', 'v', 'm', 'p', 'b', 'n', 'p', 'y', 'h'],
    ['v', 'd', 'u', 'o', 'f', 'r', 'h', 'i', 't', 'u', 'v', 'l', 'u', 'a', 'm', 'f', 'a', 'c', 'u', 'l', 't', 's'],
    ['o', 'k', 'o', 'k', 'c', 'i', 'c', 'k', 'u', 'f', 's', 'b', 't', 'g', 't', 'm', 'e', 'i', 'n', 'i', 'z', 'h'],
    ['d', 't', 'b', 'i', 'y', 'a', 's', 'f', 'y', 'n', 'd', 'z', 'f', 'k', 'm', 'g', 'e', 's', 'z', 'e', 'h', 'z'],
    ['r', 'e', 'n', 'o', 'c', 'v', 'd', 'y', 'f', 'f', 'l', 'r', 'v', 'd', 'z', 'v', 'g', 'd', 'z', 'p', 'b', 'e'],
    ['p', 'y', 'c', 'a', 'a', 's', 'c', 'g', 'c', 'a', 'h', 't', 'n', 'm', 'p', 'b', 'r', 'i', 'b', 'i', 'k', 'p']
  ],
  3: [
    ['a', 'f', 'n', 'p', 'v', 'd', 'm', 't', 'o', 'y', 'm', 'i', 'l', 'g', 'd', 'e', 'o', 't', 'o', 'c', 'n', 't'],
    ['l', 'u', 'p', 'z', 'n', 'k', 'r', 'h', 'p', 'u', 'c', 'b', 'o', 'y', 'g', 'u', 'd', 'v', 'y', 'a', 'o', 'l'],
    ['s', 'z', 'o', 'a', 'p', 'f', 'f', 't', 'c', 'v', 'k', 'i', 'r', 'b', 'p', 'm', 'n', 'e', 'r', 'g', 'e', 's'],
    ['b', 'a', 'h', 'v', 'i', 'h', 's', 'c', 'k', 'z', 'r', 'f', 'd', 'r', 'a', 'c', 'g', 'y', 'n', 'm', 'h', 'y'],
    ['t', 'd', 's', 'v', 'c', 'g', 'z', 'y', 'f', 'm', 'p', 't', 'r', 'o', 'g', 'e', 'u', 'u', 'b', 'b', 'y', 'h'],
    ['i', 'u', 'a', 'n', 'y', 'a', 'd', 'u', 'm', 'f', 'a', 'p', 'y', 'z', 'e', 'b', 'k', 'd', 'b', 'o', 'l', 'z'],
    ['e', 'l', 'z', 'h', 'e', 'a', 'd', 'z', 't', 'c', 'l', 'p', 'r', 'y', 'f', 'm', 's', 'n', 'v', 'i', 'c', 'v'],
    ['s', 'b', 'i', 'v', 'm', 'z', 'g', 'p', 's', 'm', 'r', 'k', 'b', 'k', 'r', 'e', 'h', 'c', 'u', 'v', 'n', 's'],
    ['f', 'l', 's', 'l', 'e', 'i', 'o', 'l', 'g', 'l', 'k', 't', 'h', 'z', 'o', 'k', 't', 'd', 'e', 'a', 'r', 'h'],
    ['f', 'm', 'i', 'u', 'c', 'f', 't', 'i', 'b', 's', 'g', 'k', 'm', 'k', 'n', 'p', 'h', 'v', 'b', 'g', 'u', 'i']
  ]
};

export function BurdonTest({ onComplete, studentId }: BurdonTestProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'instructions' | 'test' | 'completion'>('welcome');
  const [testData, setTestData] = useState<TestData>({
    startTime: null,
    endTime: null,
    testDuration: 300, // 5 dakika
    currentElapsedTime: 0,
    targetChars: ['a', 'b', 'd', 'g'],
    currentSection: 1,
    completedSections: 0,
    timerInterval: null,
    autoCompleted: false,
    sections: {
      1: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
      2: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
      3: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } }
    },
    totalResults: { correct: 0, missed: 0, wrong: 0, score: 0, ratio: 0 }
  });

  const progressRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Test verilerini sıfırlama
  const resetTestData = () => {
    if (testData.timerInterval) {
      clearInterval(testData.timerInterval);
    }
    setTestData({
      startTime: null,
      endTime: null,
      testDuration: 300,
      currentElapsedTime: 0,
      targetChars: ['a', 'b', 'd', 'g'],
      currentSection: 1,
      completedSections: 0,
      timerInterval: null,
      autoCompleted: false,
      sections: {
        1: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
        2: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
        3: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } }
      },
      totalResults: { correct: 0, missed: 0, wrong: 0, score: 0, ratio: 0 }
    });
  };

  // Test ızgarası oluşturma
  const generateTestGrid = () => {
    const currentSection = testData.currentSection;
    const targetSectionData = testData.sections[currentSection];
    
    console.log('generateTestGrid called for section:', currentSection);
    
    targetSectionData.grid = [];
    targetSectionData.markedChars = [];
    
    const sectionData = sectionLetters[currentSection as keyof typeof sectionLetters];
    console.log('Section data found:', !!sectionData);
    
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 22; c++) {
        const char = sectionData[r][c];
        const isTarget = testData.targetChars.includes(char);
        
        row.push({
          char: char,
          isTarget: isTarget,
          isMarked: false,
          row: r,
          col: c
        });
      }
      targetSectionData.grid.push(row);
    }
    
    console.log('Grid generated, size:', targetSectionData.grid.length);
  };

  // Karakter işaretleme
  const toggleCharMark = (row: number, col: number) => {
    setTestData(prevData => {
      const newData = { ...prevData };
      const section = newData.sections[newData.currentSection];
      const charData = section.grid[row][col];
      
      if (charData.isMarked) return prevData;
      
      charData.isMarked = true;
      
      section.markedChars.push({
        row: row,
        col: col,
        char: charData.char,
        isTarget: charData.isTarget,
        time: newData.startTime ? new Date().getTime() - newData.startTime : 0
      });
      
      console.log(`Marked char: ${charData.char}, isTarget: ${charData.isTarget}, total marked: ${section.markedChars.length}`);
      
      return newData;
    });
  };

  // Bölüm sonuçlarını hesaplama
  const calculateSectionResults = (sectionNum: number) => {
    const section = testData.sections[sectionNum];
    const results = { correct: 0, missed: 0, wrong: 0, score: 0 };
    
    section.markedChars.forEach(mark => {
      if (mark.isTarget) results.correct++;
      else results.wrong++;
    });
    
    section.grid.forEach(row => {
      row.forEach((cell: any) => {
        if (cell.isTarget && !cell.isMarked) results.missed++;
      });
    });
    
    results.score = results.correct - (results.missed + results.wrong);
    section.results = results;
  };

  // Toplam sonuçları hesaplama
  const calculateTotalResults = () => {
    const total = { correct: 0, missed: 0, wrong: 0, score: 0, ratio: 0 };
    for (let i = 1; i <= 3; i++) {
      const sectionResults = testData.sections[i].results;
      total.correct += sectionResults.correct;
      total.missed += sectionResults.missed;
      total.wrong += sectionResults.wrong;
      total.score += sectionResults.score;
    }
    
    // Toplam hedef sayısını hesaplama
    let totalPossibleTargets = 0;
    for (let i = 1; i <= 3; i++) {
      const sectionData = sectionLetters[i as keyof typeof sectionLetters];
      sectionData.forEach(row => {
        row.forEach(char => {
          if (testData.targetChars.includes(char)) {
            totalPossibleTargets++;
          }
        });
      });
    }
    
    total.ratio = totalPossibleTargets > 0 ? (total.score / totalPossibleTargets) : 0;
    testData.totalResults = total;
  };

  // Sonuçları veritabanına kaydetme
  const saveResultsToDatabase = async () => {
    try {
      if (!user) {
        toast({
          title: "Hata",
          description: "Kullanıcı oturumu bulunamadı",
          variant: "destructive"
        });
        return;
      }

      // Önce kullanıcıyı students tablosuna ekle (varsa zaten var demektir)
      const { error: studentError } = await supabase
        .from('students')
        .upsert({
          user_id: user.id,
          // Diğer alanlar null olabilir çünkü nullable
        }, { 
          onConflict: 'user_id' 
        });

      if (studentError) {
        console.error('Student ekleme hatası:', studentError);
      }

      // Student ID'sini al
      const { data: studentData, error: studentQueryError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentQueryError || !studentData) {
        console.error('Student ID alınamadı:', studentQueryError);
        toast({
          title: "Hata",
          description: "Öğrenci bilgileri bulunamadı",
          variant: "destructive"
        });
        return;
      }

      // Önce Burdon testi ID'sini al
      const { data: testInfo, error: testError } = await supabase
        .from('tests')
        .select('id')
        .eq('test_type', 'burdon_attention')
        .single();

      if (testError || !testInfo) {
        console.error('Test ID bulunamadı:', testError);
        toast({
          title: "Hata",
          description: "Test bilgileri bulunamadı",
          variant: "destructive"
        });
        return;
      }

      const resultsData = {
        test_start_time: testData.startTime,
        test_end_time: testData.endTime,
        test_elapsed_time_seconds: testData.currentElapsedTime,
        test_auto_completed: testData.autoCompleted,
        total_correct: testData.totalResults.correct,
        total_missed: testData.totalResults.missed,
        total_wrong: testData.totalResults.wrong,
        total_score: testData.totalResults.score,
        attention_ratio: testData.totalResults.ratio,
        sections_results: {
          section1: testData.sections[1].results,
          section2: testData.sections[2].results,
          section3: testData.sections[3].results
        }
      };

      const { error } = await supabase
        .from('test_results')
        .insert({
          test_id: testInfo.id,
          student_id: studentData.id,
          conducted_by: user.id,
          start_time: new Date(testData.startTime || Date.now()).toISOString(),
          end_time: new Date(testData.endTime || Date.now()).toISOString(),
          score: testData.totalResults.score,
          max_score: testData.totalResults.correct + testData.totalResults.missed,
          percentage: testData.totalResults.ratio * 100,
          results_data: resultsData,
          status: 'completed'
        });

      if (error) {
        console.error('Veritabanı hatası:', error);
        toast({
          title: "Hata", 
          description: `Test sonuçları kaydedilemedi: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Test sonuçları başarıyla kaydedildi');
        toast({
          title: "Başarılı",
          description: "Test sonuçları başarıyla kaydedildi",
        });
      }
    } catch (error) {
      console.error('Test sonuçları kaydedilirken hata:', error);
      toast({
        title: "Hata",
        description: "Test sonuçları kaydedilemedi",
        variant: "destructive"
      });
    }
  };

  // Test başlatma
  const startTest = () => {
    const newTestData = {
      startTime: new Date().getTime(),
      endTime: null,
      testDuration: 300,
      currentElapsedTime: 0,
      targetChars: ['a', 'b', 'd', 'g'],
      currentSection: 1,
      completedSections: 0,
      timerInterval: null as NodeJS.Timeout | null,
      autoCompleted: false,
      sections: {
        1: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
        2: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } },
        3: { grid: [], markedChars: [], results: { correct: 0, missed: 0, wrong: 0, score: 0 } }
      },
      totalResults: { correct: 0, missed: 0, wrong: 0, score: 0, ratio: 0 }
    };
    
    // İlk bölümün grid'ini hemen oluştur
    const sectionData = sectionLetters[1];
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 22; c++) {
        const char = sectionData[r][c];
        const isTarget = newTestData.targetChars.includes(char);
        
        row.push({
          char: char,
          isTarget: isTarget,
          isMarked: false,
          row: r,
          col: c
        });
      }
      newTestData.sections[1].grid.push(row);
    }
    
    console.log('Starting test with complete data:', newTestData);
    setTestData(newTestData);
    
    const interval = setInterval(() => {
      setTestData(prev => {
        const updated = { ...prev };
        updated.currentElapsedTime++;
        
        if (updated.currentElapsedTime >= updated.testDuration) {
          updated.autoCompleted = true;
          completeTest();
        }
        
        return updated;
      });
    }, 1000);
    
    setTestData(prev => ({ ...prev, timerInterval: interval }));
  };

  // Belirli bölüm için grid oluşturma
  const generateTestGridForCurrentSection = (currentTestData: TestData) => {
    const currentSection = currentTestData.currentSection;
    const targetSectionData = currentTestData.sections[currentSection];
    
    console.log('generateTestGridForCurrentSection called for section:', currentSection);
    
    targetSectionData.grid = [];
    targetSectionData.markedChars = [];
    
    const sectionData = sectionLetters[currentSection as keyof typeof sectionLetters];
    console.log('Section data found:', !!sectionData);
    
    for (let r = 0; r < 10; r++) {
      const row = [];
      for (let c = 0; c < 22; c++) {
        const char = sectionData[r][c];
        const isTarget = currentTestData.targetChars.includes(char);
        
        row.push({
          char: char,
          isTarget: isTarget,
          isMarked: false,
          row: r,
          col: c
        });
      }
      targetSectionData.grid.push(row);
    }
    
    console.log('Grid generated, size:', targetSectionData.grid.length);
    setTestData(prev => ({ ...prev, sections: { ...prev.sections, [currentSection]: targetSectionData } }));
  };

  // Sonraki bölüme geçme
  const moveToNextSection = () => {
    console.log('Moving to next section from:', testData.currentSection);
    
    // Önce mevcut bölümün sonuçlarını hesapla ve state'i güncelle
    setTestData(prevData => {
      const newData = { ...prevData };
      
      // Mevcut bölüm sonuçlarını hesapla
      const currentSectionNum = prevData.currentSection;
      const section = newData.sections[currentSectionNum];
      const results = { correct: 0, missed: 0, wrong: 0, score: 0 };
      
      console.log('Calculating results for section:', currentSectionNum);
      console.log('Marked chars in section:', section.markedChars.length);
      
      section.markedChars.forEach(mark => {
        if (mark.isTarget) results.correct++;
        else results.wrong++;
      });
      
      section.grid.forEach(row => {
        row.forEach((cell: any) => {
          if (cell.isTarget && !cell.isMarked) results.missed++;
        });
      });
      
      results.score = results.correct - (results.missed + results.wrong);
      section.results = results;
      
      console.log('Section results:', results);
      
      newData.completedSections = currentSectionNum;
      
      if (currentSectionNum < 3) {
        newData.currentSection++;
        console.log('Moving to section:', newData.currentSection);
        
        // Yeni bölümün grid'ini temizle ve oluştur
        const newSection = newData.sections[newData.currentSection];
        newSection.grid = [];
        newSection.markedChars = [];
        
        const sectionData = sectionLetters[newData.currentSection as keyof typeof sectionLetters];
        
        for (let r = 0; r < 10; r++) {
          const row = [];
          for (let c = 0; c < 22; c++) {
            const char = sectionData[r][c];
            const isTarget = newData.targetChars.includes(char);
            
            row.push({
              char: char,
              isTarget: isTarget,
              isMarked: false,
              row: r,
              col: c
            });
          }
          newSection.grid.push(row);
        }
        
        console.log('New section grid created, size:', newSection.grid.length);
        return newData;
      } else {
        // Son bölümse testi tamamla
        completeTest();
        return newData;
      }
    });
  };

  // Test tamamlama
  const completeTest = async () => {
    console.log('Completing test...');
    
    setTestData(prevData => {
      const newTestData = { ...prevData };
      newTestData.endTime = new Date().getTime();
      
      if (newTestData.timerInterval) {
        clearInterval(newTestData.timerInterval);
        newTestData.timerInterval = null;
      }
      
      // Mevcut bölümün sonuçlarını hesapla
      const currentSectionNum = newTestData.currentSection;
      const section = newTestData.sections[currentSectionNum];
      const results = { correct: 0, missed: 0, wrong: 0, score: 0 };
      
      console.log('Final calculation for section:', currentSectionNum);
      console.log('Marked chars in final section:', section.markedChars.length);
      
      section.markedChars.forEach(mark => {
        if (mark.isTarget) results.correct++;
        else results.wrong++;
      });
      
      section.grid.forEach(row => {
        row.forEach((cell: any) => {
          if (cell.isTarget && !cell.isMarked) results.missed++;
        });
      });
      
      results.score = results.correct - (results.missed + results.wrong);
      section.results = results;
      
      console.log('Final section results:', results);
      
      newTestData.completedSections = currentSectionNum;
      
      // Toplam sonuçları hesapla
      const total = { correct: 0, missed: 0, wrong: 0, score: 0, ratio: 0 };
      for (let i = 1; i <= 3; i++) {
        const sectionResults = newTestData.sections[i].results;
        total.correct += sectionResults.correct;
        total.missed += sectionResults.missed;
        total.wrong += sectionResults.wrong;
        total.score += sectionResults.score;
      }
      
      // Toplam hedef sayısını hesaplama
      let totalPossibleTargets = 0;
      for (let i = 1; i <= 3; i++) {
        const sectionData = sectionLetters[i as keyof typeof sectionLetters];
        sectionData.forEach(row => {
          row.forEach(char => {
            if (newTestData.targetChars.includes(char)) {
              totalPossibleTargets++;
            }
          });
        });
      }
      
      total.ratio = totalPossibleTargets > 0 ? (total.score / totalPossibleTargets) : 0;
      newTestData.totalResults = total;
      
      console.log('Final total results:', total);
      
      // State güncellemesi yapıldıktan sonra kaydet
      setTestData(newTestData);
      
      return newTestData;
    });
    
    // Veritabanına kaydet ve completion screen'e geç
    setTimeout(async () => {
      await saveResultsToDatabase();
      setCurrentScreen('completion');
    }, 100);
  };

  // Örnek ızgara render etme
  const renderExampleGrid = () => {
    const exampleChars = ['m', 'n', 'a', 'p', 'r', 'b', 'c', 'h', 'd', 'j'];
    return (
      <div className="flex justify-center gap-2 mb-3">
        {exampleChars.map((char, index) => (
          <div
            key={index}
            className={`char-button ${char === 'b' ? 'marked' : ''}`}
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '12pt',
              fontWeight: 'bold',
              color: char === 'b' ? '#ff0000' : '#000000',
              cursor: 'pointer',
              userSelect: 'none',
              display: 'inline-block',
              textAlign: 'center',
              lineHeight: '1',
              margin: '0',
              padding: '0px',
              width: '18px',
              height: '22px'
            }}
          >
            {char}
          </div>
        ))}
      </div>
    );
  };

  // Test ızgarası render etme
  const renderTestGrid = () => {
    const currentGrid = testData.sections[testData.currentSection].grid;
    
    return (
      <div
        ref={gridRef}
        className="test-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(22, 18px)',
          gap: '2px',
          marginBottom: '20px',
          maxWidth: '100%',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {currentGrid.map((row, rIndex) =>
          row.map((charData: any, cIndex) => (
            <div
              key={`${rIndex}-${cIndex}`}
              className={`char-button ${charData.isMarked ? 'marked' : ''}`}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '12pt',
                fontWeight: 'bold',
                color: charData.isMarked ? '#ff0000' : '#000000',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'inline-block',
                textAlign: 'center',
                lineHeight: '1',
                margin: '0',
                padding: '0px',
                width: '18px',
                height: '22px'
              }}
              onClick={() => toggleCharMark(rIndex, cIndex)}
            >
              {charData.char}
            </div>
          ))
        )}
      </div>
    );
  };

  // Progress bar render etme
  const renderProgressBar = () => {
    const progressPercentage = (testData.currentElapsedTime / testData.testDuration) * 100;
    
    return (
      <div
        style={{
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}
      >
        <div
          ref={progressRef}
          style={{
            height: '100%',
            backgroundColor: '#3a86ff',
            transition: 'width 1s linear',
            width: `${progressPercentage}%`
          }}
        />
      </div>
    );
  };

  // Bölüm göstergeleri render etme
  const renderSectionIndicator = () => {
    return (
      <div className="flex justify-center mb-5">
        {[1, 2, 3].map(section => (
          <div
            key={section}
            className={`section-dot ${section === testData.currentSection ? 'active' : ''}`}
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: section === testData.currentSection ? '#3a86ff' : '#e9ecef',
              margin: '0 5px'
            }}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (testData.timerInterval) {
        clearInterval(testData.timerInterval);
      }
    };
  }, [testData.timerInterval]);

  if (currentScreen === 'welcome') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Burdon Dikkat Testine Hoş Geldiniz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Bu test, dikkat sürdürme, odaklanma ve seçici dikkat becerilerinizi değerlendirmek için tasarlanmıştır. Test sonucunda dikkat kapasiteniz ve performansınız hakkında ayrıntılı bir rapor alacaksınız.</p>
          
          <div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Nasıl Çalışır?</h3>
            <p>Bu test sırasında, ekranda gösterilen harfler arasından belirli hedef harfleri bulup işaretlemeniz istenecektir. Test toplam 5 dakika sürecek ve 3 bölümden oluşacaktır.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Başlamadan Önce:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sessiz ve dikkat dağıtıcı unsurların olmadığı bir ortamda olduğunuzdan emin olun</li>
              <li>Testin tamamlanması için yeterli zamanınız olduğundan emin olun</li>
              <li>Ekrana rahat bakabildiğiniz bir pozisyon alın</li>
              <li>Telefonunuzu sessize alın ve bildirimleri kapatın</li>
            </ul>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={() => setCurrentScreen('instructions')} size="lg">
              Teste Başla
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentScreen === 'instructions') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Test Yönergeleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Kuralları</h3>
            <p>Ekranda göreceğiniz harfler arasından aşağıdaki <strong>hedef harfleri</strong> bulup işaretlemeniz gerekmektedir:</p>
            <div className="flex justify-center mt-3 mb-3 gap-4">
              {['a', 'b', 'd', 'g'].map(char => (
                <span key={char} className="text-3xl font-bold text-primary">{char}</span>
              ))}
            </div>
            <p>Test sırasında dikkat etmeniz gereken kurallar:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Test toplam 3 bölümden oluşmaktadır ve her bölümde 10x22 ızgarada harfler bulunacaktır</li>
              <li>Bir bölümü tamamladığınızda, sonraki bölüme geçmek için "Sonraki Bölüm" butonuna tıklayın</li>
              <li>Her bir hedef harfi (a, b, d, g) gördüğünüzde üzerine tıklayarak işaretleyin</li>
              <li>Bir kez işaretlediğiniz harfi geri alamazsınız, dikkatli olun</li>
              <li>Testin toplam süresi 5 dakikadır (300 saniye)</li>
              <li>Süre dolduğunda test otomatik olarak sonlanacaktır</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Örnek Uygulama</h3>
            <p>Aşağıda test ekranının nasıl görüneceğine dair bir örnek bulunmaktadır. Hedef harflerden birini işaretlemek için üzerine tıklayın:</p>
            {renderExampleGrid()}
            <p className="text-center text-sm text-muted-foreground">
              Yukarıdaki örnekte <strong>b</strong> harfi işaretlenmiş, diğer hedef harfler (<strong>a</strong>, <strong>d</strong>) henüz işaretlenmemiştir.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Test Süresi</h3>
            <p>Testin toplam süresi: <strong>5 dakika (300 saniye)</strong></p>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setCurrentScreen('welcome')}>
              Geri Dön
            </Button>
            <Button onClick={() => {
              setCurrentScreen('test');
              startTest();
            }} size="lg">
              Testi Başlat
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentScreen === 'test') {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Burdon Dikkat Testi</CardTitle>
            <div>
              <strong>Hedef Harfler:</strong>
              <span className="ml-2 font-bold text-primary">a, b, d, g</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderProgressBar()}
          {renderSectionIndicator()}
          {testData.sections[testData.currentSection].grid.length > 0 && renderTestGrid()}
          
          <div className="flex justify-center gap-4 mt-6">
            {testData.currentSection < 3 ? (
              <Button onClick={moveToNextSection}>
                Sonraki Bölüm
              </Button>
            ) : (
              <Button onClick={completeTest}>
                Testi Bitir
              </Button>
            )}
          </div>
          
          <div className="text-center mt-4">
            <span>Bölüm {testData.currentSection}/3</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentScreen === 'completion') {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-center">
        <Card className="max-w-md mx-auto p-8">
          <CardContent className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-primary mb-2">Testi Tamamladınız</h1>
              <p className="text-muted-foreground">Test sonuçlarınız başarıyla kaydedildi</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Doğru İşaretlemeler:</span>
                <span className="font-semibold">{testData.totalResults.correct}</span>
              </div>
              <div className="flex justify-between">
                <span>Kaçırılan Hedefler:</span>
                <span className="font-semibold">{testData.totalResults.missed}</span>
              </div>
              <div className="flex justify-between">
                <span>Yanlış İşaretlemeler:</span>
                <span className="font-semibold">{testData.totalResults.wrong}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Toplam Puan:</span>
                <span className="font-bold">{testData.totalResults.score}</span>
              </div>
            </div>

            {onComplete && (
              <Button onClick={onComplete} className="w-full">
                Geri Dön
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}