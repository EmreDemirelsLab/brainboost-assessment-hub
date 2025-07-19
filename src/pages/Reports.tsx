import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, FileText, Search, Filter, ArrowLeft, FileSpreadsheet, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { generateBurdonHTMLReport } from "@/components/reports/BurdonPDFTemplate";

export interface BurdonTestResult {
  id: string;
  test_start_time: string;
  test_end_time: string;
  test_elapsed_time_seconds: number;
  test_auto_completed: boolean;
  total_correct: number;
  total_missed: number;
  total_wrong: number;
  total_score: number;
  attention_ratio: number;
  section1_correct: number;
  section1_missed: number;
  section1_wrong: number;
  section1_score: number;
  section2_correct: number;
  section2_missed: number;
  section2_wrong: number;
  section2_score: number;
  section3_correct: number;
  section3_missed: number;
  section3_wrong: number;
  section3_score: number;
  detailed_results: any;
  notes: string | null;
  created_at: string;
  student_name?: string;
  conducted_by_name?: string;
}

export default function Reports() {
  const [burdonResults, setBurdonResults] = useState<BurdonTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<BurdonTestResult | null>(null);
  const { toast } = useToast();
  const { user, switchRole, logout } = useAuth();

  useEffect(() => {
    fetchBurdonResults();
  }, []);

  const fetchBurdonResults = async () => {
    try {
      // İlk olarak test sonuçlarını al
      const { data: results, error: resultsError } = await supabase
        .from('burdon_test_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      // Sonra kullanıcı ve öğrenci bilgilerini ayrı ayrı al
      const formattedResults: BurdonTestResult[] = [];
      
      for (const result of results || []) {
        let studentName = 'Bilinmeyen Öğrenci';
        let conductorName = 'Bilinmeyen Kullanıcı';

        // Öğrenci bilgisini al
        if (result.student_id) {
          const { data: studentData } = await supabase
            .from('students')
            .select('users!students_user_id_fkey(first_name, last_name)')
            .eq('id', result.student_id)
            .single();
          
          if (studentData?.users) {
            studentName = `${studentData.users.first_name} ${studentData.users.last_name}`;
          }
        }

        // Test yapan kişi bilgisini al
        if (result.conducted_by) {
          const { data: conductorData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', result.conducted_by)
            .single();
          
          if (conductorData) {
            conductorName = `${conductorData.first_name} ${conductorData.last_name}`;
          }
        }

        formattedResults.push({
          ...result,
          student_name: studentName,
          conducted_by_name: conductorName
        });
      }

      setBurdonResults(formattedResults);
    } catch (error) {
      console.error('Error fetching burdon results:', error);
      toast({
        title: "Hata",
        description: "Burdon test sonuçları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = (result: BurdonTestResult) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Ana sonuçlar sayfası
      const mainData = [
        ['BURDON DİKKAT TESTİ SONUÇLARI', ''],
        ['', ''],
        ['Test Bilgileri', ''],
        ['Test ID', result.id.substring(0, 8) + '...'], // ID'yi kısalt
        ['Öğrenci Adı', result.student_name || 'Bilinmeyen'],
        ['Test Yapan', result.conducted_by_name || 'Bilinmeyen'],
        ['Test Başlangıç', new Date(result.test_start_time).toLocaleString('tr-TR')],
        ['Test Bitiş', new Date(result.test_end_time).toLocaleString('tr-TR')],
        ['Test Süresi (saniye)', result.test_elapsed_time_seconds],
        ['Otomatik Tamamlandı', result.test_auto_completed ? 'Evet' : 'Hayır'],
        ['', ''],
        ['TOPLAM SONUÇLAR', ''],
        ['Toplam Doğru', result.total_correct],
        ['Toplam Kaçırılan', result.total_missed],
        ['Toplam Yanlış', result.total_wrong],
        ['Toplam Puan', result.total_score],
        ['Dikkat Oranı', result.attention_ratio.toFixed(6)],
        ['', ''],
        ['BÖLÜM SONUÇLARI', ''],
        ['', 'Bölüm 1', 'Bölüm 2', 'Bölüm 3'],
        ['Doğru', result.section1_correct, result.section2_correct, result.section3_correct],
        ['Kaçırılan', result.section1_missed, result.section2_missed, result.section3_missed],
        ['Yanlış', result.section1_wrong, result.section2_wrong, result.section3_wrong],
        ['Puan', result.section1_score, result.section2_score, result.section3_score],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(mainData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Sonuçları');

      // Detaylı veri sayfasını basit tut
      if (result.detailed_results) {
        const detailedData = [
          ['DETAYLI TEST BİLGİLERİ', ''],
          ['', ''],
          ['Test Süresi', result.test_elapsed_time_seconds + ' saniye'],
          ['Başlangıç Zamanı', new Date(result.test_start_time).toLocaleString('tr-TR')],
          ['Bitiş Zamanı', new Date(result.test_end_time).toLocaleString('tr-TR')],
          ['Hedef Karakterler', result.detailed_results?.target_chars?.join(', ') || 'a, b, d, g'],
          ['', ''],
          ['Not: Detaylı grid verileri dosya boyutu nedeniyle dahil edilmemiştir.']
        ];
        const detailedWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Detaylı Veriler');
      }

      const fileName = `Burdon_Test_${result.student_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Test'}_${new Date(result.created_at).toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Başarılı",
        description: "Excel raporu indirildi.",
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: "Hata",
        description: "Excel raporu oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = (result: BurdonTestResult) => {
    try {
      // HTML template'ini oluştur
      const htmlContent = generateBurdonHTMLReport(result);
      
      // Yeni pencere aç ve HTML'i yazdır
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Yazdırma işlemi tamamlandıktan sonra pencereyi kapat
        printWindow.onafterprint = () => {
          printWindow.close();
        };
        
        // Kısa bir gecikme sonrası yazdır
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      toast({
        title: "Başarılı",
        description: "PDF raporu oluşturuldu ve yazdırma penceresi açıldı.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Hata",
        description: "PDF raporu oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const filteredResults = burdonResults.filter(result => {
    const searchLower = searchTerm.toLowerCase();
    return result.student_name?.toLowerCase().includes(searchLower) ||
           result.conducted_by_name?.toLowerCase().includes(searchLower) ||
           result.id.toLowerCase().includes(searchLower);
  });

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <DashboardLayout
        user={user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roles: user.roles,
          currentRole: user.currentRole,
        } : undefined}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Burdon test sonuçları yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (selectedResult) {
    return (
      <DashboardLayout
        user={user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roles: user.roles,
          currentRole: user.currentRole,
        } : undefined}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedResult(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Test Detayları</h1>
                <p className="text-muted-foreground">
                  {selectedResult.student_name} - {new Date(selectedResult.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => exportToExcel(selectedResult)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
              <Button onClick={() => exportToPDF(selectedResult)}>
                <FileText className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </div>

          {/* Test Özeti */}
          <Card>
            <CardHeader>
              <CardTitle>Test Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedResult.total_correct}</div>
                  <div className="text-sm text-muted-foreground">Doğru</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedResult.total_missed}</div>
                  <div className="text-sm text-muted-foreground">Kaçırılan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedResult.total_wrong}</div>
                  <div className="text-sm text-muted-foreground">Yanlış</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedResult.total_score}</div>
                  <div className="text-sm text-muted-foreground">Toplam Puan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bölüm Detayları */}
          <Card>
            <CardHeader>
              <CardTitle>Bölüm Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bölüm</TableHead>
                    <TableHead>Doğru</TableHead>
                    <TableHead>Kaçırılan</TableHead>
                    <TableHead>Yanlış</TableHead>
                    <TableHead>Puan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Bölüm 1</TableCell>
                    <TableCell>{selectedResult.section1_correct}</TableCell>
                    <TableCell>{selectedResult.section1_missed}</TableCell>
                    <TableCell>{selectedResult.section1_wrong}</TableCell>
                    <TableCell>{selectedResult.section1_score}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bölüm 2</TableCell>
                    <TableCell>{selectedResult.section2_correct}</TableCell>
                    <TableCell>{selectedResult.section2_missed}</TableCell>
                    <TableCell>{selectedResult.section2_wrong}</TableCell>
                    <TableCell>{selectedResult.section2_score}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bölüm 3</TableCell>
                    <TableCell>{selectedResult.section3_correct}</TableCell>
                    <TableCell>{selectedResult.section3_missed}</TableCell>
                    <TableCell>{selectedResult.section3_wrong}</TableCell>
                    <TableCell>{selectedResult.section3_score}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Test Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Test Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Test Süresi:</strong> {selectedResult.test_elapsed_time_seconds} saniye
                </div>
                <div>
                  <strong>Dikkat Oranı:</strong> {selectedResult.attention_ratio.toFixed(6)}
                </div>
                <div>
                  <strong>Otomatik Tamamlandı:</strong> {selectedResult.test_auto_completed ? 'Evet' : 'Hayır'}
                </div>
                <div>
                  <strong>Test Tarihi:</strong> {new Date(selectedResult.created_at).toLocaleString('tr-TR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      user={user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      } : undefined}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Burdon Test Raporları</h1>
              <p className="text-muted-foreground">
                Burdon dikkat testi sonuçlarını görüntüleyebilir ve indirebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arama</CardTitle>
            <CardDescription>
              Test sonuçlarını öğrenci adı, test yapan kişi veya test ID'sine göre arayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci adı, test yapan veya test ID ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Sonuçları</CardTitle>
            <CardDescription>
              Toplam {filteredResults.length} test sonucu bulundu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz test sonucu bulunmuyor.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead>Test Yapan</TableHead>
                    <TableHead>Toplam Puan</TableHead>
                    <TableHead>Doğru/Yanlış/Kaçırılan</TableHead>
                    <TableHead>Test Tarihi</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.student_name}</TableCell>
                      <TableCell>{result.conducted_by_name}</TableCell>
                      <TableCell>
                        <Badge variant={result.total_score >= 0 ? "default" : "destructive"}>
                          {result.total_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600">{result.total_correct}</span>/
                        <span className="text-red-600">{result.total_wrong}</span>/
                        <span className="text-orange-600">{result.total_missed}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(result.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detay
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDF(result)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToExcel(result)}
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
