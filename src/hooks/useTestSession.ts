import { useState, useEffect } from 'react';
import { testService } from '@/services/testService';
import { scoreService } from '@/services/scoreService';

export const useTestSession = (kullaniciId: string) => {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<any | null>(null);

  // Debug: kullaniciId'yi kontrol et
  useEffect(() => {
    console.log('🆔 useTestSession kullaniciId:', kullaniciId);
  }, [kullaniciId]);
  
  // Test oturumu başlat
  const startSession = async () => {
    console.log('🎯 useTestSession.startSession çağrıldı:', kullaniciId);
    setLoading(true);
    try {
      const { data, error } = await testService.createTestSession(kullaniciId);
      console.log('🔄 TestService.createTestSession sonucu:', { data, error });
      
      if (!error && data) {
        setSession(data);
        // Global erişim için window'a kaydet
        (window as any).currentSession = data;
        console.log('✅ Session başarıyla set edildi:', data);
        return { data, error: null };
      }
      console.log('❌ Session başlatılamadı:', error);
      return { data: null, error };
    } catch (error) {
      console.error('❌ startSession catch bloğu:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Test oturumunu tamamla
  const completeSession = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Oturum durumunu güncelle
      await testService.updateTestSession(session.id, {
        durum: 'tamamlandi',
        bitis_tarihi: new Date().toISOString()
      });
      
      // Bilişsel skorları hesapla
      const { data: skorlar, error } = await scoreService.calculateCognitiveScores(session.id);
      if (!error && skorlar) {
        setScores(skorlar);
      }
      
      return { success: true, scores: skorlar };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Test geçmişini getir
  const getTestHistory = async () => {
    const { data, error } = await testService.getUserTestHistory(kullaniciId);
    return { data, error };
  };
  
  // Test oturumu durumunu getir
  const getSession = async (oturumId: string) => {
    const { data, error } = await testService.getTestSession(oturumId);
    return { data, error };
  };
  
  return {
    session,
    scores,
    loading,
    startSession,
    completeSession,
    getTestHistory,
    getSession
  };
}; 