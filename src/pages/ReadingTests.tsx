import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Download, Users, Clock, Search, Filter, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Test {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  instructions: string | null;
}

interface Student {
  id: string;
  user_id: string | null;
  student_number: string | null;
  first_name?: string;
  last_name?: string;
}

export default function ReadingTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTests();
    fetchStudents();
  }, [user?.currentRole, user?.id]); // Rol değişince yeniden çek

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Hata",
        description: "Testler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      if (!user) {
        console.error('❌ User not found');
        return;
      }

      console.log('🔍 Reading Tests - Fetching students for role:', user.currentRole);
      
      // Dinamik rol kategorisi belirleme
      const isAdminRole = user.currentRole === 'admin';
      const isTrainerRole = user.currentRole === 'beyin_antrenoru';
      const isRepresentativeRole = user.currentRole === 'temsilci';
      
      // Dinamik query builder - role göre filtering
      let query = supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          supervisor_id,
          demographic_info
        `)
        .contains('roles', '["kullanici"]'); // Sadece öğrenciler - JSON string formatı

      // Rol bazlı dinamik filtering
      if (isAdminRole) {
        console.log('👑 Admin - showing all students for reading tests');
      } else if (isRepresentativeRole) {
        console.log('🎯 Representative - showing students of supervised trainers for reading tests');
        // Temsilci kendi altındaki beyin antrenörlerinin öğrencilerini görür
        const { data: trainersData } = await supabase
          .from('users')
          .select('id')
          .contains('roles', '["beyin_antrenoru"]')
          .eq('supervisor_id', user.id);
        
        const trainerIds = trainersData?.map(t => t.id) || [];
        if (trainerIds.length > 0) {
          query = query.in('supervisor_id', trainerIds);
        } else {
          query = query.limit(0);
        }
      } else if (isTrainerRole) {
        console.log('🎯 Trainer - showing only supervised students for reading tests');
        query = query.eq('supervisor_id', user.id);
      } else {
        console.log('👤 Other role - no students for reading tests');
        query = query.limit(0);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Format for compatibility with existing interface
      const formattedStudents = data?.map(student => ({
        id: student.id,
        user_id: student.id, // Compatibility field
        student_number: student.demographic_info?.student_number || `STU-${student.id.slice(-8)}`,
        first_name: student.first_name,
        last_name: student.last_name,
        users: {
          first_name: student.first_name,
          last_name: student.last_name
        }
      })) || [];

      console.log('✅ Reading Tests Students loaded:', formattedStudents.length);
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (test: Test) => {
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
        test_id: test.id,
        student_id: studentId,
        conducted_by: currentUser.id,
        start_time: new Date().toISOString(),
        status: 'in_progress'
      }));

      const { error } = await supabase
        .from('test_results')
        .insert(testResults);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `${test.title} testi ${selectedStudents.length} öğrenci için başlatıldı.`,
      });

      setSelectedTest(null);
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

  const handleDownloadResults = async (test: Test) => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          students(*, users(first_name, last_name)),
          tests(title)
        `)
        .eq('test_id', test.id);

      if (error) throw error;

      // Here you would implement the actual download logic
      // For now, just show a success message
      toast({
        title: "Başarılı",
        description: `${test.title} sonuçları indiriliyor...`,
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

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || test.test_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const testTypes = [...new Set(tests.map(t => t.test_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Testler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Okuma Testleri</h1>
          <p className="text-muted-foreground">
            Öğrenciler için okuma ve anlama testlerini yönetin.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Filtreleri</CardTitle>
          <CardDescription>
            Testleri arayabilir ve türe göre filtreleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Test başlığı veya açıklama ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Test türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {testTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Testler</CardTitle>
          <CardDescription>
            Toplam {filteredTests.length} test bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTests.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz test bulunmuyor.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{test.title}</div>
                        {test.description && (
                          <div className="text-sm text-muted-foreground">
                            {test.description.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{test.test_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {test.duration_minutes ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {test.duration_minutes} dk
                        </div>
                      ) : (
                        'Sınırsız'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={test.is_active ? "default" : "secondary"}>
                        {test.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTest(test)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Başlat
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Test Başlat: {selectedTest?.title}</DialogTitle>
                              <DialogDescription>
                                Bu testi hangi öğrenciler için başlatmak istiyorsunuz?
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
                                    setSelectedTest(null);
                                    setSelectedStudents([]);
                                  }}
                                >
                                  İptal
                                </Button>
                                <Button
                                  onClick={() => selectedTest && handleStartTest(selectedTest)}
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
                          onClick={() => handleDownloadResults(test)}
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