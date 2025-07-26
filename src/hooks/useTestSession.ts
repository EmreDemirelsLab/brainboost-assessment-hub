import { useState, useEffect } from 'react';

export function useTestSession(kullaniciId: string) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<any>(null);

  console.log('🔍 useTestSession hook çağrıldı:', { kullaniciId });

  useEffect(() => {
    console.log('📊 useTestSession effect çalıştı, kullaniciId:', kullaniciId);
  }, [kullaniciId]);

  // Test oturumu başlat
  const startSession = async () => {
    console.log('🚀 Test oturumu başlatılıyor...');
    setLoading(true);
    
    try {
      // Basit bir mock session döndür
      const mockSession = {
        id: `session-${Date.now()}`,
        kullanici_id: kullaniciId,
        durum: 'baslatildi',
        created_at: new Date().toISOString()
      };
      
      setSession(mockSession);
      console.log('✅ Mock session oluşturuldu:', mockSession);
      
      return { data: mockSession, error: null };
    } catch (error) {
      console.error('❌ Session başlatma hatası:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Test oturumu tamamla
  const completeSession = async () => {
    console.log('🏁 Test oturumu tamamlanıyor...');
    return { data: null, error: null };
  };

  // Test geçmişi getir
  const getTestHistory = async () => {
    console.log('📚 Test geçmişi getiriliyor...');
    return { data: [], error: null };
  };

  // Belirli bir oturumu getir
  const getSession = async (oturumId: string) => {
    console.log('🔍 Session getiriliyor:', oturumId);
    return { data: null, error: null };
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
}