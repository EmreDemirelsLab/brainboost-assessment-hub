import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  user_id: string;
  student_number: string | null;
  birth_date: string | null;
  grade_level: number | null;
  school_name: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  notes: string | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export default function Students() {
  const { user, switchRole, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          users(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStudents = data?.map(student => ({
        ...student,
        first_name: student.users?.first_name || 'Bilinmeyen',
        last_name: student.users?.last_name || 'Öğrenci',
        email: student.users?.email || 'E-posta yok'
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

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredStudents = students.filter(student => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchTermLower) ||
      student.last_name?.toLowerCase().includes(searchTermLower) ||
      student.student_number?.toLowerCase().includes(searchTermLower) ||
      student.school_name?.toLowerCase().includes(searchTermLower)
    );
  });

  const getStatusBadge = (birthDate: string | null) => {
    // For now, all students are active - this is a placeholder
    return <Badge variant="secondary" className="bg-success text-success-foreground">Aktif</Badge>;
  };

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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Öğrenciler yükleniyor...</div>
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
                <Users className="h-8 w-8 text-primary" />
                Öğrenci Yönetimi
              </h1>
              <p className="text-muted-foreground">
                Sistemdeki öğrencileri görüntüleyebilir ve yönetebilirsiniz.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/add-user">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Öğrenci
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Arama</CardTitle>
            <CardDescription>
              Öğrenci adı, numarası, okul veya veli adına göre arama yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Listesi</CardTitle>
            <CardDescription>
              Toplam {filteredStudents.length} öğrenci bulundu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Öğrenci bulunamadı.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci No</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Sınıf</TableHead>
                    <TableHead>Okul</TableHead>
                    <TableHead>Veli</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.student_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.birth_date ? new Date(student.birth_date).toLocaleDateString('tr-TR') : 'Tarih Belirtilmemiş'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.grade_level || 'Sınıf Belirtilmemiş'}. Sınıf</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={student.school_name || 'Okul Belirtilmemiş'}>
                          {student.school_name || 'Okul Belirtilmemiş'}
                        </div>
                      </TableCell>
                      <TableCell>{student.parent_name || 'Veli Belirtilmemiş'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="truncate max-w-24" title={student.parent_phone || 'Telefon Belirtilmemiş'}>
                              {student.parent_phone || 'Telefon Belirtilmemiş'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="truncate max-w-24" title={student.parent_email || 'E-posta Belirtilmemiş'}>
                              {student.parent_email || 'E-posta Belirtilmemiş'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.birth_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplam Öğrenci</CardTitle>
              <CardDescription>Sistemdeki toplam öğrenci sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktif Öğrenci</CardTitle>
              <CardDescription>Eğitime devam eden öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => s.birth_date && new Date(s.birth_date).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bu Ay Kayıt</CardTitle>
              <CardDescription>Bu ay kayıt olan öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {students.filter(s => s.created_at && new Date(s.created_at).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}