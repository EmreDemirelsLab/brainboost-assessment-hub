import { useState } from "react";
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
import { UserRole } from "@/types/auth";

// Mock user data - will be replaced with real authentication
const mockUser = {
  name: "Ahmet Yılmaz",
  email: "ahmet@forbrainacademy.com",
  roles: ["admin", "trainer"] as UserRole[],
  currentRole: "trainer" as UserRole
};

const quickStats = [
  {
    title: "Aktif Öğrenciler",
    value: "156",
    change: "+12%",
    icon: Users,
    color: "text-primary"
  },
  {
    title: "Bu Ay Tamamlanan Testler",
    value: "324",
    change: "+8%",
    icon: Brain,
    color: "text-success"
  },
  {
    title: "Ortalama Başarı Oranı",
    value: "87%",
    change: "+3%",
    icon: TrendingUp,
    color: "text-warning"
  },
  {
    title: "Bu Hafta Egzersizler",
    value: "89",
    change: "+15%",
    icon: Activity,
    color: "text-primary"
  }
];

const recentActivities = [
  {
    id: 1,
    student: "Elif Kaya",
    activity: "ForBrain Bilişsel Beceri Değerlendirme",
    status: "completed",
    score: 92,
    time: "2 saat önce"
  },
  {
    id: 2,
    student: "Mehmet Özkan", 
    activity: "Etkin ve Anlayarak Okuma",
    status: "in-progress",
    score: null,
    time: "3 saat önce"
  },
  {
    id: 3,
    student: "Ayşe Demir",
    activity: "Uluslararası Alan Testi",
    status: "completed",
    score: 78,
    time: "5 saat önce"
  }
];

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(mockUser);

  const handleRoleSwitch = (role: UserRole) => {
    setCurrentUser(prev => ({ ...prev, currentRole: role }));
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Will implement with real auth
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

  return (
    <DashboardLayout
      user={currentUser}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoş geldiniz, {currentUser.name}
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
                <p className="text-xs text-success">
                  {stat.change} geçen aya göre
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
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Öğrenci Ekle</span>
                </Button>
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
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.student}</div>
                      <div className="text-xs text-muted-foreground">{activity.activity}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(activity.status)}
                        {activity.score && (
                          <Badge variant="outline" className="text-xs">
                            {activity.score} puan
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Bilişsel Beceri</CardTitle>
              <CardDescription>Değerlendirme Testleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Teste Başla
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Okuma Egzersizleri</CardTitle>
              <CardDescription>Etkin ve Anlayarak</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Egzersize Başla
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Alan Testleri</CardTitle>
              <CardDescription>Uluslararası Standartlar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Teste Başla
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-primary transition-all duration-300 cursor-pointer">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Formlar</CardTitle>
              <CardDescription>Değerlendirme Formları</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gradient" className="w-full">
                Form Doldur
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}