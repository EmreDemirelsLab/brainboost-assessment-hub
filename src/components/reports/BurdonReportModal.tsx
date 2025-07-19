import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { BurdonTestResult } from "@/pages/Reports";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';

interface BurdonReportModalProps {
  resultId: string | null;
  open: boolean;
  onClose: () => void;
}

export function BurdonReportModal({ resultId, open, onClose }: BurdonReportModalProps) {
  const [result, setResult] = useState<BurdonTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Her modal açıldığında fresh data çek
  useEffect(() => {
    if (open && resultId) {
      fetchResult();
    }
  }, [open, resultId]);

  const fetchResult = async () => {
    if (!resultId) return;
    
    try {
      setLoading(true);
      console.log('Fetching result for ID:', resultId);
      
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

      const formattedResult = {
        ...resultData,
        student_name: studentName,
        conducted_by_name: conductorName
      };

      setResult(formattedResult);
      console.log('Result fetched successfully:', formattedResult);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    if (!result) return;
    
    const testDate = new Date(result.created_at).toLocaleDateString('tr-TR');
    const startTime = new Date(result.test_start_time).toLocaleTimeString('tr-TR');
    const endTime = new Date(result.test_end_time).toLocaleTimeString('tr-TR');
    const durationMinutes = Math.floor(result.test_elapsed_time_seconds / 60);
    const durationSeconds = result.test_elapsed_time_seconds % 60;
    
    // PDF içeriği - Kısaltılmış versiyon
    let yPosition = 20;
    
    // Başlık
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BURDON DİKKAT TESTİ RAPORU', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Test Bilgileri
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Öğrenci: ${result.student_name}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Test Yapan: ${result.conducted_by_name}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Test Tarihi: ${testDate}`, 20, yPosition);
    yPosition += 7;
    pdf.text(`Süre: ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`, 20, yPosition);
    yPosition += 12;
    
    // Performans Metrikleri
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERFORMANS', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Doğru: ${result.total_correct}`, 20, yPosition);
    pdf.text(`Yanlış: ${result.total_wrong}`, 70, yPosition);
    pdf.text(`Kaçırılan: ${result.total_missed}`, 120, yPosition);
    yPosition += 6;
    pdf.text(`Toplam Puan: ${result.total_score}`, 20, yPosition);
    yPosition += 12;
    
    // Dikkat Oranı
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DİKKAT ORANI', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(14);
    pdf.text(`${(result.attention_ratio * 100).toFixed(2)}%`, 20, yPosition);
    
    // PDF'i yeni sekmede aç
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  if (!open) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Rapor yükleniyor...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!result) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-8">
            <p>Rapor bulunamadı veya yüklenirken hata oluştu.</p>
            <Button onClick={onClose} className="mt-4">Kapat</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const testDate = new Date(result.created_at).toLocaleDateString('tr-TR');
  const startTime = new Date(result.test_start_time).toLocaleTimeString('tr-TR');
  const endTime = new Date(result.test_end_time).toLocaleTimeString('tr-TR');
  const durationMinutes = Math.floor(result.test_elapsed_time_seconds / 60);
  const durationSeconds = result.test_elapsed_time_seconds % 60;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Burdon Test Raporu Detayı</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
              <Button onClick={onClose} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="modal-report-content" className="space-y-6">
          {/* Header */}
          <div className="text-center bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">BURDON</h1>
            <h2 className="text-xl">Dikkat Testi Raporu</h2>
          </div>

          {/* Test Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-muted-foreground mb-3">Öğrenci Bilgileri</h3>
              <div className="space-y-2">
                <p><strong>Ad Soyad:</strong> {result.student_name}</p>
                <p><strong>Test Tarihi:</strong> {testDate}</p>
                <p><strong>Test Yapan:</strong> {result.conducted_by_name}</p>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-muted-foreground mb-3">Test Detayları</h3>
              <div className="space-y-2">
                <p><strong>Başlangıç:</strong> {startTime}</p>
                <p><strong>Bitiş:</strong> {endTime}</p>
                <p><strong>Süre:</strong> {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}</p>
                <p><strong>Otomatik Tamamlandı:</strong> {result.test_auto_completed ? 'Evet' : 'Hayır'}</p>
              </div>
            </div>
          </div>

          {/* Performans Metrikleri */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{result.total_correct}</div>
              <div className="text-sm text-muted-foreground">Doğru Cevaplar</div>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{result.total_wrong}</div>
              <div className="text-sm text-muted-foreground">Yanlış Cevaplar</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{result.total_missed}</div>
              <div className="text-sm text-muted-foreground">Kaçırılan</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{result.total_score}</div>
              <div className="text-sm text-muted-foreground">Toplam Puan</div>
            </div>
          </div>

          {/* Bölüm Analizi */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Bölümsel Analiz</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Bölüm</th>
                    <th className="text-center p-3 font-semibold">Doğru</th>
                    <th className="text-center p-3 font-semibold">Yanlış</th>
                    <th className="text-center p-3 font-semibold">Kaçırılan</th>
                    <th className="text-center p-3 font-semibold">Puan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Bölüm 1</td>
                    <td className="p-3 text-center text-green-600 font-semibold">{result.section1_correct}</td>
                    <td className="p-3 text-center text-red-600 font-semibold">{result.section1_wrong}</td>
                    <td className="p-3 text-center text-orange-600 font-semibold">{result.section1_missed}</td>
                    <td className="p-3 text-center font-bold">{result.section1_score}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Bölüm 2</td>
                    <td className="p-3 text-center text-green-600 font-semibold">{result.section2_correct}</td>
                    <td className="p-3 text-center text-red-600 font-semibold">{result.section2_wrong}</td>
                    <td className="p-3 text-center text-orange-600 font-semibold">{result.section2_missed}</td>
                    <td className="p-3 text-center font-bold">{result.section2_score}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Bölüm 3</td>
                    <td className="p-3 text-center text-green-600 font-semibold">{result.section3_correct}</td>
                    <td className="p-3 text-center text-red-600 font-semibold">{result.section3_wrong}</td>
                    <td className="p-3 text-center text-orange-600 font-semibold">{result.section3_missed}</td>
                    <td className="p-3 text-center font-bold">{result.section3_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dikkat Oranı */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">Dikkat Oranı</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {(result.attention_ratio * 100).toFixed(2)}%
              </div>
              <p className="text-blue-700">
                Bu oran, öğrencinin testteki genel dikkat performansını gösterir.
              </p>
            </div>
          </div>

          {/* Notlar */}
          {result.notes && (
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-yellow-800 mb-3">Notlar</h3>
              <p className="text-yellow-700">{result.notes}</p>
            </div>
          )}

          {/* Rapor Bilgileri */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Bu rapor {new Date().toLocaleDateString('tr-TR')} tarihinde oluşturulmuştur.</p>
            <p>Test ID: {result.id.substring(0, 8)}...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}