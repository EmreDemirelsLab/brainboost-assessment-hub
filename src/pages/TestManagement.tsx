import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Users, FileText, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const mockStudents = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", grade: 5 },
  { id: "2", name: "Ayşe Demir", email: "ayse@example.com", grade: 6 },
  { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", grade: 4 },
  { id: "4", name: "Fatma Özkan", email: "fatma@example.com", grade: 5 },
];

const mockTests = [
  { id: "1", name: "Burdon Dikkat Testi", type: "cognitive", duration: 5 }
];

export default function TestManagement() {
  const { user, switchRole, logout } = useAuth();
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === mockStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map(s => s.id));
    }
  };

  const handleSendTest = () => {
    if (selectedStudents.length === 0 || !selectedTest) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen en az bir öğrenci ve bir test seçin.",
        variant: "destructive",
      });
      return;
    }

    const selectedStudentNames = mockStudents
      .filter(s => selectedStudents.includes(s.id))
      .map(s => s.name);
    
    const testName = mockTests.find(t => t.id === selectedTest)?.name;

    toast({
      title: "Test Tanımlandı",
      description: `${testName} testi ${selectedStudentNames.length} öğrenciye e-posta ile gönderildi.`,
    });

    // Reset form
    setSelectedStudents([]);
    setSelectedTest("");
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
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Test Tanımla
            </h1>
            <p className="text-muted-foreground">
              Öğrencilere test atayın ve e-posta ile gönderin.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Test Seçimi
              </CardTitle>
              <CardDescription>
                Öğrencilere göndermek istediğiniz testi seçin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Mevcut Testler</Label>
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger>
                      <SelectValue placeholder="Test seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTests.map(test => (
                        <SelectItem key={test.id} value={test.id}>
                          <div className="flex flex-col">
                            <span>{test.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Süre: {test.duration} dakika
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTest && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Seçilen Test:</h4>
                    <p className="text-sm text-blue-800">
                      {mockTests.find(t => t.id === selectedTest)?.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      Süre: {mockTests.find(t => t.id === selectedTest)?.duration} dakika
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Öğrenci Seçimi
              </CardTitle>
              <CardDescription>
                Testi göndermek istediğiniz öğrencileri seçin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Öğrenci Listesi</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllStudents}
                  >
                    {selectedStudents.length === mockStudents.length ? "Hiçbirini Seçme" : "Tümünü Seç"}
                  </Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {mockStudents.map(student => (
                    <div key={student.id} className="flex items-center space-x-3 p-2 rounded border">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleStudentToggle(student.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">Sınıf: {student.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedStudents.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      {selectedStudents.length} öğrenci seçildi
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Gönderimi
            </CardTitle>
            <CardDescription>
              Seçilen öğrencilere testi e-posta ile gönderin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTest && selectedStudents.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-2">Gönderim Özeti:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Test: {mockTests.find(t => t.id === selectedTest)?.name}</li>
                    <li>• Öğrenci Sayısı: {selectedStudents.length}</li>
                    <li>• Seçilen Öğrenciler: {mockStudents
                      .filter(s => selectedStudents.includes(s.id))
                      .map(s => s.name)
                      .join(", ")}</li>
                  </ul>
                </div>
              )}

              <Button 
                onClick={handleSendTest}
                disabled={selectedStudents.length === 0 || !selectedTest}
                className="w-full"
                size="lg"
              >
                <Send className="h-5 w-5 mr-2" />
                Test Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}