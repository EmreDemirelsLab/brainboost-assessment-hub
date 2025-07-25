import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Download, Users, Clock, Search, Filter, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestSession {
  id: string;
  kullanici_id: string;
  oturum_uuid: string;
  durum: string;
  baslangic_tarihi: string;
  created_at: string;
}

interface Student {
  id: string;
  user_id: string | null;
  student_number: string | null;
  first_name?: string;
  last_name?: string;
}

export default function SubjectTests() {
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<TestSession | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestSessions();
    fetchStudents();
  }, []);

  const fetchTestSessions = async () => {
    try {
      const { data } = await supabase
        .from('test_oturumlari')
        .select('*')
        .order('created_at', { ascending: false });
    
      if (data) {
        setTestSessions(data);
      }
    } catch (error) {
      console.error('Error fetching test sessions:', error);
      toast({
        title: "Hata",
        description: "Test oturumları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
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
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (session: TestSession) => {
    if (selectedStudents.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir öğrenci seçin.",
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
        oturum_id: session.id,
        kullanici_id: currentUser.id,
        test_turu: 'alan',
        durum: 'devam_ediyor',
        baslangic_tarihi: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('test_sonuclari')
        .insert(testResults);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Alan testi ${selectedStudents.length} öğrenci için başlatıldı.`,
      });

      setSelectedSession(null);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: "Hata",
        description: "Test başlatılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResults = async (session: TestSession) => {
    try {
      const { data, error } = await supabase
        .from('test_sonuclari')
        .select(`
          *,
          test_oturumlari(*)
        `)
        .eq('oturum_id', session.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Here you would implement the actual download logic
      // For now, just show a success message
      toast({
        title: "Başarılı",
        description: `Test sonuçları indiriliyor...`,
      });
    } catch (error) {
      console.error('Error downloading results:', error);
      toast({
        title: "Hata",
        description: "Sonuçlar indirilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const filteredSessions = testSessions.filter(session => {
    const matchesSearch = session.oturum_uuid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.durum === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [...new Set(testSessions.map(s => s.durum))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Test oturumları yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alan Testleri</h1>
          <p className="text-muted-foreground">
            Çeşitli alanlarda öğrenci değerlendirme testlerini yönetin.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Filtreleri</CardTitle>
          <CardDescription>
            Test oturumlarını arayabilir ve duruma göre filtreleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Oturum UUID ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Oturumları</CardTitle>
          <CardDescription>
            Toplam {filteredSessions.length} oturum bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz test oturumu bulunmuyor.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oturum ID</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{session.oturum_uuid}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.durum}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(session.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSession(session)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Test Başlat
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Test Başlat: {selectedSession?.oturum_uuid}</DialogTitle>
                              <DialogDescription>
                                Bu test oturumu için hangi öğrenciler katılacak?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid gap-2 max-h-64 overflow-y-auto">
                                {students.map((student) => (
                                  <label key={student.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(student.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStudents([...selectedStudents, student.id]);
                                        } else {
                                          setSelectedStudents(
                                            selectedStudents.filter(id => id !== student.id)
                                          );
                                        }
                                      }}
                                    />
                                    <span>
                                      {student.first_name} {student.last_name}
                                      {student.student_number && ` (${student.student_number})`}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSession(null);
                                    setSelectedStudents([]);
                                  }}
                                >
                                  İptal
                                </Button>
                                <Button
                                  onClick={() => selectedSession && handleStartTest(selectedSession)}
                                  disabled={selectedStudents.length === 0}
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Testi Başlat ({selectedStudents.length})
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadResults(session)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Sonuçları İndir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}