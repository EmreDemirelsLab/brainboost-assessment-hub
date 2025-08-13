import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, FileText, Search, Filter, ArrowLeft, Brain, Eye, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import BurdonReportModal from "@/components/reports/BurdonReportModal";
import D2ReportModal from "@/components/reports/D2ReportModal";
import CognitiveReportModal from "@/components/reports/CognitiveReportModal";

// Burdon test results interface
interface BurdonTestResult {
  id: string;
  student_id: string;
  created_at: string;
  student_name?: string;
  conducted_by_name?: string;
  [key: string]: any; // For flexibility with other properties
}

// D2 test results interface
interface D2TestResult {
  id: string;
  student_id: string;
  created_at: string;
  student_name?: string;
  conducted_by_name?: string;
  attention_stability: number | null;
  commission_errors: number | null;
  omission_errors: number | null;
  correct_selections: number | null;
  total_score: number | null;
  concentration_performance: number | null;
  total_items_processed: number | null;
  test_duration_seconds: number | null;
  fluctuation_rate: number | null;
  [key: string]: any;
}

// Cognitive test results interface
interface CognitiveTestResult {
  id: string;
  session_id: string;
  student_id: string;
  conducted_by: string;
  test_start_time: string;
  test_end_time: string;
  duration_seconds: number;
  dikkat_skoru: number;
  hafiza_skoru: number;
  isleme_hizi_skoru: number;
  gorsel_isleme_skoru: number;
  akil_mantik_yurutme_skoru: number;
  bilissel_esneklik_skoru: number;
  alt_test_ozetleri?: any;
  created_at: string;
  student_name?: string;
  conducted_by_name?: string;
  [key: string]: any;
}

