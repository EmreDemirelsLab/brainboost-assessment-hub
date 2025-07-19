import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Globe, Clock, Users, Play, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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

  const internationalTests = [
    {
      id: 1,
      title: "PISA Matematik",
      description: "Uluslararası Öğrenci Değerlendirme Programı - Matematik",
      grade: "9-10",
      subject: "Matematik",
      duration: "150 dakika",
      participants: 847,
      difficulty: "Uluslararası",
      country: "OECD",
      nextSession: "15 Kasım 2024"
    },
    {
      id: 2,
      title: "PISA Fen Bilimleri",
      description: "Uluslararası Öğrenci Değerlendirme Programı - Fen",
      grade: "9-10",
      subject: "Fen",
      duration: "150 dakika",
      participants: 756,
      difficulty: "Uluslararası",
      country: "OECD",
      nextSession: "20 Kasım 2024"
    },
    {
      id: 3,
      title: "TIMSS Matematik",
      description: "Uluslararası Matematik ve Fen Eğilimleri Araştırması",
      grade: "4,8",
      subject: "Matematik",
      duration: "90 dakika",
      participants: 623,
      difficulty: "Uluslararası",
      country: "IEA",
      nextSession: "25 Kasım 2024"
    },
    {
      id: 4,
      title: "PIRLS Okuma",
      description: "Uluslararası Okuma Becerilerinin Gelişimi Araştırması",
      grade: "4",
      subject: "Türkçe",
      duration: "80 dakika",
      participants: 445,
      difficulty: "Uluslararası",
      country: "IEA",
      nextSession: "30 Kasım 2024"
    },
    {
      id: 5,
      title: "TOEFL İngilizce",
      description: "Test of English as a Foreign Language",
      grade: "11-12",
      subject: "İngilizce",
      duration: "180 dakika",
      participants: 289,
      difficulty: "Uluslararası",
      country: "ETS",
      nextSession: "5 Aralık 2024"
    },
    {
      id: 6,
      title: "Cambridge English",
      description: "Cambridge İngilizce Yeterlilik Sınavları",
      grade: "9-12",
      subject: "İngilizce",
      duration: "120 dakika",
      participants: 356,
      difficulty: "Uluslararası",
      country: "Cambridge",
      nextSession: "10 Aralık 2024"
    }
  ];

  const filteredTests = internationalTests.filter(test => {
    const gradeMatch = selectedGrade === "all" || test.grade.includes(selectedGrade);
    const subjectMatch = selectedSubject === "all" || test.subject === selectedSubject;
    return gradeMatch && subjectMatch;
  });

  const subjects = [...new Set(internationalTests.map(test => test.subject))];
  const grades = ["4", "8", "9", "10", "11", "12"];

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
                      {grade}. Sınıf
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {test.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {test.description}
                    </CardDescription>
                    <Badge variant="outline" className="mt-2">
                      {test.country}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sınıf:</span>
                      <div className="font-medium">{test.grade}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Alan:</span>
                      <div className="font-medium">{test.subject}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Süre:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Katılımcı:</span>
                      <div className="font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {test.participants}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Sonraki Oturum</div>
                    <div className="font-medium">{test.nextSession}</div>
                  </div>
                  
                  <Button className="w-full" variant="default">
                    <Play className="h-4 w-4 mr-2" />
                    Teste Başla
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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