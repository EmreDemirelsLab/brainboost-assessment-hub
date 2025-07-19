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
import { BurdonTest } from "@/components/tests/BurdonTest";

export default function InternationalTests() {
  const { user, switchRole, logout } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [showBurdonTest, setShowBurdonTest] = useState(false);

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTestStart = (testType: string) => {
    if (testType === 'burdon') {
      setShowBurdonTest(true);
    } else {
      // Diğer testler için placeholder
      alert('Bu test henüz aktif değil');
    }
  };

  const internationalTests = [
    {
      id: 1,
      title: "Burdon Dikkat Testi",
      description: "Dikkat sürdürme, odaklanma ve seçici dikkat becerilerini değerlendiren test",
      grade: "Tüm Yaşlar",
      subject: "Psikometri",
      duration: "5 dakika",
      participants: "Bireysel",
      difficulty: "Orta",
      country: "Burdon",
      nextSession: "Her Zaman",
      testType: "burdon"
    },
    {
      id: 2,
      title: "PISA Matematik Testi",
      description: "15 yaş grubundaki öğrencilerin matematik alanındaki becerilerini ölçen uluslararası değerlendirme",
      grade: "9-10",
      subject: "Matematik",
      duration: "180 dakika",
      participants: "65 Ülke",
      difficulty: "Orta-Zor",
      country: "OECD",
      nextSession: "15 Kasım 2024",
      testType: "pisa"
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
                  
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleTestStart(test.testType || '')}
                  >
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

      {/* Burdon Test Modal */}
      <Dialog open={showBurdonTest} onOpenChange={setShowBurdonTest}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sr-only">
            <h2>Burdon Dikkat Testi</h2>
            <p>Dikkat sürdürme ve odaklanma testini başlatın</p>
          </div>
          <BurdonTest onComplete={() => setShowBurdonTest(false)} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}