export default function Reports() {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentTestCounts, setStudentTestCounts] = useState<{[key: string]: {burdon: number, d2: number, cognitive: number}}>({});
  const [burdonResults, setBurdonResults] = useState<BurdonTestResult[]>([]);
  const [d2Results, setD2Results] = useState<D2TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<BurdonTestResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [selectedModalData, setSelectedModalData] = useState<{student: any, testResult: any} | null>(null);
  
  // D2 Modal states
  const [selectedD2Result, setSelectedD2Result] = useState<D2TestResult | null>(null);
  const [d2ModalOpen, setD2ModalOpen] = useState(false);
  const [selectedD2ModalData, setSelectedD2ModalData] = useState<{student: any, testResult: any} | null>(null);
  
  // Cognitive Modal states
  const [cognitiveResults, setCognitiveResults] = useState<CognitiveTestResult[]>([]);
  const [selectedCognitiveResult, setSelectedCognitiveResult] = useState<CognitiveTestResult | null>(null);
  const [cognitiveModalOpen, setCognitiveModalOpen] = useState(false);
  const [selectedCognitiveModalData, setSelectedCognitiveModalData] = useState<{student: any, testResult: any} | null>(null);
  const { toast } = useToast();
  const { user, switchRole, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Auth yüklenene kadar bekle
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Basit rol kontrolü - user varsa kontrol et
  const canViewReports = user?.roles?.includes('admin') || 
                         user?.roles?.includes('temsilci') || 
                         user?.roles?.includes('beyin_antrenoru');

  if (user && !canViewReports) {
    return (
      <DashboardLayout
        user={user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roles: user.roles,
          currentRole: user.currentRole,
        } : undefined}
        onRoleSwitch={(role: any) => switchRole(role)}
        onLogout={logout}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Erişim Yetkisi Yok</h2>
            <p className="text-muted-foreground">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchStudents();
  }, [user?.currentRole, user?.id]); // Rol değişince yeniden çek

  useEffect(() => {
    if (students.length > 0) {
      fetchAllStudentTestCounts();
    }
  }, [students]);

  useEffect(() => {
    if (selectedStudent && selectedTest === 'burdon') {
      console.log('Fetching burdon results for student:', selectedStudent.id);
      setLoading(true);
      fetchBurdonResults();
    } else if (selectedStudent && selectedTest === 'd2') {
      console.log('Fetching D2 results for student:', selectedStudent.id);
      setLoading(true);
      fetchD2Results();
    }
  }, [selectedStudent, selectedTest]);

  useEffect(() => {
    if (selectedResultId && modalOpen) {
      fetchModalData(selectedResultId);
    }
  }, [selectedResultId, modalOpen]);

  const fetchAllStudentTestCounts = async () => {
    const counts: {[key: string]: {burdon: number, d2: number, cognitive: number}} = {};
    
    // Tüm öğrenciler için paralel sorgu oluştur
    const promises = students.map(async (student) => {
      // Her öğrenci için 3 test tipini paralel sorgula
      const [burdonResult, d2Result, cognitiveResult] = await Promise.all([
        // Burdon test sayısı
        supabase
          .from('burdon_test_results')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id),
        
        // D2 test sayısı
        supabase
          .from('d2_test_results')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id),
        
        // Cognitive test sayısı
        supabase
          .from('cognitive_test_result' as any)
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)
      ]);
      
      return {
        studentId: student.id,
        counts: {
          burdon: burdonResult.count || 0,
          d2: d2Result.count || 0,
          cognitive: cognitiveResult.count || 0
        }
      };
    });
    
    // Tüm öğrenci sorgularını paralel çalıştır
    const results = await Promise.all(promises);
    
    // Sonuçları counts objesine dönüştür
    results.forEach(result => {
      counts[result.studentId] = result.counts;
    });
    
    setStudentTestCounts(counts);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.error('❌ User not found');
        return;
      }

      console.log('🔍 Reports - Fetching students for role:', user.currentRole);
      
      // Dinamik rol kategorisi belirleme
      const isAdminRole = user.currentRole === 'admin';
      const isTrainerRole = user.currentRole === 'beyin_antrenoru';
      const isRepresentativeRole = user.currentRole === 'temsilci';
      
      // Dinamik query builder - role göre filtering
      let query = supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          supervisor_id,
          demographic_info,
          created_at
        `)
        .contains('roles', '["kullanici"]'); // Sadece öğrenciler - JSON string formatı

      // Rol bazlı dinamik filtering
      if (isAdminRole) {
        console.log('👑 Admin - showing all students for reports');
      } else if (isRepresentativeRole) {
        console.log('🎯 Representative - showing students of supervised trainers for reports');
        // Temsilci kendi altındaki beyin antrenörlerinin öğrencilerini görür
        const { data: trainersData } = await supabase
          .from('users')
          .select('id')
          .contains('roles', '["beyin_antrenoru"]')
          .eq('supervisor_id', user.id);
        
        const trainerIds = trainersData?.map(t => t.id) || [];
        if (trainerIds.length > 0) {
          query = query.in('supervisor_id', trainerIds);
        } else {
          query = query.limit(0);
        }
      } else if (isTrainerRole) {
        console.log('🎯 Trainer - showing only supervised students for reports');
        query = query.eq('supervisor_id', user.id);
      } else {
        console.log('👤 Other role - no students for reports');
        query = query.limit(0);
      }

      const { data: studentsData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Format for compatibility with existing interface
      const formattedStudents = studentsData?.map(student => {
        const demographicInfo = student.demographic_info as any;
        return {
          id: student.id,
          student_number: demographicInfo?.student_number || `STU-${student.id.slice(-8)}`,
          birth_date: demographicInfo?.birth_date || null,
          grade_level: demographicInfo?.grade_level || null,
          full_name: `${student.first_name} ${student.last_name}`,
          users: {
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email
          }
        };
      }) || [];

      console.log('✅ Reports Students loaded:', formattedStudents.length);
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
      setInitialLoading(false);
    }
  };

  const fetchBurdonResults = async () => {
    if (!selectedStudent) return;
    try {
      console.log('🔍 Fetching burdon results for student:', selectedStudent.id);
      console.log('🔍 Current user role:', user?.currentRole);
      console.log('🔍 Current user ID:', user?.id);
      
      // RLS BYPASS TEST - geçici olarak admin user ile deneme
      let query = supabase
        .from('burdon_test_results')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: false });
      
      // Debug için: RLS bypass olmadan önce de test et
      console.log('🔧 Testing with RLS policies...');
      const { data: results, error: resultsError } = await query;
      
      // Eğer results boşsa, veri var mı diye count kontrolü yap
      if (!results || results.length === 0) {
        console.log('🔧 No results with RLS, checking total records for this student...');
        const { count } = await supabase
          .from('burdon_test_results')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', selectedStudent.id);
        console.log('📊 Total burdon records for this student (with RLS):', count);
      }

      console.log('📊 Burdon results query response:', { results, error: resultsError });
      console.log('📊 Results array length:', results?.length || 0);
      console.log('📊 Error message:', resultsError?.message || 'No error');

      if (resultsError) throw resultsError;

      // Tüm kullanıcı bilgilerini paralel olarak al
      const userIds = new Set<string>();
      results?.forEach(result => {
        if (result.student_id) userIds.add(result.student_id);
        if (result.conducted_by) userIds.add(result.conducted_by);
      });

      // Tüm unique kullanıcıları tek sorguda al
      const userMap: Record<string, {first_name: string, last_name: string}> = {};
      if (userIds.size > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', Array.from(userIds));
        
        usersData?.forEach(user => {
          userMap[user.id] = { first_name: user.first_name, last_name: user.last_name };
        });
      }

      // Sonuçları formatla
      const formattedResults: BurdonTestResult[] = (results || []).map(result => {
        const studentUser = userMap[result.student_id];
        const conductorUser = userMap[result.conducted_by];
        
        return {
          ...result,
          student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : 'Bilinmeyen Öğrenci',
          conducted_by_name: conductorUser ? `${conductorUser.first_name} ${conductorUser.last_name}` : 'Bilinmeyen Kullanıcı'
        };
      });

      console.log('✅ Formatted burdon results:', formattedResults);
      setBurdonResults(formattedResults);
    } catch (error) {
      console.error('❌ Error fetching burdon results:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Hata",
        description: `Burdon test sonuçları yüklenirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchD2Results = async () => {
    if (!selectedStudent) return;
    try {
      console.log('🔍 Fetching D2 results for student:', selectedStudent.id);
      
      let query = supabase
        .from('d2_test_results')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('created_at', { ascending: false });
      
      console.log('🔧 Testing D2 with RLS policies...');
      const { data: results, error: resultsError } = await query;
      
      // Eğer results boşsa, veri var mı diye count kontrolü yap
      if (!results || results.length === 0) {
        console.log('🔧 No D2 results with RLS, checking total records for this student...');
        const { count } = await supabase
          .from('d2_test_results')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', selectedStudent.id);
        console.log('📊 Total D2 records for this student (with RLS):', count);
        
        if (count === 0) {
          toast({
            title: "Bilgi",
            description: "Bu öğrenci için henüz D2 test sonucu bulunamadı.",
            variant: "default",
          });
        }
      }

      console.log('📊 D2 results query response:', { results, error: resultsError });
      console.log('📊 D2 Results array length:', results?.length || 0);

      if (resultsError) throw resultsError;

      // Tüm kullanıcı bilgilerini paralel olarak al
      const userIds = new Set<string>();
      results?.forEach(result => {
        if (result.student_id) userIds.add(result.student_id);
        if (result.conducted_by) userIds.add(result.conducted_by);
      });

      // Tüm unique kullanıcıları tek sorguda al
      const userMap: Record<string, {first_name: string, last_name: string}> = {};
      if (userIds.size > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', Array.from(userIds));
        
        usersData?.forEach(user => {
          userMap[user.id] = { first_name: user.first_name, last_name: user.last_name };
        });
      }

      // Sonuçları formatla
      const formattedResults: D2TestResult[] = (results || []).map(result => {
        const studentUser = userMap[result.student_id];
        const conductorUser = userMap[result.conducted_by];
        
        return {
          ...result,
          student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : 'Bilinmeyen Öğrenci',
          conducted_by_name: conductorUser ? `${conductorUser.first_name} ${conductorUser.last_name}` : 'Bilinmeyen Kullanıcı'
        };
      });

      console.log('✅ Formatted D2 results:', formattedResults);
      setD2Results(formattedResults);
    } catch (error) {
      console.error('❌ Error fetching D2 results:', error);
      toast({
        title: "Hata",
        description: `D2 test sonuçları yüklenirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCognitiveResults = async (studentId?: string) => {
    const targetStudentId = studentId || selectedStudent?.id;
    if (!targetStudentId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching cognitive results for student:', targetStudentId);
      
      const { data: results, error: resultsError } = await supabase
        .from('cognitive_test_result' as any)
        .select('*')
        .eq('student_id', targetStudentId)
        .order('created_at', { ascending: false });

      console.log('📊 Cognitive results query response:', { results, error: resultsError });

      if (resultsError) throw resultsError;

      // Tüm kullanıcı bilgilerini paralel olarak al
      const userIds = new Set<string>();
      results?.forEach(result => {
        if (result.student_id) userIds.add(result.student_id);
        if (result.conducted_by) userIds.add(result.conducted_by);
      });

      // Tüm unique kullanıcıları tek sorguda al
      const userMap: Record<string, {first_name: string, last_name: string}> = {};
      if (userIds.size > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', Array.from(userIds));
        
        usersData?.forEach(user => {
          userMap[user.id] = { first_name: user.first_name, last_name: user.last_name };
        });
      }

      // Sonuçları formatla
      const formattedResults = (results || []).map(result => {
        const studentUser = userMap[result.student_id];
        const conductorUser = userMap[result.conducted_by];
        
        return {
          ...result,
          student_name: studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : 'Bilinmeyen Öğrenci',
          conducted_by_name: conductorUser ? `${conductorUser.first_name} ${conductorUser.last_name}` : 'Bilinmeyen'
        } as any;
      });

      console.log('✅ Formatted cognitive results:', formattedResults);
      setCognitiveResults(formattedResults);
    } catch (error: any) {
      console.error('❌ Error fetching cognitive results:', error);
      toast({
        title: "Hata",
        description: `Bilişsel beceri test sonuçları yüklenirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModalData = async (resultId: string) => {
    try {
      setLoading(true);
      
      // Tüm verileri paralel olarak çek
      const [testResultResp, ...userResponses] = await Promise.all([
        // Test sonucunu çek
        supabase
          .from('burdon_test_results')
          .select('*')
          .eq('id', resultId)
          .single()
      ]);

      if (testResultResp.error) throw testResultResp.error;
      const testResult = testResultResp.data;

      // Öğrenci ve test yapan kişi bilgilerini paralel çek
      const [studentResp, trainerResp] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, demographic_info')
          .eq('id', testResult.student_id)
          .single(),
        testResult.conducted_by ? 
          supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', testResult.conducted_by)
            .single()
          : Promise.resolve({ data: null, error: null })
      ]);

      if (studentResp.error) throw studentResp.error;
      const studentData = studentResp.data;
      const trainerData = trainerResp.data;
      const trainerName = trainerData ? `${trainerData.first_name} ${trainerData.last_name}` : 'Beyin Antrenörü';

      // Student verisini format et
      const demographicInfo = studentData.demographic_info as any;
      const formattedStudent = {
        id: studentData.id,
        full_name: `${studentData.first_name} ${studentData.last_name}`,
        birth_date: demographicInfo?.birth_date || '1990-01-01',
        gender: demographicInfo?.gender || 'male',
        trainer_name: trainerName
      };

      // Test sonucunu format et
      const formattedTestResult = {
        id: testResult.id,
        student_id: testResult.student_id,
        section1_correct: testResult.section1_correct || 0,
        section1_wrong: testResult.section1_wrong || 0,
        section1_missed: testResult.section1_missed || 0,
        section2_correct: testResult.section2_correct || 0,
        section2_wrong: testResult.section2_wrong || 0,
        section2_missed: testResult.section2_missed || 0,
        section3_correct: testResult.section3_correct || 0,
        section3_wrong: testResult.section3_wrong || 0,
        section3_missed: testResult.section3_missed || 0,
        total_correct: testResult.total_correct || 0,
        total_wrong: testResult.total_wrong || 0,
        total_missed: testResult.total_missed || 0,
        performance_percentage: Math.round(((testResult.total_correct || 0) / ((testResult.total_correct || 0) + (testResult.total_missed || 0) + (testResult.total_wrong || 0))) * 100) || 0,
        created_at: testResult.created_at
      };

      setSelectedModalData({
        student: formattedStudent,
        testResult: formattedTestResult
      });

    } catch (error) {
      console.error('Error fetching modal data:', error);
      toast({
        title: "Hata",
        description: "Rapor verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchD2ModalData = async (resultId: string) => {
    try {
      setLoading(true);
      
      // Test sonucunu çek
      const { data: testResult, error: testError } = await supabase
        .from('d2_test_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (testError) throw testError;

      // Öğrenci ve test yapan kişi bilgilerini paralel çek
      const [studentResp, trainerResp] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, demographic_info')
          .eq('id', testResult.student_id)
          .single(),
        testResult.conducted_by ? 
          supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', testResult.conducted_by)
            .single()
          : Promise.resolve({ data: null, error: null })
      ]);

      if (studentResp.error) throw studentResp.error;
      const studentData = studentResp.data;
      const trainerData = trainerResp.data;
      const trainerName = trainerData ? `${trainerData.first_name} ${trainerData.last_name}` : 'Beyin Antrenörü';

      // Student verisini format et
      const demographicInfo = studentData.demographic_info as any;
      const formattedStudent = {
        id: studentData.id,
        full_name: `${studentData.first_name} ${studentData.last_name}`,
        birth_date: demographicInfo?.birth_date || '1990-01-01',
        gender: demographicInfo?.gender || 'male',
        trainer_name: trainerName
      };

      // D2 test sonucunu format et
      const formattedTestResult = {
        id: testResult.id,
        student_id: testResult.student_id,
        created_at: testResult.created_at,
        attention_stability: testResult.attention_stability || 0,
        commission_errors: testResult.commission_errors || 0,
        omission_errors: testResult.omission_errors || 0,
        correct_selections: testResult.correct_selections || 0,
        total_score: testResult.total_score || 0,
        concentration_performance: testResult.concentration_performance || 0,
        total_items_processed: testResult.total_items_processed || 0,
        test_duration_seconds: testResult.test_duration_seconds || 0,
        fluctuation_rate: testResult.fluctuation_rate || 0,
        total_net_performance: testResult.total_net_performance || 0,
        processing_speed: testResult.processing_speed || 0,
        total_errors: testResult.total_errors || 0,
        line_results: testResult.line_results || []
      };

      setSelectedD2ModalData({
        student: formattedStudent,
        testResult: formattedTestResult
      });

    } catch (error) {
      console.error('Error fetching D2 modal data:', error);
      toast({
        title: "Hata",
        description: "D2 rapor verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCognitiveModalData = async (resultId: string) => {
    try {
      setLoading(true);
      
      // Cognitive test sonucunu çek
      const { data: testResult, error: testError } = await supabase
        .from('cognitive_test_result' as any)
        .select('*')
        .eq('id', resultId)
        .single();

      if (testError) throw testError;
      const cognitiveResult = testResult as any;

      // Student bilgilerini çek
      const { data: studentData, error: studentError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          demographic_info
        `)
        .eq('id', cognitiveResult.student_id)
        .single();

      if (studentError) throw studentError;

      // Supervisor/Trainer ismini çek
      let trainerName = 'Beyin Antrenörü';
      if (testResult.conducted_by) {
        const { data: trainerData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', testResult.conducted_by)
          .single();
        
        if (trainerData) {
          trainerName = `${trainerData.first_name} ${trainerData.last_name}`;
        }
      }

      // Student verisini format et
      const demographicInfo = studentData.demographic_info as any;
      const formattedStudent = {
        id: studentData.id,
        name: `${studentData.first_name} ${studentData.last_name}`,
        birth_date: demographicInfo?.birth_date || '1990-01-01',
        gender: demographicInfo?.gender || 'male',
        trainer_name: trainerName
      };

      // Cognitive test sonucunu format et
      const formattedTestResult = {
        id: testResult.id,
        session_id: testResult.session_id,
        student_id: testResult.student_id,
        conducted_by: testResult.conducted_by,
        test_start_time: testResult.test_start_time,
        test_end_time: testResult.test_end_time,
        duration_seconds: testResult.duration_seconds,
        dikkat_skoru: testResult.dikkat_skoru || 0,
        hafiza_skoru: testResult.hafiza_skoru || 0,
        isleme_hizi_skoru: testResult.isleme_hizi_skoru || 0,
        gorsel_isleme_skoru: testResult.gorsel_isleme_skoru || 0,
        akil_mantik_yurutme_skoru: testResult.akil_mantik_yurutme_skoru || 0,
        bilissel_esneklik_skoru: testResult.bilissel_esneklik_skoru || 0,
        alt_test_ozetleri: testResult.alt_test_ozetleri,
        created_at: testResult.created_at
      };

      setSelectedCognitiveModalData({
        student: formattedStudent,
        testResult: formattedTestResult
      });

    } catch (error) {
      console.error('Error fetching Cognitive modal data:', error);
      toast({
        title: "Hata",
        description: "Bilişsel Beceriler rapor verileri yüklenirken bir hata oluştu.",
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
    // State güncellemesi tamamlanması için kısa bir gecikme
    setTimeout(() => {
      navigate('/dashboard');
    }, 100);
  };

  const handleLogout = () => {
    logout();
  };

  // Loading durumunu kaldırdık, artık sayfayı hep gösteriyoruz

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
              <Button onClick={() => {
                if (selectedResult) {
                  setSelectedResultId(selectedResult.id);
                  setModalOpen(true);
                }
              }}>
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
              {initialLoading ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Yükleniyor...</span>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Öğrenci bulunamadı.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const testCount = studentTestCounts[student.id] || { burdon: 0, d2: 0, cognitive: 0 };
                    const hasAnyTest = testCount.burdon > 0 || testCount.d2 > 0 || testCount.cognitive > 0;
                    
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {student.student_number && !student.student_number.startsWith('STU') && <span>{student.student_number}</span>}
                              {student.grade_level && <span>{student.student_number && !student.student_number.startsWith('STU') ? '• ' : ''}{student.grade_level}. Sınıf</span>}
                              {hasAnyTest && (
                                <span>
                                  • {testCount.burdon + testCount.d2 + testCount.cognitive} test
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {testCount.burdon > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                                setSelectedTest('burdon');
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Burdon
                              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {testCount.burdon}
                              </Badge>
                            </Button>
                          )}
                          {testCount.d2 > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                                setSelectedTest('d2');
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <Search className="h-3.5 w-3.5" />
                              D2
                              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {testCount.d2}
                              </Badge>
                            </Button>
                          )}
                          {testCount.cognitive > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                                await fetchCognitiveResults(student.id);
                                setSelectedTest('cognitive');
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <Brain className="h-3.5 w-3.5" />
                              Bilişsel
                              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                {testCount.cognitive}
                              </Badge>
                            </Button>
                          )}
                          {!hasAnyTest && (
                            <span className="text-sm text-muted-foreground italic">
                              Henüz test yapılmamış
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Test seçim ekranını kaldırdık - artık direkt test sonuçlarına gidiyoruz

  // Burdon test seçildiyse
  if (selectedTest === 'burdon') {
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
            <Button variant="outline" onClick={() => {
              setSelectedStudent(null);
              setSelectedTest(null);
            }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Öğrenci Listesi
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
                              setSelectedResultId(result.id);
                              setModalOpen(true);
                            }}
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

        {selectedModalData && (
          <BurdonReportModal 
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedResultId(null);
              setSelectedModalData(null);
            }}
            student={selectedModalData.student}
            testResult={selectedModalData.testResult}
          />
        )}
      </div>
    </DashboardLayout>
    );
  }

  // D2 test seçildiyse
  if (selectedTest === 'd2') {
    const filteredD2Results = d2Results.filter(result => {
      const searchLower = searchTerm.toLowerCase();
      return result.student_name?.toLowerCase().includes(searchLower) ||
             result.conducted_by_name?.toLowerCase().includes(searchLower) ||
             result.id.toLowerCase().includes(searchLower);
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
              <Button variant="outline" onClick={() => {
                setSelectedStudent(null);
                setSelectedTest(null);
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Öğrenci Listesi
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{selectedStudent.full_name} - D2 Test Raporları</h1>
                <p className="text-muted-foreground">
                  D2 konsantrasyon testi sonuçlarını görüntüleyebilir ve indirebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>D2 Test Sonuçları</CardTitle>
              <CardDescription>
                {selectedStudent.full_name} öğrencisine ait D2 test sonuçları
              </CardDescription>
              <div className="mt-3 p-3 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground font-mono grid grid-cols-4 gap-4">
                  <div><strong>D:</strong> Doğru işaretlemeler</div>
                  <div><strong>E1:</strong> Komisyon hataları</div>
                  <div><strong>E2:</strong> Atlama hataları</div>
                  <div><strong>E:</strong> Toplam hata (E1+E2)</div>
                  <div><strong>CP:</strong> Konsantrasyon (D-E1)</div>
                  <div><strong>TN:</strong> İşlenen madde</div>
                  <div><strong>FR:</strong> Dalgalanma oranı</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Arama yapın..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <Badge variant="outline">
                  Toplam: {filteredD2Results.length} sonuç
                </Badge>
              </div>

              {filteredD2Results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">D2 test sonucu bulunamadı.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Tarihi</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">E1</TableHead>
                      <TableHead className="text-center">E2</TableHead>
                      <TableHead className="text-center">E</TableHead>
                      <TableHead className="text-center">CP</TableHead>
                      <TableHead className="text-center">TN</TableHead>
                      <TableHead className="text-center">FR</TableHead>
                      <TableHead>Test Yapan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredD2Results.map((result) => {
                      // D2 formülleri hesapla
                      const D = result.correct_selections || 0;
                      const E1 = result.commission_errors || 0;
                      const E2 = result.omission_errors || 0;
                      const E = E1 + E2; // Toplam hata
                      const CP = result.concentration_performance || (D - E1); // Konsantrasyon Performansı
                      const TN = result.total_items_processed || 0;
                      const FR = result.fluctuation_rate || 0; // Dalgalanma oranı

                      return (
                        <TableRow key={result.id}>
                          <TableCell>
                            {new Date(result.created_at).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{D}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium text-red-600">{E1}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium text-red-600">{E2}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium text-gray-600">{E}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium text-blue-600">
                              {typeof CP === 'number' ? CP.toFixed(1) : CP}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{TN}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium text-orange-600">
                              {typeof FR === 'number' ? FR.toFixed(1) : FR}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{result.conducted_by_name}</div>
                            </div>
                          </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                // D2 modal'ı aç ve print et
                                await fetchD2ModalData(result.id);
                                setD2ModalOpen(true);
                                // Modal açıldıktan sonra print fonksiyonunu çağır
                                setTimeout(() => {
                                  // D2ReportModal içindeki handlePrint fonksiyonunu çağırmak için
                                  // modal'ın print butonuna click event'i gönder
                                  const printBtn = document.querySelector('.d2-report-modal .export-btn:not(.secondary)') as HTMLButtonElement;
                                  if (printBtn) printBtn.click();
                                }, 1000);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // D2 formüllerini tekrar hesapla
                                const csvD = result.correct_selections || 0;
                                const csvE1 = result.commission_errors || 0;
                                const csvE2 = result.omission_errors || 0;
                                const csvE = csvE1 + csvE2;
                                const csvCP = result.concentration_performance || (csvD - csvE1);
                                const csvTN = result.total_items_processed || 0;
                                const csvFR = result.fluctuation_rate || 0;

                                const csvContent = [
                                  ['D2 Test Formülleri', 'Değer'],
                                  ['Test Tarihi', new Date(result.created_at).toLocaleDateString('tr-TR')],
                                  ['Öğrenci', result.student_name || 'Bilinmeyen'],
                                  ['Test Yapan', result.conducted_by_name || 'Bilinmeyen'],
                                  ['D', csvD],
                                  ['E1', csvE1],
                                  ['E2', csvE2],
                                  ['E', csvE],
                                  ['CP', typeof csvCP === 'number' ? csvCP.toFixed(1) : csvCP],
                                  ['TN', csvTN],
                                  ['FR', typeof csvFR === 'number' ? csvFR.toFixed(1) : csvFR],
                                  ['Test Süresi (saniye)', result.test_duration_seconds || 0]
                                ].map(row => row.join(',')).join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `D2_test_${result.student_name}_${new Date(result.created_at).toLocaleDateString('tr-TR')}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              CSV
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* D2 Report Modal */}
          {selectedD2ModalData && (
            <D2ReportModal 
              isOpen={d2ModalOpen}
              onClose={() => {
                setD2ModalOpen(false);
                setSelectedD2ModalData(null);
              }}
              student={selectedD2ModalData.student}
              testResult={selectedD2ModalData.testResult}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Cognitive test seçildiyse
  if (selectedTest === 'cognitive') {
    const filteredCognitiveResults = cognitiveResults.filter(result => {
      const searchLower = searchTerm.toLowerCase();
      return result.student_name?.toLowerCase().includes(searchLower) ||
             result.conducted_by_name?.toLowerCase().includes(searchLower) ||
             result.id.toLowerCase().includes(searchLower);
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
              <Button variant="outline" onClick={() => {
                setSelectedStudent(null);
                setSelectedTest(null);
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Öğrenci Listesi
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{selectedStudent.full_name} - Bilişsel Beceri Test Raporları</h1>
                <p className="text-muted-foreground">
                  Kapsamlı bilişsel beceri testi sonuçlarını görüntüleyebilir ve indirebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bilişsel Beceri Test Sonuçları</CardTitle>
              <CardDescription>
                {selectedStudent.full_name} öğrencisine ait bilişsel beceri testi sonuçları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Arama yapın..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <Badge variant="outline">
                  Toplam: {filteredCognitiveResults.length} sonuç
                </Badge>
              </div>

              {filteredCognitiveResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Bilişsel beceri testi sonucu bulunamadı.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Tarihi</TableHead>
                      <TableHead className="text-center">Dikkat</TableHead>
                      <TableHead className="text-center">Hafıza</TableHead>
                      <TableHead className="text-center">İşleme Hızı</TableHead>
                      <TableHead className="text-center">Görsel İşleme</TableHead>
                      <TableHead className="text-center">Akıl Yürütme</TableHead>
                      <TableHead className="text-center">Bilişsel Esneklik</TableHead>
                      <TableHead>Test Yapan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCognitiveResults.map((result) => {
                      return (
                        <TableRow key={result.id}>
                          <TableCell>
                            {new Date(result.created_at).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.dikkat_skoru || 0}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.hafiza_skoru || 0}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.isleme_hizi_skoru || 0}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.gorsel_isleme_skoru || 0}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.akil_mantik_yurutme_skoru || 0}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-mono text-sm font-medium">{result.bilissel_esneklik_skoru || 0}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{result.conducted_by_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Cognitive report HTML sayfasını aç
                                  // localStorage'dan anon_key'i al veya default key kullan
                                  const anonKey = localStorage.getItem('sb-anon-key');
                                  if (!anonKey) {
                                    console.error('Anon key missing from localStorage');
                                    return;
                                  }
                                  const reportUrl = `/coginitiveetemp.html?session_id=${result.session_id}&anon_key=${encodeURIComponent(anonKey)}`;
                                  window.open(reportUrl, '_blank');
                                }}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const csvContent = [
                                    ['Bilişsel Beceri Test Sonuçları', 'Değer'],
                                    ['Test Tarihi', new Date(result.created_at).toLocaleDateString('tr-TR')],
                                    ['Öğrenci', result.student_name || 'Bilinmeyen'],
                                    ['Test Yapan', result.conducted_by_name || 'Bilinmeyen'],
                                    ['Dikkat Skoru', result.dikkat_skoru || 0],
                                    ['Hafıza Skoru', result.hafiza_skoru || 0],
                                    ['İşleme Hızı Skoru', result.isleme_hizi_skoru || 0],
                                    ['Görsel İşleme Skoru', result.gorsel_isleme_skoru || 0],
                                    ['Akıl Yürütme Skoru', result.akil_mantik_yurutme_skoru || 0],
                                    ['Bilişsel Esneklik Skoru', result.bilissel_esneklik_skoru || 0],
                                    ['Test Süresi (saniye)', result.duration_seconds || 0]
                                  ].map(row => row.join(',')).join('\n');
                                  
                                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                  const link = document.createElement('a');
                                  const url = URL.createObjectURL(blob);
                                  link.setAttribute('href', url);
                                  link.setAttribute('download', `Cognitive_test_${result.student_name}_${new Date(result.created_at).toLocaleDateString('tr-TR')}.csv`);
                                  link.style.visibility = 'hidden';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                CSV
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Cognitive Report Modal */}
          {selectedCognitiveModalData && (
            <CognitiveReportModal 
              isOpen={cognitiveModalOpen}
              onClose={() => {
                setCognitiveModalOpen(false);
                setSelectedCognitiveModalData(null);
              }}
              student={selectedCognitiveModalData.student}
              testResult={selectedCognitiveModalData.testResult}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Fallback return
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">Lütfen bir test seçin.</p>
      </div>
    </DashboardLayout>
  );
}
