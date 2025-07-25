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
import { Link, useNavigate } from "react-router-dom";
import { BurdonReportModal } from "@/components/reports/BurdonReportModal";
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
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [burdonResults, setBurdonResults] = useState<BurdonTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<BurdonTestResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedTest === 'burdon') {
      console.log('Fetching burdon results for student:', selectedStudent.id);
      setLoading(true);
      fetchBurdonResults();
    }
  }, [selectedStudent, selectedTest]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          student_number,
          birth_date,
          grade_level,
          users!students_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStudents = studentsData?.map(student => ({
        ...student,
        full_name: student.users ? `${student.users.first_name} ${student.users.last_name}` : 'Bilinmeyen Öğrenci'
      })) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBurdonResults = async () => {
    if (!selectedStudent) return;
    try {
      const { data: results, error: resultsError } = await supabase
        .from('burdon_test_results')
        .select('*')
        .eq('student_id', selectedStudent.id)
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
          conducted_by_name: conductorName,
          // Add default values for missing BurdonTestResult properties
          total_correct: 0,
          total_missed: 0,
          total_wrong: 0,
          total_score: 0,
          attention_ratio: 0,
          section1_correct: 0,
          section1_missed: 0,
          section1_wrong: 0,
          section1_score: 0,
          section2_correct: 0,
          section2_missed: 0,
          section2_wrong: 0,
          section2_score: 0,
          section3_correct: 0,
          section3_missed: 0,
          section3_wrong: 0,
          section3_score: 0,
          detailed_results: null,
          notes: null
        } as BurdonTestResult);
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
      // Burdon premium template'ini burdon-premium-report.html'den kullan
      const testDate = new Date(result.created_at).toLocaleDateString('tr-TR');
      const startTime = new Date(result.test_start_time).toLocaleTimeString('tr-TR');
      const endTime = new Date(result.test_end_time).toLocaleTimeString('tr-TR');
      const durationMinutes = Math.floor(result.test_elapsed_time_seconds / 60);
      const durationSeconds = result.test_elapsed_time_seconds % 60;
      
      // Premium HTML template
      const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Burdon Dikkat Testi - Premium Analiz Raporu</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        /* === PDF OPTIMIZATION === */
        @page {
            margin: 15mm;
            size: A4;
        }

        @media print {
            body { 
                margin: 0; 
                font-size: 10pt; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
            .page-break-avoid { page-break-inside: avoid; }
        }

        /* === VARIABLES === */
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #e0e7ff;
            --secondary: #06b6d4;
            --accent: #f59e0b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --neutral-50: #fafafa;
            --neutral-100: #f5f5f5;
            --neutral-200: #e5e5e5;
            --neutral-300: #d4d4d4;
            --neutral-400: #a3a3a3;
            --neutral-500: #737373;
            --neutral-600: #525252;
            --neutral-700: #404040;
            --neutral-800: #262626;
            --neutral-900: #171717;
        }

        /* === BASE STYLES === */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            line-height: 1.7;
            color: var(--neutral-800);
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            font-size: 14px;
            letter-spacing: -0.025em;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 24px;
            background: white;
            min-height: 100vh;
        }

        /* === HEADER === */
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--secondary) 100%);
            margin: -24px -24px 48px -24px;
            padding: 48px 48px 60px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .title-container {
            text-align: center;
            background: white;
            border-radius: 20px;
            padding: 28px 48px;
            margin: 0 auto 24px;
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }

        .title-accent {
            font-size: 1.6rem;
            font-weight: 600;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }

        .title-main {
            font-size: 2.8rem;
            font-weight: 400;
            color: #1e293b;
            letter-spacing: -0.01em;
            line-height: 1.1;
        }

        /* === METRICS === */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin: 40px 0;
        }

        .metric-card {
            background: white;
            border-radius: 20px;
            padding: 32px 24px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border: 1px solid var(--neutral-200);
            text-align: center;
            transition: transform 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-4px);
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary);
        }

        .metric-card.success::before { background: var(--success); }
        .metric-card.warning::before { background: var(--warning); }
        .metric-card.danger::before { background: var(--danger); }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 8px;
            color: var(--neutral-800);
        }

        .metric-label {
            font-size: 0.95rem;
            color: var(--neutral-600);
            font-weight: 500;
        }

        /* === TABLE === */
        .analysis-table {
            width: 100%;
            border-collapse: collapse;
            margin: 32px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .analysis-table th {
            background: var(--primary);
            color: white;
            padding: 16px;
            text-align: left;
            font-weight: 600;
        }

        .analysis-table td {
            padding: 16px;
            border-bottom: 1px solid var(--neutral-200);
        }

        .analysis-table tbody tr:hover {
            background: var(--neutral-50);
        }

        /* === INFO SECTION === */
        .info-section {
            background: white;
            border-radius: 16px;
            padding: 32px;
            margin: 32px 0;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--neutral-800);
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--neutral-200);
        }

        .info-label {
            font-weight: 600;
            color: var(--neutral-600);
        }

        .info-value {
            font-weight: 500;
            color: var(--neutral-800);
        }

        .footer {
            text-align: center;
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid var(--neutral-200);
            color: var(--neutral-600);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title-container">
                <div class="title-accent">BURDON</div>
                <div class="title-main">Dikkat Testi Raporu</div>
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card success">
                <div class="metric-value">${result.total_correct}</div>
                <div class="metric-label">Doğru Cevaplar</div>
            </div>
            <div class="metric-card warning">
                <div class="metric-value">${result.total_missed}</div>
                <div class="metric-label">Kaçırılan</div>
            </div>
            <div class="metric-card danger">
                <div class="metric-value">${result.total_wrong}</div>
                <div class="metric-label">Yanlış Cevaplar</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${result.total_score}</div>
                <div class="metric-label">Toplam Puan</div>
            </div>
        </div>

        <div class="info-section">
            <h2 class="section-title">📋 Test Bilgileri</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">👤 Öğrenci Adı:</span>
                    <span class="info-value">${result.student_name || 'Bilinmeyen'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">👨‍🏫 Test Yapan:</span>
                    <span class="info-value">${result.conducted_by_name || 'Bilinmeyen'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">📅 Test Tarihi:</span>
                    <span class="info-value">${testDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🕐 Başlangıç:</span>
                    <span class="info-value">${startTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🕑 Bitiş:</span>
                    <span class="info-value">${endTime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">⏱️ Test Süresi:</span>
                    <span class="info-value">${durationMinutes}d ${durationSeconds}s</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🎯 Dikkat Oranı:</span>
                    <span class="info-value">${(result.attention_ratio * 100).toFixed(2)}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">🤖 Otomatik Tamamlandı:</span>
                    <span class="info-value">${result.test_auto_completed ? 'Evet' : 'Hayır'}</span>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h2 class="section-title">📊 Bölüm Detayları</h2>
            <table class="analysis-table">
                <thead>
                    <tr>
                        <th>Bölüm</th>
                        <th>✅ Doğru</th>
                        <th>⚠️ Kaçırılan</th>
                        <th>❌ Yanlış</th>
                        <th>🏆 Puan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Bölüm 1</strong></td>
                        <td>${result.section1_correct}</td>
                        <td>${result.section1_missed}</td>
                        <td>${result.section1_wrong}</td>
                        <td>${result.section1_score}</td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 2</strong></td>
                        <td>${result.section2_correct}</td>
                        <td>${result.section2_missed}</td>
                        <td>${result.section2_wrong}</td>
                        <td>${result.section2_score}</td>
                    </tr>
                    <tr>
                        <td><strong>Bölüm 3</strong></td>
                        <td>${result.section3_correct}</td>
                        <td>${result.section3_missed}</td>
                        <td>${result.section3_wrong}</td>
                        <td>${result.section3_score}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p><strong>ForBrain Gelişim ve Takip Sistemi</strong></p>
            <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
            <p>Rapor Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
    </div>
</body>
</html>`;
      
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
          <div className="text-lg">Yükleniyor...</div>
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

  // Öğrenci seçilmemişse öğrenci listesi göster
  if (!selectedStudent) {
    const filteredStudents = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return student.full_name?.toLowerCase().includes(searchLower) ||
             student.student_number?.toLowerCase().includes(searchLower);
    });

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
                <h1 className="text-3xl font-bold">Test Raporları</h1>
                <p className="text-muted-foreground">
                  Hangi öğrencinin raporlarını görüntülemek istiyorsunuz?
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Öğrenci Arama</CardTitle>
              <CardDescription>
                Öğrenci adı veya numarasına göre arama yapabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Öğrenci adı veya numarası ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Öğrenci Listesi</CardTitle>
              <CardDescription>
                Toplam {filteredStudents.length} öğrenci bulundu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Öğrenci bulunamadı.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card 
                      key={student.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{student.full_name}</CardTitle>
                        <CardDescription>
                          {student.student_number && `Öğrenci No: ${student.student_number}`}
                          {student.grade_level && ` • ${student.grade_level}. Sınıf`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Testleri Görüntüle
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Test seçilmemişse test listesi göster
  if (!selectedTest) {
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
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Öğrenci Listesi
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{selectedStudent.full_name} - Test Raporları</h1>
                <p className="text-muted-foreground">
                  Hangi testin raporlarını görüntülemek istiyorsunuz?
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
              console.log('Burdon card clicked for student:', selectedStudent.id);
              setSelectedTest('burdon');
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Burdon Dikkat Testi
                </CardTitle>
                <CardDescription>
                  Burdon dikkat testi sonuçlarını görüntüleyin ve analiz edin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Raporları Görüntüle
                </Button>
              </CardContent>
            </Card>
          </div>
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
            <Button variant="outline" onClick={() => setSelectedTest(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Test Seçimi
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedStudent.full_name} - Burdon Test Raporları</h1>
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
                            onClick={() => {
                              console.log('Detay button clicked for result:', result.id);
                              setSelectedResultId(result.id);
                              setModalOpen(true);
                            }}
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

        <BurdonReportModal 
          resultId={selectedResultId}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedResultId(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
