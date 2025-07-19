import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
// import { generateBurdonHTMLReport } from "@/components/reports/BurdonPDFTemplate";
import { BurdonTestResult } from "./Reports";

export default function BurdonReportDetail() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<BurdonTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      
      // Test sonucunu al
      const { data: resultData, error } = await supabase
        .from('burdon_test_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error) throw error;

      // Öğrenci bilgisini al
      let studentName = 'Bilinmeyen Öğrenci';
      if (resultData.student_id) {
        const { data: studentData } = await supabase
          .from('students')
          .select('users!students_user_id_fkey(first_name, last_name)')
          .eq('id', resultData.student_id)
          .single();
        
        if (studentData?.users) {
          studentName = `${studentData.users.first_name} ${studentData.users.last_name}`;
        }
      }

      // Test yapan kişi bilgisini al
      let conductorName = 'Bilinmeyen Kullanıcı';
      if (resultData.conducted_by) {
        const { data: conductorData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', resultData.conducted_by)
          .single();
        
        if (conductorData) {
          conductorName = `${conductorData.first_name} ${conductorData.last_name}`;
        }
      }

      setResult({
        ...resultData,
        student_name: studentName,
        conducted_by_name: conductorName
      });
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Rapor bulunamadı</p>
          <Button onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Raporlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* No-print toolbar */}
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/reports')}
          className="bg-background shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Raporlara Dön
        </Button>
        <Button
          onClick={handlePrint}
          className="shadow-lg"
        >
          <Printer className="h-4 w-4 mr-2" />
          Yazdır / PDF
        </Button>
      </div>

      {/* PDF Report Content */}
      <div className="report-content bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">BURDON</h1>
            <h2 className="text-2xl text-gray-700">Dikkat Testi Raporu</h2>
          </div>

          {/* Test Bilgileri */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Öğrenci Bilgileri</h3>
              <p><strong>Ad Soyad:</strong> {result.student_name}</p>
              <p><strong>Test Tarihi:</strong> {new Date(result.created_at).toLocaleDateString('tr-TR')}</p>
              <p><strong>Test Yapan:</strong> {result.conducted_by_name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Test Detayları</h3>
              <p><strong>Başlangıç:</strong> {new Date(result.test_start_time).toLocaleTimeString('tr-TR')}</p>
              <p><strong>Bitiş:</strong> {new Date(result.test_end_time).toLocaleTimeString('tr-TR')}</p>
              <p><strong>Süre:</strong> {Math.floor(result.test_elapsed_time_seconds / 60)}:{(result.test_elapsed_time_seconds % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>

          {/* Performans Metrikleri */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{result.total_correct}</div>
              <div className="text-sm text-gray-600">Doğru Cevaplar</div>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{result.total_wrong}</div>
              <div className="text-sm text-gray-600">Yanlış Cevaplar</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{result.total_missed}</div>
              <div className="text-sm text-gray-600">Kaçırılan</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{result.total_score}</div>
              <div className="text-sm text-gray-600">Toplam Puan</div>
            </div>
          </div>

          {/* Bölüm Analizi */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Bölümsel Analiz</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Bölüm</th>
                    <th className="border border-gray-300 p-3 text-center">Doğru</th>
                    <th className="border border-gray-300 p-3 text-center">Yanlış</th>
                    <th className="border border-gray-300 p-3 text-center">Kaçırılan</th>
                    <th className="border border-gray-300 p-3 text-center">Puan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 font-medium">Bölüm 1</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">{result.section1_correct}</td>
                    <td className="border border-gray-300 p-3 text-center text-red-600">{result.section1_wrong}</td>
                    <td className="border border-gray-300 p-3 text-center text-orange-600">{result.section1_missed}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{result.section1_score}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 font-medium">Bölüm 2</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">{result.section2_correct}</td>
                    <td className="border border-gray-300 p-3 text-center text-red-600">{result.section2_wrong}</td>
                    <td className="border border-gray-300 p-3 text-center text-orange-600">{result.section2_missed}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{result.section2_score}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 font-medium">Bölüm 3</td>
                    <td className="border border-gray-300 p-3 text-center text-green-600">{result.section3_correct}</td>
                    <td className="border border-gray-300 p-3 text-center text-red-600">{result.section3_wrong}</td>
                    <td className="border border-gray-300 p-3 text-center text-orange-600">{result.section3_missed}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold">{result.section3_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dikkat Oranı */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Dikkat Oranı</h3>
            <div className="text-3xl font-bold text-blue-600">
              {(result.attention_ratio * 100).toFixed(2)}%
            </div>
            <p className="text-blue-700 mt-2">
              Bu oran, öğrencinin testteki genel dikkat performansını gösterir.
            </p>
          </div>

          {/* Notlar */}
          {result.notes && (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">Notlar</h3>
              <p className="text-yellow-700">{result.notes}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            background: white !important;
          }
          
          .report-content {
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}