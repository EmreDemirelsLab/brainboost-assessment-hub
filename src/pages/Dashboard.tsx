import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  studentCount: number;
  testCount: number;
  userCount: number;
}

interface RecentActivity {
  id: string;
  student_name: string;
  activity: string;
  status: string;
  score: number;
  time: string;
  attention_ratio: number;
}

export default function Dashboard() {
  const { user, switchRole, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    testCount: 0,
    userCount: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [studentsRes, testsRes, usersRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('burdon_test_results').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        studentCount: studentsRes.count || 0,
        testCount: testsRes.count || 0,
        userCount: usersRes.count || 0
      });

      // Fetch recent test activities
      const { data: recentTests } = await supabase
        .from('burdon_test_results')
        .select(`
          id,
          total_score,
          attention_ratio,
          created_at,
          student_id,
          students!inner(
            user_id,
            users!inner(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTests) {
        const activities = recentTests.map((test) => {
          const student = test.students as any;
          const studentName = student?.users 
            ? `${student.users.first_name} ${student.users.last_name}` 
            : 'Bilinmeyen Öğrenci';
          
          return {
            id: test.id,
            student_name: studentName,
            activity: "Burdon Dikkat Testi",
            status: "completed",
            score: test.total_score,
            time: formatTimeAgo(test.created_at),
            attention_ratio: test.attention_ratio * 100
          };
        });
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} saat önce`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} gün önce`;
    }
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

  const quickStats = [
    {
      title: "Kayıtlı Öğrenciler",
      value: stats.studentCount.toString(),
      change: "",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Tamamlanan Testler",
      value: stats.testCount.toString(),
      change: "",
      icon: Brain,
      color: "text-success"
    },
    {
      title: "Sistem Kullanıcıları",
      value: stats.userCount.toString(),
      change: "",
      icon: Activity,
      color: "text-warning"
    },
    {
      title: "Aktif Test Türü",
      value: "1",
      change: "(Burdon)",
      icon: Award,
      color: "text-primary"
    }
  ];

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
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          {quickStats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-primary transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
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
              <CardTitle>Son Test Sonuçları</CardTitle>
              <CardDescription>
                En son tamamlanan Burdon testleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.student_name}</div>
                        <div className="text-xs text-muted-foreground">{activity.activity}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(activity.status)}
                          <Badge variant="outline" className="text-xs">
                            {activity.score} puan
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            %{activity.attention_ratio.toFixed(1)} dikkat
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz test sonucu bulunmuyor</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}