import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Users, 
  BarChart3, 
  Activity,
  TrendingUp,
  Clock,
  Award,
  Palette,
  Puzzle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  activeStudents: number;
  completedTests: number;
  averageSuccessRate: number;
  weeklyExercises: number;
}

interface RecentActivity {
  id: string;
  student_name: string;
  activity: string;
  status: string;
  score: number | null;
  time: string;
}

export default function Dashboard() {
  const { user, switchRole, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    completedTests: 0,
    averageSuccessRate: 0,
    weeklyExercises: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth yüklenene kadar bekle
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  useEffect(() => {
    // Sadece admin/trainer/temsilci/beyin_antrenoru rolündeki kullanıcılar dashboard verilerini görebilir
    if (user && user.currentRole && user.currentRole !== 'kullanici') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active students count - rol bazında filtreleme
      let studentsQuery = supabase
        .from('users')
        .select('id')
        .contains('roles', '["kullanici"]');

      // Admin tüm kullanıcıları görebilir - herhangi bir filtreleme yok
      if (user?.roles?.includes('admin')) {
        // Admin için filtreleme yok, tüm kullanıcıları getir
      }
      // Temsilci sadece kendi altındaki beyin antrenörlerinin öğrencilerini görebilir
      else if (user?.roles?.includes('temsilci')) {
        // Önce kendi altındaki beyin antrenörlerini bul
        const { data: trainersData } = await supabase
          .from('users')
          .select('id')
          .contains('roles', '["beyin_antrenoru"]')
          .eq('supervisor_id', user.id);
        
        const trainerIds = trainersData?.map(t => t.id) || [];
        if (trainerIds.length > 0) {
          studentsQuery = studentsQuery.in('supervisor_id', trainerIds);
        } else {
          // Eğer hiç beyin antrenörü yoksa boş sonuç döndür
          studentsQuery = studentsQuery.eq('id', 'no-results');
        }
      }
      // Beyin antrenörü sadece kendi altındaki öğrencileri görebilir
      else if (user?.roles?.includes('beyin_antrenoru')) {
        studentsQuery = studentsQuery.eq('supervisor_id', user.id);
      }

      const { data: studentsData, error: studentsError } = await studentsQuery
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch completed tests this month - tüm test türlerinden
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const studentIds = studentsData?.map(s => s.id) || [];
      let allTestsData = [];
      let formattedActivities: RecentActivity[] = [];
      
      if (studentIds.length > 0) {
        // Tüm test türlerinden veri çek
        const testTables = [
          'attention_test_results',
          'memory_test_results', 
          'stroop_test_results',
          'puzzle_test_results'
        ] as const;

        // Tüm tabloları paralel olarak çek - daha hızlı yükleme
        const fetchPromises = testTables.map(async (table) => {
          try {
            // Her test türü için doğru kolon adlarını kullan
            let accuracyColumn = 'accuracy_percentage';
            if (table === 'stroop_test_results') {
              accuracyColumn = 'overall_accuracy';
            } else if (table === 'd2_test_results') {
              accuracyColumn = 'accuracy_percentage';
            } else if (table === 'puzzle_test_results') {
              accuracyColumn = 'accuracy_percentage';
            }
            
            const { data, error } = await (supabase as any)
              .from(table)
              .select(`id, student_id, created_at, ${accuracyColumn}`)
              .in('student_id', studentIds)
              .gte('created_at', startOfMonth.toISOString());
            
            if (!error && data) {
              // Veriyi normalize et - accuracy_percentage olarak kaydet
              const normalizedData = data.map(item => ({
                ...item,
                accuracy_percentage: item[accuracyColumn]
              }));
              allTestsData.push(...normalizedData);
            }
          } catch (err) {
            // Hata durumunda sessizce devam et
          }
        });
        
        // Tüm sorguları paralel olarak bekle
        await Promise.all(fetchPromises);
        
        // Recent activities için de aynı testTables'ı kullan
        formattedActivities = await fetchRecentActivities(studentIds, testTables);
      }
      
      async function fetchRecentActivities(studentIds: string[], testTables: readonly string[]): Promise<RecentActivity[]> {
        const recentActivities: RecentActivity[] = [];
        
        // Recent activities için de paralel sorgulama
        const activityPromises = testTables.map(async (table) => {
          try {
            // Her test türü için doğru kolon adlarını kullan
            let accuracyColumn = 'accuracy_percentage';
            if (table === 'stroop_test_results') {
              accuracyColumn = 'overall_accuracy';
            } else if (table === 'd2_test_results') {
              accuracyColumn = 'accuracy_percentage';
            } else if (table === 'puzzle_test_results') {
              accuracyColumn = 'accuracy_percentage';
            }
            
            const { data, error } = await (supabase as any)
              .from(table)
              .select(`
                id,
                student_id,
                created_at,
                ${accuracyColumn},
                users!${table}_student_id_fkey(first_name, last_name)
              `)
              .in('student_id', studentIds)
              .order('created_at', { ascending: false })
              .limit(3);
            
            if (!error && data) {
              data.forEach((activity: any) => {
                const testName = {
                  'attention_test_results': 'Dikkat Testi',
                  'memory_test_results': 'Hafıza Testi',
                  'stroop_test_results': 'Stroop Testi',
                  'puzzle_test_results': 'Puzzle Testi'
                }[table] || 'Test';

                const studentName = activity.users 
                  ? `${activity.users.first_name} ${activity.users.last_name}`
                  : 'Bilinmeyen Öğrenci';
                
                let score = null;
                const accuracyValue = activity[accuracyColumn] || activity.accuracy_percentage;
                if (accuracyValue) {
                  try {
                    const accuracy = typeof accuracyValue === 'string' 
                      ? parseFloat(accuracyValue) 
                      : accuracyValue;
                    score = accuracy ? Math.round(accuracy) : null;
                  } catch (err) {
                    // Sessizce devam et
                  }
                }
                
                recentActivities.push({
                  id: `${table}_${activity.id}`,
                  student_name: studentName,
                  activity: testName,
                  status: 'completed',
                  score: score,
                  time: activity.created_at
                });
              });
            }
          } catch (err) {
            // Hata durumunda sessizce devam et
          }
        });
        
        // Tüm aktivite sorgularını bekle
        await Promise.all(activityPromises);
        
        // Son aktiviteleri tarihe göre sırala ve ilk 5'ini al
        return recentActivities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);
      }

      // Calculate average success rate (tüm testlerden)  
      let averageScore = 0;
      if (allTestsData.length > 0) {
        let totalScore = 0;
        let validTests = 0;
        
        allTestsData.forEach(test => {
          if (test.accuracy_percentage) {
            try {
              const accuracy = typeof test.accuracy_percentage === 'string' 
                ? parseFloat(test.accuracy_percentage) 
                : test.accuracy_percentage;
              
              if (accuracy && !isNaN(accuracy)) {
                totalScore += accuracy;
                validTests++;
              }
            } catch (err) {
              // Sessizce devam et
            }
          }
        });
        
        averageScore = validTests > 0 ? totalScore / validTests : 0;
      }



      // Haftalık egzersizler için son 7 günün verilerini çek
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weeklyTests = allTestsData.filter(test => 
        new Date(test.created_at) >= startOfWeek
      );

      setStats({
        activeStudents: studentsData?.length || 0,
        completedTests: allTestsData?.length || 0,
        averageSuccessRate: Math.round(averageScore),
        weeklyExercises: weeklyTests?.length || 0
      });

      setRecentActivities(formattedActivities);

    } catch (error) {
      toast({
        title: "Hata",
        description: "Dashboard verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-success text-success-foreground">Tamamlandı</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Devam Ediyor</Badge>;
      default:
        return <Badge variant="outline">Bekliyor</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

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
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoş geldiniz, {user?.firstName} {user?.lastName}
          </h1>
          {user?.currentRole === 'kullanici' ? (
            <p className="text-muted-foreground">
              ForBrain Academy'ye hoş geldiniz. Sol menüden testlere başlayabilirsiniz.
            </p>
          ) : user?.currentRole === 'admin' ? (
            <p className="text-muted-foreground">
              ForBrain Academy sistem yönetim paneline hoş geldiniz. Tüm sistem verilerini görüntüleyebilir ve yönetebilirsiniz.
            </p>
          ) : user?.currentRole === 'temsilci' ? (
            <p className="text-muted-foreground">
              Temsilci paneline hoş geldiniz. Bölgenizdeki beyin antrenörleri ve öğrencilerini yönetebilirsiniz.
            </p>
          ) : user?.currentRole === 'beyin_antrenoru' ? (
            <p className="text-muted-foreground">
              Beyin antrenörü paneline hoş geldiniz. Öğrencilerinizin gelişimini takip edebilir ve yeni testler tanımlayabilirsiniz.
            </p>
          ) : (
            <p className="text-muted-foreground">
              ForBrain Academy yönetim paneline hoş geldiniz.
            </p>
          )}
        </div>

        {/* Role-based Information Cards */}
        {user?.currentRole === 'admin' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Sistem Genel Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-8">
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Toplam Kullanıcı
                    </CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeStudents}</div>
                    <p className="text-xs text-success">
                      Sistemdeki tüm kullanıcılar
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Toplam Test
                    </CardTitle>
                    <Brain className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedTests}</div>
                    <p className="text-xs text-blue-600">
                      Tamamlanan testler
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Başarı Ortalaması
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageSuccessRate}%</div>
                    <p className="text-xs text-green-600">
                      Sistem geneli başarı
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Haftalık Aktivite
                    </CardTitle>
                    <Activity className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.weeklyExercises}</div>
                    <p className="text-xs text-orange-600">
                      Bu hafta yapılan egzersizler
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
        )}

        {user?.currentRole === 'temsilci' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Temsilci Bölge Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Beyin Antrenörleri
                    </CardTitle>
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-success">
                      Altınızda çalışan antrenörler
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Bölge Öğrencileri
                    </CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeStudents}</div>
                    <p className="text-xs text-blue-600">
                      Bölgenizdeki aktif öğrenciler
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Bölge Performansı
                    </CardTitle>
                    <BarChart3 className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageSuccessRate}%</div>
                    <p className="text-xs text-green-600">
                      Bölge başarı ortalaması
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
        )}

        {user?.currentRole === 'beyin_antrenoru' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Öğrenci Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-8">
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Öğrencilerim
                    </CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeStudents}</div>
                    <p className="text-xs text-success">
                      Size atanmış öğrenciler
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tamamlanan Testler
                    </CardTitle>
                    <Brain className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedTests}</div>
                    <p className="text-xs text-blue-600">
                      Öğrencilerimin tamamladığı testler
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Başarı Ortalaması
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageSuccessRate}%</div>
                    <p className="text-xs text-green-600">
                      Öğrencilerimin başarı ortalaması
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-card hover:shadow-primary transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Bu Hafta
                    </CardTitle>
                    <Activity className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.weeklyExercises}</div>
                    <p className="text-xs text-orange-600">
                      Bu hafta yapılan aktiviteler
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
        )}

        {/* Hızlı İşlemler - Admin, Temsilci, Beyin Antrenörü için */}
        {(user?.currentRole === 'admin' || user?.currentRole === 'temsilci' || user?.currentRole === 'beyin_antrenoru') && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>İşlemler</CardTitle>
                <CardDescription>
                  {user?.currentRole === 'admin' ? 'Sistem yönetimi işlemleri' :
                   user?.currentRole === 'temsilci' ? 'Temsilci işlemleri' :
                   'Öğrenci yönetimi işlemleri'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {user?.currentRole === 'admin' && (
                    <>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Brain className="h-6 w-6" />
                        <span className="text-sm">Yeni Test</span>
                      </Button>
                      <CreateUserModal
                        trigger={
                          <Button variant="outline" className="h-20 flex-col space-y-2">
                            <Users className="h-6 w-6" />
                            <span className="text-sm">Kullanıcı Ekle</span>
                          </Button>
                        }
                      />
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Raporlar</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Award className="h-6 w-6" />
                        <span className="text-sm">Sertifikalar</span>
                      </Button>
                    </>
                  )}
                  
                  {user?.currentRole === 'temsilci' && (
                    <>
                      <CreateUserModal
                        trigger={
                          <Button variant="outline" className="h-20 flex-col space-y-2">
                            <GraduationCap className="h-6 w-6" />
                            <span className="text-sm">Antrenör Ekle</span>
                          </Button>
                        }
                      />
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Bölge Raporları</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Users className="h-6 w-6" />
                        <span className="text-sm">Antrenörlerim</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-sm">Performans</span>
                      </Button>
                    </>
                  )}
                  
                  {user?.currentRole === 'beyin_antrenoru' && (
                    <>
                      <CreateUserModal
                        trigger={
                          <Button variant="outline" className="h-20 flex-col space-y-2">
                            <Users className="h-6 w-6" />
                            <span className="text-sm">Öğrenci Ekle</span>
                          </Button>
                        }
                      />
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Brain className="h-6 w-6" />
                        <span className="text-sm">Test Ata</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Öğrenci Raporları</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Activity className="h-6 w-6" />
                        <span className="text-sm">Aktiviteler</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

          {/* Recent Activities */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Öğrencilerinizin son test ve egzersiz sonuçları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p>Yükleniyor...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Son aktivite bulunamadı.</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.student_name}</div>
                        <div className="text-xs text-muted-foreground">{activity.activity}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(activity.status)}
                          {activity.score && (
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.score}%
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Genel Dikkat Performansı Yüzdesi
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeAgo(activity.time)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
        )}

        {/* Kullanıcılar (Öğrenciler) için testlere başla mesajı */}
        {user?.currentRole === 'kullanici' && (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Bilişsel Beceri Testleri</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Bilişsel becerilerinizi geliştirmek için aşağıdaki testleri tamamlayın.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
              
              {/* Dikkat Testi */}
              <Card 
                className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer"
                onClick={() => window.open('/cognitive-tests/dikkat/dikkat.html', '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Dikkat Testi</h3>
                  <p className="text-sm text-muted-foreground">Dikkat becerinizi ölçün</p>
                </CardContent>
              </Card>

              {/* Hafıza Testi */}
              <Card 
                className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer"
                onClick={() => window.open('/cognitive-tests/hafiza/hafiza.html', '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Hafıza Testi</h3>
                  <p className="text-sm text-muted-foreground">Hafıza kapasitesini test edin</p>
                </CardContent>
              </Card>

              {/* Stroop Testi */}
              <Card 
                className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer"
                onClick={() => window.open('/cognitive-tests/stroop/stroop.html', '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <Palette className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Stroop Testi</h3>
                  <p className="text-sm text-muted-foreground">Renk algısı ve odaklanma</p>
                </CardContent>
              </Card>

              {/* Puzzle Testi */} 
              <Card 
                className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer"
                onClick={() => window.open('/cognitive-tests/puzzle/puzzle.html', '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <Puzzle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Puzzle Testi</h3>
                  <p className="text-sm text-muted-foreground">Görsel problem çözme</p>
                </CardContent>
              </Card>

              {/* Akıl-Mantık Testi */}
              <Card 
                className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer"
                onClick={() => window.open('/cognitive-tests/akil-mantik/akil-mantik.html', '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <GraduationCap className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Akıl-Mantık Testi</h3>
                  <p className="text-sm text-muted-foreground">Mantıksal düşünme becerisi</p>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}