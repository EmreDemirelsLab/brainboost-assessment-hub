import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, GraduationCap, Globe, Clock, Users, Play, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";


interface TestResult {
  testType: string;
  studentId: string | null;
  results: any;
}

export default function InternationalTests() {
  const { user, switchRole, logout } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTestStart = (testType: string) => {
    alert('Bu testler artık mevcut değil. Bilişsel değerlendirme testlerini kullanın.');
  };

  // Testler kaldırıldı - sadece açıklama için
  const availableTests: any[] = [];

  const filteredTests = availableTests;
  const subjects: string[] = [];
  const grades: string[] = [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Kolay": return "bg-green-100 text-green-800";
      case "Orta": return "bg-yellow-100 text-yellow-800";
      case "Zor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                Uluslararası Alan Testleri
              </h1>
              <p className="text-muted-foreground">
                Dünya standartlarında değerlendirme testleri ile öğrencilerinizi ölçün.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Filtreleri</CardTitle>
            <CardDescription>
              Sınıf seviyesi ve alan bazında testleri filtreleyebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sınıf seviyesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınıflar</SelectItem>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Alan seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Alanlar</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Testler Kaldırıldı</h3>
              <p className="text-muted-foreground mb-4">
                Uluslararası testler sistemden kaldırılmıştır. Bilişsel değerlendirme testlerini kullanın.
              </p>
              <Button asChild>
                <Link to="/cognitive-assessment">
                  Bilişsel Değerlendirme Testleri
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uluslararası Testler Hakkında</CardTitle>
            <CardDescription>
              Dünya standartlarında değerlendirme sistemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Award className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">PISA Testleri</h3>
                <p className="text-sm text-muted-foreground">
                  OECD tarafından düzenlenen, 15 yaş grubundaki öğrencilerin matematik, 
                  fen ve okuma becerilerini değerlendiren uluslararası test.
                </p>
              </div>
              <div className="space-y-3">
                <Award className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">TIMSS Testleri</h3>
                <p className="text-sm text-muted-foreground">
                  4. ve 8. sınıf öğrencilerinin matematik ve fen bilimleri alanındaki 
                  başarılarını uluslararası düzeyde karşılaştıran değerlendirme.
                </p>
              </div>
              <div className="space-y-3">
                <Award className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">PIRLS Testleri</h3>
                <p className="text-sm text-muted-foreground">
                  4. sınıf öğrencilerinin okuma anlama becerilerini uluslararası 
                  standartlarda ölçen kapsamlı değerlendirme sistemi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}