import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface TestResult {
  testType: string;
  studentId: string | null;
  results: any;
}

export default function InternationalTests() {
  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTestStart = (testType: string) => {
    // Test penceresi açma işlemi - tam ekran
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    let testUrl = '';
    let testTitle = '';

    if (testType === 'burdon') {
      testUrl = '/international-tests/burdon-test/burdon.html';
      testTitle = 'Burdon Dikkat Testi';
    } else if (testType === 'd2') {
      testUrl = '/international-tests/d2-test/D2_testi.html';
      testTitle = 'd2 Dikkat Testi';
    } else {
      alert('Bu test henüz aktif değil');
      return;
    }
      
    const testWindow = window.open(testUrl, '_blank', 
      `width=${screenWidth},height=${screenHeight},left=0,top=0,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,fullscreen=yes`);

    if (!testWindow) {
      alert('Test penceresi açılamadı. Lütfen popup engelleyiciyi kapatın.');
    } else {
      // Test penceresi yüklendikten sonra başlığı değiştir ve tam ekran moduna geç
      testWindow.addEventListener('load', () => {
        try {
          // Pencere başlığını değiştir
          testWindow.document.title = testTitle;

          // Tam ekran moduna geçmeye çalış
          if (testWindow.document.documentElement && testWindow.document.documentElement.requestFullscreen) {
            testWindow.document.documentElement.requestFullscreen().catch(err => {
              console.log('Tam ekran modu başlatılamadı:', err);
            });
          }
        } catch (error) {
          console.log('Pencere ayarları uygulanamadı:', error);
        }
      });
    }
  };

  // Available International Tests
  const availableTests = [
    {
      id: 1,
      title: "Burdon Dikkat Testi",
      description: "Dikkat sürdürme, odaklanma ve seçici dikkat becerilerini değerlendiren uluslararası standart test",
      grade: "Tüm Yaşlar",
      subject: "Psikometri",
      duration: "3 dakika",
      participants: "Bireysel",
      difficulty: "Orta",
      country: "Burdon Standardı",
      nextSession: "Her Zaman",
      testType: "burdon",
      isActive: true
    },
    {
      id: 2,
      title: "d2 Dikkat Testi",
      description: "Konsantrasyon performansı, işlem hızı ve dikkat kararlılığını ölçen altın standart d2 testi",
      grade: "Tüm Yaşlar",
      subject: "Psikometri",
      duration: "5 dakika",
      participants: "Bireysel",
      difficulty: "Orta", 
      country: "d2 Standardı",
      nextSession: "Her Zaman",
      testType: "d2",
      isActive: true
    }
  ];



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
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Uluslararası Alan Testleri
          </h1>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/assets/images/forbrain logo.png" 
            alt="ForBrain Logo" 
            className="h-20 mx-auto mb-6"
          />
          
          {/* Uyarı */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-sm text-amber-800">
              <strong>Önemli:</strong> Testler ayrı bir pencerede açılacaktır. Pop-up engelleyici ayarlarınızın kapalı olduğundan emin olun.
            </p>
          </div>
        </div>



        <div className="flex flex-col items-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {availableTests.map((test) => (
            <Card key={test.id} className="text-center p-8 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="flex-grow flex flex-col">
                <div className="flex-grow">
                  <CardTitle className="text-2xl font-bold text-slate-800 mb-4">
                    {test.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 mb-6">
                    {test.description}
                  </CardDescription>
                </div>

              </CardHeader>
              <CardContent className="mt-auto">
                <Button 
                  size="lg"
                  className="w-full text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700" 
                  onClick={() => handleTestStart(test.testType || '')}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Teste Başla
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>


    </DashboardLayout>
  );
}