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
  const { user, switchRole, logout } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    completedTests: 0,
    averageSuccessRate: 0,
    weeklyExercises: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active students count
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch completed tests this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: testsData, error: testsError } = await supabase
        .from('burdon_test_results')
        .select('id, total_score, attention_ratio')
        .gte('created_at', startOfMonth.toISOString());

      if (testsError) throw testsError;

      // Calculate average success rate
      const averageScore = testsData && testsData.length > 0 
        ? testsData.reduce((sum, test) => sum + (test.attention_ratio || 0), 0) / testsData.length
        : 0;

      // Fetch recent activities (Burdon test results)
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('burdon_test_results')
        .select(`
          id,
          total_score,
          attention_ratio,
          created_at,
          students!burdon_test_results_student_id_fkey(
            users!students_user_id_fkey(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      const formattedActivities: RecentActivity[] = activitiesData?.map(activity => {
        const studentName = activity.students?.users 
          ? `${activity.students.users.first_name} ${activity.students.users.last_name}`
          : 'Bilinmeyen Öğrenci';
        
        return {
          id: activity.id,
          student_name: studentName,
          activity: 'Burdon Dikkat Testi',
          status: 'completed',
          score: activity.attention_ratio ? Math.round(activity.attention_ratio * 100) : null,
          time: activity.created_at
        };
      }) || [];

      setStats({
        activeStudents: studentsData?.length || 0,
        completedTests: testsData?.length || 0,
        averageSuccessRate: Math.round(averageScore * 100),
        weeklyExercises: testsData?.length || 0 // Using same data for now
      });

      setRecentActivities(formattedActivities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <Card key="active-students" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Aktif Öğrenciler
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStudents}</div>
                  <p className="text-xs text-success">
                    {stats.activeStudents > 0 ? `${stats.activeStudents} öğrenci` : 'Aktif öğrenci yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="completed-tests" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bu Ay Tamamlanan Testler
                  </CardTitle>
                  <Brain className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedTests}</div>
                  <p className="text-xs text-success">
                    {stats.completedTests > 0 ? `${stats.completedTests} test` : 'Tamamlanmış test yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="average-success-rate" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ortalama Başarı Oranı
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageSuccessRate}%</div>
                  <p className="text-xs text-warning">
                    {stats.averageSuccessRate > 0 ? `${stats.averageSuccessRate}%` : 'Başarı oranı yok'}
                  </p>
                </CardContent>
              </Card>
              <Card key="weekly-exercises" className="shadow-card hover:shadow-primary transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bu Hafta Egzersizler
                  </CardTitle>
                  <Activity className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.weeklyExercises}</div>
                  <p className="text-xs text-primary">
                    {stats.weeklyExercises > 0 ? `${stats.weeklyExercises} egzersiz` : 'Egzersiz yok'}
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
                        <div className="text-xs text-muted-foreground">{activity.activity}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(activity.status)}
                          {activity.score && (
                            <Badge variant="outline" className="text-xs">
                              {activity.score}%
                            </Badge>
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
    </DashboardLayout>
  );
}