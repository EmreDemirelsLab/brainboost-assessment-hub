import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from '@supabase/supabase-js';

export function CognitiveAssessmentTest() {
  const [sessionId, setSessionId] = useState<string>('');
  const [isTestActive, setIsTestActive] = useState(false);

  // Supabase configuration
  const supabaseUrl = 'https://gamjzzomkosvqhficabt.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbWp6em9ta29zdnFoZmljYWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4ODc3MDAsImV4cCI6MjA2ODQ2MzcwMH0.r8KkywdhNSP1hxzSAlKo8SB5jOEb0KQRUBfZ9Va0p9I';

  useEffect(() => {
    // Generate session ID on component mount
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    console.log('🆔 Generated session ID:', newSessionId);

    // Listen for test completion messages
    const handleTestMessage = (event: MessageEvent) => {
      if (event.data?.type === 'all-tests-complete') {
        console.log('✅ All tests completed, cleaning up session');
        setIsTestActive(false);
        // Clean up localStorage
        localStorage.removeItem('bb-session-id');
        localStorage.removeItem('bb-session-start');
        localStorage.removeItem('bb-session-end');
        localStorage.removeItem('bb-student-id');
        localStorage.removeItem('bb-conducted-by');
      }
    };

    window.addEventListener('message', handleTestMessage);
    return () => window.removeEventListener('message', handleTestMessage);
  }, []);

  const setupLocalStorageBridge = async () => {
    try {
      // Get current user info
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ User not authenticated, using anonymous session');
        // Use anonymous user ID for testing
        const anonymousId = crypto.randomUUID();
        
        // Setup localStorage bridge
        localStorage.setItem('bb-session-id', sessionId);
        localStorage.setItem('bb-session-start', new Date().toISOString());
        localStorage.setItem('bb-student-id', anonymousId);
        localStorage.setItem('bb-conducted-by', anonymousId);
        localStorage.setItem('sb-url', supabaseUrl);
        localStorage.setItem('sb-anon-key', supabaseKey);
        
        console.log('📦 localStorage bridge setup (anonymous):', {
          sessionId,
          studentId: anonymousId,
          conductedBy: anonymousId
        });
        
        return true;
      }

      // Get user details from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('❌ Failed to get user data:', userError);
        return false;
      }

      // Setup localStorage bridge with authenticated user
      localStorage.setItem('bb-session-id', sessionId);
      localStorage.setItem('bb-session-start', new Date().toISOString());
      localStorage.setItem('bb-student-id', userData.id);
      localStorage.setItem('bb-conducted-by', userData.id);
      localStorage.setItem('sb-url', supabaseUrl);
      localStorage.setItem('sb-anon-key', supabaseKey);
      
      console.log('📦 localStorage bridge setup (authenticated):', {
        sessionId,
        studentId: userData.id,
        conductedBy: userData.id
      });
      
      return true;
    } catch (error) {
      console.error('❌ localStorage bridge setup failed:', error);
      return false;
    }
  };

  const handleStartTest = async () => {
    if (!sessionId) {
      console.error('❌ Session ID not generated yet');
      return;
    }

    // Setup localStorage bridge before opening test window
    const bridgeSetup = await setupLocalStorageBridge();
    if (!bridgeSetup) {
      alert('Session kurulumu başarısız oldu. Lütfen tekrar deneyin.');
      return;
    }

    setIsTestActive(true);

    // Test penceresi açma işlemi - tam ekran
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    
    const testWindow = window.open('/cognitive-tests/dikkat/dikkat.html', '_blank', 
      `width=${screenWidth},height=${screenHeight},left=0,top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,fullscreen=yes`);

    if (!testWindow) {
      alert('Test penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.');
      setIsTestActive(false);
    } else {
      console.log('🚀 Test window opened with session ID:', sessionId);
      
      // Test penceresi yüklendikten sonra başlığı değiştir ve tam ekran moduna geç
      testWindow.addEventListener('load', () => {
        try {
          // Pencere başlığını değiştir
          testWindow.document.title = 'Fortest Bilişsel Beceriler Testi';

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

      // Handle window close
      const checkClosed = setInterval(() => {
        if (testWindow.closed) {
          console.log('🔒 Test window closed');
          setIsTestActive(false);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  // 🔥 AGGREGATOR TEST FUNCTION
  const testAggregator = async () => {
    try {
      console.log('🧪 AGGREGATOR TEST: Başlatılıyor...');
      
      // Test session ID'si ile localStorage'ı setup et
      const testSessionId = 'f068e4a7-f42c-4885-abc0-f53c11ee9620';
      const testStudentId = '69dcfe0e-1f5d-4ce7-9b58-2d8a8a22978f';
      
      localStorage.setItem('bb-session-id', testSessionId);
      localStorage.setItem('bb-student-id', testStudentId);
      localStorage.setItem('bb-conducted-by', testStudentId);
      localStorage.setItem('bb-session-start', '2025-01-06T02:30:00.000Z');
      localStorage.setItem('bb-session-end', new Date().toISOString());
      localStorage.setItem('sb-url', supabaseUrl);
      localStorage.setItem('sb-anon-key', supabaseKey);
      
      console.log('📦 Test localStorage setup:', {
        sessionId: testSessionId,
        studentId: testStudentId
      });
      
      // Supabase client oluştur
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 5 test sonucunu oku
      console.log('📖 Test sonuçları okunuyor...');
      const [attResult, memResult, strResult, pzlResult, logicResult] = await Promise.all([
        supabase.from('attention_test_results').select('*').eq('session_id', testSessionId).order('test_end_time', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('memory_test_results').select('*').eq('session_id', testSessionId).order('test_end_time', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('stroop_test_results').select('*').eq('session_id', testSessionId).order('test_end_time', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('puzzle_test_results').select('*').eq('session_id', testSessionId).order('test_end_time', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('akil_mantik_test_results').select('*').eq('session_id', testSessionId).order('test_end_time', { ascending: false }).limit(1).maybeSingle()
      ]);
      
      // Hata kontrolü
      if (attResult.error || memResult.error || strResult.error || pzlResult.error || logicResult.error) {
        throw new Error('Test sonuçları okunamadı');
      }
      
      if (!attResult.data || !memResult.data || !strResult.data || !pzlResult.data || !logicResult.data) {
        throw new Error('Bazı test sonuçları bulunamadı');
      }
      
      console.log('✅ Tüm test sonuçları bulundu');
      
      // Basit skorlama - DOĞRU FIELD İSİMLERİ
      const scores = {
        dikkat_skoru: Math.round((attResult.data.accuracy_percentage || 0) * 100) / 100,
        hafiza_skoru: Math.round((memResult.data.accuracy_percentage || 0) * 100) / 100,
        isleme_hizi_skoru: Math.round(((100 - (strResult.data.average_response_time_ms || 1000) / 10) || 0) * 100) / 100,
        gorsel_isleme_skoru: Math.round(((pzlResult.data.four_piece_score || 0) + (pzlResult.data.six_piece_score || 0)) / 2 * 100) / 100,
        akil_mantik_yurutme_skoru: Math.round((logicResult.data.success_rate || 0) * 100) / 100,
        bilissel_esneklik_skoru: Math.round(((strResult.data.accuracy_percentage || 0) + (pzlResult.data.cognitive_flexibility_score || 0)) / 2 * 100) / 100
      };
      
      console.log('🧠 Bilişsel skorlar hesaplandı:', scores);
      
      // cognitive_test_result tablosuna kaydet
      const startTime = localStorage.getItem('bb-session-start') || new Date().toISOString();
      const endTime = localStorage.getItem('bb-session-end') || new Date().toISOString();
      const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
      
      const cognitiveResult = {
        session_id: testSessionId,
        student_id: testStudentId,
        conducted_by: testStudentId,
        test_start_time: startTime,
        test_end_time: endTime,
        duration_seconds: duration,
        ...scores,
        alt_test_ozetleri: {
          attention: attResult.data,
          memory: memResult.data,
          stroop: strResult.data,
          puzzle: pzlResult.data,
          logic: logicResult.data
        }
      };
      
      console.log('💾 Bilişsel test sonucu kaydediliyor...');
      const { data: insertData, error: insertError } = await supabase
        .from('cognitive_test_result')
        .insert([cognitiveResult])
        .select();
      
      if (insertError) {
        console.error('❌ Bilişsel test sonucu kayıt hatası:', insertError);
        alert(`Aggregator hatası: ${insertError.message}`);
        return;
      }
      
      console.log('🎉 AGGREGATOR TEST: Başarıyla tamamlandı!', insertData);
      alert(`✅ Aggregator test başarılı!\nCognitive Test Result ID: ${insertData[0]?.id}\nSkorlar: ${JSON.stringify(scores, null, 2)}`);
      
    } catch (error) {
      console.error('❌ AGGREGATOR TEST HATASI:', error);
      alert(`❌ Aggregator test hatası: ${error.message}`);
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
          Fortest Bilişsel Beceriler Testi
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

        {/* Session Info */}
        {sessionId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 max-w-2xl">
            <p className="text-sm text-blue-800">
              <strong>Session ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">{sessionId.slice(0, 8)}...</code>
            </p>
            {isTestActive && (
              <p className="text-sm text-green-600 mt-2">
                ✅ Test aktif - localStorage bridge kuruldu
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Testi Başlat Butonu */}
        <Button 
          onClick={handleStartTest}
          size="lg"
          className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
          disabled={!sessionId || isTestActive}
        >
          {isTestActive ? 'Test Devam Ediyor...' : 'Testi Başlat'}
        </Button>
        
        {/* 🧪 AGGREGATOR TEST BUTONU */}
        <Button 
          onClick={testAggregator}
          size="sm"
          variant="outline"
          className="text-sm px-4 py-2 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          🧪 Test Aggregator (Session: f068e4a7...)
        </Button>
    </div>
  );
}