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
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalTests: number;
  averageScore: number;
  totalUsers: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  student_name: string;
  test_type: string;
  score: number;
  date: string;
}

export default function Dashboard() {
  const { user, switchRole, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    averageScore: 0,
    totalUsers: 0,
    completionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Test sonuçları ve istatistikleri
      const { data: testResults, error: testError } = await (supabase as any)
        .from('test_sonuclari')
        .select(`
          id,
          genel_test_skoru,
          test_turu,
          created_at,
          test_oturumlari!test_sonuclari_oturum_id_fkey(
            users!test_oturumlari_kullanici_id_fkey(
              first_name,
              last_name,
              ad_soyad,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (testError) {
        console.error('Test sonuçları hatası:', testError);
        throw testError;
      }

      // Son 7 günün test sayısı
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentTests, error: recentError } = await (supabase as any)
        .from('test_sonuclari')
        .select('id, genel_test_skoru')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) {
        console.error('Son testler hatası:', recentError);
        throw recentError;
      }

      // Toplam kullanıcı sayısı
      const { data: totalUsers, error: usersError } = await (supabase as any)
        .from('users')
        .select('id', { count: 'exact' });

      if (usersError) {
        console.error('Kullanıcı sayısı hatası:', usersError);
        throw usersError;
      }

      // Ortalama skor hesapla
      const validScores = recentTests?.filter(test => test.genel_test_skoru != null) || [];
      const averageScore = validScores.length > 0 
        ? validScores.reduce((sum, test) => sum + test.genel_test_skoru, 0) / validScores.length 
        : 0;

      setStats({
        totalTests: recentTests?.length || 0,
        averageScore: Math.round(averageScore),
        totalUsers: totalUsers?.length || 0,
        completionRate: 85 // Sabit değer, gerçek hesaplama için ek sorgu gerekir
      });

      // Son aktiviteleri formatla
      const formattedActivities = testResults?.map(result => {
        const user = result.test_oturumlari?.users;
        const studentName = user?.ad_soyad || 
                           (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '') ||
                           user?.email || 'Bilinmeyen Kullanıcı';
        
        return {
          id: result.id,
          student_name: studentName,
          test_type: result.test_turu || 'Bilinmeyen Test',
          score: result.genel_test_skoru || 0,
          date: result.created_at
        };
      }) || [];

      setRecentActivities(formattedActivities);
      
    } catch (error) {
      console.error('Dashboard verisi alınırken hata:', error);
      setStats({
        totalTests: 0,
        averageScore: 0,
        totalUsers: 0,
        completionRate: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
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
          <p className="text-muted-foreground">
            ForBrain Academy yönetim paneline hoş geldiniz. Bugün öğrencilerinizin gelişimini takip edebilir ve yeni testler tanımlayabilirsiniz.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-8">
              <p>Yükleniyor...</p>
            </div>
          ) : (
            <>
              <Card key="total-users" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Toplam Kullanıcılar
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-success">
                    {stats.totalUsers > 0 ? `${stats.totalUsers} kullanıcı` : 'Kullanıcı yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="total-tests" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Son 7 Gün Testler
                  </CardTitle>
                  <Brain className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTests}</div>
                  <p className="text-xs text-success">
                    {stats.totalTests > 0 ? `${stats.totalTests} test` : 'Test yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="average-score" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ortalama Skor
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}</div>
                  <p className="text-xs text-warning">
                    {stats.averageScore > 0 ? `${stats.averageScore} puan` : 'Skor yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="completion-rate" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tamamlanma Oranı
                  </CardTitle>
                  <Activity className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-primary">
                    {stats.completionRate > 0 ? `${stats.completionRate}% tamamlandı` : 'Veri yok'}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>
                Sık kullanılan işlemlere hızlı erişim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        <div className="text-xs text-muted-foreground">{activity.test_type}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            Tamamlandı
                          </Badge>
                          {activity.score > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.score} puan
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeAgo(activity.date)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}