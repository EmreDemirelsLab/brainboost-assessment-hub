import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { BurdonTestResult } from "@/pages/Reports";

interface BurdonReportModalProps {
  result: BurdonTestResult | null;
  open: boolean;
  onClose: () => void;
}

export function BurdonReportModal({ result, open, onClose }: BurdonReportModalProps) {
  if (!result) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('modal-report-content');
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Burdon Test Raporu</title>
              <style>
                @page { margin: 1cm; size: A4; }
                body { 
                  font-family: Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  margin: 0; 
                  padding: 20px;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  padding: 20px; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  border-radius: 8px; 
                }
                .metrics-grid { 
                  display: grid; 
                  grid-template-columns: repeat(4, 1fr); 
                  gap: 15px; 
                  margin: 30px 0; 
                }
                .metric-card { 
                  background: #f8f9fa; 
                  padding: 20px; 
                  border-radius: 8px; 
                  text-align: center; 
                  border-left: 4px solid #667eea; 
                }
                .metric-value { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #333; 
                }
                .metric-label { 
                  font-size: 12px; 
                  color: #666; 
                  margin-top: 5px; 
                }
                .section { 
                  margin: 30px 0; 
                  padding: 20px; 
                  background: white; 
                  border-radius: 8px; 
                  border: 1px solid #e9ecef; 
                }
                .section-title { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 15px; 
                  color: #495057; 
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-top: 15px; 
                }
                th, td { 
                  padding: 12px; 
                  text-align: left; 
                  border-bottom: 1px solid #dee2e6; 
                }
                th { 
                  background: #f8f9fa; 
                  font-weight: 600; 
                }
                .attention-section {
                  background: #e3f2fd;
                  border: 1px solid #2196f3;
                  border-radius: 8px;
                  padding: 20px;
                  text-align: center;
                  margin: 20px 0;
                }
                .attention-value {
                  font-size: 32px;
                  font-weight: bold;
                  color: #1976d2;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

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
                Yazdır / PDF
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