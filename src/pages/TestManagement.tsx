import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Users, FileText, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  user_id: string;
  student_number: string | null;
  first_name?: string;
  last_name?: string;
}

interface Test {
  id: string;
  title: string;
  test_type: string;
  duration_minutes: number | null;
}

export default function TestManagement() {
  const { user, switchRole, logout } = useAuth();
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchTests();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          student_number,
          users(first_name, last_name)
        `);

      if (error) throw error;

      const formattedStudents = data?.map(student => ({
        ...student,
        first_name: student.users?.first_name || 'Bilinmeyen',
        last_name: student.users?.last_name || 'Öğrenci'
      })) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('id, title, test_type, duration_minutes')
        .eq('is_active', true);

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

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
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSendTest = async () => {
    if (selectedStudents.length === 0 || !selectedTest) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen en az bir öğrenci ve bir test seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user ID for conducted_by field
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı bulunamadı');

      // Get current user's profile
      const { data: currentUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single();

      if (!currentUser) throw new Error('Kullanıcı profili bulunamadı');

      // Create test results for selected students
      const testResults = selectedStudents.map(studentId => ({
        test_id: selectedTest,
        student_id: studentId,
        conducted_by: currentUser.id,
        start_time: new Date().toISOString(),
        status: 'assigned'
      }));

      const { error } = await supabase
        .from('test_results')
        .insert(testResults);

      if (error) throw error;

      const testName = tests.find(t => t.id === selectedTest)?.title;

      toast({
        title: "Test Tanımlandı",
        description: `${testName} testi ${selectedStudents.length} öğrenciye başarıyla tanımlandı.`,
      });

      // Reset form
      setSelectedStudents([]);
      setSelectedTest("");
    } catch (error) {
      console.error('Error assigning test:', error);
      toast({
        title: "Hata",
        description: "Test tanımlanırken bir hata oluştu.",
        variant: "destructive",
      });
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
                      {tests.map(test => (
                        <SelectItem key={test.id} value={test.id}>
                          <div className="flex flex-col">
                            <span>{test.title}</span>
                            <span className="text-xs text-muted-foreground">
                              Süre: {test.duration_minutes || 0} dakika
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
                      {tests.find(t => t.id === selectedTest)?.title}
                    </p>
                    <p className="text-xs text-blue-600">
                      Süre: {tests.find(t => t.id === selectedTest)?.duration_minutes || 0} dakika
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
                    {selectedStudents.length === students.length ? "Hiçbirini Seçme" : "Tümünü Seç"}
                  </Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center space-x-3 p-2 rounded border">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleStudentToggle(student.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-muted-foreground">E-posta: {student.student_number || 'Bilinmiyor'}</p>
                        {/* Assuming student_number is the email for now */}
                        <p className="text-xs text-muted-foreground">Sınıf: {student.student_number || 'Bilinmiyor'}</p>
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
                    <li>• Test: {tests.find(t => t.id === selectedTest)?.title}</li>
                    <li>• Öğrenci Sayısı: {selectedStudents.length}</li>
                    <li>• Seçilen Öğrenciler: {students
                      .filter(s => selectedStudents.includes(s.id))
                      .map(s => `${s.first_name} ${s.last_name}`).join(", ")}</li>
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